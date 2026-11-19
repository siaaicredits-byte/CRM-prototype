
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = Number(id);

    if (!Number.isInteger(leadId) || leadId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid lead ID." },
        { status: 400 }
      );
    }

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
        { success: false, message: "Invalid source or status." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        { success: false, message: "Enter a valid lead value." },
        { status: 400 }
      );
    }

    const existingLead = await db.orm.public.Lead
      .where({ id: leadId })
      .first();

    if (!existingLead) {
      return NextResponse.json(
        { success: false, message: "Lead not found." },
        { status: 404 }
      );
    }

    await db.orm.public.Lead
      .where({ id: leadId })
      .update({
        firstName,
        lastName: lastName || null,
        email,
        phone: phone || null,
        source,
        status,
        owner: owner || "Unassigned",
        value,
      });

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully.",
    });
  } catch (error) {
    console.error("Update lead failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update lead." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = Number(id);

    if (!Number.isInteger(leadId) || leadId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid lead ID." },
        { status: 400 }
      );
    }

    const existingLead = await db.orm.public.Lead
      .where({ id: leadId })
      .first();

    if (!existingLead) {
      return NextResponse.json(
        { success: false, message: "Lead not found." },
        { status: 404 }
      );
    }

    await db.orm.public.Lead
      .where({ id: leadId })
      .delete();

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully.",
    });
  } catch (error) {
    console.error("Delete lead failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete lead." },
      { status: 500 }
    );
  }
}
