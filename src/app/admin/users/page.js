"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Shield,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import Image from "next/image";

const ALL_ROLES = ["admin", "moderator", "expert"];

function RoleModal({ user, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const currentRoles = user.roles.map((r) => r.name.toLowerCase());

  async function toggle(roleName) {
    const hasRole = currentRoles.includes(roleName);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/roles`, {
        method: hasRole ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-xl border-t sm:border border-border bg-card shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.username}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">
              {user.username || "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground">Manage roles</p>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {ALL_ROLES.map((role) => {
            const has = currentRoles.includes(role);
            return (
              <div
                key={role}
                className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-2.5"
              >
                <div className="flex items-center gap-2">
                  {has ? (
                    <Shield className="h-4 w-4 text-blue-500" />
                  ) : (
                    <ShieldOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm capitalize">{role}</span>
                </div>
                <button
                  onClick={() => toggle(role)}
                  disabled={saving}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                    has
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                  }`}
                >
                  {has ? "Revoke" : "Assign"}
                </button>
              </div>
            );
          })}
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button
          onClick={onClose}
          className="w-full rounded-md border border-border/50 py-2 text-sm hover:bg-muted/50 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (search) params.set("search", search);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users & Roles</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage users and their platform roles
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by username…"
            className="w-full rounded-lg border border-border/50 bg-muted/30 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
        >
          Search
        </button>
      </form>

      {/* Mobile card list (xs–sm) */}
      <div className="md:hidden space-y-2">
        {loading && (
          <p className="text-center text-muted-foreground py-10 text-sm">
            Loading...
          </p>
        )}
        {!loading && data?.users?.length === 0 && (
          <p className="text-center text-muted-foreground py-10 text-sm">
            No users found
          </p>
        )}
        {!loading &&
          data?.users?.map((u) => (
            <div
              key={u.id}
              className="rounded-xl border border-border/50 bg-card px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {u.avatarUrl ? (
                  <Image
                    src={u.avatarUrl}
                    alt={u.username}
                    width={32}
                    height={32}
                    className="rounded-full shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {u.username || "—"}
                  </p>
                  <div className="flex gap-1 flex-wrap mt-0.5">
                    {u.roles.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        Member
                      </span>
                    ) : (
                      u.roles.map((r) => (
                        <span
                          key={r.id}
                          className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                            r.name === "admin"
                              ? "bg-blue-500/10 text-blue-500"
                              : r.name === "moderator"
                                ? "bg-violet-500/10 text-violet-500"
                                : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {r.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(u)}
                className="rounded-md bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium hover:bg-primary/20 transition shrink-0"
              >
                Roles
              </button>
            </div>
          ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-border/50 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                User
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Roles
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                Clarity
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                Threads
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                Joined
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            )}
            {!loading && data?.users?.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  No users found
                </td>
              </tr>
            )}
            {!loading &&
              data?.users?.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      {u.avatarUrl ? (
                        <Image
                          src={u.avatarUrl}
                          alt={u.username}
                          width={28}
                          height={28}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium">{u.username || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {u.roles.length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          Member
                        </span>
                      )}
                      {u.roles.map((r) => (
                        <span
                          key={r.id}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            r.name === "admin"
                              ? "bg-blue-500/10 text-blue-500"
                              : r.name === "moderator"
                                ? "bg-violet-500/10 text-violet-500"
                                : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell text-muted-foreground">
                    {u.stats?.clarityScore?.toFixed(1) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell text-muted-foreground">
                    {u.stats?.totalThreads ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                    {timeAgo(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="rounded-md bg-primary/10 text-primary px-3 py-1 text-xs font-medium hover:bg-primary/20 transition"
                    >
                      Roles
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {data.pagination.total} users · Page {data.pagination.page} of{" "}
            {data.pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-border/50 p-1.5 hover:bg-muted/50 transition disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page === data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-border/50 p-1.5 hover:bg-muted/50 transition disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {selectedUser && (
        <RoleModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSaved={() => {
            setSelectedUser(null);
            load();
          }}
        />
      )}
    </div>
  );
}
