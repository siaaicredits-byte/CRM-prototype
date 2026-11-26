
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/authenticate";
import { AdminUsers } from "@/components/admin/AdminUsers";

export const metadata: Metadata = {
  title: "User Management",
};

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "MASTER_ADMIN") {
    redirect("/dashboard");
  }

  return <AdminUsers />;
}
