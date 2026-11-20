
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const contacts = await db.orm.public.Contact
      .where({ userId: currentUser.id })
      .all();

    return NextResponse.json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error("Fetch contacts failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch contacts." },
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
    const jobTitle = String(body.jobTitle ?? "").trim();

    const companyId =
      body.companyId === null ||
      body.companyId === undefined ||
      body.companyId === ""
        ? null
        : Number(body.companyId);

    if (!firstName) {
      return NextResponse.json(
        { success: false, message: "First name is required." },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (
      companyId !== null &&
      (!Number.isInteger(companyId) || companyId <= 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid company ID." },
        { status: 400 }
      );
    }

    // Verify that the selected company belongs to the logged-in user.
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
            success: false,
            message: "Selected company does not exist or you do not have access to it.",
          },
          { status: 403 }
        );
      }
    }

    const contact = await db.orm.public.Contact.create({
      firstName,
      lastName: lastName || null,
      email: email || null,
      phone: phone || null,
      jobTitle: jobTitle || null,
      companyId,
      userId: currentUser.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Contact created successfully.",
        contact,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create contact failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create contact.",
      },
      { status: 500 }
    );
  }
}
