
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

const validTypes = [
  "INFO",
  "SUCCESS",
  "WARNING",
  "ERROR",
  "REMINDER",
];

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await db.orm.public.Notification
      .where({ userId: currentUser.id })
      .all();

    const sortedNotifications = [...notifications].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    const unreadCount = sortedNotifications.filter(
      (notification) => !notification.isRead
    ).length;

    return NextResponse.json({
      notifications: sortedNotifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET notifications error:", error);

    return NextResponse.json(
      { message: "Failed to fetch notifications" },
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

    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!title || title.length > 200) {
      return NextResponse.json(
        { message: "Title is required and must be under 200 characters" },
        { status: 400 }
      );
    }

    if (!message || message.length > 2000) {
      return NextResponse.json(
        { message: "Message is required and must be under 2000 characters" },
        { status: 400 }
      );
    }

    const type = body.type ?? "INFO";

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { message: "Invalid notification type" },
        { status: 400 }
      );
    }

    let href: string | null = null;

    if (body.href !== undefined && body.href !== null) {
      if (
        typeof body.href !== "string" ||
        !body.href.startsWith("/") ||
        body.href.startsWith("//") ||
        body.href.length > 500
      ) {
        return NextResponse.json(
          { message: "Invalid notification link" },
          { status: 400 }
        );
      }

      href = body.href;
    }

    let dedupeKey: string | null = null;

    if (body.dedupeKey !== undefined && body.dedupeKey !== null) {
      if (
        typeof body.dedupeKey !== "string" ||
        !body.dedupeKey.trim() ||
        body.dedupeKey.length > 200
      ) {
        return NextResponse.json(
          { message: "Invalid deduplication key" },
          { status: 400 }
        );
      }

      dedupeKey = body.dedupeKey.trim();
    }

    if (dedupeKey) {
      const existingNotification = await db.orm.public.Notification
        .where({
          userId: currentUser.id,
          dedupeKey,
        })
        .first();

      if (existingNotification) {
        return NextResponse.json({
          message: "Notification already exists",
          notification: existingNotification,
        });
      }
    }

    const notification = await db.orm.public.Notification.create({
      title,
      message,
      type,
      isRead: false,
      href,
      dedupeKey,
      userId: currentUser.id,
    });

    return NextResponse.json(
      {
        message: "Notification created successfully",
        notification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST notifications error:", error);

    return NextResponse.json(
      { message: "Failed to create notification" },
      { status: 500 }
    );
  }
}
