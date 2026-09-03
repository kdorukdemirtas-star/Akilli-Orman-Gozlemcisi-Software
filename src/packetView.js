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
