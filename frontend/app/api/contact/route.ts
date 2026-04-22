import { NextResponse } from "next/server";

import { submitContactForm } from "@/lib/contact-form";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
      website?: string;
    };

    await submitContactForm({
      name: body.name ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      subject: body.subject ?? "",
      message: body.message ?? "",
      website: body.website ?? "",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte skicka meddelandet.";
    const status = message.includes("För många försök") ? 429 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
