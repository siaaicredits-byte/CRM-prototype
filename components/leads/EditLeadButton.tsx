
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Pencil, X } from "lucide-react";
import type { Lead } from "@/types/crm";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface EditLeadButtonProps {
  lead: Lead;
}

export function EditLeadButton({ lead }: EditLeadButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: lead.name.split(" ")[0] ?? "",
    lastName: lead.name.split(" ").slice(1).join(" "),
    email: lead.email,
    phone: lead.phone ?? "",
    source: lead.source,
    status: lead.status.toUpperCase(),
    owner: lead.owner,
    value: String(lead.value),
  });

  function updateField(name: string, value: string) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update lead.");
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-line bg-surface-raised px-3 py-2.5 text-sm text-ink outline-none focus:border-accent";

  const labelClass =
    "mb-1.5 block text-xs font-medium text-ink-muted";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink-muted transition hover:border-accent hover:text-accent"
      >
        <Pencil size={14} />
        Edit
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setOpen(false);
              }
            }}
          >
            <div className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-ink">
                    Edit Lead
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Update {lead.name}&apos;s information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-ink-muted hover:bg-surface-raised"
                  aria-label="Close form"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={(event) =>
                        updateField("firstName", event.target.value)
                      }
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={(event) =>
                        updateField("lastName", event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  {/* Lead Source */}
                  <div>
                    <label className={labelClass}>Lead Source</label>
                    <CustomSelect
                      value={form.source}
                      onChange={(value) =>
                        updateField("source", value)
                      }
                      options={[
                        { value: "Website", label: "Website" },
                        { value: "Referral", label: "Referral" },
                        { value: "LinkedIn", label: "LinkedIn" },
                        { value: "Event", label: "Event" },
                        {
                          value: "Cold Outreach",
                          label: "Cold Outreach",
                        },
                      ]}
                    />
                  </div>

                  {/* Lead Status */}
                  <div>
                    <label className={labelClass}>Status</label>
                    <CustomSelect
                      value={form.status}
                      onChange={(value) =>
                        updateField("status", value)
                      }
                      options={[
                        { value: "NEW", label: "New" },
                        { value: "CONTACTED", label: "Contacted" },
                        { value: "QUALIFIED", label: "Qualified" },
                        { value: "PROPOSAL", label: "Proposal" },
                        { value: "LOST", label: "Lost" },
                      ]}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Lead Owner</label>
                    <input
                      name="owner"
                      value={form.owner}
                      onChange={(event) =>
                        updateField("owner", event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Lead Value</label>
                    <input
                      type="number"
                      name="value"
                      value={form.value}
                      onChange={(event) =>
                        updateField("value", event.target.value)
                      }
                      className={inputClass}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 border-t border-line pt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-line px-4 py-2.5 text-sm text-ink-muted hover:bg-surface-raised"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
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
