
"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  due: string | Date;
  done: boolean;
};

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

type CalendarMonthProps = {
  tasks: Task[];
  events: CalendarEvent[];
};

type CalendarView = "month" | "week" | "day";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function taskDateKey(value: string): string {
  if (!value) return "";

  const datePart = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];

  if (datePart) return datePart;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return dateKey(date);
}

function eventDateKey(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function formatDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const offset = (day + 6) % 7;

  result.setDate(result.getDate() - offset);
  result.setHours(0, 0, 0, 0);

  return result;
}

function eventColor(type: string): string {
  switch (type) {
    case "MEETING":
      return "bg-blue-400";
    case "CALL":
      return "bg-violet-400";
    case "DEMO":
      return "bg-amber-400";
    case "FOLLOW_UP":
      return "bg-cyan-400";
    default:
      return "bg-pink-400";
  }
}

function eventTypeLabel(type: string): string {
  switch (type) {
    case "MEETING":
      return "Meeting";
    case "CALL":
      return "Call";
    case "DEMO":
      return "Demo";
    case "FOLLOW_UP":
      return "Follow-up";
    default:
      return "Other";
  }
}

export function CalendarMonth({
  tasks,
  events,
}: CalendarMonthProps) {
  const [selectedDate, setSelectedDate] = useState(
    dateKey(new Date())
  );

  const [view, setView] = useState<CalendarView>("month");

  const selected = useMemo(() => {
    const date = new Date(`${selectedDate}T12:00:00`);

    return Number.isNaN(date.getTime()) ? new Date() : date;
  }, [selectedDate]);

  const todayKey = dateKey(new Date());

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    tasks.forEach((task) => {
      const key = taskDateKey(String(task.due));

      if (!key) return;

      grouped[key] ??= [];
      grouped[key].push(task);
    });

    return grouped;
  }, [tasks]);

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};

    events.forEach((event) => {
      const key = eventDateKey(event.startAt);

      if (!key) return;

      grouped[key] ??= [];
      grouped[key].push(event);
    });

    Object.values(grouped).forEach((items) => {
      items.sort(
        (a, b) =>
          new Date(a.startAt).getTime() -
          new Date(b.startAt).getTime()
      );
    });

    return grouped;
  }, [events]);

  const selectedTasks = tasksByDate[selectedDate] ?? [];
  const selectedEvents = eventsByDate[selectedDate] ?? [];

  const monthDays = useMemo(() => {
    const year = selected.getFullYear();
    const month = selected.getMonth();

    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();

    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: count }, (_, index) => index + 1),
    ];
  }, [selected]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selected);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      return date;
    });
  }, [selected]);

  const heading =
    view === "month"
      ? selected.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : view === "week"
        ? `${weekDays[0].toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} – ${weekDays[6].toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`
        : formatDate(selectedDate);

  function navigate(direction: number) {
    const next = new Date(selected);

    if (view === "month") {
      next.setMonth(next.getMonth() + direction);
    } else if (view === "week") {
      next.setDate(next.getDate() + direction * 7);
    } else {
      next.setDate(next.getDate() + direction);
    }

    setSelectedDate(dateKey(next));
  }

  function goToToday() {
    setSelectedDate(dateKey(new Date()));
  }

  function renderDateButton(date: Date) {
    const key = dateKey(date);
    const dayTasks = tasksByDate[key] ?? [];
    const dayEvents = eventsByDate[key] ?? [];

    const isToday = key === todayKey;
    const isSelected = key === selectedDate;

    return (
      <button
        key={key}
        type="button"
        onClick={() => setSelectedDate(key)}
        aria-pressed={isSelected}
        className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border p-1 transition sm:min-h-20 ${
          isSelected
            ? "border-accent bg-accent/10 text-ink"
            : isToday
              ? "border-accent/50 bg-surface-raised text-ink"
              : "border-line bg-surface text-ink hover:bg-surface-raised"
        }`}
      >
        <span className="text-sm font-semibold">
          {date.getDate()}
        </span>

        {(dayTasks.length > 0 || dayEvents.length > 0) && (
          <div className="flex flex-wrap items-center justify-center gap-1">
            {dayTasks.slice(0, 2).map((task) => (
              <span
                key={`task-${task.id}`}
                className={`size-1.5 rounded-full ${
                  task.done ? "bg-emerald-400" : "bg-accent"
                }`}
              />
            ))}

            {dayEvents.slice(0, 3).map((event) => (
              <span
                key={`event-${event.id}`}
                className={`size-1.5 rounded-full ${eventColor(event.type)}`}
              />
            ))}
          </div>
        )}

        {(dayTasks.length > 0 || dayEvents.length > 0) && (
          <span className="text-[9px] text-ink-muted">
            {dayTasks.length + dayEvents.length} item(s)
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">
          {heading}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink-muted hover:bg-surface-raised"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Previous"
            className="rounded-lg border border-line p-2 text-ink-muted hover:bg-surface-raised"
          >
            <ChevronLeft className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Next"
            className="rounded-lg border border-line p-2 text-ink-muted hover:bg-surface-raised"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-1 rounded-lg border border-line bg-surface-raised p-1">
        {(["month", "week", "day"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setView(item)}
            aria-pressed={view === item}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium capitalize transition ${
              view === item
                ? "bg-accent text-white"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Calendar Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-accent" />
          Pending task
        </span>

        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400" />
          Completed task
        </span>

        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-blue-400" />
          Calendar event
        </span>
      </div>

      {/* Month View */}
      {view === "month" && (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekdays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-ink-muted"
            >
              {day}
            </div>
          ))}

          {monthDays.map((day, index) =>
            day === null ? (
              <div key={`empty-${index}`} />
            ) : (
              renderDateButton(
                new Date(
                  selected.getFullYear(),
                  selected.getMonth(),
                  day
                )
              )
            )
          )}
        </div>
      )}

      {/* Week View */}
      {view === "week" && (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekDays.map((date) => (
            <div key={dateKey(date)} className="min-w-0">
              <p className="mb-2 text-center text-[10px] font-medium text-ink-muted sm:text-xs">
                {weekdays[(date.getDay() + 6) % 7]}
              </p>

              {renderDateButton(date)}
            </div>
          ))}
        </div>
      )}

      {/* Day View */}
      {view === "day" && (
        <div className="rounded-xl border border-line bg-surface-raised p-4">
          <p className="text-sm font-semibold text-ink">
            {formatDate(selectedDate)}
          </p>

          <p className="mt-1 text-xs text-ink-muted">
            {selectedTasks.length} task(s) and {selectedEvents.length} event(s) scheduled
          </p>
        </div>
      )}

      {/* Selected Date Tasks */}
      <div className="rounded-xl border border-line bg-surface-raised p-4">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="size-4 text-accent" />

          <h3 className="text-sm font-semibold text-ink">
            Tasks for {formatDate(selectedDate)}
          </h3>
        </div>

        {selectedTasks.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No tasks scheduled for this date.
          </p>
        ) : (
          <ul className="space-y-2">
            {selectedTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3"
              >
                <span
                  className={`min-w-0 truncate text-sm font-medium ${
                    task.done
                      ? "text-ink-muted line-through"
                      : "text-ink"
                  }`}
                >
                  {task.title}
                </span>

                <span
                  className={`shrink-0 text-xs ${
                    task.done ? "text-emerald-400" : "text-ink-muted"
                  }`}
                >
                  {task.done ? "Completed" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected Date Events */}
      <div className="rounded-xl border border-line bg-surface-raised p-4">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="size-4 text-accent" />

          <h3 className="text-sm font-semibold text-ink">
            Events for {formatDate(selectedDate)}
          </h3>
        </div>

        {selectedEvents.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No calendar events scheduled for this date.
          </p>
        ) : (
          <ul className="space-y-2">
            {selectedEvents.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-line bg-surface p-3"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${eventColor(event.type)}`}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {event.title}
                    </p>

                    <p className="mt-1 text-xs text-ink-muted">
                      {eventTypeLabel(event.type)}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatTime(event.startAt)} – {formatTime(event.endAt)}
                      </span>

                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {event.location}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="mt-2 text-xs text-ink-muted">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 rounded-full border border-line px-2 py-1 text-[10px] text-ink-muted">
                    {event.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
