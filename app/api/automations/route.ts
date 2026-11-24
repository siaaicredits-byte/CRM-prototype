
import { connection, NextRequest, NextResponse } from "next/server";
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

export async function GET() {
  await connection();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const automations = await db.orm.public.Automation
      .where({ userId: user.id })
      .all();

    return NextResponse.json(
      { success: true, automations },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch automations failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch automations." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    if (!name || name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required and must be under 100 characters.",
        },
        { status: 400 }
      );
    }

    if (!triggers.includes(body.triggerType)) {
      return NextResponse.json(
        { success: false, message: "Invalid automation trigger." },
        { status: 400 }
      );
    }

    if (!actions.includes(body.actionType)) {
      return NextResponse.json(
        { success: false, message: "Invalid automation action." },
        { status: 400 }
      );
    }

    if (
      body.conditions !== undefined &&
      body.conditions !== null &&
      !Array.isArray(body.conditions)
    ) {
      return NextResponse.json(
        { success: false, message: "Conditions must be an array." },
        { status: 400 }
      );
    }

    if (
      body.actionConfig !== undefined &&
      (body.actionConfig === null ||
        typeof body.actionConfig !== "object" ||
        Array.isArray(body.actionConfig))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Action configuration must be an object.",
        },
        { status: 400 }
      );
    }

    const automation = await db.orm.public.Automation.create({
      name,
      description:
        typeof body.description === "string"
          ? body.description.trim() || null
          : null,
      triggerType: body.triggerType,
      conditions: JSON.stringify(body.conditions ?? []),
      actionType: body.actionType,
      actionConfig: JSON.stringify(body.actionConfig ?? {}),
      isActive: body.isActive !== false,
      lastRunAt: null,
      userId: user.id,
    });

    return NextResponse.json(
      { success: true, automation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create automation failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create automation." },
      { status: 500 }
    );
  }
}
