const KEY = "aog-plugins-v1";

export const ALARM_MODES = ["sabit", "takvim", "yalniz_ml"];

export function defaultPlugins() {
  return {
    version: 1,
    hopOn: false,
    hopNote: "",
    piOn: false,
    piUrl: "",
    alarmMode: "sabit",
    commissionedAt: "",
  };
}

function asMode(raw) {
  return ALARM_MODES.includes(raw) ? raw : "sabit";
}

export function readPlugins() {
  const base = defaultPlugins();
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "");
    if (!parsed || parsed.version !== 1) return base;
    return {
      ...base,
      hopOn: Boolean(parsed.hopOn),
      hopNote: String(parsed.hopNote || "").slice(0, 80),
      piOn: Boolean(parsed.piOn),
      piUrl: String(parsed.piUrl || "").slice(0, 200),
      alarmMode: asMode(parsed.alarmMode),
      commissionedAt: String(parsed.commissionedAt || "").slice(0, 32),
    };
  } catch {
    return base;
  }
}

export function asHttpUrl(raw) {
  const t = String(raw || "").trim();
  if (!t) return "";
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    if (u.username || u.password) return "";
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

export function writePlugins(next) {
  const cur = readPlugins();
  const out = {
    ...cur,
    ...next,
    version: 1,
    alarmMode: asMode(next.alarmMode ?? cur.alarmMode),
  };
  localStorage.setItem(KEY, JSON.stringify(out));
  return out;
}
