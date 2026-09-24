export function nowUtc() {
  return new Date().toISOString();
}

export function toUtcDateOnly(value?: string | Date) {
  if (!value) return nowUtc().slice(0, 10);
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function formatUtc(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}
