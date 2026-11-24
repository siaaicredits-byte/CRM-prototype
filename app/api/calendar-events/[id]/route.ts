
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

const validTypes = [
  "MEETING",
  "CALL",
  "DEMO",
  "FOLLOW_UP",
  "OTHER",
];

const validStatuses = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
];

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
        { message: "Invalid event ID" },
        { status: 400 }
      );
    }

    const existingEvent = await db.orm.public.CalendarEvent
      .where({ id, userId: currentUser.id })
      .first();

    if (!existingEvent) {
      return NextResponse.json(
        { message: "Calendar event not found" },
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
          { message: "Invalid event title" },
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

    if (body.location !== undefined) {
      if (
        body.location !== null &&
        typeof body.location !== "string"
      ) {
        return NextResponse.json(
          { message: "Invalid location" },
          { status: 400 }
        );
      }

      updates.location =
        typeof body.location === "string"
          ? body.location.trim() || null
          : null;
    }

    if (body.type !== undefined) {
      if (
        typeof body.type !== "string" ||
        !validTypes.includes(body.type)
      ) {
        return NextResponse.json(
          { message: "Invalid event type" },
          { status: 400 }
        );
      }

      updates.type = body.type;
    }

    if (body.status !== undefined) {
      if (
        typeof body.status !== "string" ||
        !validStatuses.includes(body.status)
      ) {
        return NextResponse.json(
          { message: "Invalid event status" },
          { status: 400 }
        );
      }

      updates.status = body.status;
    }

    if (body.startAt !== undefined) {
      const startAt = new Date(body.startAt);

      if (Number.isNaN(startAt.getTime())) {
        return NextResponse.json(
          { message: "Invalid start date" },
          { status: 400 }
        );
      }

      updates.startAt = startAt;
    }

    if (body.endAt !== undefined) {
      const endAt = new Date(body.endAt);

      if (Number.isNaN(endAt.getTime())) {
        return NextResponse.json(
          { message: "Invalid end date" },
          { status: 400 }
        );
      }

      updates.endAt = endAt;
    }

    const finalStartAt =
      updates.startAt instanceof Date
        ? updates.startAt
        : new Date(existingEvent.startAt);

    const finalEndAt =
      updates.endAt instanceof Date
        ? updates.endAt
        : new Date(existingEvent.endAt);

    if (finalEndAt <= finalStartAt) {
      return NextResponse.json(
        { message: "End time must be after start time" },
        { status: 400 }
      );
    }

    const relationFields = [
      "leadId",
      "contactId",
      "companyId",
      "dealId",
    ] as const;

    for (const field of relationFields) {
      if (body[field] === undefined) continue;

      if (body[field] === null || body[field] === "") {
        updates[field] = null;
        continue;
      }

      const relationId = Number(body[field]);

      if (
        !Number.isSafeInteger(relationId) ||
        relationId <= 0
      ) {
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

      if (field === "companyId") {
        const record = await db.orm.public.Company
          .where({ id: relationId, userId: currentUser.id })
          .first();

        if (!record) {
          return NextResponse.json(
            { message: "Company not found" },
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

    const event = await db.orm.public.CalendarEvent
      .where({ id, userId: currentUser.id })
      .update(updates);

    return NextResponse.json({
      message: "Calendar event updated successfully",
      event,
    });
  } catch (error) {
    console.error("PUT calendar event error:", error);

    return NextResponse.json(
      { message: "Failed to update calendar event" },
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
        { message: "Invalid event ID" },
        { status: 400 }
      );
    }

    const existingEvent = await db.orm.public.CalendarEvent
      .where({ id, userId: currentUser.id })
      .first();

    if (!existingEvent) {
      return NextResponse.json(
        { message: "Calendar event not found" },
        { status: 404 }
      );
    }

    await db.orm.public.CalendarEvent
      .where({ id, userId: currentUser.id })
      .delete();

    return NextResponse.json({
      message: "Calendar event deleted successfully",
    });
  } catch (error) {
    console.error("DELETE calendar event error:", error);

    return NextResponse.json(
      { message: "Failed to delete calendar event" },
      { status: 500 }
    );
  }
}
