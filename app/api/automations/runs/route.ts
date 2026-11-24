
import { connection, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

export async function GET() {
  await connection();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const runs = await db.orm.public.AutomationRun
      .where({ userId: user.id })
      .all();

    return NextResponse.json(
      {
        success: true,
        runs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch automation runs failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch automation history.",
      },
      { status: 500 }
    );
  }
}
