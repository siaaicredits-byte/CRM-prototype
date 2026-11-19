
"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { DatabaseCompany } from "@/lib/database-companies";

interface EditCompanyButtonProps {
  company: DatabaseCompany;
}

export function EditCompanyButton({ company }: EditCompanyButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: company.name,
    website: company.website,
    industry: company.industry,
    phone: company.phone,
    email: company.email,
    address: company.address,
    description: company.description,
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update company.");
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

  const fields = [
    { name: "name", label: "Company name", required: true },
    { name: "website", label: "Website", type: "url" },
    { name: "industry", label: "Industry" },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "email", label: "Email", type: "email" },
    { name: "address", label: "Address" },
  ] as const;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface-hover"
      >
        Edit
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
            <div className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
              <div className="flex shrink-0 items-center justify-between border-b border-line p-6">
                <div>
                  <h2 className="text-lg font-semibold text-ink">
                    Edit Company
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Update company information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="rounded-lg p-2 text-ink-muted transition hover:bg-surface-hover hover:text-ink"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {fields.map((field) => (
                    <label key={field.name} className="block">
                      <span className="mb-1.5 block text-xs font-medium text-ink-muted">
                        {field.label}
                        {"required" in field && field.required ? " *" : ""}
                      </span>

                      <input
                        type={"type" in field ? field.type : "text"}
                        required={"required" in field ? field.required : false}
                        value={form[field.name]}
                        onChange={(event) =>
                          updateField(field.name, event.target.value)
                        }
                        placeholder={field.label}
                        className="w-full rounded-lg border border-line bg-[#0b1220] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                      />
                    </label>
                  ))}
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-ink-muted">
                    Description
                  </span>

                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Brief company description"
                    className="w-full resize-y rounded-lg border border-line bg-[#0b1220] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                  />
                </label>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-surface pt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-line px-4 py-2 text-sm text-ink-muted transition hover:bg-surface-hover"
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
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
