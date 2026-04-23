"use client";

import { useState } from "react";

export default function CmsLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/cms/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setLoading(false);
      setStatus(data.error ?? "Inloggning misslyckades.");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
      <h1 className="mb-3 text-3xl font-bold text-stone-900">Admininloggning</h1>
      <p className="mb-6 text-sm leading-6 text-stone-600">
        Logga in med användarnamn och lösenord för att öppna CMS-admin.
      </p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Användarnamn</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
          />
          <span className="mt-2 block text-xs text-stone-500">Användarnamn hanteras utan skillnad på stora och små bokstäver.</span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Lösenord</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-amber-700 px-4 py-3 font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60"
        >
          {loading ? "Loggar in..." : "Logga in"}
        </button>
        {status && <p className="text-sm text-red-700">{status}</p>}
      </form>
    </div>
  );
}
