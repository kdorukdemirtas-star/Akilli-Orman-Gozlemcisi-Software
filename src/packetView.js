export function packetRssi(p) {
  if (!p || p.rssi == null || p.rssi === "") return null;
  const n = Number(p.rssi);
  return Number.isFinite(n) ? n : null;
}

export function rssiLabel(p) {
  const n = packetRssi(p);
  if (n == null) return "Pakette yok";
  return `${n} dBm`;
}

export function mq9Label(p) {
  if (!p || p.mq9 == null || p.mq9 === "") return "-";
  const n = Number(p.mq9);
  return Number.isFinite(n) ? String(Math.round(n)) : "-";
}

export function flameOn(p) {
  if (!p) return false;
  return Number(p.a8) === 0 || Number(p.a9) === 0;
}

export function flameLabel(p) {
  if (!p || (p.a8 == null && p.a9 == null)) return "-";
  return flameOn(p) ? "Alev" : "Yok";
}

export function flameNote(p) {
  if (!p || (p.a8 == null && p.a9 == null)) return "D8 ve D9";
  const d8 = Number(p.a8) === 0 ? "alev" : "boş";
  const d9 = Number(p.a9) === 0 ? "alev" : "boş";
  return `D8 ${d8}, D9 ${d9}`;
}

export function gpsFix(p) {
  const g = Number(p?.gps);
  return g === 1 || g === 2;
}

export function gpsLabel(p) {
  if (!p) return "-";
  if (!gpsFix(p)) return "Fix yok";
  const la = Number(p.lat);
  const lo = Number(p.lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return "Fix yok";
  return `${la.toFixed(5)}, ${lo.toFixed(5)}`;
}

export function gpsNote(p) {
  const g = Number(p?.gps);
  if (g === 1) return "Uydu kilidi";
  if (g === 2) return "Son kayıtlı konum";
  return "Harita genel bakışta";
}
