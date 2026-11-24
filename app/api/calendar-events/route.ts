
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

const relationFields = [
  "leadId",
  "contactId",
  "companyId",
  "dealId",
] as const;

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const events = await db.orm.public.CalendarEvent
      .where({ userId: currentUser.id })
      .all();

    return NextResponse.json(events);
  } catch (error) {
    console.error("GET calendar events error:", error);

    return NextResponse.json(
      { message: "Failed to fetch calendar events" },
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
        { message: "Invalid event type" },
        { status: 400 }
      );
    }

    const startAt = new Date(body.startAt);
    const endAt = new Date(body.endAt);

    if (
      !body.startAt ||
      !body.endAt ||
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime())
    ) {
      return NextResponse.json(
        { message: "Valid start and end dates are required" },
        { status: 400 }
      );
    }

    if (endAt <= startAt) {
      return NextResponse.json(
        { message: "End time must be after start time" },
        { status: 400 }
      );
    }

    const relations: {
      leadId?: number;
      contactId?: number;
      companyId?: number;
      dealId?: number;
    } = {};

    for (const field of relationFields) {
      const value = body[field];

      if (value === undefined || value === null || value === "") {
        continue;
      }

      const id = Number(value);

      if (!Number.isSafeInteger(id) || id <= 0) {
        return NextResponse.json(
          { message: `Invalid ${field}` },
          { status: 400 }
        );
      }

      let record = null;

      if (field === "leadId") {
        record = await db.orm.public.Lead
          .where({ id, userId: currentUser.id })
          .first();
      } else if (field === "contactId") {
        record = await db.orm.public.Contact
          .where({ id, userId: currentUser.id })
          .first();
      } else if (field === "companyId") {
        record = await db.orm.public.Company
          .where({ id, userId: currentUser.id })
          .first();
      } else if (field === "dealId") {
        record = await db.orm.public.Deal
          .where({ id, userId: currentUser.id })
          .first();
      }

      if (!record) {
        return NextResponse.json(
          { message: `${field} record not found` },
          { status: 404 }
        );
      }

      relations[field] = id;
    }

    const event = await db.orm.public.CalendarEvent.create({
      title,
      description:
        typeof body.description === "string"
          ? body.description.trim() || null
          : null,
      startAt,
      endAt,
      location:
        typeof body.location === "string"
          ? body.location.trim() || null
          : null,
      type: body.type,
      status: "SCHEDULED",
      userId: currentUser.id,
      ...relations,
    });

    return NextResponse.json(
      {
        message: "Calendar event created successfully",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST calendar events error:", error);

    return NextResponse.json(
      { message: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}
