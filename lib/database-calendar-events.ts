
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

export type CalendarEventRecord = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  location: string | null;
  type: string;
  status: string;
  leadId: number | null;
  contactId: number | null;
  companyId: number | null;
  dealId: number | null;
};

export async function getDatabaseCalendarEvents(): Promise<CalendarEventRecord[]> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return [];
  }

  const records = await db.orm.public.CalendarEvent
    .where({ userId: currentUser.id })
    .all();

  return records
    .map((record) => ({
      id: String(record.id),
      title: record.title,
      description: record.description,
      startAt: record.startAt.toISOString(),
      endAt: record.endAt.toISOString(),
      location: record.location,
      type: record.type,
      status: record.status,
      leadId: record.leadId,
      contactId: record.contactId,
      companyId: record.companyId,
      dealId: record.dealId,
    }))
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() -
        new Date(b.startAt).getTime()
    );
}
