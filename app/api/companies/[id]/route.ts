
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// UPDATE COMPANY
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const companyId = Number(id);

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid company ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const website = String(body.website ?? "").trim();
    const industry = String(body.industry ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const address = String(body.address ?? "").trim();
    const description = String(body.description ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Company name is required." },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (website && !/^https?:\/\/.+\..+/.test(website)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid website URL starting with http:// or https://." },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.Company
      .where({ id: companyId })
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Company not found." },
        { status: 404 }
      );
    }

    const company = await db.orm.public.Company
      .where({ id: companyId })
      .update({
        name,
        website: website || null,
        industry: industry || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        description: description || null,
      });

    return NextResponse.json({
      success: true,
      message: "Company updated successfully.",
      company,
    });
  } catch (error) {
    console.error("Update company failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update company." },
      { status: 500 }
    );
  }
}

// DELETE COMPANY
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const companyId = Number(id);

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid company ID." },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.Company
      .where({ id: companyId })
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Company not found." },
        { status: 404 }
      );
    }

    await db.orm.public.Company
      .where({ id: companyId })
      .delete();

    return NextResponse.json({
      success: true,
      message: "Company deleted successfully.",
    });
  } catch (error) {
    console.error("Delete company failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete company. It may be linked to existing contacts or leads.",
      },
      { status: 500 }
    );
  }
}
