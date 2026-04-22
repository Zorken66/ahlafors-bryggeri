"use client";

import { useEffect, useState } from "react";

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
};

export default function ContactMessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function loadMessages() {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/cms/contact-messages", { cache: "no-store" });
      const data = (await response.json()) as ContactMessage[] | { error?: string };

      if (!response.ok) {
        throw new Error("Kunde inte läsa kontaktmeddelanden.");
      }

      setMessages(data as ContactMessage[]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte läsa kontaktmeddelanden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMessages();
  }, []);

  async function updateStatus(id: number, nextStatus: ContactMessage["status"]) {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/cms/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Kunde inte uppdatera status.");
      }

      await loadMessages();
      setStatus("Status uppdaterad.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte uppdatera status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
        <h2 className="text-xl font-bold text-stone-900">Kontaktmeddelanden</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Nya formulärinlägg från kontaktsidan lagras här. Markera dem som lästa eller arkiverade.
        </p>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
        <div className="space-y-4">
          {messages.map((message) => (
            <article key={message.id} className="rounded-2xl border border-stone-200 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-stone-900">{message.subject}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    {message.name} · <a href={`mailto:${message.email}`} className="underline">{message.email}</a>
                    {message.phone ? ` · ${message.phone}` : ""}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-400">
                    {new Date(message.createdAt).toLocaleString("sv-SE")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    message.status === "new"
                      ? "bg-amber-100 text-amber-800"
                      : message.status === "read"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-stone-200 text-stone-700"
                  }`}>
                    {message.status === "new" ? "Ny" : message.status === "read" ? "Läst" : "Arkiverad"}
                  </span>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-stone-700">{message.message}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={loading || message.status === "read"}
                  onClick={() => void updateStatus(message.id, "read")}
                  className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500 disabled:opacity-60"
                >
                  Markera som läst
                </button>
                <button
                  type="button"
                  disabled={loading || message.status === "archived"}
                  onClick={() => void updateStatus(message.id, "archived")}
                  className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500 disabled:opacity-60"
                >
                  Arkivera
                </button>
                <button
                  type="button"
                  disabled={loading || message.status === "new"}
                  onClick={() => void updateStatus(message.id, "new")}
                  className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500 disabled:opacity-60"
                >
                  Markera som ny
                </button>
              </div>
            </article>
          ))}

          {messages.length === 0 && !loading && (
            <p className="text-sm text-stone-500">Inga kontaktmeddelanden har kommit in ännu.</p>
          )}
        </div>

        {status && <p className={`mt-4 text-sm ${status.includes("inte") || status.includes("Kunde") ? "text-red-700" : "text-green-700"}`}>{status}</p>}
      </div>
    </div>
  );
}
