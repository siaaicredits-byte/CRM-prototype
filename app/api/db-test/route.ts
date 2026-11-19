import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

export async function GET() {
  try {
    const lead = await db.orm.public.Lead
      .where({ id: 1 })
      .first();

    return NextResponse.json({
      success: true,
      message: "Prisma connected to PostgreSQL",
      databaseQuerySuccessful: true,
      sampleLead: lead,
    });
  } catch (error) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      { success: false, message: "Database query failed" },
      { status: 500 }
    );
  }
}
