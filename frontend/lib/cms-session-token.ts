export type MiddlewareCmsSession = {
  sessionId: string;
  username: string;
  issuedAt: number;
  expiresAt: number;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function encodeText(value: string) {
  return new TextEncoder().encode(value);
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encodeText(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encodeText(value));
  return toBase64Url(new Uint8Array(signature));
}

export async function verifySessionCookie(cookieValue: string, secret: string) {
  const [payload, signature] = cookieValue.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = await sign(payload, secret);

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as Partial<MiddlewareCmsSession>;

    if (
      typeof parsed.sessionId !== "string"
      || typeof parsed.username !== "string"
      || typeof parsed.issuedAt !== "number"
      || typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    if (Date.now() > parsed.expiresAt) {
      return null;
    }

    return parsed as MiddlewareCmsSession;
  } catch {
    return null;
  }
}
