
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

    const [leads, deals, tasks] = await Promise.all([
      db.orm.public.Lead.where({ userId: user.id }).all(),
      db.orm.public.Deal.where({ userId: user.id }).all(),
      db.orm.public.Task.where({ userId: user.id }).all(),
    ]);

    // Lead analysis
    const totalLeads = leads.length;

    const qualifiedLeads = leads.filter((lead) =>
      ["QUALIFIED", "PROPOSAL"].includes(lead.status.toUpperCase())
    );

    const lostLeads = leads.filter(
      (lead) => lead.status.toUpperCase() === "LOST"
    );

    const leadConversionRate =
      totalLeads > 0
        ? Number(((qualifiedLeads.length / totalLeads) * 100).toFixed(1))
        : 0;

    const leadsBySource: Record<string, number> = {};
    const leadsByStatus: Record<string, number> = {};

    for (const lead of leads) {
      leadsBySource[lead.source || "Unknown"] =
        (leadsBySource[lead.source || "Unknown"] || 0) + 1;

      leadsByStatus[lead.status || "Unknown"] =
        (leadsByStatus[lead.status || "Unknown"] || 0) + 1;
    }

    // Deal analysis
    const totalDeals = deals.length;

    const wonDeals = deals.filter(
      (deal) => deal.stage.toLowerCase() === "won"
    );

    const lostDeals = deals.filter(
      (deal) => deal.stage.toLowerCase() === "lost"
    );

    const activeDeals = deals.filter(
      (deal) => !["won", "lost"].includes(deal.stage.toLowerCase())
    );

    const pipelineValue = activeDeals.reduce(
      (sum, deal) => sum + Number(deal.value || 0),
      0
    );

    const wonValue = wonDeals.reduce(
      (sum, deal) => sum + Number(deal.value || 0),
      0
    );

    const closedDeals = wonDeals.length + lostDeals.length;

    const dealWinRate =
      closedDeals > 0
        ? Number(((wonDeals.length / closedDeals) * 100).toFixed(1))
        : 0;

    const dealsByStage: Record<string, number> = {};

    for (const deal of deals) {
      dealsByStage[deal.stage || "Unknown"] =
        (dealsByStage[deal.stage || "Unknown"] || 0) + 1;
    }

    // Task analysis
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const pendingTasks = tasks.filter((task) => !task.done);

    const completedTasks = tasks.filter((task) => task.done);

    const overdueTasks = pendingTasks.filter(
      (task) => new Date(task.due) < today
    );

    const upcomingTasks = pendingTasks.filter((task) => {
      const due = new Date(task.due);
      const nextSevenDays = new Date(today);
      nextSevenDays.setDate(today.getDate() + 7);

      return due >= today && due <= nextSevenDays;
    });

    // Rule-based recommendations
    const insights: string[] = [];

    if (totalLeads === 0) {
      insights.push("Start adding leads to build your sales pipeline.");
    } else if (leadConversionRate < 30) {
      insights.push(
        "Lead qualification is below 30%. Review your follow-up and qualification process."
      );
    } else {
      insights.push(
        "Lead qualification is progressing well. Continue engaging qualified prospects."
      );
    }

    if (activeDeals.length === 0) {
      insights.push("There are no active deals. Create new opportunities.");
    } else {
      insights.push(
        `You have ${activeDeals.length} active deals worth ₹${pipelineValue.toLocaleString("en-IN")}.`
      );
    }

    if (overdueTasks.length > 0) {
      insights.push(
        `${overdueTasks.length} overdue tasks need immediate attention.`
      );
    }

    if (upcomingTasks.length > 0) {
      insights.push(
        `${upcomingTasks.length} tasks are due within the next seven days.`
      );
    }

    if (totalDeals > 0 && closedDeals === 0) {
      insights.push(
        "No deals have been closed yet. Focus on moving opportunities towards closure."
      );
    }

    return NextResponse.json({
      success: true,
      agent: "Sales Analyst",

      summary: {
        leads: {
          total: totalLeads,
          qualified: qualifiedLeads.length,
          lost: lostLeads.length,
          qualificationRate: leadConversionRate,
          bySource: leadsBySource,
          byStatus: leadsByStatus,
        },

        deals: {
          total: totalDeals,
          active: activeDeals.length,
          won: wonDeals.length,
          lost: lostDeals.length,
          pipelineValue,
          wonValue,
          winRate: dealWinRate,
          byStage: dealsByStage,
        },

        tasks: {
          total: tasks.length,
          pending: pendingTasks.length,
          completed: completedTasks.length,
          overdue: overdueTasks.length,
          upcoming: upcomingTasks.length,
        },
      },

      insights,
      message: "Sales analysis completed successfully.",
      method: "Rule-based CRM sales analysis",
    });
  } catch (error) {
    console.error("Sales Analyst failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to analyse sales data.",
      },
      { status: 500 }
    );
  }
}
