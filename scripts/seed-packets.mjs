import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { asStationId } from "../src/stationPair.js";

function loadEnv(file) {
  const out = {};
  let text = "";
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return out;
  }
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    out[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return out;
}

const root = resolve(import.meta.dirname, "..");
const env = {
  ...loadEnv(resolve(root, ".env")),
  ...loadEnv(resolve(root, ".env.local")),
};

const url =
  env.VITE_SUPABASE_URL ||
  env.NEXT_PUBLIC_Akilli_Orman_Gozlemcisi_SUPABASE_URL ||
  "https://pffvskcoaqnzgvjbnlfj.supabase.co";
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
// service_role bypasses RLS, so the station id must pass the same allowlist the app uses.
const station = asStationId(env.VITE_STATION_ID || "AOG-DEMO-1");

if (!url || !serviceKey) {
  console.error("Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env (never VITE_ for the service role).");
  process.exit(1);
}
if (!station) {
  console.error("VITE_STATION_ID must be 3-40 chars: letters, digits, dot, underscore or dash.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);
const now = Date.now();
const rows = Array.from({ length: 24 }, (_, i) => ({
  n: 9100 + i,
  t: Number((18.4 + (i % 11) * 1.15).toFixed(1)),
  mq9: 1180 + i * 16,
  hours: Number((23.4 - i * 0.95).toFixed(2)),
}));

const payload = rows.map((r, i) => ({
  station_id: station,
  n: r.n,
  t: r.t,
  gps: 1,
  lat: 37.9192,
  lon: 40.268,
  mq9: r.mq9,
  a8: 1,
  a9: 1,
  rssi: -72 - (i % 12),
  created_at: new Date(now - r.hours * 3600 * 1000).toISOString(),
}));

const cutoff = new Date(now - 24 * 3600 * 1000).toISOString();
const pruned = await supabase.from("packets").delete().eq("station_id", station).lt("created_at", cutoff);
if (pruned.error) {
  console.error(pruned.error.message);
}

const inserted = await supabase.from("packets").insert(payload).select("n");
if (inserted.error) {
  console.error(inserted.error.message);
  process.exit(1);
}
console.log(`seeded ${inserted.data?.length ?? 0} packets for ${station}`);
