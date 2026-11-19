
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface Company {
  id: number;
  name: string;
}

export function AddContactButton() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    companyId: "",
  });

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch("/api/companies");
        const result = await response.json();

        if (
          response.ok &&
          result.success &&
          Array.isArray(result.companies)
        ) {
          setCompanies(
            result.companies.map(
              (company: Company) => ({
                id: company.id,
                name: company.name,
              })
            )
          );
        }
      } catch (error) {
        console.error("Unable to load companies:", error);
      }
    }

    fetchCompanies();
  }, []);

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
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          companyId: form.companyId
            ? Number(form.companyId)
            : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to create contact.");
      }

      setOpen(false);

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        jobTitle: "",
        companyId: "",
      });

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
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
      >
        <Plus size={18} />
        Add Contact
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
                    Add Contact
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Enter the contact information below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close form"
                  className="rounded-lg p-2 text-ink-muted hover:bg-surface-raised"
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
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      className={inputClass}
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

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Job Title</label>
                    <input
                      name="jobTitle"
                      value={form.jobTitle}
                      onChange={(event) =>
                        updateField("jobTitle", event.target.value)
                      }
                      className={inputClass}
                      placeholder="e.g. Sales Manager"
                    />
                  </div>

                  {/* Company */}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Company (Optional)
                    </label>

                    <CustomSelect
                      value={form.companyId}
                      onChange={(value) =>
                        updateField("companyId", value)
                      }
                      placeholder="No company assigned"
                      options={[
                        {
                          value: "",
                          label: "No company assigned",
                        },
                        ...companies.map((company) => ({
                          value: String(company.id),
                          label: company.name,
                        })),
                      ]}
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
                    {loading ? "Saving..." : "Save Contact"}
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
