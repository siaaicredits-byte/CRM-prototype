
import { runAutomationEvent } from "@/lib/automations/run-automation";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

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
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

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

    // Check whether the user can access this lead.
    let hasAccess =
      currentUser.role === "MASTER_ADMIN" ||
      Number(existingLead.userId) === currentUser.id;

    if (!hasAccess && existingLead.projectId !== null) {
      const membership = await db.orm.public.ProjectMember
        .where({
          projectId: Number(existingLead.projectId),
          userId: currentUser.id,
        })
        .first();

      hasAccess = Boolean(membership);
    }

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this lead." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const source = String(body.source ?? "");
    const status = String(body.status ?? "NEW");
    const value = Number(body.value ?? 0);

    if (!firstName || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "First name and email are required.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (
      !allowedSources.includes(source) ||
      !allowedStatuses.includes(status)
    ) {
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

    await db.orm.public.Lead
      .where({ id: leadId })
      .update({
        firstName,
        lastName: lastName || null,
        email,
        phone: phone || null,
        source,
        status,
        owner: currentUser.name || currentUser.email,
        value,
      });

    // Run automation only when the lead status changes.
    if (existingLead.status !== status) {
      try {
        await runAutomationEvent(currentUser.id, "LEAD_STATUS_CHANGED", {
          previousStatus: existingLead.status,
          lead: {
            id: existingLead.id,
            firstName,
            lastName: lastName || null,
            email,
            status,
            source,
            score: existingLead.score,
            value,
            owner: currentUser.name || currentUser.email,
          },
        });
      } catch (error) {
        console.error("Lead-status-changed automation event failed:", error);
      }
    }

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
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

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

    // Check whether the user can access this lead.
    let hasAccess =
      currentUser.role === "MASTER_ADMIN" ||
      Number(existingLead.userId) === currentUser.id;

    if (!hasAccess && existingLead.projectId !== null) {
      const membership = await db.orm.public.ProjectMember
        .where({
          projectId: Number(existingLead.projectId),
          userId: currentUser.id,
        })
        .first();

      hasAccess = Boolean(membership);
    }

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this lead." },
        { status: 403 }
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
