
import { connection, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

export async function GET() {
  await connection();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const leads = await db.orm.public.Lead
      .where({ userId: user.id })
      .all();

    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    for (const lead of leads) {
      const status = lead.status || "UNKNOWN";
      const source = lead.source || "Unknown";

      byStatus[status] = (byStatus[status] || 0) + 1;
      bySource[source] = (bySource[source] || 0) + 1;
    }

    const needsAttention = leads
      .filter((lead) => {
        const status = lead.status.toUpperCase();

        return (
          status === "NEW" ||
          status === "CONTACTED" ||
          (lead.score !== null && Number(lead.score) >= 75)
        );
      })
      .map((lead) => ({
        id: String(lead.id),
        name: [lead.firstName, lead.lastName]
          .filter(Boolean)
          .join(" "),
        status: lead.status,
        source: lead.source || "Unknown",
        score: lead.score,
        value: Number(lead.value || 0),
        priority:
          lead.status.toUpperCase() === "NEW" ||
          (lead.score !== null && Number(lead.score) >= 75)
            ? "High"
            : "Medium",
      }));

    const highValueLeads = leads
      .filter((lead) => Number(lead.value || 0) >= 50000)
      .map((lead) => ({
        id: String(lead.id),
        name: [lead.firstName, lead.lastName]
          .filter(Boolean)
          .join(" "),
        value: Number(lead.value || 0),
        status: lead.status,
      }));

    return NextResponse.json({
      success: true,
      agent: "Lead Organizer",
      summary: {
        totalLeads: leads.length,
        byStatus,
        bySource,
        needsAttention,
        highValueLeads,
      },
      message: "Leads organised successfully.",
      method: "Rule-based organisation",
    });
  } catch (error) {
    console.error("Lead Organizer failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to organise leads." },
      { status: 500 }
    );
  }
}
