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
  const pad = (hi - lo) * 0.12;
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

export function timeMarks(t0, t1) {
  const start = Number(t0);
  const end = Number(t1);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];
  const span = end - start;
  let step = 6 * 3600 * 1000;
  if (span <= 2 * 60 * 1000) step = 15 * 1000;
  else if (span <= 10 * 60 * 1000) step = 60 * 1000;
  else if (span <= 40 * 60 * 1000) step = 5 * 60 * 1000;
  else if (span <= 2 * 3600 * 1000) step = 15 * 60 * 1000;
  else if (span <= 8 * 3600 * 1000) step = 60 * 60 * 1000;
  else if (span <= 18 * 3600 * 1000) step = 2 * 3600 * 1000;
  const origin = Math.ceil(start / step) * step;
  const marks = [];
  for (let t = origin; t <= end + 1; t += step) {
    marks.push(t);
    if (marks.length > 12) break;
  }
  return marks;
}

export function clockLabel(ts, spanMs = DAY_MS) {
  const d = new Date(ts);
  if (!Number.isFinite(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (spanMs < 3 * 60 * 1000) {
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }
  return `${hh}:${mm}`;
}

export function windowLabel(t0, t1) {
  const span = Number(t1) - Number(t0);
  if (!Number.isFinite(span) || span <= 0) return "Gelen paketler";
  if (span < 90 * 1000) return "Son saniyeler";
  if (span < 90 * 60 * 1000) return `Son ${Math.max(1, Math.round(span / 60000))} dakika`;
  const hours = Math.max(1, Math.round(span / 3600000));
  return hours === 1 ? "Son 1 saat" : `Son ${hours} saat`;
}

function dataWindow(pts) {
  const first = pts[0].ts;
  const last = pts[pts.length - 1].ts;
  const raw = Math.max(last - first, 1000);
  const pad = Math.max(raw * 0.08, 400);
  return { t0: first - pad, t1: last + pad };
}

function smoothPath(coords) {
  if (!coords.length) return "";
  const pt = (c) => `${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
  if (coords.length === 1) return `M ${pt(coords[0])}`;
  if (coords.length === 2) return `M ${pt(coords[0])} L ${pt(coords[1])}`;
  let d = `M ${pt(coords[0])}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${pt(p2)}`;
  }
  return d;
}

export function chartLayout(rows, now = Date.now(), size = { w: 640, h: 260 }) {
  const pts = tempPoints(rows).filter((p) => p.ts >= now - DAY_MS && p.ts <= now + 5000);
  if (!pts.length) return { empty: true };

  const { t0, t1 } = dataWindow(pts);
  const span = t1 - t0 || 1;
  const min = Math.min(...pts.map((p) => p.t));
  const max = Math.max(...pts.map((p) => p.t));
  const y = yScale(min, max);
  const pad = { l: 48, r: 18, t: 36, b: 36 };
  const innerW = size.w - pad.l - pad.r;
  const innerH = size.h - pad.t - pad.b;
  const ySpan = y.hi - y.lo || 1;

  function xOf(ts) {
    return pad.l + ((Math.max(t0, Math.min(t1, ts)) - t0) / span) * innerW;
  }
  function yOf(t) {
    return pad.t + ((y.hi - t) / ySpan) * innerH;
  }

  const coords = pts.map((p) => ({ x: xOf(p.ts), y: yOf(p.t), t: p.t, ts: p.ts }));
  const peak = coords.reduce((best, c) => (c.t >= best.t ? c : best), coords[0]);
  const last = coords[coords.length - 1];
  const baseY = pad.t + innerH;
  const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const path = smoothPath(coords);
  const pathTail = path.replace(/^M [0-9.+-]+ [0-9.+-]+/, "");
  const area = `M ${coords[0].x.toFixed(1)} ${baseY.toFixed(1)} L ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}${pathTail} L ${last.x.toFixed(1)} ${baseY.toFixed(1)} Z`;

  return {
    empty: false,
    w: size.w,
    h: size.h,
    pad,
    baseY,
    min,
    max,
    span,
    caption: windowLabel(t0, t1),
    yTicks: y.ticks.map((v) => ({ v, y: yOf(v) })),
    xTicks: timeMarks(t0, t1).map((ts) => ({ ts, x: xOf(ts), label: clockLabel(ts, span) })),
    coords,
    line,
    path,
    area,
    peak,
    last,
  };
}
