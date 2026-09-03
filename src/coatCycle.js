export const COAT_DAYS = 90;
export const COAT_STORE = "aog-coat-renewed:v1";
const DAY_MS = 24 * 60 * 60 * 1000;

export function coatProgress(renewedAt, now = Date.now()) {
  if (!renewedAt || !Number.isFinite(Number(renewedAt)) || Number(renewedAt) <= 0) {
    return { pct: 0, stage: "yenileme", remainingDays: 0, elapsedDays: null };
  }
  const start = Number(renewedAt);
  const elapsed = now - start;
  const life = COAT_DAYS * DAY_MS;
  const remaining = life - elapsed;
  const pct = Math.max(0, Math.min(100, Math.round((remaining / life) * 100)));
  const elapsedDays = elapsed / DAY_MS;
  let stage = "yenileme";
  if (elapsedDays < 30) stage = "yeni";
  else if (elapsedDays < 60) stage = "orta";
  return {
    pct,
    stage,
    remainingDays: Math.max(0, Math.ceil(remaining / DAY_MS)),
    elapsedDays,
  };
}

export function readCoatRenewed() {
  try {
    const n = Number(localStorage.getItem(COAT_STORE));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function writeCoatRenewed(ts) {
  localStorage.setItem(COAT_STORE, String(ts));
}
