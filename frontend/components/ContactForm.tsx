"use client";

import { useState } from "react";

type ContactFormProps = {
  subjectPlaceholder: string;
};

const initialState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  website: "",
};

export default function ContactForm({ subjectPlaceholder }: ContactFormProps) {
  const [formData, setFormData] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as { error?: string; ok?: boolean };

      if (!response.ok) {
        throw new Error(data.error ?? "Kunde inte skicka formuläret.");
      }

      setFormData(initialState);
      setStatus({ type: "success", message: "Tack. Meddelandet är skickat." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Kunde inte skicka formuläret.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={formData.website}
        onChange={(event) => setFormData((current) => ({ ...current, website: event.target.value }))}
        className="hidden"
        aria-hidden="true"
      />
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-stone-700 mb-2">
          Namn *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
          className="w-full px-4 py-3 bg-white border border-stone-300 focus:border-copper focus:ring-2 focus:ring-copper/20 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-2">
          E-post *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
          className="w-full px-4 py-3 bg-white border border-stone-300 focus:border-copper focus:ring-2 focus:ring-copper/20 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-stone-700 mb-2">
          Telefon
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
          className="w-full px-4 py-3 bg-white border border-stone-300 focus:border-copper focus:ring-2 focus:ring-copper/20 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-semibold text-stone-700 mb-2">
          Ämne *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          placeholder={subjectPlaceholder}
          required
          value={formData.subject}
          onChange={(event) => setFormData((current) => ({ ...current, subject: event.target.value }))}
          className="w-full px-4 py-3 bg-white border border-stone-300 focus:border-copper focus:ring-2 focus:ring-copper/20 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-stone-700 mb-2">
          Meddelande *
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          value={formData.message}
          onChange={(event) => setFormData((current) => ({ ...current, message: event.target.value }))}
          className="w-full px-4 py-3 bg-white border border-stone-300 focus:border-copper focus:ring-2 focus:ring-copper/20 transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full disabled:opacity-60"
      >
        {submitting ? "Skickar..." : "Skicka meddelande"}
      </button>

      {status && (
        <p className={`text-sm ${status.type === "success" ? "text-green-700" : "text-red-700"}`}>
          {status.message}
        </p>
      )}
    </form>
  );
}
