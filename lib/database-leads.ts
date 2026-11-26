
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";
import type { Lead, LeadSource, LeadStatus } from "@/types/crm";

const validSources: LeadSource[] = [
  "Website",
  "Referral",
  "LinkedIn",
  "Event",
  "Cold Outreach",
];

const validStatuses: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Lost",
];

export async function getDatabaseLeads(): Promise<Lead[]> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    console.log("[LEADS DEBUG] No authenticated user.");
    return [];
  }

  let records;

  console.log("[LEADS DEBUG] User:", {
    id: currentUser.id,
    role: currentUser.role,
  });

  if (currentUser.role === "MASTER_ADMIN") {
    records = await db.orm.public.Lead.all();

    console.log("[LEADS DEBUG] Master Admin - all leads:", records.length);
  } else {
    const memberships = await db.orm.public.ProjectMember
      .where({ userId: currentUser.id })
      .all();

    const projectIds = memberships.map((membership) =>
      Number(membership.projectId)
    );

    console.log("[LEADS DEBUG] Assigned project IDs:", projectIds);

    const projectLeadGroups = await Promise.all(
      projectIds.map((projectId) =>
        db.orm.public.Lead.where({ projectId }).all()
      )
    );

    const ownedLeads = await db.orm.public.Lead
      .where({ userId: currentUser.id })
      .all();

    const unassignedOwnedLeads = ownedLeads.filter(
      (lead) => lead.projectId === null
    );

    records = Array.from(
      new Map(
        [...projectLeadGroups.flat(), ...unassignedOwnedLeads].map(
          (record) => [Number(record.id), record]
        )
      ).values()
    );

    console.log("[LEADS DEBUG] Results:", {
      projectLeads: projectLeadGroups.flat().length,
      ownUnassignedLeads: unassignedOwnedLeads.length,
      totalVisibleLeads: records.length,
    });
  }

  return records.map((record) => {
    const source = record.source as LeadSource;
    const status = record.status as LeadStatus;

    const normalizedStatus =
      status.charAt(0) + status.slice(1).toLowerCase();

    return {
      id: String(record.id),
      name: [record.firstName, record.lastName]
        .filter(Boolean)
        .join(" "),
      company: "—",
      email: record.email ?? "",
      phone: record.phone ?? "",
      source: validSources.includes(source) ? source : "Website",
      status: validStatuses.includes(normalizedStatus as LeadStatus)
        ? (normalizedStatus as LeadStatus)
        : "New",
      value: Number(record.value ?? 0),
      owner: record.owner ?? "Unassigned",
      createdAt: record.createdAt.toISOString().slice(0, 10),
    };
  });
}
