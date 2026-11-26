
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";
import { hashPassword } from "@/lib/auth/password";

const allowedRoles = ["MASTER_ADMIN", "MANAGER", "SALES_REP"];

async function authorizeMasterAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "MASTER_ADMIN") {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: "Master Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { user, response: null };
}

// GET: List all organisation users
export async function GET() {
  try {
    const auth = await authorizeMasterAdmin();

    if (auth.response) return auth.response;

    const users = await db.orm.public.User.all();

    const safeUsers = users.map((user) => ({
      id: Number(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }));

    return NextResponse.json({
      success: true,
      users: safeUsers,
    });
  } catch (error) {
    console.error("Fetch admin users failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to retrieve users." },
      { status: 500 }
    );
  }
}

// POST: Create a user from the Master Admin panel
export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeMasterAdmin();

    if (auth.response) return auth.response;

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const password =
      typeof body.password === "string" ? body.password : "";
    const role = typeof body.role === "string" ? body.role : "";

    if (!name || !email || !password || !role) {
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

    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        { success: false, message: "Password must be between 8 and 72 characters." },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid user role." },
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

    const newUser = await db.orm.public.User.create({
      name,
      email,
      passwordHash,
      role,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully.",
        user: {
          id: Number(newUser.id),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isActive: newUser.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin user failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create user." },
      { status: 500 }
    );
  }
}

// PATCH: Update a user's role or account status
export async function PATCH(request: NextRequest) {
  try {
    const auth = await authorizeMasterAdmin();

    if (auth.response) return auth.response;

    const body = await request.json();

    const userId = Number(body.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID." },
        { status: 400 }
      );
    }

    const existingUser = await db.orm.public.User
      .where({ id: userId })
      .first();

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const updates: {
      role?: string;
      isActive?: boolean;
    } = {};

    if (body.role !== undefined) {
      if (
        typeof body.role !== "string" ||
        !allowedRoles.includes(body.role)
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid user role." },
          { status: 400 }
        );
      }

      updates.role = body.role;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { success: false, message: "Invalid account status." },
          { status: 400 }
        );
      }

      updates.isActive = body.isActive;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid changes provided." },
        { status: 400 }
      );
    }

    const newRole = updates.role ?? existingUser.role;
    const newIsActive = updates.isActive ?? existingUser.isActive;

    // Prevent Master Admin from removing their own admin access.
    if (userId === auth.user!.id) {
      if (
        newRole !== "MASTER_ADMIN" ||
        newIsActive !== true
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "You cannot remove your own Master Admin access or deactivate your account.",
          },
          { status: 403 }
        );
      }
    }

    // Protect the last active Master Admin.
    const removesActiveAdmin =
      existingUser.role === "MASTER_ADMIN" &&
      existingUser.isActive &&
      (newRole !== "MASTER_ADMIN" || !newIsActive);

    if (removesActiveAdmin) {
      const allUsers = await db.orm.public.User.all();

      const activeMasterAdmins = allUsers.filter(
        (user) =>
          user.role === "MASTER_ADMIN" && user.isActive
      );

      if (activeMasterAdmins.length <= 1) {
        return NextResponse.json(
          {
            success: false,
            message: "At least one active Master Admin must remain.",
          },
          { status: 400 }
        );
      }
    }

    await db.orm.public.User
      .where({ id: userId })
      .update(updates);

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
    });
  } catch (error) {
    console.error("Update admin user failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update user." },
      { status: 500 }
    );
  }
}
