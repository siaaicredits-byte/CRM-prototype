
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  FolderKanban,
  FolderPlus,
  RefreshCw,
  Power,
  PowerOff,
  Users,
  UserPlus,
  X,
} from "lucide-react";

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

type Project = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdById: number;
  createdAt: string;
  updatedAt?: string;
};

type ProjectMember = {
  id: number;
  name: string | null;
  username: string | null;
  email: string;
  role: string;
  isActive: boolean;
  assignedAt: string;
};

type AdminUser = {
  id: number;
  name: string | null;
  username: string | null;
  email: string;
  role: string;
  isActive: boolean;
};

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  // Project member management state
  const [membersProjectId, setMembersProjectId] = useState<number | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AdminUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [memberError, setMemberError] = useState("");

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/projects", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load projects.");
      }

      setProjects(data.projects ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  async function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create project.");
      }

      setForm({ name: "", description: "" });
      setShowCreate(false);
      setSuccess("Project created successfully.");

      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function updateProjectStatus(project: Project) {
    setUpdatingId(project.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: project.id,
          isActive: !project.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update project.");
      }

      setSuccess(data.message || "Project status updated.");
      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // Load members assigned to a project
  async function loadMembers(projectId: number) {
    setMembersLoading(true);
    setMemberError("");

    try {
      const response = await fetch(
        `/api/admin/projects/${projectId}/members`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load project members.");
      }

      setMembers(data.members ?? []);
    } catch (err) {
      setMemberError(
        err instanceof Error ? err.message : "Unable to load members."
      );
    } finally {
      setMembersLoading(false);
    }
  }

  // Load users available for project assignment
  async function loadAvailableUsers() {
    try {
      const response = await fetch("/api/admin/users", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load users.");
      }

      setAvailableUsers(data.users ?? []);
    } catch (err) {
      setMemberError(
        err instanceof Error ? err.message : "Unable to load users."
      );
    }
  }

  // Open or close the member management panel
  async function toggleMembers(projectId: number) {
    setMemberError("");
    setSuccess("");
    setSelectedUserIds([]);

    if (membersProjectId === projectId) {
      setMembersProjectId(null);
      setMembers([]);
      return;
    }

    setMembersProjectId(projectId);
    setMembers([]);
    setAvailableUsers([]);

    await Promise.all([
      loadMembers(projectId),
      loadAvailableUsers(),
    ]);
  }

  // Select or deselect a user
  function toggleUserSelection(userId: number) {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  }

  // Assign selected users
  async function assignMembers() {
    if (!membersProjectId || selectedUserIds.length === 0) return;

    setMemberSubmitting(true);
    setMemberError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/projects/${membersProjectId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userIds: selectedUserIds,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to assign members.");
      }

      setSuccess(data.message || "Project members updated.");
      setSelectedUserIds([]);

      await loadMembers(membersProjectId);
    } catch (err) {
      setMemberError(
        err instanceof Error ? err.message : "Unable to assign members."
      );
    } finally {
      setMemberSubmitting(false);
    }
  }

  // Remove a user from a project
  async function removeMember(userId: number) {
    if (!membersProjectId) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this member from the project?"
    );

    if (!confirmed) return;

    setMemberSubmitting(true);
    setMemberError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/projects/${membersProjectId}/members`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove member.");
      }

      setSuccess(data.message || "Project member removed.");
      await loadMembers(membersProjectId);
    } catch (err) {
      setMemberError(
        err instanceof Error ? err.message : "Unable to remove member."
      );
    } finally {
      setMemberSubmitting(false);
    }
  }

  const filteredProjects = projects.filter((project) =>
    `${project.name} ${project.description ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const activeCount = projects.filter(
    (project) => project.isActive
  ).length;

  const inactiveCount = projects.length - activeCount;

  const unassignedUsers = availableUsers.filter(
    (user) =>
      user.isActive &&
      !members.some((member) => member.id === user.id)
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Project Management"
        description="Create and manage organisation projects and their availability."
        actions={
          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <FolderPlus className="size-4" />
            Add Project
          </button>
        }
      />

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500"
        >
          {success}
        </div>
      )}

      {showCreate && (
        <Card>
          <CardHeader
            title="Create project"
            description="Add a new project to your organisation."
          />

          <CardBody>
            <form onSubmit={createProject} className="grid gap-4">
              <input
                required
                maxLength={150}
                placeholder="Project name"
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                  })
                }
                className="rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink"
              />

              <textarea
                rows={3}
                maxLength={1000}
                placeholder="Project description (optional)"
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                className="rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Project"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-line px-4 py-2 text-sm text-ink-muted"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total projects",
            value: projects.length,
            icon: FolderKanban,
          },
          {
            label: "Active projects",
            value: activeCount,
            icon: Power,
          },
          {
            label: "Inactive projects",
            value: inactiveCount,
            icon: PowerOff,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink-muted">
                    {item.label}
                  </p>
                  <Icon className="size-5 text-accent" />
                </div>

                <p className="mt-2 text-2xl font-semibold text-ink tabular-nums">
                  {item.value}
                </p>
              </CardBody>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader
          title="Organisation projects"
          description="View and manage all registered projects."
          action={
            <button
              type="button"
              onClick={() => void loadProjects()}
              disabled={loading}
              aria-label="Refresh projects"
              className="rounded-lg p-2 text-ink-muted hover:bg-surface-raised"
            >
              <RefreshCw className="size-4" />
            </button>
          }
        />

        <CardBody>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-lg border border-line bg-surface-raised py-2 pl-9 pr-3 text-sm text-ink"
            />
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-ink-muted">
              Loading projects...
            </p>
          ) : filteredProjects.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">
              No projects found. Create your first project to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-ink-faint">
                    <th className="px-3 py-3 font-medium">Project</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Created</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProjects.map((project) => (
                    <>
                      <tr
                        key={project.id}
                        className="border-b border-line last:border-0"
                      >
                        <td className="px-3 py-3">
                          <p className="font-medium text-ink">
                            {project.name}
                          </p>
                          <p className="mt-1 max-w-md text-xs text-ink-muted">
                            {project.description || "No description"}
                          </p>
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={
                              project.isActive
                                ? "text-good"
                                : "text-ink-faint"
                            }
                          >
                            {project.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-xs text-ink-muted">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void toggleMembers(project.id)}
                              className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-surface-raised"
                            >
                              <Users className="size-4" />
                              {membersProjectId === project.id
                                ? "Close Members"
                                : "Manage Members"}
                            </button>

                            <button
                              type="button"
                              disabled={updatingId === project.id}
                              onClick={() => void updateProjectStatus(project)}
                              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium disabled:opacity-50 ${
                                project.isActive
                                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                  : "border-green-500/30 text-green-500 hover:bg-green-500/10"
                              }`}
                            >
                              {project.isActive ? (
                                <>
                                  <PowerOff className="size-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="size-4" />
                                  Activate
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {membersProjectId === project.id && (
                        <tr key={`${project.id}-members`}>
                          <td
                            colSpan={4}
                            className="border-b border-line bg-surface-raised/40 p-4"
                          >
                            <div className="flex flex-col gap-5">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <h3 className="font-semibold text-ink">
                                    Project Members
                                  </h3>
                                  <p className="text-xs text-ink-muted">
                                    Manage users assigned to {project.name}.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setMembersProjectId(null);
                                    setMembers([]);
                                    setSelectedUserIds([]);
                                  }}
                                  aria-label="Close member management"
                                  className="rounded-md p-2 text-ink-muted hover:bg-surface-raised"
                                >
                                  <X className="size-4" />
                                </button>
                              </div>

                              {memberError && (
                                <div
                                  role="alert"
                                  className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
                                >
                                  {memberError}
                                </div>
                              )}

                              {membersLoading ? (
                                <p className="py-4 text-sm text-ink-muted">
                                  Loading project members...
                                </p>
                              ) : (
                                <>
                                  <div>
                                    <h4 className="mb-3 text-sm font-semibold text-ink">
                                      Assigned Members ({members.length})
                                    </h4>

                                    {members.length === 0 ? (
                                      <p className="rounded-lg border border-dashed border-line p-4 text-sm text-ink-muted">
                                        No members assigned to this project yet.
                                      </p>
                                    ) : (
                                      <div className="flex flex-col gap-2">
                                        {members.map((member) => (
                                          <div
                                            key={member.id}
                                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3"
                                          >
                                            <div className="min-w-0">
                                              <p className="font-medium text-ink">
                                                {member.name ||
                                                  member.username ||
                                                  member.email}
                                              </p>
                                              <p className="text-xs text-ink-muted">
                                                {member.email}
                                              </p>
                                              <p className="mt-1 text-xs text-ink-faint">
                                                {member.role}
                                              </p>
                                            </div>

                                            <button
                                              type="button"
                                              disabled={memberSubmitting}
                                              onClick={() =>
                                                void removeMember(member.id)
                                              }
                                              className="rounded-md border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="border-t border-line pt-4">
                                    <h4 className="mb-3 text-sm font-semibold text-ink">
                                      Assign New Members
                                    </h4>

                                    {unassignedUsers.length === 0 ? (
                                      <p className="rounded-lg border border-dashed border-line p-4 text-sm text-ink-muted">
                                        No active users available for assignment.
                                      </p>
                                    ) : (
                                      <>
                                        <div className="mb-3 grid gap-2 sm:grid-cols-2">
                                          {unassignedUsers.map((user) => (
                                            <label
                                              key={user.id}
                                              className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-surface p-3 hover:bg-surface-raised"
                                            >
                                              <input
                                                type="checkbox"
                                                checked={selectedUserIds.includes(
                                                  user.id
                                                )}
                                                onChange={() =>
                                                  toggleUserSelection(user.id)
                                                }
                                                className="size-4 accent-current"
                                              />

                                              <span className="min-w-0">
                                                <span className="block truncate text-sm font-medium text-ink">
                                                  {user.name ||
                                                    user.username ||
                                                    user.email}
                                                </span>
                                                <span className="block truncate text-xs text-ink-muted">
                                                  {user.email}
                                                </span>
                                                <span className="block text-xs text-ink-faint">
                                                  {user.role}
                                                </span>
                                              </span>
                                            </label>
                                          ))}
                                        </div>

                                        <button
                                          type="button"
                                          disabled={
                                            selectedUserIds.length === 0 ||
                                            memberSubmitting
                                          }
                                          onClick={() => void assignMembers()}
                                          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                          <UserPlus className="size-4" />
                                          {memberSubmitting
                                            ? "Processing..."
                                            : `Assign Selected (${selectedUserIds.length})`}
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
