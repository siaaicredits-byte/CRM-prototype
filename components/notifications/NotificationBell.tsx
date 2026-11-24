
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  ExternalLink,
  Trash2,
  X,
} from "lucide-react";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  href: string | null;
  createdAt: string;
};

type NotificationResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load notifications");
      }

      const data: NotificationResponse = await response.json();

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setError("");
    } catch (err) {
      console.error("Notification fetch error:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();

    const interval = window.setInterval(() => {
      void fetchNotifications();
    }, 60000);

    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  async function markAsRead(id: number, isRead: boolean) {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead }),
      });

      if (!response.ok) throw new Error("Update failed");

      await fetchNotifications();
    } catch (err) {
      console.error("Notification update error:", err);
    }
  }

  async function markAllAsRead() {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Update failed");

      await fetchNotifications();
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  }

  async function deleteNotification(id: number) {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      await fetchNotifications();
    } catch (err) {
      console.error("Notification delete error:", err);
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  }

  const typeColor: Record<string, string> = {
    INFO: "text-sky-400",
    SUCCESS: "text-emerald-400",
    WARNING: "text-amber-400",
    ERROR: "text-red-400",
    REMINDER: "text-violet-400",
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        className="relative inline-flex size-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
      >
        <Bell className="size-[18px]" aria-hidden="true" />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />

          <section
            aria-label="Notifications panel"
            className="absolute right-0 z-40 mt-3 w-[min(92vw,400px)] overflow-hidden rounded-xl border border-line bg-navy-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Notifications
                </h2>
                <p className="text-xs text-ink-muted">
                  {unreadCount} unread
                </p>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    title="Mark all as read"
                    aria-label="Mark all as read"
                    className="rounded-lg p-2 text-ink-muted hover:bg-surface-raised hover:text-ink"
                  >
                    <CheckCheck className="size-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                  className="rounded-lg p-2 text-ink-muted hover:bg-surface-raised hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {loading ? (
                <p className="px-4 py-10 text-center text-sm text-ink-muted">
                  Loading notifications...
                </p>
              ) : error ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      void fetchNotifications();
                    }}
                    className="mt-3 text-xs text-sky-400 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell className="mx-auto mb-3 size-8 text-ink-faint" />
                  <p className="text-sm font-medium text-ink">
                    You're all caught up!
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    New notifications will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <article
                    key={notification.id}
                    className={`border-b border-line px-4 py-3 transition-colors ${
                      notification.isRead
                        ? "bg-transparent"
                        : "bg-surface/60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 size-2 shrink-0 rounded-full ${
                          notification.isRead
                            ? "bg-transparent"
                            : "bg-sky-400"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className={`text-sm ${
                              notification.isRead
                                ? "font-medium text-ink-muted"
                                : "font-semibold text-ink"
                            }`}
                          >
                            {notification.title}
                          </h3>

                          <span
                            className={`shrink-0 text-[10px] font-semibold ${
                              typeColor[notification.type] ?? "text-ink-muted"
                            }`}
                          >
                            {notification.type}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-ink-muted">
                          {notification.message}
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <time className="text-[10px] text-ink-faint">
                            {formatDate(notification.createdAt)}
                          </time>

                          <div className="flex items-center gap-2">
                            {notification.href && (
                              <Link
                                href={notification.href}
                                onClick={() => {
                                  if (!notification.isRead) {
                                    void markAsRead(notification.id, true);
                                  }
                                  setIsOpen(false);
                                }}
                                className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
                              >
                                Open
                                <ExternalLink className="size-3" />
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                void markAsRead(
                                  notification.id,
                                  !notification.isRead
                                )
                              }
                              className="text-xs text-ink-muted hover:text-ink"
                            >
                              {notification.isRead ? "Unread" : "Read"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void deleteNotification(notification.id)
                              }
                              aria-label="Delete notification"
                              className="rounded p-1 text-ink-faint hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
