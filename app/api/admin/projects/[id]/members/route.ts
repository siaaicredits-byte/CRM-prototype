
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

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

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getProjectId(context: RouteContext) {
  const { id } = await context.params;
  const projectId = Number(id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return null;
  }

  return projectId;
}

// GET: Retrieve all members assigned to a project
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await authorizeMasterAdmin();

    if (auth.response) return auth.response;

    const projectId = await getProjectId(context);

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID." },
        { status: 400 }
      );
    }

    const project = await db.orm.public.Project
      .where({ id: projectId })
      .first();

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }

    const memberships = await db.orm.public.ProjectMember
      .where({ projectId })
      .all();

    const users = await db.orm.public.User.all();

    const members = memberships
      .map((membership) => {
        const user = users.find(
          (item) => Number(item.id) === Number(membership.userId)
        );

        if (!user) return null;

        return {
          id: Number(user.id),
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          assignedAt: membership.createdAt,
        };
      })
      .filter((member) => member !== null);

    return NextResponse.json({
      success: true,
      project: {
        id: Number(project.id),
        name: project.name,
      },
      members,
    });
  } catch (error) {
    console.error("Fetch project members failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to retrieve project members." },
      { status: 500 }
    );
  }
}

// POST: Assign one or multiple users to a project
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await authorizeMasterAdmin();

    if (auth.response) return auth.response;

    const projectId = await getProjectId(context);

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID." },
        { status: 400 }
      );
    }

    const project = await db.orm.public.Project
      .where({ id: projectId })
      .first();

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    
    
const rawUserIds: unknown[] = Array.isArray(body.userIds)
  ? body.userIds
  : [body.userId];

const userIds: number[] = [];

for (const rawId of rawUserIds) {
  const parsedUserId = Number(rawId);

  if (
    !Number.isInteger(parsedUserId) ||
    parsedUserId <= 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Provide one or more valid user IDs.",
      },
      { status: 400 }
    );
  }

  if (!userIds.includes(parsedUserId)) {
    userIds.push(parsedUserId);
  }
}

if (userIds.length === 0) {
  return NextResponse.json(
    {
      success: false,
      message: "Provide one or more valid user IDs.",
    },
    { status: 400 }
  );
}


    const assigned: number[] = [];
    const skipped: { userId: number; reason: string }[] = [];

    for (const userId of userIds) {
      const user = await db.orm.public.User
        .where({ id: userId })
        .first();

      if (!user) {
        skipped.push({
          userId,
          reason: "User not found.",
        });
        continue;
      }

      if (!user.isActive) {
        skipped.push({
          userId,
          reason: "User account is inactive.",
        });
        continue;
      }

      const existingMembership = await db.orm.public.ProjectMember
        .where({ projectId, userId })
        .first();

      if (existingMembership) {
        skipped.push({
          userId,
          reason: "User is already assigned.",
        });
        continue;
      }

      await db.orm.public.ProjectMember.create({
        projectId,
        userId,
      });

      assigned.push(userId);
    }

    return NextResponse.json({
      success: true,
      message: `${assigned.length} user(s) assigned successfully.`,
      assignedUserIds: assigned,
      skipped,
    });
  } catch (error) {
    console.error("Assign project members failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to assign project members." },
      { status: 500 }
    );
  }
}

// DELETE: Remove a user from a project
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await authorizeMasterAdmin();

    if (auth.response) return auth.response;

    const projectId = await getProjectId(context);

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const userId = Number(body.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "A valid user ID is required." },
        { status: 400 }
      );
    }

    const project = await db.orm.public.Project
      .where({ id: projectId })
      .first();

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }

    const membership = await db.orm.public.ProjectMember
      .where({ projectId, userId })
      .first();

    if (!membership) {
      return NextResponse.json(
        { success: false, message: "Project member not found." },
        { status: 404 }
      );
    }

    await db.orm.public.ProjectMember
      .where({ projectId, userId })
      .delete();

    return NextResponse.json({
      success: true,
      message: "Project member removed successfully.",
    });
  } catch (error) {
    console.error("Remove project member failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to remove project member." },
      { status: 500 }
    );
  }
}
