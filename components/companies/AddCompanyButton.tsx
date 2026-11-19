
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";

export function AddCompanyButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    website: "",
    industry: "",
    phone: "",
    email: "",
    address: "",
    description: "",
  });

  function updateField(field: string, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create company.");
      }

      setForm({
        name: "",
        website: "",
        industry: "",
        phone: "",
        email: "",
        address: "",
        description: "",
      });

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    ["name", "Company Name", true],
    ["website", "Website", false],
    ["industry", "Industry", false],
    ["phone", "Phone", false],
    ["email", "Email", false],
    ["address", "Address", false],
  ] as const;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <Plus size={16} />
        Add Company
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
            <div className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Add Company</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Enter the company details below.
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
                {fields.map(([field, label, required]) => (
                  <div key={field}>
                    <label className="mb-1.5 block text-sm text-slate-300">
                      {label}{required ? " *" : ""}
                    </label>
                   <input
  type={
    field === "email"
      ? "email"
      : field === "phone"
        ? "tel"
        : field === "website"
          ? "url"
          : "text"
  }
  required={required}
  value={form[field]}
  onChange={(event) => updateField(field, event.target.value)}
  placeholder={label}
  className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
/>
                  </div>
                ))}

                <div>
                  <label className="mb-1.5 block text-sm text-slate-300">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    placeholder="Brief company description"
                    className="w-full resize-y rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

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
                    {saving ? "Saving..." : "Save Company"}
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
