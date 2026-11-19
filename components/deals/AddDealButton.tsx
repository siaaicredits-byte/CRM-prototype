
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface Company {
  id: number;
  name: string;
}

export function AddDealButton() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [stage, setStage] = useState("discovery");
  const [value, setValue] = useState("");
  const [owner, setOwner] = useState("");
  const [closeDate, setCloseDate] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  
useEffect(() => {
  if (!open) return;

  async function fetchCompanies() {
    try {
      const response = await fetch("/api/companies");
      const result = await response.json();

      if (response.ok && result.success && Array.isArray(result.companies)) {
        setCompanies(
          result.companies.map(
            (company: { id: number; name: string }) => ({
              id: company.id,
              name: company.name,
            })
          )
        );
      } else {
        setError(result.message || "Unable to load companies.");
      }
    } catch (error) {
      console.error("Unable to load companies:", error);
      setError("Unable to load companies. Please try again.");
    }
  }

  fetchCompanies();
}, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          companyId,
          stage,
          value,
          owner,
          closeDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create deal.");
      }

      setOpen(false);
      setTitle("");
      setCompanyId("");
      setStage("discovery");
      setValue("");
      setOwner("");
      setCloseDate("");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        + Add Deal
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
              <div className="flex items-center justify-between border-b border-border p-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Create new deal
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Add an opportunity to your sales pipeline.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-1 text-xl text-muted hover:bg-surface-hover"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div>
                  <label className="mb-1.5 block text-sm text-muted">
                    Deal title *
                  </label>
                  <input
                    required
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Website redesign project"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-muted">
                    Company
                  </label>
                 <CustomSelect
  value={companyId}
  onChange={setCompanyId}
  placeholder="No company selected"
  options={[
    { value: "", label: "No company selected" },
    ...companies.map((company) => ({
      value: String(company.id),
      label: company.name,
    })),
  ]}
/>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm text-muted">
                      Pipeline stage *
                    </label>
                  <CustomSelect
  value={stage}
  onChange={setStage}
  options={[
    { value: "discovery", label: "Discovery" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal", label: "Proposal" },
    { value: "negotiation", label: "Negotiation" },
    { value: "won", label: "Closed Won" },
  ]}
/>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm text-muted">
                      Deal value (USD) *
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={value}
                      onChange={(event) => setValue(event.target.value)}
                      placeholder="25000"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-muted">
                    Deal owner
                  </label>
                  <input
                    value={owner}
                    onChange={(event) => setOwner(event.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-muted">
                    Expected closing date *
                  </label>
                  <input
                    required
                    type="date"
                    value={closeDate}
                    onChange={(event) => setCloseDate(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted hover:bg-surface-hover"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Deal"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
