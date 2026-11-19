
import { db } from "@/src/prisma/db";
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
  const records = await db.orm.public.Lead
    .where({})
    .all();

  return records.map((record) => {
    const source = record.source as LeadSource;
    const status = record.status as LeadStatus;

    return {
      id: String(record.id),
      name: [record.firstName, record.lastName]
        .filter(Boolean)
        .join(" "),
      company: "—",
      email: record.email ?? "",
      phone: record.phone ?? "",
      source: validSources.includes(source) ? source : "Website",
      status: validStatuses.includes(
        status.charAt(0) + status.slice(1).toLowerCase() as LeadStatus
      )
        ? (status.charAt(0) + status.slice(1).toLowerCase()) as LeadStatus
        : "New",
      value: Number(record.value ?? 0),
      owner: record.owner ?? "Unassigned",
      createdAt: record.createdAt.toISOString().slice(0, 10),
    };
  });
}
