
import type { Metadata } from "next";
import { Suspense } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { AddLeadButton } from "@/components/leads/AddLeadButton";
import { LeadSearch } from "@/components/leads/LeadSearch";
import { getDatabaseLeads } from "@/lib/database-leads";
import { connection } from "next/server";

export const metadata: Metadata = { title: "Leads" };

async function LeadsData() {
  await connection();
  const leads = await getDatabaseLeads();

  return (
    <Card delay={1} className="overflow-hidden">
      <CardHeader
        title="All leads"
        description={`${leads.length} leads shown`}
      />
      <div className="pt-3">
        <LeadSearch leads={leads} />
      </div>
    </Card>
  );
}

function LeadsLoading() {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="All leads"
        description="Loading leads from database..."
      />
      <div className="space-y-3 p-4">
        <div className="h-11 animate-pulse rounded-xl bg-surface-raised" />
        <div className="h-10 animate-pulse rounded-lg bg-surface-raised" />
        <div className="h-20 animate-pulse rounded-lg bg-surface-raised" />
      </div>
    </Card>
  );
}

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Leads"
        description="Every inbound and outbound lead, newest first."
        actions={
          <>
            <Badge tone="accent">Live database</Badge>
            <AddLeadButton />
          </>
        }
      />

      <Suspense fallback={<LeadsLoading />}>
        <LeadsData />
      </Suspense>
    </div>
  );
}
