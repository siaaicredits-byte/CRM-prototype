
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

const validTypes = ["Call", "Email", "Meeting", "Follow-up"];
const validPriorities = ["High", "Medium", "Low"];

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: rawId } = await context.params;
    const id = Number(rawId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "Invalid task ID" },
        { status: 400 }
      );
    }

    const existingTask = await db.orm.public.Task
      .where({ id, userId: currentUser.id })
      .first();

    if (!existingTask) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.trim().length > 200
      ) {
        return NextResponse.json(
          { message: "Invalid task title" },
          { status: 400 }
        );
      }

      updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (
        body.description !== null &&
        typeof body.description !== "string"
      ) {
        return NextResponse.json(
          { message: "Invalid description" },
          { status: 400 }
        );
      }

      updates.description =
        typeof body.description === "string"
          ? body.description.trim() || null
          : null;
    }

    if (body.type !== undefined) {
      if (!validTypes.includes(body.type)) {
        return NextResponse.json(
          { message: "Invalid task type" },
          { status: 400 }
        );
      }

      updates.type = body.type;
    }

    if (body.priority !== undefined) {
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { message: "Invalid task priority" },
          { status: 400 }
        );
      }

      updates.priority = body.priority;
    }

    if (body.due !== undefined) {
      const due = new Date(body.due);

      if (Number.isNaN(due.getTime())) {
        return NextResponse.json(
          { message: "Invalid due date" },
          { status: 400 }
        );
      }

      updates.due = due;
    }

    if (body.done !== undefined) {
      if (typeof body.done !== "boolean") {
        return NextResponse.json(
          { message: "Invalid completion status" },
          { status: 400 }
        );
      }

      updates.done = body.done;
    }

    const relationFields = ["leadId", "contactId", "dealId"] as const;

    for (const field of relationFields) {
      if (body[field] === undefined) continue;

      if (body[field] === null) {
        updates[field] = null;
        continue;
      }

      const relationId = Number(body[field]);

      if (!Number.isSafeInteger(relationId) || relationId <= 0) {
        return NextResponse.json(
          { message: `Invalid ${field}` },
          { status: 400 }
        );
      }

      if (field === "leadId") {
        const record = await db.orm.public.Lead
          .where({ id: relationId, userId: currentUser.id })
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
          .where({ id: relationId, userId: currentUser.id })
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
          .where({ id: relationId, userId: currentUser.id })
          .first();

        if (!record) {
          return NextResponse.json(
            { message: "Deal not found" },
            { status: 404 }
          );
        }
      }

      updates[field] = relationId;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "No valid fields provided" },
        { status: 400 }
      );
    }

    const task = await db.orm.public.Task
      .where({ id, userId: currentUser.id })
      .update(updates);

    return NextResponse.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("PUT task error:", error);

    return NextResponse.json(
      { message: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: rawId } = await context.params;
    const id = Number(rawId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "Invalid task ID" },
        { status: 400 }
      );
    }

    const existingTask = await db.orm.public.Task
      .where({ id, userId: currentUser.id })
      .first();

    if (!existingTask) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    await db.orm.public.Task
      .where({ id, userId: currentUser.id })
      .delete();

    return NextResponse.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE task error:", error);

    return NextResponse.json(
      { message: "Failed to delete task" },
      { status: 500 }
    );
  }
}
