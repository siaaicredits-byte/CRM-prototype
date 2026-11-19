
import { db } from "@/src/prisma/db";
import type { Contact } from "@/types/crm";

export async function getDatabaseContacts(): Promise<Contact[]> {
  const [records, companies] = await Promise.all([
    db.orm.public.Contact.where({}).all(),
    db.orm.public.Company.where({}).all(),
  ]);

  const companyNames = new Map(
    companies.map((company) => [company.id, company.name])
  );

  return records.map((record) => ({
    id: String(record.id),
    name: [record.firstName, record.lastName]
      .filter(Boolean)
      .join(" "),
    title: record.jobTitle ?? "",
    company: record.companyId
      ? companyNames.get(record.companyId) ?? "—"
      : "—",
    email: record.email ?? "",
    phone: record.phone ?? "",
    lastContacted: record.updatedAt.toISOString().slice(0, 10),
  }));
}
