
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

// UPDATE DEAL
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid deal ID." },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.Deal
      .where({ id, userId: currentUser.id })
      .first();

    if (!existing) {
      return NextResponse.json(
        { error: "Deal not found." },
        { status: 404 }
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

    // Verify company ownership.
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

    const deal = await db.orm.public.Deal
      .where({ id, userId: currentUser.id })
      .update({
        title,
        stage,
        value,
        owner: currentUser.name || currentUser.email,
        closeDate,
        companyId,
      });

    return NextResponse.json(deal);
  } catch (error) {
    console.error("Update deal failed:", error);

    return NextResponse.json(
      { error: "Failed to update deal." },
      { status: 500 }
    );
  }
}

// DELETE DEAL
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid deal ID." },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.Deal
      .where({ id, userId: currentUser.id })
      .first();

    if (!existing) {
      return NextResponse.json(
        { error: "Deal not found." },
        { status: 404 }
      );
    }

    await db.orm.public.Deal
      .where({ id, userId: currentUser.id })
      .delete();

    return NextResponse.json({
      message: "Deal deleted successfully.",
    });
  } catch (error) {
    console.error("Delete deal failed:", error);

    return NextResponse.json(
      { error: "Failed to delete deal." },
      { status: 500 }
    );
  }
}
