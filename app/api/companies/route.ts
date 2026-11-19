
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";

// GET ALL COMPANIES
export async function GET() {
  try {
    const companies = await db.orm.public.Company.where({}).all();

    return NextResponse.json({
      success: true,
      companies,
    });
  } catch (error) {
    console.error("Fetch companies failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch companies." },
      { status: 500 }
    );
  }
}

// CREATE COMPANY
export async function POST(request: NextRequest) {
  try {
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

    const company = await db.orm.public.Company.create({
      name,
      website: website || null,
      industry: industry || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      description: description || null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Company created successfully.",
        company,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create company failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create company." },
      { status: 500 }
    );
  }
}
