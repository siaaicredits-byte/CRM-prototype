
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("registered") === "true") {
      setSuccess(
        "Account created successfully! Please sign in to continue."
      );
    }
  }, []);
  useEffect(() => {
  let active = true;

  async function checkSession() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (!active) return;

      if (response.ok) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
    } catch {
      // Allow unauthenticated users to access the login page.
    }

    if (active) {
      setCheckingSession(false);
    }
  }

  checkSession();

  return () => {
    active = false;
  };
}, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to log in.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }
if (checkingSession) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#080d1b] text-white">
      <p className="text-sm text-slate-400">Checking your session...</p>
    </main>
  );
}
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#080d1b] px-4 py-10 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/15 text-2xl font-bold text-blue-300">
            P
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Pulse<span className="text-blue-400">CRM</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Your intelligent sales workspace
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to continue to your dashboard.
          </p>

          {success && (
            <div
              role="status"
              className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#0d1528] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/10 bg-[#0d1528] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Create account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          © 2026 PulseCRM. All rights reserved.
        </p>
      </div>
    </main>
  );
}
