
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

const validTypes = ["Call", "Email", "Meeting", "Follow-up"];
const validPriorities = ["High", "Medium", "Low"];

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const tasks = await db.orm.public.Task
      .where({ userId: currentUser.id })
      .all();

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET tasks error:", error);

    return NextResponse.json(
      { message: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    if (!title || title.length > 200) {
      return NextResponse.json(
        { message: "Title is required and must be under 200 characters" },
        { status: 400 }
      );
    }

    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { message: "Invalid task type" },
        { status: 400 }
      );
    }

    if (!validPriorities.includes(body.priority)) {
      return NextResponse.json(
        { message: "Invalid task priority" },
        { status: 400 }
      );
    }

    const due = new Date(body.due);

    if (!body.due || Number.isNaN(due.getTime())) {
      return NextResponse.json(
        { message: "A valid due date is required" },
        { status: 400 }
      );
    }

    const relationIds = ["leadId", "contactId", "dealId"] as const;

    const relations: {
      leadId?: number;
      contactId?: number;
      dealId?: number;
    } = {};

    for (const field of relationIds) {
      const value = body[field];

      if (value === undefined || value === null) continue;

      const id = Number(value);

      if (!Number.isSafeInteger(id) || id <= 0) {
        return NextResponse.json(
          { message: `Invalid ${field}` },
          { status: 400 }
        );
      }

      if (field === "leadId") {
        const record = await db.orm.public.Lead
          .where({ id, userId: currentUser.id })
          .first();

        if (!record) {
          return NextResponse.json(
            { message: "Lead not found" },
            { status: 404 }
          );
        }
      }

      if (field === "contactId") {
        const record = await db.orm.public.Contact
          .where({ id, userId: currentUser.id })
          .first();

        if (!record) {
          return NextResponse.json(
            { message: "Contact not found" },
            { status: 404 }
          );
        }
      }

      if (field === "dealId") {
        const record = await db.orm.public.Deal
          .where({ id, userId: currentUser.id })
          .first();

        if (!record) {
          return NextResponse.json(
            { message: "Deal not found" },
            { status: 404 }
          );
        }
      }

      relations[field] = id;
    }

    const task = await db.orm.public.Task.create({
      title,
      description:
        typeof body.description === "string"
          ? body.description.trim() || null
          : null,
      type: body.type,
      priority: body.priority,
      due,
      done: false,
      userId: currentUser.id,
      ...relations,
    });

    return NextResponse.json(
      { message: "Task created successfully", task },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST tasks error:", error);

    return NextResponse.json(
      { message: "Failed to create task" },
      { status: 500 }
    );
  }
}
