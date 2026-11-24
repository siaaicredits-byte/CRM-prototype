import { runAutomationEvent } from "@/lib/automations/run-automation";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

const allowedSources = [
  "Website",
  "Referral",
  "LinkedIn",
  "Event",
  "Cold Outreach",
];

const allowedStatuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "LOST",
];

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const leads = await db.orm.public.Lead
      .where({ userId: currentUser.id })
      .all();

    return NextResponse.json({
      success: true,
      leads,
    });
  } catch (error) {
    console.error("Fetch leads failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve leads.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const source = String(body.source ?? "");
    const status = String(body.status ?? "NEW");
    const value = Number(body.value ?? 0);

    if (!firstName || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "First name and email are required.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (
      !allowedSources.includes(source) ||
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lead source or status.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        { success: false, message: "Enter a valid lead value." },
        { status: 400 }
      );
    }

    const lead = await db.orm.public.Lead.create({
      firstName,
      lastName: lastName || null,
      email,
      phone: phone || null,
      source,
      status,
      score: null,
      value,
      owner: currentUser.name || currentUser.email,
      userId: currentUser.id,
    });
       try {
      await runAutomationEvent(currentUser.id, "LEAD_CREATED", {
        lead: {
          id: lead.id,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email ?? "",
          status: lead.status,
          source: lead.source,
          score: lead.score,
          value: lead.value,
          owner: lead.owner,
        },
      });
    } catch (error) {
      console.error("Lead-created automation event failed:", error);
    }


    return NextResponse.json(
      {
        success: true,
        message: "Lead created successfully.",
        lead,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create lead failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create lead.",
      },
      { status: 500 }
    );
  }
}
