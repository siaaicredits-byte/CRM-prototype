
"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import type { Task } from "@/types/crm";

interface CalendarMonthProps {
  tasks: Task[];
}

type CalendarView = "month" | "week" | "day";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatDate(key: string) {
  return new Date(`${key}T12:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CalendarMonth({ tasks }: CalendarMonthProps) {
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState(() =>
    dateKey(new Date())
  );

  const selected = new Date(`${selectedDate}T12:00:00`);
  const todayKey = dateKey(new Date());

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    tasks.forEach((task) => {
      const key = task.due.slice(0, 10);
      grouped[key] ??= [];
      grouped[key].push(task);
    });

    return grouped;
  }, [tasks]);

  const selectedTasks = tasksByDate[selectedDate] ?? [];

  const monthDays = useMemo(() => {
    const year = selected.getFullYear();
    const month = selected.getMonth();
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();

    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: count }, (_, i) => i + 1),
    ];
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selected);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [selectedDate]);

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
            ? "border-accent bg-accent/10 text-accent"
            : "border-transparent text-ink hover:border-line hover:bg-surface-raised"
        }`}
      >
        <span
          className={`flex size-7 items-center justify-center rounded-full text-sm ${
            isToday ? "bg-accent text-white" : ""
          }`}
        >
          {date.getDate()}
        </span>

        {dayTasks.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-accent" />
            <span className="text-[10px] text-ink-muted">
              {dayTasks.length}
            </span>
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">{heading}</h2>
          <p className="text-xs text-ink-muted">
            Manage your scheduled tasks and activities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-surface-raised"
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

      {view === "day" && (
        <div className="rounded-xl border border-line bg-surface-raised p-4">
          <p className="text-sm font-semibold text-ink">
            {formatDate(selectedDate)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {selectedTasks.length} scheduled task(s)
          </p>
        </div>
      )}

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
    </div>
  );
}
