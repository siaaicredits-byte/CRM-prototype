
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

async function authorizeMasterAdmin(request: NextRequest) {
  const user = await getCurrentUser(request);

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

// GET: Retrieve all projects
export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeMasterAdmin(request);

    if (auth.response) return auth.response;

    const projects = await db.orm.public.Project.all();

    const safeProjects = projects.map((project) => ({
      id: Number(project.id),
      name: project.name,
      description: project.description,
      isActive: project.isActive,
      createdById: Number(project.createdById),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      projects: safeProjects,
    });
  } catch (error) {
    console.error("Fetch admin projects failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to retrieve projects." },
      { status: 500 }
    );
  }
}

// POST: Create a project
export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeMasterAdmin(request);

    if (auth.response) return auth.response;

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Project name is required." },
        { status: 400 }
      );
    }

    if (name.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "Project name must be 150 characters or fewer.",
        },
        { status: 400 }
      );
    }

    const existingProject = await db.orm.public.Project
      .where({ name })
      .first();

    if (existingProject) {
      return NextResponse.json(
        {
          success: false,
          message: "A project with this name already exists.",
        },
        { status: 409 }
      );
    }

    const project = await db.orm.public.Project.create({
      name,
      description: description || null,
      isActive: true,
      createdById: auth.user!.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully.",
        project: {
          id: Number(project.id),
          name: project.name,
          description: project.description,
          isActive: project.isActive,
          createdById: Number(project.createdById),
          createdAt: project.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin project failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create project." },
      { status: 500 }
    );
  }
}

// PATCH: Activate or deactivate a project
export async function PATCH(request: NextRequest) {
  try {
    const auth = await authorizeMasterAdmin(request);

    if (auth.response) return auth.response;

    const body = await request.json();

    const id = Number(body.id);
    const isActive = body.isActive;

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "A valid project ID is required." },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "A valid project status is required." },
        { status: 400 }
      );
    }

    const project = await db.orm.public.Project
      .where({ id })
      .first();

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }

    await db.orm.public.Project
      .where({ id })
      .update({ isActive });

    const updatedProject = await db.orm.public.Project
      .where({ id })
      .first();

    if (!updatedProject) {
      return NextResponse.json(
        { success: false, message: "Unable to retrieve updated project." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Project ${isActive ? "activated" : "deactivated"} successfully.`,
      project: {
        id: Number(updatedProject.id),
        name: updatedProject.name,
        description: updatedProject.description,
        isActive: updatedProject.isActive,
        createdById: Number(updatedProject.createdById),
        createdAt: updatedProject.createdAt,
        updatedAt: updatedProject.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update admin project failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update project status." },
      { status: 500 }
    );
  }
}
