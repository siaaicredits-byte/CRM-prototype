
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

const validStages = [
  "discovery",
  "qualified",
  "proposal",
  "negotiation",
  "won",
];

export async function GET() {
  try {
    const deals = await db.orm.public.Deal.where({}).all();
    return NextResponse.json(deals);
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve deals." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const stage = body.stage;
    const owner =
      typeof body.owner === "string" && body.owner.trim()
        ? body.owner.trim()
        : "Unassigned";
    const value = Number(body.value);
    const closeDate = new Date(body.closeDate);
    const companyId =
      body.companyId === "" || body.companyId == null
        ? null
        : Number(body.companyId);

    if (!title) {
      return NextResponse.json(
        { error: "Deal title is required." },
        { status: 400 }
      );
    }

    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { error: "Invalid deal stage." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        { error: "Deal value must be a valid non-negative number." },
        { status: 400 }
      );
    }

    if (!body.closeDate || Number.isNaN(closeDate.getTime())) {
      return NextResponse.json(
        { error: "A valid closing date is required." },
        { status: 400 }
      );
    }

    if (
      companyId !== null &&
      (!Number.isInteger(companyId) || companyId <= 0)
    ) {
      return NextResponse.json(
        { error: "Invalid company." },
        { status: 400 }
      );
    }

    if (companyId !== null) {
      const company = await db.orm.public.Company
        .where({ id: companyId })
        .first();

      if (!company) {
        return NextResponse.json(
          { error: "Selected company was not found." },
          { status: 404 }
        );
      }
    }

    const deal = await db.orm.public.Deal.create({
      title,
      stage,
      value,
      owner,
      closeDate,
      companyId,
    });

    return NextResponse.json(deal, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create deal." },
      { status: 500 }
    );
  }
}
