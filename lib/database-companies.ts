
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

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
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return [];
  }

  const records = await db.orm.public.Company
    .where({ userId: currentUser.id })
    .all();

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
