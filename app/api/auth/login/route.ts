import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/session-cookie";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await db.orm.public.User
      .where({ email })
      .first();

    if (!user || !user.passwordHash || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordMatches = await verifyPassword(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await createSession({
      userId: Number(user.id),
      email: user.email,
      role: user.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to log in." },
      { status: 500 }
    );
  }
}