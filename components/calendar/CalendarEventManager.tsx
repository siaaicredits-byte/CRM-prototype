
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Clock, MapPin, Pencil, Trash2, X } from "lucide-react";

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  location: string | null;
  type: string;
  status: string;
  leadId: number | null;
  contactId: number | null;
  companyId: number | null;
  dealId: number | null;
};

type Props = {
  events: CalendarEvent[];
};

type EventForm = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  status: string;
};

function getIndiaDate(value?: string) {
  const date = value ? new Date(value) : new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function getIndiaTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function emptyForm(): EventForm {
  return {
    title: "",
    description: "",
    date: getIndiaDate(),
    startTime: "10:00",
    endTime: "10:30",
    location: "",
    type: "MEETING",
    status: "SCHEDULED",
  };
}

function formatEventDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const eventTypes = [
  { value: "MEETING", label: "Meeting" },
  { value: "CALL", label: "Call" },
  { value: "DEMO", label: "Demo" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "OTHER", label: "Other" },
];

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent";

export function CalendarEventManager({ events }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function updateField<K extends keyof EventForm>(key: K, value: EventForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setIsOpen(true);
  }

  function openEditForm(event: CalendarEvent) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description ?? "",
      date: getIndiaDate(event.startAt),
      startTime: getIndiaTime(event.startAt),
      endTime: getIndiaTime(event.endAt),
      location: event.location ?? "",
      type: event.type,
      status: event.status,
    });
    setError("");
    setIsOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter an event title.");
      return;
    }

    const startAt = new Date(`${form.date}T${form.startTime}:00`);
    const endAt = new Date(`${form.date}T${form.endTime}:00`);

    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime()) ||
      endAt <= startAt
    ) {
      setError("End time must be later than start time.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        type: form.type,
        status: form.status,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };

      const response = await fetch(
        editingId ? `/api/calendar-events/${editingId}` : "/api/calendar-events",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || result?.message || "Unable to save event.");
      }

      setIsOpen(false);
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this calendar event?")) return;

    setDeletingId(id);
    setError("");

    try {
      const response = await fetch(`/api/calendar-events/${id}`, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || result?.message || "Unable to delete event.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete event.");
    } finally {
      setDeletingId(null);
    }
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Calendar Events</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Create and manage your meetings, calls and follow-ups.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <CalendarPlus className="size-4" />
          Add Event
        </button>
      </div>

      {error && !isOpen && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-line bg-surface-raised p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-ink">
              {editingId ? "Edit Event" : "Create New Event"}
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-ink-muted hover:bg-surface"
              aria-label="Close form"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm text-ink sm:col-span-2">
              Event title *
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Client project discussion"
                maxLength={200}
                required
              />
            </label>

            <label className="space-y-1.5 text-sm text-ink">
              Event type
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
              >
                {eventTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm text-ink">
              Status
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>

            <label className="space-y-1.5 text-sm text-ink">
              Date *
              <input
                type="date"
                className={inputClass}
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 text-sm text-ink">
                Start time *
                <input
                  type="time"
                  className={inputClass}
                  value={form.startTime}
                  onChange={(e) => updateField("startTime", e.target.value)}
                  required
                />
              </label>
              <label className="space-y-1.5 text-sm text-ink">
                End time *
                <input
                  type="time"
                  className={inputClass}
                  value={form.endTime}
                  onChange={(e) => updateField("endTime", e.target.value)}
                  required
                />
              </label>
            </div>

            <label className="space-y-1.5 text-sm text-ink sm:col-span-2">
              Location
              <input
                className={inputClass}
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="Office, online meeting link or client location"
              />
            </label>

            <label className="space-y-1.5 text-sm text-ink sm:col-span-2">
              Description
              <textarea
                className={inputClass}
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Add event notes or agenda..."
              />
            </label>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-line px-4 py-2.5 text-sm text-ink-muted hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sortedEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-surface-raised p-8 text-center">
            <CalendarPlus className="mx-auto size-8 text-ink-muted" />
            <p className="mt-3 text-sm font-medium text-ink">No calendar events yet</p>
            <p className="mt-1 text-xs text-ink-muted">
              Select Add Event to schedule your first meeting or call.
            </p>
          </div>
        ) : (
          sortedEvents.map((item) => (
            <article
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-surface-raised p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-ink">{item.title}</h3>
                  <span className="rounded-full border border-line px-2 py-1 text-[10px] text-ink-muted">
                    {eventTypes.find((type) => type.value === item.type)?.label ?? item.type}
                  </span>
                  <span className="rounded-full border border-line px-2 py-1 text-[10px] text-ink-muted">
                    {item.status}
                  </span>
                </div>

                <p className="mt-2 flex items-center gap-2 text-xs text-ink-muted">
                  <Clock className="size-3.5" />
                  {formatEventDate(item.startAt)} – {getIndiaTime(item.endAt)}
                </p>

                {item.location && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-ink-muted">
                    <MapPin className="size-3.5" />
                    {item.location}
                  </p>
                )}

                {item.description && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditForm(item)}
                  className="rounded-lg border border-line p-2 text-ink-muted hover:bg-surface hover:text-ink"
                  aria-label={`Edit ${item.title}`}
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="rounded-lg border border-line p-2 text-ink-muted hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
