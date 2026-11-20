
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface UserCardProps {
  user: {
    name: string | null;
    email: string;
    role: string;
  };
}

export function UserCard({ user }: UserCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const displayName = user.name || user.email;

  const displayRole = user.role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  async function handleLogout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to log out.");
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError("Logout failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-surface/60 p-3">
      <div className="flex items-center gap-3">
        <Avatar name={displayName} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">
            {displayName}
          </p>
          <p className="truncate text-xs text-ink-muted">
            {user.email}
          </p>
          <p className="truncate text-xs text-ink-muted">
            {displayRole}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          aria-label="Log out"
          title="Log out"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut className="size-[18px]" />
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}

      {loading && (
        <p className="mt-2 text-xs text-ink-muted">
          Signing out...
        </p>
      )}
    </div>
  );
}
