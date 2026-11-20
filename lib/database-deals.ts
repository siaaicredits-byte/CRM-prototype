
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";
import type { Deal, DealStageId } from "@/types/crm";

export async function getDatabaseDeals(): Promise<Deal[]> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return [];
  }

  const [records, companies] = await Promise.all([
    db.orm.public.Deal
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
    title: record.title,
    company: record.companyId
      ? companyNames.get(record.companyId) ?? "—"
      : "—",
    stage: record.stage as DealStageId,
    value: record.value,
    owner: record.owner,
    closeDate: record.closeDate.toISOString().slice(0, 10),
  }));
}
