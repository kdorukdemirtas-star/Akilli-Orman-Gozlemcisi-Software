export const DAY_MS = 24 * 60 * 60 * 1000;

export function tempPoints(rows) {
  const pts = [];
  for (const row of rows || []) {
    const t = Number(row.t);
    const ts = Date.parse(row.created_at);
    if (!Number.isFinite(t) || !Number.isFinite(ts)) continue;
    pts.push({ t, ts });
  }
  return pts.sort((a, b) => a.ts - b.ts);
}

export function yScale(min, max, count = 5) {
  let lo = Number(min);
  let hi = Number(max);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    return { lo: 0, hi: 1, ticks: [0, 1] };
  }
  if (hi < lo) [lo, hi] = [hi, lo];
  if (hi === lo) {
    lo -= 1;
    hi += 1;
  }
  const pad = (hi - lo) * 0.18;
  lo -= pad;
  hi += pad;
  const span = hi - lo;
  const raw = span / Math.max(1, count - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const niceStep =
    [1, 2, 2.5, 5, 10].map((n) => n * mag).find((n) => n >= raw) || 10 * mag;
  const tick0 = Math.floor(lo / niceStep) * niceStep;
  const ticks = [];
  for (let v = tick0; v <= hi + niceStep * 0.51; v = Number((v + niceStep).toFixed(10))) {
    ticks.push(Number(v.toFixed(8)));
    if (ticks.length > 12) break;
  }
  return { lo: ticks[0], hi: ticks[ticks.length - 1] ?? ticks[0] + niceStep, ticks };
}

export function hourMarks(t0, t1, stepHours = 6) {
  const start = Number(t0);
  const end = Number(t1);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];
  const d = new Date(start);
  d.setMinutes(0, 0, 0);
  const step = Math.max(1, stepHours);
  const snapped = Math.ceil(d.getHours() / step) * step;
  d.setHours(snapped);
  if (d.getTime() < start) d.setHours(d.getHours() + step);
  const marks = [];
  while (d.getTime() <= end + 1000) {
    marks.push(d.getTime());
    d.setHours(d.getHours() + step);
    if (marks.length > 16) break;
  }
  return marks;
}

export function clockLabel(ts) {
  const d = new Date(ts);
  if (!Number.isFinite(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function chartLayout(rows, now = Date.now(), size = { w: 640, h: 240 }) {
  const t0 = now - DAY_MS;
  const t1 = now;
  const pts = tempPoints(rows).filter((p) => p.ts >= t0 && p.ts <= t1);
  if (!pts.length) return { empty: true };

  const min = Math.min(...pts.map((p) => p.t));
  const max = Math.max(...pts.map((p) => p.t));
  const y = yScale(min, max);
  const pad = { l: 52, r: 16, t: 28, b: 32 };
  const innerW = size.w - pad.l - pad.r;
  const innerH = size.h - pad.t - pad.b;
  const ySpan = y.hi - y.lo || 1;

  function xOf(ts) {
    return pad.l + ((Math.max(t0, Math.min(t1, ts)) - t0) / DAY_MS) * innerW;
  }
  function yOf(t) {
    return pad.t + ((y.hi - t) / ySpan) * innerH;
  }

  const coords = pts.map((p) => ({ x: xOf(p.ts), y: yOf(p.t), t: p.t, ts: p.ts }));
  const peak = coords.reduce((best, c) => (c.t >= best.t ? c : best), coords[0]);
  const last = coords[coords.length - 1];
  const baseY = pad.t + innerH;
  const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `M ${coords[0].x.toFixed(1)} ${baseY.toFixed(1)} L ${coords
    .map((c) => `${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ")} L ${last.x.toFixed(1)} ${baseY.toFixed(1)} Z`;

  return {
    empty: false,
    w: size.w,
    h: size.h,
    pad,
    baseY,
    min,
    max,
    yTicks: y.ticks.map((v) => ({ v, y: yOf(v) })),
    xTicks: hourMarks(t0, t1).map((ts) => ({ ts, x: xOf(ts), label: clockLabel(ts) })),
    coords,
    line,
    area,
    peak,
  };
}
