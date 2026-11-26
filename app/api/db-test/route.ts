
import { connection, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

export async function GET() {
  await connection();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    await db.orm.public.User
      .where({ id: user.id })
      .first();

    return NextResponse.json({
      success: true,
      message: "Database connection successful.",
      databaseQuerySuccessful: true,
    });
  } catch (error) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection or query failed.",
      },
      { status: 500 }
    );
  }
}
