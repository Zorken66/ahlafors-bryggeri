export type DateOnlyParts = {
  year: number;
  month: number;
  day: number;
};

function parseInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseDateOnlyParts(value: string | null | undefined): DateOnlyParts | null {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = parseInteger(match[1]);
  const month = parseInteger(match[2]);
  const day = parseInteger(match[3]);

  if (year === null || month === null || day === null || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return { year, month, day };
}

export function createStableDateFromDateOnly(value: string | null | undefined) {
  const parts = parseDateOnlyParts(value);

  if (!parts) {
    return null;
  }

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
}

export function getDateOnlyDay(value: string | null | undefined) {
  return parseDateOnlyParts(value)?.day ?? null;
}

export function formatDateOnly(
  value: string | null | undefined,
  locale: string,
  options: Intl.DateTimeFormatOptions,
) {
  const stableDate = createStableDateFromDateOnly(value);

  if (!stableDate) {
    return "";
  }

  return stableDate.toLocaleDateString(locale, {
    ...options,
    timeZone: "Europe/Stockholm",
  });
}

export function getEventStartTimestamp(date: string | null | undefined, time: string | null | undefined) {
  const parts = parseDateOnlyParts(date);

  if (!parts) {
    return null;
  }

  const timeMatch = typeof time === "string" ? time.match(/(\d{2}):(\d{2})/) : null;
  const hours = timeMatch ? Number.parseInt(timeMatch[1], 10) : 0;
  const minutes = timeMatch ? Number.parseInt(timeMatch[2], 10) : 0;

  return Date.UTC(parts.year, parts.month - 1, parts.day, hours, minutes, 0);
}

function getComparableTimeValue(value: string | null | undefined) {
  const timeMatch = typeof value === "string" ? value.match(/(\d{2}):(\d{2})/) : null;

  if (!timeMatch) {
    return "00:00";
  }

  return `${timeMatch[1]}:${timeMatch[2]}`;
}

function getStockholmComparableNow(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

export function isDateTimeInPast(date: string | null | undefined, time: string | null | undefined, now = new Date()) {
  const parsedDate = parseDateOnlyParts(date);

  if (!parsedDate) {
    return false;
  }

  const eventDate = `${parsedDate.year.toString().padStart(4, "0")}-${parsedDate.month.toString().padStart(2, "0")}-${parsedDate.day.toString().padStart(2, "0")}`;
  const eventTime = getComparableTimeValue(time);
  const stockholmNow = getStockholmComparableNow(now);

  if (eventDate < stockholmNow.date) {
    return true;
  }

  if (eventDate > stockholmNow.date) {
    return false;
  }

  return eventTime < stockholmNow.time;
}
