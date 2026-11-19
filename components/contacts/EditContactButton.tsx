
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { Contact } from "@/types/crm";
import { CustomSelect } from "@/components/ui/CustomSelect";

type EditContactButtonProps = {
  contact: Contact;
};

type CompanyOption = {
  id: number;
  name: string;
};

export function EditContactButton({ contact }: EditContactButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<CompanyOption[]>([]);

  const [form, setForm] = useState({
    firstName: contact.name.split(" ")[0] ?? "",
    lastName: contact.name.split(" ").slice(1).join(" "),
    email: contact.email,
    phone: contact.phone,
    jobTitle: contact.title,
    companyId: "",
  });

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch("/api/companies");
        const result = await response.json();

        if (response.ok && result.success) {
          const companyList: CompanyOption[] = result.companies.map(
            (company: { id: number; name: string }) => ({
              id: company.id,
              name: company.name,
            })
          );

          setCompanies(companyList);

          const assignedCompany = companyList.find(
            (company) => company.name === contact.company
          );

          setForm((previous) => ({
            ...previous,
            companyId: assignedCompany ? String(assignedCompany.id) : "",
          }));
        }
      } catch (err) {
        console.error("Unable to load companies:", err);
      }
    }

    fetchCompanies();
  }, [contact.company]);

  function updateField(field: string, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update contact.");
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-400/10 hover:text-blue-300"
      >
        <Pencil size={13} />
        Edit
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Edit Contact
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Update contact information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  ["firstName", "First Name"],
                  ["lastName", "Last Name"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["jobTitle", "Job Title"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label className="mb-1.5 block text-sm text-slate-300">
                      {label}
                    </label>

                    <input
                      type="text"
                      value={form[field as keyof typeof form]}
                      onChange={(event) =>
                        updateField(field, event.target.value)
                      }
                      className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                    />
                  </div>
                ))}

                <div>
                  <label className="mb-1.5 block text-sm text-slate-300">
                    Company (Optional)
                  </label>

                  <CustomSelect
                    value={form.companyId}
                    onChange={(value) => updateField("companyId", value)}
                    placeholder="Select a company"
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

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
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
