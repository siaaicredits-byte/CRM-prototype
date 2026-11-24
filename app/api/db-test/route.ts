
import { connection, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

export async function GET() {
  // Prevent database queries during build-time prerendering.
  await connection();

  try {
    const lead = await db.orm.public.Lead
      .where({ id: 1 })
      .first();

    return NextResponse.json(
      {
        success: true,
        message: "Prisma connected to PostgreSQL",
        databaseQuerySuccessful: true,
        sampleLead: lead,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection or query failed",
      },
      { status: 500 }
    );
  }
}
