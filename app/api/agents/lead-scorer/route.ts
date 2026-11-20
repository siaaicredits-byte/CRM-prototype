
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

function calculateLeadScore(lead: {
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: string;
  value: number;
}) {
  let score = 0;
  const reasons: string[] = [];

  if (lead.email) {
    score += 15;
    reasons.push("Email address available (+15)");
  }

  if (lead.phone) {
    score += 10;
    reasons.push("Phone number available (+10)");
  }

  if (lead.firstName && lead.lastName) {
    score += 10;
    reasons.push("Full name available (+10)");
  }

  const sourceScores: Record<string, number> = {
    Referral: 25,
    LinkedIn: 20,
    Website: 15,
    Event: 15,
    "Cold Outreach": 5,
  };

  const sourceScore = sourceScores[lead.source ?? ""] ?? 0;
  score += sourceScore;

  if (sourceScore > 0) {
    reasons.push(`${lead.source} lead source (+${sourceScore})`);
  }

  const statusScores: Record<string, number> = {
    QUALIFIED: 25,
    PROPOSAL: 20,
    CONTACTED: 15,
    NEW: 10,
    LOST: 0,
  };

  const statusScore = statusScores[lead.status.toUpperCase()] ?? 0;
  score += statusScore;

  if (statusScore > 0) {
    reasons.push(`Lead status: ${lead.status} (+${statusScore})`);
  }

  if (lead.value >= 50000) {
    score += 15;
    reasons.push("High potential deal value (+15)");
  } else if (lead.value >= 10000) {
    score += 10;
    reasons.push("Moderate potential deal value (+10)");
  }

  score = Math.min(100, score);

  let recommendation = "Contact this lead and gather more information.";

  if (lead.status.toUpperCase() === "LOST") {
    recommendation = "Review the reason this lead was lost before re-engaging.";
  } else if (score >= 75) {
    recommendation = "Prioritise this lead and schedule a follow-up.";
  } else if (score >= 50) {
    recommendation = "Contact this lead and assess their requirements.";
  }

  return { score, reasons, recommendation };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const requestedId = body.leadId;

    const leads = await db.orm.public.Lead
      .where({ userId: user.id })
      .all();

    const selectedLeads = requestedId
      ? leads.filter((lead) => String(lead.id) === String(requestedId))
      : leads.filter((lead) => lead.status.toUpperCase() !== "LOST");

    if (requestedId && selectedLeads.length === 0) {
      return NextResponse.json(
        { success: false, message: "Lead not found." },
        { status: 404 }
      );
    }

    const results = [];

    for (const lead of selectedLeads) {
      const analysis = calculateLeadScore({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        status: lead.status,
        value: Number(lead.value ?? 0),
      });

      await db.orm.public.Lead
        .where({ id: lead.id, userId: user.id })
        .update({ score: analysis.score });

      results.push({
        leadId: String(lead.id),
        name: [lead.firstName, lead.lastName]
          .filter(Boolean)
          .join(" "),
        ...analysis,
      });
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} lead(s) scored successfully.`,
      totalScored: results.length,
      results,
      scoringMethod: "Rule-based scoring",
    });
  } catch (error) {
    console.error("Lead scoring failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to score leads." },
      { status: 500 }
    );
  }
}
