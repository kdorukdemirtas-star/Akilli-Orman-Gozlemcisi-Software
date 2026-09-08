import { flameOn } from "./packetView.js";

export function monthsSince(iso, now = Date.now()) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return 0;
  const ms = now - t;
  if (ms < 0) return 0;
  return ms / (30.4375 * 24 * 60 * 60 * 1000);
}

export function blendWeights(months) {
  const m = Math.max(0, Number(months) || 0);
  if (m < 2) return { fixed: 1, dynamic: 0, ml: 0 };
  if (m < 6) return { fixed: 0.75, dynamic: 0.2, ml: 0.05 };
  if (m < 10) return { fixed: 0, dynamic: 0.55, ml: 0.45 };
  if (m < 12) return { fixed: 0, dynamic: 0.5, ml: 0.5 };
  return { fixed: 0, dynamic: 0, ml: 1 };
}

export function fixedAlert(p) {
  if (!p || p.t == null) return false;
  return Number(p.t) >= 100 && flameOn(p);
}

export function dynamicAlert(p, stats) {
  if (!p || !flameOn(p)) return false;
  const t = Number(p.t);
  if (!Number.isFinite(t)) return false;
  const p90 = Number(stats?.p90);
  if (Number.isFinite(p90) && p90 > 0) return t >= p90;
  return t >= 80;
}

export function tempP90(rows) {
  const ts = (rows || [])
    .map((row) => Number(row?.t))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (ts.length < 5) return null;
  const i = Math.min(ts.length - 1, Math.floor(0.9 * (ts.length - 1)));
  return ts[i];
}

export function decideAlert({ packet, mode, months, mlScore, stats }) {
  if (mode === "sabit") return fixedAlert(packet);
  if (mode === "yalniz_ml") return Number(mlScore) >= 0.5;
  const w = blendWeights(months);
  let score = 0;
  if (fixedAlert(packet)) score += w.fixed;
  if (dynamicAlert(packet, stats)) score += w.dynamic;
  if (Number(mlScore) >= 0.5) score += w.ml;
  return score >= 0.5;
}
