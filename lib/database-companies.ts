
import { db } from "@/src/prisma/db";

export interface DatabaseCompany {
  id: string;
  name: string;
  website: string;
  industry: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  createdAt: string;
}

export async function getDatabaseCompanies(): Promise<DatabaseCompany[]> {
  const records = await db.orm.public.Company.where({}).all();

  return records.map((record) => ({
    id: String(record.id),
    name: record.name,
    website: record.website ?? "",
    industry: record.industry ?? "",
    phone: record.phone ?? "",
    email: record.email ?? "",
    address: record.address ?? "",
    description: record.description ?? "",
    createdAt: record.createdAt.toISOString(),
  }));
}
