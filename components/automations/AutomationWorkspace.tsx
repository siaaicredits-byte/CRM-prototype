"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Activity, CheckCircle2, Clock, Copy, Pause, Pencil, Play, Plus,
  RefreshCw, Sparkles, Trash2, Workflow, X, XCircle,
} from "lucide-react";

type Automation = {
  id: number;
  name: string;
  description: string | null;
  triggerType: string;
  conditions: string | null;
  actionType: string;
  actionConfig: string | null;
  isActive: boolean;
  lastRunAt: string | null;
  createdAt: string;
};

type AutomationRun = {
  id: number;
  automationId: number;
  status: string;
  result: string | null;
  error: string | null;
  startedAt: string;
};

type Condition = { field: string; operator: string; value: string | number };
type FormState = {
  name: string; description: string; triggerType: string;
  conditionField: string; conditionOperator: string; conditionValue: string;
  actionType: string; owner: string; status: string;
  taskTitle: string; dueInDays: string;
};

const triggers = [
  { value: "LEAD_CREATED", label: "When a new lead is created" },
  { value: "LEAD_STATUS_CHANGED", label: "When a lead status changes" },
  { value: "DEAL_CREATED", label: "When a new deal is created" },
];

const actions = [
  { value: "ASSIGN_LEAD_OWNER", label: "Assign lead owner" },
  { value: "UPDATE_LEAD_STATUS", label: "Update lead status" },
  { value: "CREATE_FOLLOW_UP_TASK", label: "Create follow-up task" },
];

const leadStatuses = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "LOST"];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50";
const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

const emptyForm: FormState = {
  name: "",
  description: "",
  triggerType: "LEAD_CREATED",
  conditionField: "",
  conditionOperator: "equals",
  conditionValue: "",
  actionType: "CREATE_FOLLOW_UP_TASK",
  owner: "",
  status: "CONTACTED",
  taskTitle: "Follow up with lead",
  dueInDays: "1",
};

function parseConditions(value: string | null): Condition[] {
  try {
    const result: unknown = JSON.parse(value || "[]");
    return Array.isArray(result) ? (result as Condition[]) : [];
  } catch {
    return [];
  }
}

function parseConfig(value: string | null): Record<string, unknown> {
  try {
    const result: unknown = JSON.parse(value || "{}");
    return result && typeof result === "object" && !Array.isArray(result)
      ? (result as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function triggerLabel(value: string) {
  return triggers.find((item) => item.value === value)?.label ?? value;
}

function actionLabel(value: string) {
  return actions.find((item) => item.value === value)?.label ?? value;
}

export function AutomationWorkspace() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [aRes, rRes] = await Promise.all([
        fetch("/api/automations", { cache: "no-store" }),
        fetch("/api/automations/runs", { cache: "no-store" }),
      ]);
      const aData = await aRes.json();
      const rData = await rRes.json();
      if (!aRes.ok) throw new Error(aData.message || "Unable to load workflows.");
      if (!rRes.ok) throw new Error(rData.message || "Unable to load execution history.");
      setAutomations(aData.automations ?? []);
      setRuns(rData.runs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load automations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function useTemplate(type: "welcome" | "qualified" | "deal") {
    setEditingId(null);
    setError("");
    setNotice("");
    const templates: Record<typeof type, FormState> = {
      welcome: {
        ...emptyForm,
        name: "Welcome New Leads",
        description: "Automatically create a follow-up task for every new lead.",
        triggerType: "LEAD_CREATED",
        actionType: "CREATE_FOLLOW_UP_TASK",
        taskTitle: "Contact new lead",
        dueInDays: "1",
      },
      qualified: {
        ...emptyForm,
        name: "Qualified Lead Assignment",
        description: "Assign qualified leads to the sales team.",
        triggerType: "LEAD_STATUS_CHANGED",
        conditionField: "status",
        conditionOperator: "equals",
        conditionValue: "QUALIFIED",
        actionType: "ASSIGN_LEAD_OWNER",
        owner: "Sales Team",
      },
      deal: {
        ...emptyForm,
        name: "New Deal Follow-up",
        description: "Create a follow-up task when a deal is created.",
        triggerType: "DEAL_CREATED",
        actionType: "CREATE_FOLLOW_UP_TASK",
        taskTitle: "Review new deal",
        dueInDays: "1",
      },
    };
    setForm(templates[type]);
    setShowForm(true);
  }

  function editAutomation(item: Automation) {
    const condition = parseConditions(item.conditions)[0];
    const config = parseConfig(item.actionConfig);
    setForm({
      name: item.name,
      description: item.description || "",
      triggerType: item.triggerType,
      conditionField: condition?.field || "",
      conditionOperator: condition?.operator || "equals",
      conditionValue: String(condition?.value ?? ""),
      actionType: item.actionType,
      owner: String(config.owner ?? ""),
      status: String(config.status ?? "CONTACTED"),
      taskTitle: String(config.title ?? "Follow up with lead"),
      dueInDays: String(config.dueInDays ?? 1),
    });
    setEditingId(item.id);
    setError("");
    setNotice("");
    setShowForm(true);
  }

  async function duplicateAutomation(item: Automation) {
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${item.name} (Copy)`,
          description: item.description,
          triggerType: item.triggerType,
          conditions: parseConditions(item.conditions),
          actionType: item.actionType,
          actionConfig: parseConfig(item.actionConfig),
          isActive: false,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to duplicate workflow.");
      setNotice("Workflow duplicated. The copy is paused.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to duplicate workflow.");
    }
  }

  async function saveAutomation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    if (form.triggerType === "DEAL_CREATED" &&
        form.actionType !== "CREATE_FOLLOW_UP_TASK") {
      setError("Deal-created workflows currently support follow-up task actions only.");
      setSaving(false);
      return;
    }
    if (form.actionType === "ASSIGN_LEAD_OWNER" && !form.owner.trim()) {
      setError("Enter the lead owner.");
      setSaving(false);
      return;
    }
    if (form.actionType === "CREATE_FOLLOW_UP_TASK" &&
        (!form.taskTitle.trim() || !Number.isInteger(Number(form.dueInDays)) ||
         Number(form.dueInDays) < 0 || Number(form.dueInDays) > 365)) {
      setError("Enter a task title and a due period between 0 and 365 days.");
      setSaving(false);
      return;
    }

    const conditions: Condition[] =
      form.conditionField && form.conditionValue.trim()
        ? [{
            field: form.conditionField,
            operator: form.conditionOperator,
            value: Number.isNaN(Number(form.conditionValue))
              ? form.conditionValue
              : Number(form.conditionValue),
          }]
        : [];

    const actionConfig =
      form.actionType === "ASSIGN_LEAD_OWNER"
        ? { owner: form.owner.trim() }
        : form.actionType === "UPDATE_LEAD_STATUS"
          ? { status: form.status }
          : { title: form.taskTitle.trim(), dueInDays: Number(form.dueInDays) };

    try {
      const response = await fetch(
        editingId ? `/api/automations/${editingId}` : "/api/automations",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
            triggerType: form.triggerType,
            conditions,
            actionType: form.actionType,
            actionConfig,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save workflow.");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setNotice(editingId ? "Workflow updated." : "Workflow created.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save workflow.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAutomation(item: Automation) {
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/automations/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to update workflow.");
      setNotice(item.isActive ? "Workflow paused." : "Workflow activated.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update workflow.");
    }
  }

  async function deleteAutomation(item: Automation) {
    if (!window.confirm(`Delete "${item.name}" and its execution history?`)) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/automations/${item.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete workflow.");
      setNotice("Workflow deleted.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete workflow.");
    }
  }

  const activeCount = automations.filter((item) => item.isActive).length;
  const successfulRuns = runs.filter((run) => run.status === "SUCCESS").length;
  const failedRuns = runs.filter((run) => run.status === "FAILED").length;

  const availableActions = form.triggerType === "DEAL_CREATED"
    ? actions.filter((item) => item.value === "CREATE_FOLLOW_UP_TASK")
    : actions;

  const conditionFields = form.triggerType === "DEAL_CREATED"
    ? [
        { value: "stage", label: "Deal stage" },
        { value: "value", label: "Deal value" },
        { value: "owner", label: "Deal owner" },
      ]
    : [
        { value: "status", label: "Lead status" },
        { value: "source", label: "Lead source" },
        { value: "score", label: "Lead score" },
        { value: "value", label: "Lead value" },
        { value: "owner", label: "Lead owner" },
      ];

  function changeTrigger(triggerType: string) {
    setForm((current) => ({
      ...current,
      triggerType,
      actionType: triggerType === "DEAL_CREATED"
        ? "CREATE_FOLLOW_UP_TASK"
        : current.actionType,
      conditionField: "",
      conditionValue: "",
    }));
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Workflow automation</h2>
          <p className="mt-1 text-sm text-slate-400">
            Automate routine CRM actions with trigger-based workflows.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void loadData()}
            className={`${buttonClass} border border-white/10 bg-white/5 hover:bg-white/10`}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button type="button" onClick={openCreate}
            className={`${buttonClass} bg-blue-600 text-white hover:bg-blue-500`}>
            <Plus size={17} /> Create workflow
          </button>
        </div>
      </div>

      {(error || notice) && (
        <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${
          error ? "border-red-500/30 bg-red-500/10 text-red-300"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
        }`}>
          {error || notice}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total workflows", value: automations.length, icon: Workflow },
          { label: "Active workflows", value: activeCount, icon: Play },
          { label: "Successful runs", value: successfulRuns, icon: CheckCircle2 },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-[#111827] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{item.label}</span>
              <item.icon size={19} className="text-blue-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-blue-400" />
          <h3 className="font-semibold">Workflow templates</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { id: "welcome" as const, title: "Welcome New Leads",
              description: "Create a follow-up task when a lead arrives." },
            { id: "qualified" as const, title: "Qualified Lead Assignment",
              description: "Assign qualified leads to your sales team." },
            { id: "deal" as const, title: "New Deal Follow-up",
              description: "Create a task when a new deal is added." },
          ].map((template) => (
            <button key={template.id} type="button"
              onClick={() => useTemplate(template.id)}
              className="rounded-2xl border border-white/10 bg-[#111827] p-4 text-left transition hover:border-blue-500/50 hover:bg-blue-500/5">
              <p className="font-medium">{template.title}</p>
              <p className="mt-2 text-sm text-slate-400">{template.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blue-400">
                <Plus size={14} /> Use template
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111827]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h3 className="font-semibold">Your workflows</h3>
            <p className="mt-1 text-xs text-slate-400">Manage your CRM automation rules.</p>
          </div>
          <span className="text-xs text-slate-400">{failedRuns} failed runs</span>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">Loading workflows...</div>
        ) : automations.length === 0 ? (
          <div className="p-10 text-center">
            <Workflow className="mx-auto text-slate-500" size={34} />
            <p className="mt-3 font-medium">No workflows yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Create your first workflow to automate a CRM action.
            </p>
            <button type="button" onClick={openCreate}
              className={`${buttonClass} mt-4 bg-blue-600 hover:bg-blue-500`}>
              <Plus size={16} /> Create your first workflow
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {automations.map((item) => (
              <div key={item.id}
                className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium">{item.name}</h4>
                    <span className={`rounded-full px-2.5 py-1 text-xs ${
                      item.isActive ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-slate-500/15 text-slate-400"
                    }`}>{item.isActive ? "Active" : "Paused"}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.description || "No description provided."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                    <span>Trigger: {triggerLabel(item.triggerType)}</span>
                    <span>Action: {actionLabel(item.actionType)}</span>
                    <span>Last run: {item.lastRunAt
                      ? new Date(item.lastRunAt).toLocaleString() : "Never"}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button type="button" onClick={() => void toggleAutomation(item)}
                    className={`${buttonClass} border border-white/10 bg-white/5 hover:bg-white/10`}>
                    {item.isActive ? <Pause size={15} /> : <Play size={15} />}
                    {item.isActive ? "Pause" : "Activate"}
                  </button>
                  <button type="button" onClick={() => editAutomation(item)}
                    className={`${buttonClass} border border-white/10 bg-white/5 hover:bg-white/10`}>
                    <Pencil size={15} /> Edit
                  </button>
                  <button type="button" onClick={() => void duplicateAutomation(item)}
                    className={`${buttonClass} border border-white/10 bg-white/5 hover:bg-white/10`}>
                    <Copy size={15} /> Duplicate
                  </button>
                  <button type="button" onClick={() => void deleteAutomation(item)}
                    className={`${buttonClass} border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20`}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111827]">
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <Activity size={18} className="text-blue-400" />
          <div>
            <h3 className="font-semibold">Execution history</h3>
            <p className="mt-1 text-xs text-slate-400">Recent workflow execution records.</p>
          </div>
        </div>
        {runs.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">No execution history yet.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {[...runs]
              .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
              .slice(0, 20)
              .map((run) => (
                <div key={run.id}
                  className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">Workflow #{run.automationId}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {run.result || run.error || "No details recorded."}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={12} /> {new Date(run.startedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
                    run.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-300"
                      : run.status === "FAILED" ? "bg-red-500/10 text-red-300"
                        : "bg-amber-500/10 text-amber-300"
                  }`}>
                    {run.status === "SUCCESS" ? <CheckCircle2 size={13} />
                      : run.status === "FAILED" ? <XCircle size={13} />
                        : <Clock size={13} />}
                    {run.status}
                  </span>
                </div>
              ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <form onSubmit={saveAutomation}
            className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1220] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {editingId ? "Edit workflow" : "Create workflow"}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Configure trigger, condition and action.
                </p>
              </div>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close form">
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Workflow name</span>
                <input required maxLength={100} className={inputClass}
                  placeholder="e.g. Welcome new leads" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Description</span>
                <textarea rows={2} className={inputClass}
                  placeholder="Describe what this workflow does..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="mb-3 text-sm font-semibold text-blue-300">1. Choose a trigger</p>
                <select className={inputClass} value={form.triggerType}
                  onChange={(e) => changeTrigger(e.target.value)}>
                  {triggers.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="mb-3 text-sm font-semibold">2. Add an optional condition</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <select className={inputClass} value={form.conditionField}
                    onChange={(e) => setForm({ ...form, conditionField: e.target.value })}>
                    <option value="">No condition</option>
                    {conditionFields.map((field) => (
                      <option key={field.value} value={field.value}>{field.label}</option>
                    ))}
                  </select>
                  <select className={inputClass} value={form.conditionOperator}
                    disabled={!form.conditionField}
                    onChange={(e) => setForm({ ...form, conditionOperator: e.target.value })}>
                    <option value="equals">Equals</option>
                    <option value="not_equals">Does not equal</option>
                    <option value="contains">Contains</option>
                    <option value="greater_than">Greater than</option>
                    <option value="less_than">Less than</option>
                  </select>
                  <input className={inputClass} placeholder="Condition value"
                    value={form.conditionValue} disabled={!form.conditionField}
                    onChange={(e) => setForm({ ...form, conditionValue: e.target.value })} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Conditions are evaluated against the lead or deal that triggered the workflow.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="mb-3 text-sm font-semibold text-emerald-300">3. Choose an action</p>
                <select className={inputClass} value={form.actionType}
                  onChange={(e) => setForm({ ...form, actionType: e.target.value })}>
                  {availableActions.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>

                {form.actionType === "ASSIGN_LEAD_OWNER" && (
                  <input required className={`${inputClass} mt-3`}
                    placeholder="New lead owner" value={form.owner}
                    onChange={(e) => setForm({ ...form, owner: e.target.value })} />
                )}

                {form.actionType === "UPDATE_LEAD_STATUS" && (
                  <select className={`${inputClass} mt-3`} value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {leadStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                )}

                {form.actionType === "CREATE_FOLLOW_UP_TASK" && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input required className={inputClass} placeholder="Task title"
                      value={form.taskTitle}
                      onChange={(e) => setForm({ ...form, taskTitle: e.target.value })} />
                    <input required type="number" min="0" max="365"
                      className={inputClass} placeholder="Due in days"
                      value={form.dueInDays}
                      onChange={(e) => setForm({ ...form, dueInDays: e.target.value })} />
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className={`${buttonClass} border border-white/10 bg-white/5 hover:bg-white/10`}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className={`${buttonClass} bg-blue-600 hover:bg-blue-500`}>
                {saving ? "Saving..." : editingId ? "Save changes" : "Create workflow"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AutomationWorkspace;
