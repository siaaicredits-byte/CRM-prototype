import { runAutomationEvent } from "@/lib/automations/run-automation";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

const triggers = [
  "LEAD_CREATED",
  "LEAD_STATUS_CHANGED",
  "DEAL_CREATED",
];

const actions = [
  "ASSIGN_LEAD_OWNER",
  "UPDATE_LEAD_STATUS",
  "CREATE_FOLLOW_UP_TASK",
];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const automationId = Number(id);

    if (!Number.isSafeInteger(automationId) || automationId <= 0) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const existing = await db.orm.public.Automation
      .where({ id: automationId, userId: user.id })
      .first();

    if (!existing) {
      return NextResponse.json({ message: "Automation not found." }, { status: 404 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim() || body.name.length > 100) {
        return NextResponse.json({ message: "Invalid name." }, { status: 400 });
      }
      updates.name = body.name.trim();
    }

    if (body.description !== undefined) {
      updates.description =
        typeof body.description === "string" ? body.description.trim() || null : null;
    }

    if (body.triggerType !== undefined) {
      if (!triggers.includes(body.triggerType)) {
        return NextResponse.json({ message: "Invalid trigger." }, { status: 400 });
      }
      updates.triggerType = body.triggerType;
    }

    if (body.actionType !== undefined) {
      if (!actions.includes(body.actionType)) {
        return NextResponse.json({ message: "Invalid action." }, { status: 400 });
      }
      updates.actionType = body.actionType;
    }

    if (body.conditions !== undefined) {
      if (!Array.isArray(body.conditions)) {
        return NextResponse.json({ message: "Conditions must be an array." }, { status: 400 });
      }
      updates.conditions = JSON.stringify(body.conditions);
    }

    if (body.actionConfig !== undefined) {
      if (
        !body.actionConfig ||
        typeof body.actionConfig !== "object" ||
        Array.isArray(body.actionConfig)
      ) {
        return NextResponse.json({ message: "Invalid action configuration." }, { status: 400 });
      }
      updates.actionConfig = JSON.stringify(body.actionConfig);
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json({ message: "isActive must be a boolean." }, { status: 400 });
      }
      updates.isActive = body.isActive;
    }

    await db.orm.public.Automation
      .where({ id: automationId, userId: user.id })
      .update(updates);

    const updated = await db.orm.public.Automation
      .where({ id: automationId, userId: user.id })
      .first();

    return NextResponse.json({ success: true, automation: updated });
  } catch (error) {
    console.error("Update automation failed:", error);
    return NextResponse.json(
      { message: "Unable to update automation." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const automationId = Number(id);

    if (!Number.isSafeInteger(automationId) || automationId <= 0) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const existing = await db.orm.public.Automation
      .where({ id: automationId, userId: user.id })
      .first();

    if (!existing) {
      return NextResponse.json({ message: "Automation not found." }, { status: 404 });
    }

    // Preserve the run history by deleting it only after explicit automation removal.
    await db.orm.public.AutomationRun
      .where({ automationId, userId: user.id })
      .delete();

    await db.orm.public.Automation
      .where({ id: automationId, userId: user.id })
      .delete();

    return NextResponse.json({ success: true, message: "Automation deleted." });
  } catch (error) {
    console.error("Delete automation failed:", error);
    return NextResponse.json(
      { message: "Unable to delete automation." },
      { status: 500 }
    );
  }
}
