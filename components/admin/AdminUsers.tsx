
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  UserPlus,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  Save,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

const roleOptions = [
  { value: "SALES_REP", label: "Sales Executive" },
  { value: "MANAGER", label: "Manager" },
  { value: "MASTER_ADMIN", label: "Master Admin" },
];

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [roleDrafts, setRoleDrafts] = useState<Record<number, string>>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES_REP",
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load users.");
      }

      setUsers(data.users);
      setRoleDrafts(
        Object.fromEntries(
          data.users.map((user: AdminUser) => [user.id, user.role])
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create user.");
      }

      setForm({
        name: "",
        email: "",
        password: "",
        role: "SALES_REP",
      });

      setShowCreate(false);
      setSuccess("User created successfully.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateUser(
    userId: number,
    changes: { role?: string; isActive?: boolean }
  ) {
    setUpdatingUserId(userId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...changes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update user.");
      }

      setSuccess(data.message || "User updated successfully.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      await loadUsers();
    } finally {
      setUpdatingUserId(null);
    }
  }

  const filteredUsers = users.filter((user) =>
    `${user.name ?? ""} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const activeCount = users.filter((user) => user.isActive).length;
  const adminCount = users.filter(
    (user) => user.role === "MASTER_ADMIN"
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User Management"
        description="Manage organisation accounts, roles and access."
        actions={
          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <UserPlus className="size-4" />
            Add User
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
            title="Create user"
            description="Create an organisation account with an assigned role."
          />
          <CardBody>
            <form onSubmit={createUser} className="grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink"
              />

              <input
                required
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink"
              />

              <input
                required
                type="password"
                minLength={8}
                maxLength={72}
                placeholder="Temporary password (8-72 characters)"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink"
              />

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
                className="rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink"
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create User"}
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
          { label: "Total users", value: users.length, icon: Users },
          { label: "Active users", value: activeCount, icon: UserCheck },
          { label: "Master Admins", value: adminCount, icon: ShieldCheck },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink-muted">{item.label}</p>
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
          title="Organisation users"
          description="Manage registered accounts, roles and access."
          action={
            <button
              type="button"
              onClick={() => void loadUsers()}
              disabled={loading}
              aria-label="Refresh users"
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or role..."
              className="w-full rounded-lg border border-line bg-surface-raised py-2 pl-9 pr-3 text-sm text-ink"
            />
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-ink-muted">
              Loading users...
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">
              No users found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-ink-faint">
                    <th className="px-3 py-3 font-medium">User</th>
                    <th className="px-3 py-3 font-medium">Role</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Created</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const roleDraft = roleDrafts[user.id] ?? user.role;
                    const isUpdating = updatingUserId === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-line last:border-0"
                      >
                        <td className="px-3 py-3">
                          <p className="font-medium text-ink">
                            {user.name || "Unnamed user"}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {user.email}
                          </p>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={roleDraft}
                              disabled={isUpdating}
                              onChange={(e) =>
                                setRoleDrafts((previous) => ({
                                  ...previous,
                                  [user.id]: e.target.value,
                                }))
                              }
                              className="rounded-md border border-line bg-surface-raised px-2 py-1.5 text-xs text-ink"
                              aria-label={`Role for ${user.email}`}
                            >
                              {roleOptions.map((role) => (
                                <option key={role.value} value={role.value}>
                                  {role.label}
                                </option>
                              ))}
                            </select>

                            {roleDraft !== user.role && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  void updateUser(user.id, {
                                    role: roleDraft,
                                  })
                                }
                                className="rounded-md bg-accent p-2 text-white disabled:opacity-50"
                                title="Save role"
                                aria-label={`Save role for ${user.email}`}
                              >
                                <Save className="size-4" />
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={
                              user.isActive ? "text-good" : "text-ink-faint"
                            }
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-xs text-ink-muted">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-3 py-3">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              void updateUser(user.id, {
                                isActive: !user.isActive,
                              })
                            }
                            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium disabled:opacity-50 ${
                              user.isActive
                                ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                : "border-green-500/30 text-green-500 hover:bg-green-500/10"
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="size-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="size-4" />
                                Activate
                              </>
                            )}
                          </button>

                          {isUpdating && (
                            <span className="ml-2 text-xs text-ink-muted">
                              Saving...
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
