
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

    const deals = await db.orm.public.Deal
      .where({ userId: user.id })
      .all();

    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const nextSevenDays = new Date(today);
    nextSevenDays.setDate(today.getDate() + 7);

    const byStage: Record<string, number> = {};

    for (const deal of deals) {
      const stage = deal.stage || "Unknown";
      byStage[stage] = (byStage[stage] || 0) + 1;
    }

    const activeDeals = deals.filter(
      (deal) => !["won", "lost"].includes(deal.stage.toLowerCase())
    );

    const highValueDeals = activeDeals
      .filter((deal) => Number(deal.value) >= 50000)
      .map((deal) => ({
        id: String(deal.id),
        title: deal.title,
        stage: deal.stage,
        value: Number(deal.value),
        closeDate: deal.closeDate,
      }));

    const upcomingDeals = activeDeals
      .filter((deal) => {
        const closeDate = new Date(deal.closeDate);
        return closeDate >= today && closeDate <= nextSevenDays;
      })
      .map((deal) => ({
        id: String(deal.id),
        title: deal.title,
        stage: deal.stage,
        value: Number(deal.value),
        closeDate: deal.closeDate,
      }));

    const overdueDeals = activeDeals
      .filter((deal) => new Date(deal.closeDate) < today)
      .map((deal) => ({
        id: String(deal.id),
        title: deal.title,
        stage: deal.stage,
        value: Number(deal.value),
        closeDate: deal.closeDate,
      }));

    const needsAttention = [
      ...overdueDeals.map((deal) => ({
        ...deal,
        priority: "High",
        recommendation: "The expected closing date has passed. Follow up and update the deal status.",
      })),
      ...upcomingDeals.map((deal) => ({
        ...deal,
        priority: "Medium",
        recommendation: "The closing date is approaching. Contact the prospect and confirm the next steps.",
      })),
    ];

    const pipelineValue = activeDeals.reduce(
      (total, deal) => total + Number(deal.value || 0),
      0
    );

    return NextResponse.json({
      success: true,
      agent: "Deal Tracker",
      summary: {
        totalDeals: deals.length,
        activeDeals: activeDeals.length,
        pipelineValue,
        byStage,
        highValueDeals,
        upcomingDeals,
        overdueDeals,
        needsAttention,
      },
      message: "Deals analysed successfully.",
      method: "Rule-based deal tracking",
    });
  } catch (error) {
    console.error("Deal Tracker failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to analyse deals." },
      { status: 500 }
    );
  }
}
