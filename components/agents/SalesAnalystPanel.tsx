
"use client";

import { useState } from "react";

interface SalesAnalysis {
  success: boolean;
  message?: string;
  summary: {
    leads: {
      total: number;
      qualified: number;
      lost: number;
      qualificationRate: number;
      bySource: Record<string, number>;
      byStatus: Record<string, number>;
    };
    deals: {
      total: number;
      active: number;
      won: number;
      lost: number;
      pipelineValue: number;
      wonValue: number;
      winRate: number;
      byStage: Record<string, number>;
    };
    tasks: {
      total: number;
      pending: number;
      completed: number;
      overdue: number;
      upcoming: number;
    };
  };
  insights: string[];
  method: string;
}

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function SalesAnalystPanel() {
  const [data, setData] = useState<SalesAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAnalysis() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agents/sales-analyst");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Analysis failed.");
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to analyse sales data."
      );
    } finally {
      setLoading(false);
    }
  }

  const metricCards = data
    ? [
        {
          label: "Total Leads",
          value: data.summary.leads.total,
          detail: `${data.summary.leads.qualified} qualified`,
        },
        {
          label: "Qualification Rate",
          value: `${data.summary.leads.qualificationRate}%`,
          detail: "Qualified + proposal leads",
        },
        {
          label: "Active Deals",
          value: data.summary.deals.active,
          detail: `${data.summary.deals.total} total deals`,
        },
        {
          label: "Pipeline Value",
          value: currency(data.summary.deals.pipelineValue),
          detail: "Active opportunities",
        },
        {
          label: "Deal Win Rate",
          value: `${data.summary.deals.winRate}%`,
          detail: `${data.summary.deals.won} deals won`,
        },
        {
          label: "Pending Tasks",
          value: data.summary.tasks.pending,
          detail: `${data.summary.tasks.overdue} overdue`,
        },
      ]
    : [];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Sales Analyst
          </h2>
          <p className="text-sm text-ink-muted">
            Analyse your CRM performance and discover sales opportunities.
          </p>
        </div>

        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Analysing..." : "Run Sales Analysis"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {!data && !loading && !error && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-sm text-ink-muted">
            Run your first sales analysis to view live CRM insights.
          </p>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {metricCards.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="text-sm text-ink-muted">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {metric.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="font-semibold text-ink">Lead Performance</h3>
              <div className="mt-4 space-y-3">
                {Object.entries(data.summary.leads.byStatus).map(
                  ([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="text-ink-muted">{status}</span>
                      <span className="font-medium text-ink">{count}</span>
                    </div>
                  )
                )}
              </div>
              <h4 className="mt-5 text-sm font-medium text-ink">
                Lead Sources
              </h4>
              <div className="mt-3 space-y-2">
                {Object.entries(data.summary.leads.bySource).map(
                  ([source, count]) => (
                    <div key={source} className="flex justify-between text-sm">
                      <span className="text-ink-muted">{source}</span>
                      <span className="text-ink">{count}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="font-semibold text-ink">Deal Performance</h3>
              <div className="mt-4 space-y-3">
                {Object.entries(data.summary.deals.byStage).map(
                  ([stage, count]) => (
                    <div key={stage} className="flex justify-between text-sm">
                      <span className="capitalize text-ink-muted">{stage}</span>
                      <span className="text-ink">{count}</span>
                    </div>
                  )
                )}
              </div>
              <div className="mt-5 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Won Value</span>
                  <span className="text-ink">
                    {currency(data.summary.deals.wonValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-semibold text-ink">Task Overview</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Total", data.summary.tasks.total],
                ["Pending", data.summary.tasks.pending],
                ["Completed", data.summary.tasks.completed],
                ["Overdue", data.summary.tasks.overdue],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-ink-muted">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-5">
            <h3 className="font-semibold text-ink">
              Sales Insights & Recommendations
            </h3>
            <ul className="mt-4 space-y-3">
              {data.insights.map((insight, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-sm text-ink-muted"
                >
                  <span className="font-semibold text-blue-400">
                    {index + 1}.
                  </span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-ink-muted">
            Analysis method: {data.method}
          </p>
        </>
      )}
    </section>
  );
}
