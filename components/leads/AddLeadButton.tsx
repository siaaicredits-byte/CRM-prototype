
"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

type Project = {
  id: number;
  name: string;
};

export function AddLeadButton() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "Website",
    status: "NEW",
    owner: "Alex Morgan",
    value: "0",
    projectId: "",
  });

  async function openForm() {
    setOpen(true);
    setError("");
    setProjectsLoading(true);

    try {
      const response = await fetch("/api/projects");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load projects.");
      }

      setProjects(result.projects || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load projects."
      );
    } finally {
      setProjectsLoading(false);
    }
  }

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
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
          projectId: form.projectId
            ? Number(form.projectId)
            : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to create lead.");
      }

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        source: "Website",
        status: "NEW",
        owner: "Alex Morgan",
        value: "0",
        projectId: "",
      });

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
        onClick={openForm}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
      >
        <Plus size={16} />
        Add Lead
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
                    Add New Lead
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Enter the lead details below.
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
                      placeholder="Enter first name"
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
                      placeholder="Enter last name"
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
                      placeholder="name@example.com"
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
                      placeholder="Phone number"
                    />
                  </div>

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
                      placeholder="Lead owner"
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

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Project</label>
                    <CustomSelect
                      value={form.projectId}
                      onChange={(value) =>
                        updateField("projectId", value)
                      }
                      options={[
                        { value: "", label: "No Project" },
                        ...projects.map((project) => ({
                          value: String(project.id),
                          label: project.name,
                        })),
                      ]}
                    />
                    {projectsLoading && (
                      <p className="mt-1 text-xs text-ink-muted">
                        Loading projects...
                      </p>
                    )}
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
                    disabled={loading || projectsLoading}
                    className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Create Lead"}
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
