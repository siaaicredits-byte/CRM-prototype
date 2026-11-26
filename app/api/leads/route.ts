
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

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    // Master Admin can access every lead.
    if (currentUser.role === "MASTER_ADMIN") {
      const leads = await db.orm.public.Lead.all();

      return NextResponse.json({
        success: true,
        leads,
      });
    }

    // Find projects assigned to the current user.
    const memberships = await db.orm.public.ProjectMember
      .where({ userId: currentUser.id })
      .all();

    const projectIds = memberships.map((item) => Number(item.projectId));

    // Retrieve leads belonging to assigned projects.
    const projectLeadGroups = await Promise.all(
      projectIds.map((projectId) =>
        db.orm.public.Lead.where({ projectId }).all()
      )
    );

    const projectLeads = projectLeadGroups.flat();

    // Preserve access to the user's existing unassigned leads.
    const ownedLeads = await db.orm.public.Lead
      .where({ userId: currentUser.id })
      .all();

    const unassignedOwnedLeads = ownedLeads.filter(
      (lead) => lead.projectId === null
    );

    // Combine results without duplicates.
    const uniqueLeads = Array.from(
      new Map(
        [...projectLeads, ...unassignedOwnedLeads].map((lead) => [
          Number(lead.id),
          lead,
        ])
      ).values()
    );

    return NextResponse.json({
      success: true,
      leads: uniqueLeads,
    });
  } catch (error) {
    console.error("Fetch leads failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve leads.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
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
        {
          success: false,
          message: "Invalid lead source or status.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        { success: false, message: "Enter a valid lead value." },
        { status: 400 }
      );
    }

    // Project assignment is optional.
    let projectId: number | null = null;

    if (
      body.projectId !== undefined &&
      body.projectId !== null &&
      body.projectId !== ""
    ) {
      projectId = Number(body.projectId);

      if (!Number.isInteger(projectId) || projectId <= 0) {
        return NextResponse.json(
          { success: false, message: "Invalid project ID." },
          { status: 400 }
        );
      }

      const project = await db.orm.public.Project
        .where({ id: projectId })
        .first();

      if (!project) {
        return NextResponse.json(
          { success: false, message: "Project not found." },
          { status: 404 }
        );
      }

      // Non-admin users must belong to the selected project.
      if (currentUser.role !== "MASTER_ADMIN") {
        const membership = await db.orm.public.ProjectMember
          .where({
            projectId,
            userId: currentUser.id,
          })
          .first();

        if (!membership) {
          return NextResponse.json(
            {
              success: false,
              message: "You are not a member of this project.",
            },
            { status: 403 }
          );
        }
      }
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
      owner: currentUser.name || currentUser.email,
      userId: currentUser.id,
      projectId,
    });

    try {
      await runAutomationEvent(currentUser.id, "LEAD_CREATED", {
        lead: {
          id: lead.id,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email ?? "",
          status: lead.status,
          source: lead.source,
          score: lead.score,
          value: lead.value,
          owner: lead.owner,
        },
      });
    } catch (error) {
      console.error("Lead-created automation event failed:", error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lead created successfully.",
        lead,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create lead failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create lead.",
      },
      { status: 500 }
    );
  }
}
