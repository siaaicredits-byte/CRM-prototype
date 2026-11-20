
"use client";

import { useEffect, useState } from "react";
import { agentIcons } from "@/components/agents/agent-meta";
import { agents } from "@/lib/demo-data";
import { Card } from "@/components/ui/Card";

type ScoreResult = {
  leadId: string;
  name: string;
  score: number;
  reasons: string[];
  recommendation: string;
};

type OrganizerLead = {
  id: string;
  name: string;
  status: string;
  source: string;
  score: number | null;
  value: number;
  priority: string;
};

type OrganizerData = {
  totalLeads: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  needsAttention: OrganizerLead[];
  highValueLeads: {
    id: string;
    name: string;
    value: number;
    status: string;
  }[];
};

type LeadOption = {
  id: string;
  name: string;
  email: string | null;
};

type FollowUpDraft = {
  channel: string;
  tone: string;
  subject: string | null;
  message: string;
};

type DealItem = {
  id: string;
  title: string;
  stage: string;
  value: number;
  closeDate: string | Date;
};

type DealAttentionItem = DealItem & {
  priority: string;
  recommendation: string;
};

type DealTrackerData = {
  totalDeals: number;
  activeDeals: number;
  pipelineValue: number;
  byStage: Record<string, number>;
  highValueDeals: DealItem[];
  upcomingDeals: DealItem[];
  overdueDeals: DealItem[];
  needsAttention: DealAttentionItem[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string | Date) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export function AgentWorkspace() {
  const [scorerLoading, setScorerLoading] = useState(false);
  const [organizerLoading, setOrganizerLoading] = useState(false);
  const [writerLoading, setWriterLoading] = useState(false);
  const [dealTrackerLoading, setDealTrackerLoading] = useState(false);

  const [results, setResults] = useState<ScoreResult[]>([]);
  const [organizerData, setOrganizerData] =
    useState<OrganizerData | null>(null);
  const [dealTrackerData, setDealTrackerData] =
    useState<DealTrackerData | null>(null);

  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [channel, setChannel] = useState("email");
  const [tone, setTone] = useState("professional");
  const [draft, setDraft] = useState<FollowUpDraft | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadLeads() {
      try {
        const response = await fetch("/api/leads", {
          credentials: "same-origin",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load leads.");
        }

        const leadList = Array.isArray(data.leads)
          ? data.leads
          : Array.isArray(data.data)
            ? data.data
            : [];

        const formattedLeads = leadList.map(
          (lead: {
            id: string | number;
            firstName?: string;
            lastName?: string | null;
            name?: string;
            email?: string | null;
          }) => ({
            id: String(lead.id),
            name:
              lead.name ||
              [lead.firstName, lead.lastName]
                .filter(Boolean)
                .join(" ") ||
              "Unnamed Lead",
            email: lead.email ?? null,
          })
        );

        setLeads(formattedLeads);

        if (formattedLeads.length > 0) {
          setSelectedLeadId(formattedLeads[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load leads."
        );
      }
    }

    loadLeads();
  }, []);

  async function runLeadScorer() {
    setScorerLoading(true);
    setError("");
    setMessage("");
    setResults([]);

    try {
      const response = await fetch("/api/agents/lead-scorer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to run Lead Scorer.");
      }

      setResults(data.results ?? []);
      setMessage(data.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setScorerLoading(false);
    }
  }

  async function runLeadOrganizer() {
    setOrganizerLoading(true);
    setError("");
    setMessage("");
    setOrganizerData(null);

    try {
      const response = await fetch("/api/agents/lead-organizer", {
        method: "GET",
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to run Lead Organizer.");
      }

      setOrganizerData(data.summary);
      setMessage(data.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setOrganizerLoading(false);
    }
  }

  async function runDealTracker() {
    setDealTrackerLoading(true);
    setError("");
    setMessage("");
    setDealTrackerData(null);

    try {
      const response = await fetch("/api/agents/deal-tracker", {
        method: "GET",
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to run Deal Tracker.");
      }

      setDealTrackerData(data.summary);
      setMessage(data.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to track deals."
      );
    } finally {
      setDealTrackerLoading(false);
    }
  }

  async function runFollowUpWriter() {
    if (!selectedLeadId) {
      setError("Please select a lead first.");
      return;
    }

    setWriterLoading(true);
    setError("");
    setMessage("");
    setDraft(null);

    try {
      const response = await fetch("/api/agents/follow-up-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          leadId: selectedLeadId,
          channel,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to generate draft.");
      }

      setDraft(data.draft);
      setMessage(data.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setWriterLoading(false);
    }
  }

  async function copyDraft() {
    if (!draft) return;

    const text = draft.subject
      ? `Subject: ${draft.subject}\n\n${draft.message}`
      : draft.message;

    try {
      await navigator.clipboard.writeText(text);
      setMessage("Follow-up draft copied to clipboard.");
    } catch {
      setError(
        "Unable to copy. Please select and copy the message manually."
      );
    }
  }

  const anyAgentLoading =
    scorerLoading ||
    organizerLoading ||
    writerLoading ||
    dealTrackerLoading;

  return (
    <div className="flex flex-col gap-6">
      {/* AGENT CARDS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent, index) => {
          const Icon = agentIcons[agent.id];

          const isScorer = agent.id === "lead-scorer";
          const isOrganizer = agent.id === "lead-organizer";
          const isWriter = agent.id === "follow-up-writer";
          const isDealTracker = agent.id === "deal-tracker";
          const isMeetingAssistant = agent.id === "meeting-assistant";
          const isSalesAnalyst = agent.id === "sales-analyst";

          const isAvailable =
            isScorer ||
            isOrganizer ||
            isWriter ||
            isDealTracker ||
            isMeetingAssistant ||
            isSalesAnalyst;

          return (
            <Card
              key={agent.id}
              delay={index + 1}
              className="flex flex-col p-5 transition-colors hover:border-line-strong"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-accent/25">
                  <Icon className="size-5" />
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs ${
                    isAvailable
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-ink-muted/10 text-ink-muted"
                  }`}
                >
                  {isAvailable ? "Available" : "Coming soon"}
                </span>
              </div>

              <h2 className="mt-4 font-semibold text-ink">
                {agent.name}
              </h2>

              <p className="mt-1 flex-1 text-sm text-ink-muted">
                {agent.description}
              </p>

              <div className="mt-5 border-t border-line pt-4">
                <p className="text-xs text-ink-faint">Trigger</p>
                <p className="mt-1 text-sm text-ink">{agent.trigger}</p>

                {isScorer ? (
                  <button
                    onClick={runLeadScorer}
                    disabled={anyAgentLoading}
                    className="mt-4 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {scorerLoading ? "Scoring leads..." : "Run Lead Scorer"}
                  </button>
                ) : isOrganizer ? (
                  <button
                    onClick={runLeadOrganizer}
                    disabled={anyAgentLoading}
                    className="mt-4 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {organizerLoading
                      ? "Organising leads..."
                      : "Run Lead Organizer"}
                  </button>
                ) : isWriter ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs text-ink-muted">
                        Select Lead
                      </label>
                      <select
                        value={selectedLeadId}
                        onChange={(event) =>
                          setSelectedLeadId(event.target.value)
                        }
                        disabled={writerLoading || leads.length === 0}
                        className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink"
                      >
                        {leads.length === 0 ? (
                          <option value="">No leads available</option>
                        ) : (
                          leads.map((lead) => (
                            <option key={lead.id} value={lead.id}>
                              {lead.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-ink-muted">
                        Channel
                      </label>
                      <select
                        value={channel}
                        onChange={(event) => setChannel(event.target.value)}
                        className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink"
                      >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-ink-muted">
                        Message Tone
                      </label>
                      <select
                        value={tone}
                        onChange={(event) => setTone(event.target.value)}
                        className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink"
                      >
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="formal">Formal</option>
                      </select>
                    </div>

                    <button
                      onClick={runFollowUpWriter}
                      disabled={anyAgentLoading || !selectedLeadId}
                      className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      {writerLoading ? "Generating draft..." : "Generate Draft"}
                    </button>
                  </div>
                ) : isDealTracker ? (
                  <button
                    onClick={runDealTracker}
                    disabled={anyAgentLoading}
                    className="mt-4 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {dealTrackerLoading
                      ? "Tracking deals..."
                      : "Run Deal Tracker"}
                  </button>
                ) : isMeetingAssistant ? (
                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-center text-sm text-emerald-400">
                    Available in Meeting Assistant panel below
                  </div>
                ) : isSalesAnalyst ? (
                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-center text-sm text-emerald-400">
                    Available in Sales Analyst panel below
                  </div>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>

      {/* ERROR AND SUCCESS MESSAGES */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {message}
        </div>
      )}

      {/* FOLLOW-UP DRAFT */}
      {draft && (
        <Card className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Generated Follow-Up Draft
              </h2>
              <p className="text-xs text-ink-muted">
                {draft.channel.toUpperCase()} · {draft.tone}
              </p>
            </div>

            <button
              onClick={copyDraft}
              className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent-soft"
            >
              Copy Draft
            </button>
          </div>

          {draft.subject && (
            <div>
              <p className="text-xs text-ink-muted">Subject</p>
              <p className="mt-1 font-medium text-ink">
                {draft.subject}
              </p>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs text-ink-muted">Message Preview</p>
            <div className="whitespace-pre-wrap rounded-xl border border-line bg-surface p-4 text-sm leading-7 text-ink">
              {draft.message}
            </div>
          </div>

          <p className="text-xs text-ink-muted">
            Template-based draft. Review and edit before sending. No message
            is sent automatically.
          </p>
        </Card>
      )}

      {/* LEAD SCORING RESULTS */}
      {results.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">
            Lead Scoring Results
          </h2>

          {results.map((result) => (
            <Card key={result.leadId} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-ink">{result.name}</h3>
                  <p className="text-xs text-ink-muted">
                    Lead ID: {result.leadId}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">
                    {result.score}/100
                  </p>
                  <p className="text-xs text-ink-muted">Rule-based score</p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${result.score}%` }}
                />
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-ink">
                  Scoring reasons
                </h4>
                <ul className="mt-2 space-y-1">
                  {result.reasons.map((reason, index) => (
                    <li key={index} className="text-sm text-ink-muted">
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-lg bg-accent-soft p-3">
                <p className="text-xs font-medium text-accent">
                  Recommended next action
                </p>
                <p className="mt-1 text-sm text-ink">
                  {result.recommendation}
                </p>
              </div>
            </Card>
          ))}
        </section>
      )}

      {/* LEAD ORGANIZER RESULTS */}
      {organizerData && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">
            Lead Organizer Results
          </h2>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card className="p-4">
              <p className="text-xs text-ink-muted">Total Leads</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                {organizerData.totalLeads}
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-xs text-ink-muted">Needs Attention</p>
              <p className="mt-2 text-2xl font-bold text-amber-400">
                {organizerData.needsAttention.length}
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-xs text-ink-muted">High Value Leads</p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">
                {organizerData.highValueLeads.length}
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-xs text-ink-muted">Lead Sources</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                {Object.keys(organizerData.bySource).length}
              </p>
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="font-semibold text-ink">Leads by Status</h3>
            <div className="mt-3 space-y-2">
              {Object.entries(organizerData.byStatus).map(
                ([status, count]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span className="text-ink-muted">{status}</span>
                    <span className="font-medium text-ink">{count}</span>
                  </div>
                )
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-ink">Leads by Source</h3>
            <div className="mt-3 space-y-2">
              {Object.entries(organizerData.bySource).map(
                ([source, count]) => (
                  <div key={source} className="flex justify-between text-sm">
                    <span className="text-ink-muted">{source}</span>
                    <span className="font-medium text-ink">{count}</span>
                  </div>
                )
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-ink">
              Leads Needing Attention
            </h3>

            {organizerData.needsAttention.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">
                No leads currently need attention.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {organizerData.needsAttention.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-3"
                  >
                    <div>
                      <p className="font-medium text-ink">{lead.name}</p>
                      <p className="text-xs text-ink-muted">
                        {lead.status} · {lead.source} · Score:{" "}
                        {lead.score ?? "Not scored"}
                      </p>
                    </div>

                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                      {lead.priority} Priority
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-ink">High Value Leads</h3>

            {organizerData.highValueLeads.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">
                No high-value leads found.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {organizerData.highValueLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="text-ink">{lead.name}</span>
                    <span className="font-medium text-emerald-400">
                      {formatCurrency(lead.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      )}

      {/* DEAL TRACKER RESULTS */}
      {dealTrackerData && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Deal Tracker Results
            </h2>
            <p className="text-sm text-ink-muted">
              Review pipeline health and deals that need attention.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="p-4">
              <p className="text-xs text-ink-muted">Total Deals</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                {dealTrackerData.totalDeals}
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-xs text-ink-muted">Active Deals</p>
              <p className="mt-2 text-2xl font-bold text-ink">
                {dealTrackerData.activeDeals}
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-xs text-ink-muted">Pipeline Value</p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">
                {formatCurrency(dealTrackerData.pipelineValue)}
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-xs text-ink-muted">Needs Attention</p>
              <p className="mt-2 text-2xl font-bold text-amber-400">
                {dealTrackerData.needsAttention.length}
              </p>
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="font-semibold text-ink">Deals by Stage</h3>

            {Object.keys(dealTrackerData.byStage).length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">
                No deals available.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {Object.entries(dealTrackerData.byStage).map(
                  ([stage, count]) => (
                    <div key={stage} className="flex justify-between text-sm">
                      <span className="capitalize text-ink-muted">
                        {stage}
                      </span>
                      <span className="font-medium text-ink">{count}</span>
                    </div>
                  )
                )}
              </div>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-semibold text-ink">High Value Deals</h3>

              {dealTrackerData.highValueDeals.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">
                  No high-value deals found.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {dealTrackerData.highValueDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="rounded-xl border border-line p-3"
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <p className="font-medium text-ink">{deal.title}</p>
                        <p className="font-semibold text-emerald-400">
                          {formatCurrency(deal.value)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs capitalize text-ink-muted">
                        {deal.stage} · Expected close:{" "}
                        {formatDate(deal.closeDate)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-ink">Upcoming Deals</h3>

              {dealTrackerData.upcomingDeals.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">
                  No deals closing in the next seven days.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {dealTrackerData.upcomingDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="rounded-xl border border-line p-3"
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <p className="font-medium text-ink">{deal.title}</p>
                        <p className="text-sm font-semibold text-ink">
                          {formatCurrency(deal.value)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">
                        Expected close: {formatDate(deal.closeDate)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="font-semibold text-ink">Overdue Deals</h3>

            {dealTrackerData.overdueDeals.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">
                No overdue deals. Your pipeline has no past-due closing dates.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {dealTrackerData.overdueDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 p-3"
                  >
                    <div>
                      <p className="font-medium text-ink">{deal.title}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {deal.stage} · Due {formatDate(deal.closeDate)}
                      </p>
                    </div>

                    <span className="font-semibold text-red-400">
                      {formatCurrency(deal.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-ink">
              Deals Needing Attention
            </h3>

            {dealTrackerData.needsAttention.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">
                No deals currently need attention.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {dealTrackerData.needsAttention.map((deal) => (
                  <div
                    key={`${deal.id}-${deal.priority}`}
                    className="rounded-xl border border-line p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-ink">{deal.title}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          deal.priority === "High"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {deal.priority} Priority
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-ink-muted">
                      {deal.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      )}
    </div>
  );
}
