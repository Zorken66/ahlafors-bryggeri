"use client";

import { useEffect, useState } from "react";

import type { CmsRole } from "@/lib/content-schema";

type AdminUser = {
  username: string;
  displayName: string;
  role: CmsRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const roleOptions: Array<{ value: CmsRole; label: string }> = [
  { value: "superadmin", label: "Superadmin" },
  { value: "editor", label: "Redaktör" },
  { value: "blog_editor", label: "Bloggredaktör" },
  { value: "contact_editor", label: "Kontaktredaktör" },
];

export default function AdminUsersManager({ currentUsername }: { currentUsername: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    username: "",
    displayName: "",
    password: "",
    role: "editor" as CmsRole,
  });
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});

  async function loadUsers() {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/cms/admin-users", { cache: "no-store" });
      const data = (await response.json()) as AdminUser[] | { error?: string };

      if (!response.ok) {
        throw new Error("Kunde inte läsa admin-användare.");
      }

      setUsers(data as AdminUser[]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte läsa admin-användare.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/cms/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Kunde inte skapa admin-användaren.");
      }

      setCreateForm({ username: "", displayName: "", password: "", role: "editor" });
      setStatus("Admin-användare skapad.");
      await loadUsers();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte skapa admin-användaren.");
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(username: string, payload: { displayName?: string; password?: string; isActive?: boolean; role?: CmsRole }) {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/cms/admin-users/${encodeURIComponent(username)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Kunde inte uppdatera admin-användaren.");
      }

      setStatus("Admin-användare uppdaterad.");
      setPasswordDrafts((current) => ({ ...current, [username]: "" }));
      await loadUsers();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte uppdatera admin-användaren.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
        <h2 className="text-xl font-bold text-stone-900">Admin-användare</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Skapa nya admins, byt namn och återställ lösenord direkt från CMS:et.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
          <h3 className="text-lg font-bold text-stone-900">Ny admin</h3>
          <p className="mt-1 text-sm text-stone-500">Skapa ett nytt konto och välj rätt behörighet direkt.</p>
          <form className="mt-5 space-y-4" onSubmit={handleCreate}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Användarnamn</span>
              <input
                type="text"
                value={createForm.username}
                onChange={(event) => setCreateForm((current) => ({ ...current, username: event.target.value }))}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Visningsnamn</span>
              <input
                type="text"
                value={createForm.displayName}
                onChange={(event) => setCreateForm((current) => ({ ...current, displayName: event.target.value }))}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Lösenord</span>
              <input
                type="password"
                value={createForm.password}
                onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Roll</span>
              <select
                value={createForm.role}
                onChange={(event) => setCreateForm((current) => ({ ...current, role: event.target.value as CmsRole }))}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60"
            >
              {loading ? "Sparar..." : "Skapa admin"}
            </button>
          </form>
        </section>

        <section className="min-w-0 rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Befintliga admins</h3>
              <p className="text-sm text-stone-500">Hantera namn, roller, lösenord och kontoaktivitet.</p>
            </div>
            <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
              {users.length} konton
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {users.map((user) => (
              <div key={user.username} className="rounded-3xl border border-stone-200 bg-stone-50/70 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-stone-900">{user.displayName}</p>
                    <p className="truncate text-sm text-stone-500">{user.username}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-400">{roleOptions.find((role) => role.value === user.role)?.label}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700"}`}>
                      {user.isActive ? "Aktiv" : "Inaktiv"}
                    </span>
                    {user.username === currentUsername && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        Du
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Visningsnamn</span>
                      <input
                        type="text"
                        defaultValue={user.displayName}
                        onBlur={(event) => {
                          const nextValue = event.target.value.trim();
                          if (nextValue && nextValue !== user.displayName) {
                            void updateUser(user.username, { displayName: nextValue });
                          }
                        }}
                        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-amber-600"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Roll</span>
                      <select
                        value={user.role}
                        disabled={loading || user.username === currentUsername}
                        onChange={(event) => void updateUser(user.username, { role: event.target.value as CmsRole })}
                        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-amber-600 disabled:opacity-60"
                      >
                        {roleOptions.map((role) => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Nytt lösenord</span>
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                        <input
                          type="password"
                          placeholder="Skriv nytt lösenord"
                          value={passwordDrafts[user.username] ?? ""}
                          onChange={(event) => setPasswordDrafts((current) => ({ ...current, [user.username]: event.target.value }))}
                          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-amber-600"
                        />
                        <button
                          type="button"
                          disabled={loading || !(passwordDrafts[user.username] ?? "").trim()}
                          onClick={() => void updateUser(user.username, { password: passwordDrafts[user.username] })}
                          className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500 disabled:opacity-60"
                        >
                          Byt lösenord
                        </button>
                      </div>
                    </label>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Kontostatus</p>
                    <p className="mt-2 text-sm text-stone-600">
                      {user.isActive ? "Kontot kan logga in och använda CMS:et." : "Kontot är avstängt och kan inte logga in."}
                    </p>
                    <button
                      type="button"
                      disabled={loading || user.username === currentUsername}
                      onClick={() => void updateUser(user.username, { isActive: !user.isActive })}
                      className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${
                        user.isActive
                          ? "border border-red-300 text-red-700 hover:bg-red-50"
                          : "border border-green-300 text-green-700 hover:bg-green-50"
                      }`}
                    >
                      {user.isActive ? "Stäng av konto" : "Aktivera konto"}
                    </button>
                    {user.username === currentUsername && (
                      <p className="mt-3 text-xs text-stone-500">Ditt eget konto kan inte stängas av här.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {users.length === 0 && <p className="text-sm text-stone-500">Inga admin-användare hittades.</p>}
          </div>

          {status && (
            <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${status.includes("inte") || status.includes("Kunde") ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
              {status}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
