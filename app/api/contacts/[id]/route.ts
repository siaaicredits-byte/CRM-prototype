
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// UPDATE CONTACT
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const contactId = Number(id);

    if (!Number.isInteger(contactId) || contactId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid contact ID." },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.Contact
      .where({ id: contactId, userId: currentUser.id })
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Contact not found." },
        { status: 404 }
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
            success: false,
            message:
              "Selected company does not exist or you do not have access to it.",
          },
          { status: 403 }
        );
      }
    }

    const contact = await db.orm.public.Contact
      .where({ id: contactId, userId: currentUser.id })
      .update({
        firstName,
        lastName: lastName || null,
        email: email || null,
        phone: phone || null,
        jobTitle: jobTitle || null,
        companyId,
      });

    return NextResponse.json({
      success: true,
      message: "Contact updated successfully.",
      contact,
    });
  } catch (error) {
    console.error("Update contact failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update contact." },
      { status: 500 }
    );
  }
}

// DELETE CONTACT
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const contactId = Number(id);

    if (!Number.isInteger(contactId) || contactId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid contact ID." },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.Contact
      .where({ id: contactId, userId: currentUser.id })
      .first();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Contact not found." },
        { status: 404 }
      );
    }

    await db.orm.public.Contact
      .where({ id: contactId, userId: currentUser.id })
      .delete();

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully.",
    });
  } catch (error) {
    console.error("Delete contact failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete contact." },
      { status: 500 }
    );
  }
}
