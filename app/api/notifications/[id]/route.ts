
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getNotificationId(context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function PATCH(
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

    const id = await getNotificationId(context);

    if (!id) {
      return NextResponse.json(
        { message: "Invalid notification ID" },
        { status: 400 }
      );
    }

    const existingNotification = await db.orm.public.Notification
      .where({ id, userId: currentUser.id })
      .first();

    if (!existingNotification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (typeof body.isRead !== "boolean") {
      return NextResponse.json(
        { message: "isRead must be a boolean" },
        { status: 400 }
      );
    }

    const notification = await db.orm.public.Notification
      .where({ id, userId: currentUser.id })
      .update({ isRead: body.isRead });

    return NextResponse.json({
      message: "Notification updated successfully",
      notification,
    });
  } catch (error) {
    console.error("PATCH notification error:", error);

    return NextResponse.json(
      { message: "Failed to update notification" },
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

    const id = await getNotificationId(context);

    if (!id) {
      return NextResponse.json(
        { message: "Invalid notification ID" },
        { status: 400 }
      );
    }

    const existingNotification = await db.orm.public.Notification
      .where({ id, userId: currentUser.id })
      .first();

    if (!existingNotification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    await db.orm.public.Notification
      .where({ id, userId: currentUser.id })
      .delete();

    return NextResponse.json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("DELETE notification error:", error);

    return NextResponse.json(
      { message: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
