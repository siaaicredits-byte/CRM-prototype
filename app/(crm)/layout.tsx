
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getCurrentUser } from "@/lib/auth/authenticate";

export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#080d1b]" />}>
      <AuthenticatedCrmLayout>
        {children}
      </AuthenticatedCrmLayout>
    </Suspense>
  );
}

async function AuthenticatedCrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="app-backdrop min-h-dvh">
      <Sidebar user={user} />

      <div className="flex min-h-dvh flex-col lg:pl-64">
        <Topbar user={user} />

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
