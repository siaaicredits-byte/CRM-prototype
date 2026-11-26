
import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const allProjects = await db.orm.public.Project.all();

    const activeProjects = allProjects.filter(
      (project) => project.isActive
    );

    if (user.role === "MASTER_ADMIN") {
      return NextResponse.json({
        success: true,
        projects: activeProjects.map((project) => ({
          id: Number(project.id),
          name: project.name,
        })),
      });
    }

    const memberships = await db.orm.public.ProjectMember.where({
      userId: user.id,
    }).all();

    const memberProjectIds = new Set(
      memberships.map((member) => Number(member.projectId))
    );

    const projects = activeProjects
      .filter((project) =>
        memberProjectIds.has(Number(project.id))
      )
      .map((project) => ({
        id: Number(project.id),
        name: project.name,
      }));

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    unstable_rethrow(error);

    console.error("Fetch available projects failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve projects.",
      },
      { status: 500 }
    );
  }
}
