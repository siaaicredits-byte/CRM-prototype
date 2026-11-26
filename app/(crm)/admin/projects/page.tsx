
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/authenticate";
import { AdminProjects } from "@/components/admin/AdminProjects";

export const metadata: Metadata = {
  title: "Project Management",
};

export default async function AdminProjectsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "MASTER_ADMIN") {
    redirect("/dashboard");
  }

  return <AdminProjects />;
}
