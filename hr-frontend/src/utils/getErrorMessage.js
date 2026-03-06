/**
 * Normalize API error detail to a string for display.
 * Backends (e.g. FastAPI) often return detail as an array of { type, loc, msg, input }.
 */
export function getErrorMessage(detail, fallback = "Something went wrong.") {
  if (detail == null) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (typeof first === "string") return first;
    if (first && typeof first.msg === "string") return first.msg;
  }
  if (typeof detail === "object" && detail.msg) return detail.msg;
  return fallback;
}
