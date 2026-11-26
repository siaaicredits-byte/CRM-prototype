
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";
import { runAutomationEvent } from "@/lib/automations/run-automation";

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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ImportLead = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  phone?: unknown;
  source?: unknown;
  status?: unknown;
  value?: unknown;
};

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
    const rows = body.leads;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No lead records provided." },
        { status: 400 }
      );
    }

    if (rows.length > 500) {
      return NextResponse.json(
        { success: false, message: "Maximum 500 leads per import." },
        { status: 400 }
      );
    }

    // Get the user's existing leads.
    const ownedLeads = await db.orm.public.Lead
      .where({ userId: currentUser.id })
      .all();

    // Get leads from projects the user belongs to.
    const memberships = await db.orm.public.ProjectMember
      .where({ userId: currentUser.id })
      .all();

    const projectLeadGroups = await Promise.all(
      memberships.map((membership) =>
        db.orm.public.Lead
          .where({ projectId: Number(membership.projectId) })
          .all()
      )
    );

    const accessibleLeads = [
      ...ownedLeads,
      ...projectLeadGroups.flat(),
    ];

    const existingEmails = new Set(
      accessibleLeads.map((lead) =>
        String(lead.email ?? "").trim().toLowerCase()
      )
    );

    const seenEmails = new Set<string>();
    const errors: { row: number; email: string; reason: string }[] = [];

    let imported = 0;
    let skipped = 0;

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index] as ImportLead;
      const rowNumber = index + 2;

      const firstName = String(row.firstName ?? "").trim();
      const lastName = String(row.lastName ?? "").trim();
      const email = String(row.email ?? "").trim().toLowerCase();
      const phone = String(row.phone ?? "").trim();
      const source = String(row.source ?? "Website").trim();
      const status = String(row.status ?? "NEW").trim().toUpperCase();
      const value = Number(row.value ?? 0);

      if (!firstName || !emailPattern.test(email)) {
        skipped++;
        errors.push({
          row: rowNumber,
          email,
          reason: "First name and a valid email are required.",
        });
        continue;
      }

      if (!allowedSources.includes(source)) {
        skipped++;
        errors.push({
          row: rowNumber,
          email,
          reason: "Invalid lead source.",
        });
        continue;
      }

      if (!allowedStatuses.includes(status)) {
        skipped++;
        errors.push({
          row: rowNumber,
          email,
          reason: "Invalid lead status.",
        });
        continue;
      }

      if (!Number.isFinite(value) || value < 0) {
        skipped++;
        errors.push({
          row: rowNumber,
          email,
          reason: "Invalid lead value.",
        });
        continue;
      }

      if (existingEmails.has(email) || seenEmails.has(email)) {
        skipped++;
        errors.push({
          row: rowNumber,
          email,
          reason: "Duplicate email address.",
        });
        continue;
      }

      try {
        // Imported leads remain unassigned and belong to the importing user.
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
        });

        imported++;
        seenEmails.add(email);

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
        } catch (automationError) {
          console.error(
            "Imported lead automation failed:",
            automationError
          );
        }
      } catch (error) {
        console.error(`Import failed for row ${rowNumber}:`, error);
        skipped++;
        errors.push({
          row: rowNumber,
          email,
          reason: "Database could not save this lead.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Bulk import completed.",
      summary: {
        total: rows.length,
        imported,
        skipped,
        failed: errors.length,
      },
      errors,
    });
  } catch (error) {
    console.error("Bulk lead import failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to import leads.",
      },
      { status: 500 }
    );
  }
}
