
import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

export async function PATCH() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await db.orm.public.Notification
      .where({
        userId: currentUser.id,
        isRead: false,
      })
      .all();

    await Promise.all(
      notifications.map((notification) =>
        db.orm.public.Notification
          .where({
            id: notification.id,
            userId: currentUser.id,
          })
          .update({ isRead: true })
      )
    );

    return NextResponse.json({
      message: "All notifications marked as read",
      updatedCount: notifications.length,
    });
  } catch (error) {
    console.error("PATCH read-all notifications error:", error);

    return NextResponse.json(
      { message: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
