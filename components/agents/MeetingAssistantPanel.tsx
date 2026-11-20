
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

type MeetingResult = {
  meeting: {
    title: string;
    date: string;
    attendees: string;
    preparedBy: string;
  };
  preparation: {
    agenda: string[];
    notes: string;
    suggestedActions: string[];
  };
};

export function MeetingAssistantPanel() {
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [attendees, setAttendees] = useState("");
  const [notes, setNotes] = useState("");

  const [result, setResult] = useState<MeetingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function generateAgenda() {
    setLoading(true);
    setError("");
    setMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/agents/meeting-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          meetingTitle,
          meetingDate,
          attendees,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to prepare the meeting."
        );
      }

      setResult({
        meeting: data.meeting,
        preparation: data.preparation,
      });

      setMessage(data.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyAgenda() {
    if (!result) return;

    const content = [
      `Meeting: ${result.meeting.title}`,
      `Date: ${result.meeting.date}`,
      `Attendees: ${result.meeting.attendees}`,
      "",
      "AGENDA",
      ...result.preparation.agenda.map(
        (item, index) => `${index + 1}. ${item}`
      ),
      "",
      "MEETING NOTES",
      result.preparation.notes,
      "",
      "SUGGESTED ACTIONS",
      ...result.preparation.suggestedActions.map(
        (item, index) => `${index + 1}. ${item}`
      ),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(content);
      setMessage("Meeting preparation copied successfully.");
    } catch {
      setError("Unable to copy. Please copy the content manually.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="space-y-4 p-5">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Meeting Preparation
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Enter meeting details to prepare an agenda and suggested actions.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-muted">
            Meeting Title *
          </label>
          <input
            value={meetingTitle}
            onChange={(event) => setMeetingTitle(event.target.value)}
            maxLength={200}
            placeholder="e.g. Customer Requirements Discussion"
            className="w-full rounded-xl border border-line bg-surface px-3 py-3 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-ink-muted">
              Meeting Date
            </label>
            <input
              type="date"
              value={meetingDate}
              onChange={(event) => setMeetingDate(event.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3 py-3 text-sm text-ink"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-ink-muted">
              Attendees
            </label>
            <input
              value={attendees}
              onChange={(event) => setAttendees(event.target.value)}
              placeholder="Customer, Sales Representative"
              className="w-full rounded-xl border border-line bg-surface px-3 py-3 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-muted">
            Meeting Notes / Requirements
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={10000}
            rows={4}
            placeholder="Enter customer requirements, discussion topics or important details..."
            className="w-full resize-y rounded-xl border border-line bg-surface px-3 py-3 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <button
          onClick={generateAgenda}
          disabled={loading || !meetingTitle.trim()}
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Preparing Meeting..." : "Generate Meeting Agenda"}
        </button>
      </Card>

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

      {result && (
        <Card className="space-y-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Meeting Preparation
              </h2>
              <p className="text-xs text-ink-muted">
                Prepared by {result.meeting.preparedBy}
              </p>
            </div>

            <button
              onClick={copyAgenda}
              className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-accent-soft"
            >
              Copy Agenda
            </button>
          </div>

          <div className="rounded-xl bg-accent-soft p-4">
            <h3 className="font-semibold text-ink">
              {result.meeting.title}
            </h3>
            <p className="mt-2 text-sm text-ink-muted">
              Date: {result.meeting.date}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Attendees: {result.meeting.attendees}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-ink">
              Suggested Meeting Agenda
            </h3>
            <ol className="mt-3 space-y-3">
              {result.preparation.agenda.map((item, index) => (
                <li key={index} className="flex gap-3 text-sm text-ink">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    {index + 1}
                  </span>
                  <span className="pt-1">{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-ink">Meeting Notes</h3>
            <p className="mt-2 whitespace-pre-wrap rounded-xl border border-line p-4 text-sm leading-6 text-ink-muted">
              {result.preparation.notes}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-ink">
              Suggested Action Items
            </h3>
            <ul className="mt-3 space-y-3">
              {result.preparation.suggestedActions.map((item, index) => (
                <li key={index} className="flex gap-3 text-sm text-ink">
                  <span className="text-emerald-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-ink-muted">
            Template-based meeting preparation. Review the agenda and
            suggested actions before sharing.
          </p>
        </Card>
      )}
    </div>
  );
}
