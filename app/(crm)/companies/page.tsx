
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { AddCompanyButton } from "@/components/companies/AddCompanyButton";
import { CompanySearch } from "@/components/companies/CompanySearch";
import { getDatabaseCompanies } from "@/lib/database-companies";

export const metadata: Metadata = { title: "Companies" };

async function CompaniesData() {
  await connection();

  const companies = await getDatabaseCompanies();

  return (
    <Card delay={1} className="overflow-hidden">
      <CardHeader
        title="All companies"
        description={`${companies.length} companies in your database`}
      />
      <div className="pt-3">
        <CompanySearch companies={companies} />
      </div>
    </Card>
  );
}

function CompaniesLoading() {
  return (
    <Card className="animate-pulse p-6">
      <div className="h-5 w-40 rounded bg-surface-hover" />
      <div className="mt-6 h-10 rounded bg-surface-hover" />
      <div className="mt-4 h-48 rounded bg-surface-hover" />
    </Card>
  );
}

export default function CompaniesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Companies"
        description="Manage your business accounts and company relationships."
        actions={
          <>
            <Badge tone="accent">Live database</Badge>
            <AddCompanyButton />
          </>
        }
      />

      <Suspense fallback={<CompaniesLoading />}>
        <CompaniesData />
      </Suspense>
    </div>
  );
}
