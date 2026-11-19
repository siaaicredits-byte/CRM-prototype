
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

const allowedSources = [
  "Website",
  "Referral",
  "LinkedIn",
  "Event",
  "Cold Outreach",
];

const allowedStatuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "LOST",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const source = String(body.source ?? "");
    const status = String(body.status ?? "NEW");
    const owner = String(body.owner ?? "Unassigned").trim();
    const value = Number(body.value ?? 0);

    if (!firstName || !email) {
      return NextResponse.json(
        { success: false, message: "First name and email are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (!allowedSources.includes(source) || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid lead source or status." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        { success: false, message: "Enter a valid lead value." },
        { status: 400 }
      );
    }

    const lead = await db.orm.public.Lead.create({
      firstName,
      lastName: lastName || null,
      email,
      phone: phone || null,
      source,
      status,
      score: null,
      value,
      owner: owner || "Unassigned",
    });

    return NextResponse.json(
      { success: true, message: "Lead created successfully.", lead },
      { status: 201 }
    );
    } 
    catch (error) {
    console.error("Create lead failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}