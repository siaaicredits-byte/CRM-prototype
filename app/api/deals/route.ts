
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

const validStages = [
  "discovery",
  "qualified",
  "proposal",
  "negotiation",
  "won",
];

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const deals = await db.orm.public.Deal
      .where({ userId: currentUser.id })
      .all();

    return NextResponse.json(deals);
  } catch (error) {
    console.error("Fetch deals failed:", error);

    return NextResponse.json(
      { error: "Failed to retrieve deals." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const stage = body.stage;
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

    // Verify that the selected company belongs to the current user.
    if (companyId !== null) {
      const company = await db.orm.public.Company
        .where({
          id: companyId,
          userId: currentUser.id,
        })
        .first();

      if (!company) {
        return NextResponse.json(
          {
            error:
              "Selected company does not exist or you do not have access to it.",
          },
          { status: 403 }
        );
      }
    }

    const deal = await db.orm.public.Deal.create({
      title,
      stage,
      value,
      owner: currentUser.name || currentUser.email,
      closeDate,
      companyId,
      userId: currentUser.id,
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error("Create deal failed:", error);

    return NextResponse.json(
      { error: "Failed to create deal." },
      { status: 500 }
    );
  }
}
