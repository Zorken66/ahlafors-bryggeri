import sanitizeHtml from "sanitize-html";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function normalizeRichText(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function sanitizeRichText(value: string) {
  return sanitizeHtml(normalizeRichText(value), {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h3",
      "h4",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          href: attribs.href ?? "#",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  });
}

export function richTextToPlainText(value: string) {
  return sanitizeHtml(normalizeRichText(value), {
    allowedTags: [],
    allowedAttributes: {},
  }).replace(/\s+/g, " ").trim();
}
