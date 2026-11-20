
import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth/authenticate";

export async function GET() {
  await connection();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Current user error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to retrieve user." },
      { status: 500 }
    );
  }
}
