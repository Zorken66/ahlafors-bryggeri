import "server-only";

import { headers } from "next/headers";
import nodemailer from "nodemailer";

import { ensureCmsDatabaseReady, getCmsDbPool } from "@/lib/cms-db";
import { readSiteContent } from "@/lib/content-store";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 1000 * 60 * 60;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_BLOCK_MS = 1000 * 60 * 30;

export type ContactFormSubmission = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  website?: string;
};

export type ContactMessageStatus = "new" | "read" | "archived";

export type ContactMessageListItem = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
};

type ContactMessageRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  created_at: string;
};

type ContactAttemptRow = {
  window_started_at: number;
  request_count: number;
  blocked_until: number;
};

function normalizeInput(input: ContactFormSubmission) {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: (input.phone ?? "").trim(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    website: (input.website ?? "").trim(),
  };
}

function validateSubmission(input: ReturnType<typeof normalizeInput>) {
  if (!input.name || input.name.length < 2) {
    throw new Error("Ange ett giltigt namn.");
  }

  if (!EMAIL_PATTERN.test(input.email)) {
    throw new Error("Ange en giltig e-postadress.");
  }

  if (!input.subject || input.subject.length < 3) {
    throw new Error("Ange ett ämne.");
  }

  if (!input.message || input.message.length < 10) {
    throw new Error("Meddelandet är för kort.");
  }

  if (input.name.length > 160 || input.email.length > 190 || input.phone.length > 80 || input.subject.length > 190) {
    throw new Error("Ett eller flera fält är för långa.");
  }

  if (input.website) {
    throw new Error("Spam upptäckt.");
  }
}

async function getRequestMetadata() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
  const userAgent = headerStore.get("user-agent");

  return { ipAddress, userAgent };
}

async function enforceContactRateLimit(ipAddress: string) {
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  const now = Date.now();
  const { rows } = await pool.query<ContactAttemptRow>(
    `
      SELECT window_started_at, request_count, blocked_until
      FROM cms_contact_form_attempts
      WHERE ip_address = $1
      LIMIT 1
    `,
    [ipAddress],
  );

  const row = rows[0];

  if (!row) {
    await pool.query(
      `
        INSERT INTO cms_contact_form_attempts (ip_address, window_started_at, request_count, blocked_until)
        VALUES ($1, $2, 1, 0)
      `,
      [ipAddress, now],
    );
    return;
  }

  if (row.blocked_until > now) {
    throw new Error("För många försök. Vänta en stund och försök igen.");
  }

  const withinWindow = now - row.window_started_at < RATE_LIMIT_WINDOW_MS;
  const nextCount = withinWindow ? row.request_count + 1 : 1;
  const nextWindowStartedAt = withinWindow ? row.window_started_at : now;
  const blockedUntil = nextCount > RATE_LIMIT_MAX_REQUESTS ? now + RATE_LIMIT_BLOCK_MS : 0;

  await pool.query(
    `
      UPDATE cms_contact_form_attempts
      SET window_started_at = $1, request_count = $2, blocked_until = $3, updated_at = CURRENT_TIMESTAMP
      WHERE ip_address = $4
    `,
    [nextWindowStartedAt, nextCount, blockedUntil, ipAddress],
  );

  if (blockedUntil > now) {
    throw new Error("För många försök. Vänta en stund och försök igen.");
  }
}

async function sendNotificationEmail(messageId: number, input: ReturnType<typeof normalizeInput>) {
  const host = process.env.SMTP_HOST;

  if (!host) {
    return;
  }

  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.CONTACT_NOTIFICATION_FROM ?? process.env.SMTP_FROM ?? user;

  if (!from) {
    return;
  }

  const { contact } = await readSiteContent();
  const to = process.env.CONTACT_NOTIFICATION_TO ?? contact.email;

  if (!to) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  await transporter.sendMail({
    from,
    to,
    replyTo: input.email,
    subject: `[Kontakt] ${input.subject}`,
    text: [
      `Meddelande-ID: ${messageId}`,
      `Namn: ${input.name}`,
      `E-post: ${input.email}`,
      `Telefon: ${input.phone || "-"}`,
      "",
      input.message,
    ].join("\n"),
  });
}

export async function submitContactForm(submission: ContactFormSubmission) {
  const input = normalizeInput(submission);
  validateSubmission(input);

  const metadata = await getRequestMetadata();
  await enforceContactRateLimit(metadata.ipAddress);

  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  const { rows } = await pool.query<{ id: number }>(
    `
      INSERT INTO cms_contact_messages (name, email, phone, subject, message, status, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, 'new', $6, $7)
      RETURNING id
    `,
    [
      input.name,
      input.email,
      input.phone || null,
      input.subject,
      input.message,
      metadata.ipAddress,
      metadata.userAgent ?? null,
    ],
  );

  try {
    await sendNotificationEmail(rows[0].id, input);
  } catch (error) {
    console.error("Kunde inte skicka kontaktnotifiering.", error);
  }

  return { ok: true, id: rows[0].id };
}

export async function listContactMessages(): Promise<ContactMessageListItem[]> {
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  const { rows } = await pool.query<ContactMessageRow>(
    `
      SELECT id, name, email, phone, subject, message, status, created_at
      FROM cms_contact_messages
      ORDER BY created_at DESC, id DESC
    `,
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function updateContactMessageStatus(id: number, status: ContactMessageStatus) {
  if (!["new", "read", "archived"].includes(status)) {
    throw new Error("Ogiltig status.");
  }

  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  await pool.query(
    `
      UPDATE cms_contact_messages
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
    [status, id],
  );
}
