export function enteroPositivo(value) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
export function texto(value, {
  min = 1,
  max = 1_000,
  optional = false
} = {}) {
  if (value === undefined || value === null) return optional ? null : undefined;
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/\r\n/g, "\n").trim();
  if (optional && normalized.length === 0) return null;
  if (normalized.length < min || normalized.length > max || /\0/.test(normalized)) return undefined;
  return normalized;
}
export function booleano(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return fallback;
}
export function valorPermitido(value, allowed, fallback = undefined) {
  return allowed.includes(value) ? value : fallback;
}
