export const STATION_ID_RE = /^[A-Za-z0-9._-]{3,40}$/;

export function asStationId(raw) {
  if (!raw || typeof raw !== "string") return "";
  const t = raw.trim();
  return STATION_ID_RE.test(t) ? t : "";
}

function httpOrigin(origin) {
  try {
    const u = new URL(origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    if (u.username || u.password) return "";
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

export function parseStation(raw, depth = 0) {
  if (!raw || typeof raw !== "string" || depth > 4) return "";
  const t = raw.trim();
  try {
    const u = new URL(t);
    const scheme = u.protocol.replace(":", "").toLowerCase();
    if (scheme === "http" || scheme === "https") {
      const q = u.searchParams.get("station") || u.searchParams.get("s");
      if (q) return parseStation(q, depth + 1);
      const parts = u.pathname.split("/").filter(Boolean);
      const i = parts.findIndex((p) => p === "pair" || p === "station");
      if (i >= 0 && parts[i + 1]) {
        return parseStation(decodeURIComponent(parts[i + 1]), depth + 1);
      }
    }
  } catch {
    /* not a URL */
  }
  const proto = t.match(/^aog:\/\/(?:pair|station)\/(.+)$/i);
  if (proto) return parseStation(proto[1], depth + 1);
  return asStationId(t);
}

export const STATION_STORAGE_KEY = "aog-station";

export function pairHref(origin, stationId) {
  const base = httpOrigin(origin);
  if (!base || !asStationId(stationId)) return "";
  return `${base}/pair?station=${encodeURIComponent(stationId)}`;
}
