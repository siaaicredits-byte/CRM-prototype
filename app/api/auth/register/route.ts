import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { hashPassword } from "@/lib/auth/password";



export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (password.length > 72) {
      return NextResponse.json(
        { success: false, message: "Password is too long." },
        { status: 400 }
      );
    }

    const existingUser = await db.orm.public.User
      .where({ email })
      .first();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await db.orm.public.User.create({
      email,
      name,
      passwordHash,
      role: "SALES_REP",
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create account." },
      { status: 500 }
    );
  }
}