
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";
import type { Contact } from "@/types/crm";

export async function getDatabaseContacts(): Promise<Contact[]> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return [];
  }

  const [records, companies] = await Promise.all([
    db.orm.public.Contact
      .where({ userId: currentUser.id })
      .all(),

    db.orm.public.Company
      .where({ userId: currentUser.id })
      .all(),
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
