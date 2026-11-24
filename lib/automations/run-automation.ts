
import "server-only";

import { db } from "@/src/prisma/db";

type TriggerType =
  | "LEAD_CREATED"
  | "LEAD_STATUS_CHANGED"
  | "DEAL_CREATED";

type EventData = {
  lead?: {
    id: number;
    firstName?: string;
    lastName?: string | null;
    email?: string;
    status?: string;
    source?: string | null;
    score?: number | null;
    value?: number;
    owner?: string;
  };
  deal?: {
    id: number;
    title?: string;
    stage?: string;
    value?: number;
    owner?: string;
  };
  previousStatus?: string;
};

type Condition = {
  field: string;
  operator: string;
  value: string | number;
};

function parseObject(value: string | null) {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function matchesConditions(
  rawConditions: string | null,
  data: EventData
) {
  if (!rawConditions) return true;

  let conditions: Condition[];

  try {
    const parsed: unknown = JSON.parse(rawConditions);
    if (!Array.isArray(parsed)) return false;
    conditions = parsed as Condition[];
  } catch {
    return false;
  }

  const record = data.lead ?? data.deal;
  if (!record) return false;

  return conditions.every((condition) => {
    const actual = (record as Record<string, unknown>)[condition.field];
    const expected = condition.value;

    switch (condition.operator) {
      case "equals":
        return String(actual ?? "") === String(expected);
      case "not_equals":
        return String(actual ?? "") !== String(expected);
      case "contains":
        return String(actual ?? "")
          .toLowerCase()
          .includes(String(expected).toLowerCase());
      case "greater_than":
        return Number(actual) > Number(expected);
      case "less_than":
        return Number(actual) < Number(expected);
      default:
        return false;
    }
  });
}

async function executeAction(
  actionType: string,
  rawConfig: string | null,
  userId: number,
  data: EventData
) {
  const config = parseObject(rawConfig);

  if (actionType === "ASSIGN_LEAD_OWNER") {
    if (!data.lead?.id || typeof config.owner !== "string" || !config.owner.trim()) {
      throw new Error("A lead and valid owner are required.");
    }

    await db.orm.public.Lead
      .where({ id: data.lead.id, userId })
      .update({ owner: config.owner.trim() });

    return `Lead assigned to ${config.owner.trim()}.`;
  }

  if (actionType === "UPDATE_LEAD_STATUS") {
    const allowedStatuses = [
      "NEW",
      "CONTACTED",
      "QUALIFIED",
      "PROPOSAL",
      "LOST",
    ];

    if (
      !data.lead?.id ||
      typeof config.status !== "string" ||
      !allowedStatuses.includes(config.status)
    ) {
      throw new Error("A lead and valid status are required.");
    }

    await db.orm.public.Lead
      .where({ id: data.lead.id, userId })
      .update({ status: config.status });

    return `Lead status changed to ${config.status}.`;
  }

  if (actionType === "CREATE_FOLLOW_UP_TASK") {
    if (!data.lead?.id && !data.deal?.id) {
      throw new Error("A related lead or deal is required.");
    }

    const title =
      typeof config.title === "string" && config.title.trim()
        ? config.title.trim()
        : "Automated follow-up";

    const days = Number(config.dueInDays ?? 1);
    if (!Number.isInteger(days) || days < 0 || days > 365) {
      throw new Error("Follow-up due days must be between 0 and 365.");
    }

    const due = new Date();
    due.setDate(due.getDate() + days);

    await db.orm.public.Task.create({
      title,
      description: "Automatically created by a PulseCRM workflow.",
      type: "Follow-up",
      priority: "Medium",
      due,
      done: false,
      userId,
      ...(data.lead?.id ? { leadId: data.lead.id } : {}),
      ...(data.deal?.id ? { dealId: data.deal.id } : {}),
    });

    return `Follow-up task "${title}" created.`;
  }

  throw new Error(`Unsupported automation action: ${actionType}`);
}

export async function runAutomationEvent(
  userId: number,
  triggerType: TriggerType,
  data: EventData
) {
  const automations = await db.orm.public.Automation
    .where({ userId, triggerType, isActive: true })
    .all();

  for (const automation of automations) {
    let status = "SUCCESS";
    let result: string | null = null;
    let errorMessage: string | null = null;

    try {
      if (!matchesConditions(automation.conditions, data)) {
        status = "SKIPPED";
        result = "Conditions were not met.";
      } else {
        result = await executeAction(
          automation.actionType,
          automation.actionConfig,
          userId,
          data
        );
      }
    } catch (error) {
      status = "FAILED";
      errorMessage =
        error instanceof Error ? error.message : "Automation failed.";
    }

    try {
      await db.orm.public.AutomationRun.create({
        status,
        triggerData: JSON.stringify(data),
        result,
        error: errorMessage,
        startedAt: new Date(),
        completedAt: new Date(),
        automationId: automation.id,
        userId,
      });

      await db.orm.public.Automation
        .where({ id: automation.id, userId })
        .update({ lastRunAt: new Date() });
    } catch (loggingError) {
      console.error("Automation execution logging failed:", loggingError);
    }
  }
}
