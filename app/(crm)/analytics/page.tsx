import type { Metadata } from "next";
import { ChartColumn } from "lucide-react";
import { PipelineOverview } from "@/components/dashboard/PipelineOverview";
import { SalesPerformanceChart } from "@/components/dashboard/SalesPerformanceChart";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlannedFeatures } from "@/components/ui/PlannedFeatures";
import { dealStages, pipelineSummary, salesPerformance } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="Revenue, pipeline and team performance."
        actions={<Badge tone="accent">Demo data</Badge>}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card delay={1} className="xl:col-span-2">
          <CardHeader title="Revenue vs target" description="Last 12 months" />
          <CardBody className="pt-3">
            <SalesPerformanceChart data={salesPerformance} height={300} />
          </CardBody>
        </Card>
        <Card delay={2}>
          <CardHeader title="Pipeline by stage" description="Current deal value" />
          <CardBody>
            <PipelineOverview stages={dealStages} summary={pipelineSummary} />
          </CardBody>
        </Card>
      </div>
      <PlannedFeatures
        icon={ChartColumn}
        title="Deeper reporting"
        description="Reports built from live CRM data once the database is connected."
        features={[
          "Win rate and sales-cycle length by rep",
          "Lead source conversion funnel",
          "Forecast vs actual by quarter",
          "Weekly reports from the Sales Analyst agent",
        ]}
      />
    </div>
  );
}
