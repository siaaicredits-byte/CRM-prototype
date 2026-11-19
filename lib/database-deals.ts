
import { db } from "@/src/prisma/db";
import type { Deal, DealStageId } from "@/types/crm";

export async function getDatabaseDeals(): Promise<Deal[]> {
  const [records, companies] = await Promise.all([
    db.orm.public.Deal.where({}).all(),
    db.orm.public.Company.where({}).all(),
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
