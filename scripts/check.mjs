import assert from "node:assert/strict";
import { test } from "node:test";
import { coatProgress } from "../src/coatCycle.js";
import { chartLayout, hourMarks, yScale } from "../src/tempChart.js";
import { ntfyPollUrl, parseNtfyFeed } from "../src/ntfyFeed.js";
import { DISPLAY_PIN, withDisplayPin } from "../src/displayPin.js";
import { flameLabel, flameNote, gpsLabel, gpsNote, hopLabel, mq9Label, packetHop, packetRssi, rssiLabel } from "../src/packetView.js";
import { addPlugin, alarmModeFor, asHttpUrl, defaultPlugins, pluginAdded, PLUGIN_CATALOG, readPlugins, removePlugin, writePlugins } from "../src/pluginStore.js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { asChatKip, AOG_FACTS, chatModel, kipLabel, kipTokens, stripThink, systemPrompt, titleFromQuestion } from "../src/chatStore.js";
import { blendWeights, decideAlert, dynamicAlert, fixedAlert, monthsSince, tempP90 } from "../src/alertBlend.js";
import { stationFromUser } from "../src/stationBind.js";
import { deviceKind, isStandaloneDisplay, pwaPlatform } from "../src/pwa.js";
import { packetLoadHint } from "../src/packetHint.js";
import { pairHref, parseStation, STATION_STORAGE_KEY } from "../src/stationPair.js";
import { NAV_PACKS, DESKTOP_TABS } from "../src/navPacks.js";

test("parseStation accepts a raw station id", () => {
  assert.equal(parseStation("AOG-DEMO-1"), "AOG-DEMO-1");
});

test("parseStation reads aog pair URLs", () => {
  assert.equal(parseStation("aog://pair/AOG-DEMO-1"), "AOG-DEMO-1");
});

test("parseStation reads https pair query", () => {
  assert.equal(
    parseStation("https://example.test/pair?station=AOG-DEMO-1"),
    "AOG-DEMO-1",
  );
});

test("parseStation rejects colon and javascript ids", () => {
  assert.equal(parseStation("javascript:AOG-DEMO-1"), "");
  assert.equal(parseStation("AOG:FOO"), "");
});

test("parseStation rejects non-http pair paths", () => {
  assert.equal(parseStation("javascript:pair/AOG-DEMO-1"), "");
  assert.equal(parseStation("file:///pair/AOG-DEMO-1"), "");
  assert.equal(parseStation("blob:https://example.test/pair/AOG-DEMO-1"), "");
  assert.equal(
    parseStation("https://example.test/pair?station=javascript:pair/AOG-X"),
    "",
  );
});

test("pairHref writes the station query", () => {
  assert.equal(
    pairHref("https://a.test", "AOG-DEMO-1"),
    "https://a.test/pair?station=AOG-DEMO-1",
  );
});

test("pairHref rejects non-http origins", () => {
  assert.equal(pairHref("javascript:alert(1)//", "AOG-DEMO-1"), "");
  assert.equal(pairHref("https://a.test/extra", "AOG-DEMO-1"), "https://a.test/pair?station=AOG-DEMO-1");
});

test("paired station lives in a device-local key", () => {
  assert.equal(STATION_STORAGE_KEY, "aog-station");
});

test("packetLoadHint maps schema cache errors", () => {
  const hint = packetLoadHint("Could not find the table 'public.packets' in the schema cache");
  assert.match(hint, /Yeniden dene/);
  assert.doesNotMatch(hint, /Could not find the table|schema\.sql|SQL Editor/);
});

test("packetLoadHint hides unmatched backend text", () => {
  const hint = packetLoadHint("JWT expired");
  assert.doesNotMatch(hint, /JWT expired/);
  assert.match(hint, /Yeniden dene/);
});

test("packetLoadHint maps a dead supabase host", () => {
  const hint = packetLoadHint("Failed to fetch");
  assert.match(hint, /bağlanılamadı/);
  assert.doesNotMatch(hint, /Failed to fetch|\.env\.local/);
});

test("isStandaloneDisplay is true for installed PWA", () => {
  assert.equal(isStandaloneDisplay({ displayModeStandalone: true, iosStandalone: false }), true);
  assert.equal(isStandaloneDisplay({ displayModeStandalone: false, iosStandalone: true }), true);
  assert.equal(isStandaloneDisplay({ displayModeStandalone: false, iosStandalone: false }), false);
});

test("pwaPlatform reads Iphone and Android user agents", () => {
  assert.equal(pwaPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"), "ios");
  assert.equal(pwaPlatform("Mozilla/5.0 (Linux; Android 14; Pixel 8)"), "android");
  assert.equal(pwaPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)"), "other");
});

test("deviceKind only accepts ios and android routes", () => {
  assert.equal(deviceKind("ios"), "ios");
  assert.equal(deviceKind("android"), "android");
  assert.equal(deviceKind("web"), "");
  assert.equal(deviceKind("javascript:ios"), "");
});

const DAY_MS = 24 * 60 * 60 * 1000;

test("coatProgress is empty until Karışım yenilendi", () => {
  const now = 1_700_000_000_000;
  const none = coatProgress(0, now);
  assert.equal(none.pct, 0);
  assert.equal(none.stage, "yenileme");
  assert.equal(none.remainingDays, 0);
});

test("coatProgress tracks a 90 day renewal window", () => {
  const now = 1_700_000_000_000;
  const fresh = coatProgress(now, now);
  assert.equal(fresh.stage, "yeni");
  assert.equal(fresh.pct, 100);

  const mid = coatProgress(now - 45 * DAY_MS, now);
  assert.equal(mid.stage, "orta");
  assert.equal(mid.pct, 50);

  const late = coatProgress(now - 75 * DAY_MS, now);
  assert.equal(late.stage, "yenileme");
  assert.ok(late.pct < 30);

  const expired = coatProgress(now - 91 * DAY_MS, now);
  assert.equal(expired.pct, 0);
  assert.equal(expired.stage, "yenileme");
});

test("parseNtfyFeed keeps messages newest first", () => {
  const rows = parseNtfyFeed(
    `{"event":"open"}\n{"event":"message","title":"Eski","message":"a","time":10}\n{"event":"keepalive"}\n{"event":"message","title":"Yeni","message":"b","time":40}\n`,
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[0].title, "Yeni");
  assert.equal(rows[1].message, "a");
});

test("ntfyPollUrl encodes the public topic", () => {
  assert.equal(ntfyPollUrl(""), "");
  assert.equal(
    ntfyPollUrl("aog-test-topic"),
    "https://ntfy.sh/aog-test-topic/json?poll=1",
  );
});

test("packetRssi ignores firmware voltage and missing fields", () => {
  assert.equal(packetRssi({ rssi: -72 }), -72);
  assert.equal(packetRssi({ v: -91 }), -91);
  assert.equal(packetRssi({ v: 3300 }), null);
  assert.equal(packetRssi({}), null);
  assert.equal(rssiLabel({ rssi: -80 }), "-80 dBm");
  assert.equal(rssiLabel({ v: -77 }), "-77 dBm");
  assert.equal(rssiLabel({}), "Pakette yok");
});

test("mq9 and flame and gps labels read the packet fields", () => {
  assert.equal(mq9Label({ mq9: 1548 }), "1548");
  assert.equal(mq9Label({}), "-");
  assert.equal(flameLabel({ a8: 1, a9: 1 }), "Yok");
  assert.equal(flameLabel({ a8: 0, a9: 1 }), "Alev");
  assert.equal(flameNote({ a8: 0, a9: 1 }), "D8 alev, D9 boş");
  assert.equal(gpsLabel({ gps: 0 }), "Fix yok");
  assert.equal(gpsLabel({ gps: 1, lat: 37.9192, lon: 40.268 }), "37.91920, 40.26800");
  assert.equal(gpsNote({ gps: 1 }), "Uydu kilidi");
});

test("withDisplayPin replaces packet coordinates with Dicle Üniversitesi", () => {
  const pinned = withDisplayPin({ lat: 0, lon: 0, gps: 2, t: 30 });
  assert.equal(pinned.lat, DISPLAY_PIN.lat);
  assert.equal(pinned.lon, DISPLAY_PIN.lon);
  assert.equal(pinned.gps, 1);
  assert.equal(pinned.t, 30);
  assert.equal(DISPLAY_PIN.note, "Dicle Üniversitesi");
});

test("yScale pads a tight temperature band", () => {
  const y = yScale(30.8, 31.8);
  assert.ok(y.lo <= 30.8);
  assert.ok(y.hi >= 31.8);
  assert.ok(y.ticks.length >= 3);
  assert.equal(y.ticks[0], y.lo);
});

test("hourMarks lands on 6 hour local clock faces", () => {
  const t0 = Date.parse("2026-09-02T01:17:00+03:00");
  const t1 = t0 + DAY_MS;
  const marks = hourMarks(t0, t1);
  assert.ok(marks.length >= 4);
  for (const ts of marks) {
    const d = new Date(ts);
    assert.equal(d.getMinutes(), 0);
    assert.equal(d.getHours() % 6, 0);
    assert.ok(ts >= t0 && ts <= t1 + 1000);
  }
});

test("chartLayout maps the peak to the hottest packet", () => {
  const now = Date.parse("2026-09-02T20:00:00+03:00");
  const chart = chartLayout(
    [
      { t: 20, created_at: new Date(now - 12 * 3600000).toISOString() },
      { t: 31.8, created_at: new Date(now - 2 * 3600000).toISOString() },
      { t: 22, created_at: new Date(now - 1 * 3600000).toISOString() },
    ],
    now,
  );
  assert.equal(chart.empty, false);
  assert.equal(chart.peak.t, 31.8);
  assert.equal(chart.coords.length, 3);
  assert.ok(chart.yTicks.length >= 3);
  assert.ok(chart.xTicks.length >= 3);
  assert.match(chart.line, /,/);
  assert.match(chart.path, /^M /);
});

test("chartLayout stretches recent packets across the plot", () => {
  const now = Date.parse("2026-09-02T20:00:00+03:00");
  const rows = Array.from({ length: 10 }, (_, i) => ({
    t: 30 + i * 0.08,
    created_at: new Date(now - (9 - i) * 2000).toISOString(),
  }));
  const chart = chartLayout(rows, now, { w: 640, h: 260 });
  const first = chart.coords[0].x;
  const last = chart.coords[chart.coords.length - 1].x;
  assert.ok(last - first > 400);
  assert.ok(first > 40 && first < 90);
  assert.ok(last > 520);
});

test("chartLayout is empty without temperatures", () => {
  assert.equal(chartLayout([], Date.now()).empty, true);
  assert.equal(
    chartLayout([{ n: 1, created_at: new Date().toISOString() }], Date.now()).empty,
    true,
  );
});

test("asHttpUrl keeps host and rejects credentials", () => {
  assert.equal(asHttpUrl("http://aog-pi.local:8080/v1"), "http://aog-pi.local:8080");
  assert.equal(asHttpUrl("http://u:p@aog-pi.local:8080"), "");
  assert.equal(asHttpUrl("javascript:alert(1)"), "");
});

test("pluginStore writes alarm mode and hop note", () => {
  const mem = new Map();
  globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => {
      mem.set(k, String(v));
    },
  };
  assert.equal(readPlugins().alarmMode, defaultPlugins().alarmMode);
  writePlugins({ hopOn: true, hopNote: "3C:0F:02:DA:30:9C", alarmMode: "takvim", added: ["hop", "ml"] });
  const next = readPlugins();
  assert.equal(next.hopOn, true);
  assert.equal(next.hopNote, "3C:0F:02:DA:30:9C");
  assert.equal(next.alarmMode, "takvim");
  assert.equal(pluginAdded(next, "hop"), true);
  assert.equal(alarmModeFor(next), "takvim");
});

test("chat kips hide model names and map tokens", () => {
  assert.equal(asChatKip("derin"), "derin");
  assert.equal(asChatKip("qwen"), "hizli");
  assert.equal(chatModel("derin"), "derin");
  assert.equal(kipLabel("hizli"), "Hızlı cevaplar");
  assert.equal(kipLabel("derin"), "Derin cevaplar");
  assert.doesNotMatch(kipLabel("hizli") + kipLabel("derin"), /qwen|deepseek|r1|0\.8b|1\.5b/i);
  assert.equal(kipTokens("hizli"), 192);
  assert.equal(kipTokens("derin"), 320);
  const facts = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../pi/AOG.md"),
    "utf8",
  ).trim();
  assert.equal(facts, AOG_FACTS.trim());
  const blob = systemPrompt("hizli") + systemPrompt("derin");
  assert.doesNotMatch(blob, /Qwen|DeepSeek/);
  assert.match(blob, /sklearn/);
  assert.match(blob, /100 °C/);
  assert.match(blob, /LoRa/);
  assert.match(blob, /0x2A/);
  assert.match(blob, /Mesh sistemi/);
  assert.match(blob, /Clerk/);
  assert.match(blob, /StandardScaler/);
  assert.match(systemPrompt("hizli"), /Kip: hızlı/);
  assert.match(systemPrompt("derin"), /Kip: derin/);
  assert.equal(stripThink("<think>gizli</think>Alarm AND kuralıdır."), "Alarm AND kuralıdır.");
  assert.doesNotMatch(stripThink("Qwen 3.5 0.8B ve DeepSeek R1 1.5B"), /qwen|deepseek|\br1\b|0\.8b|1\.5b/i);
  assert.doesNotMatch(
    PLUGIN_CATALOG.map((item) => item.title + item.body).join(" "),
    /Qwen|DeepSeek|0\.8B|1\.5B|https?:\/\//i,
  );
  assert.match(PLUGIN_CATALOG.find((item) => item.id === "pi").body, /Adres yazılmaz/);
  assert.match(PLUGIN_CATALOG.find((item) => item.id === "ml").body, /100 °C ve alev/);
  assert.doesNotMatch(PLUGIN_CATALOG.find((item) => item.id === "ml").body, /sklearn|LogReg/i);
  assert.equal(titleFromQuestion("alarm kuralı nedir acaba burada"), "alarm kuralı nedir acaba burada");
  const here = dirname(fileURLToPath(import.meta.url));
  const proxy = readFileSync(join(here, "../pi/chat_proxy.py"), "utf8");
  assert.match(proxy, /Always replace client system/);
  assert.doesNotMatch(proxy, /has_system/);
  assert.match(proxy, /CHAT_CORS_ORIGIN/);
  assert.doesNotMatch(proxy, /Access-Control-Allow-Origin", "\*"/);
  const lookout = readFileSync(join(here, "../src/Lookout.jsx"), "utf8");
  assert.match(lookout, /title="Skor"/);
  assert.doesNotMatch(lookout, /title="sklearn"/);
  const vite = readFileSync(join(here, "../vite.config.js"), "utf8");
  assert.doesNotMatch(vite, /VITE_PI_CHAT_URL/);
});

test("addPlugin and removePlugin toggle catalog entries", () => {
  const mem = new Map();
  globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => {
      mem.set(k, String(v));
    },
  };
  assert.equal(pluginAdded(readPlugins(), "ml"), false);
  assert.equal(alarmModeFor(readPlugins()), "sabit");
  addPlugin("ml");
  writePlugins({ alarmMode: "yalniz_ml" });
  assert.equal(pluginAdded(readPlugins(), "ml"), true);
  assert.equal(alarmModeFor(readPlugins()), "yalniz_ml");
  removePlugin("ml");
  assert.equal(pluginAdded(readPlugins(), "ml"), false);
  assert.equal(alarmModeFor(readPlugins()), "sabit");
});

test("blendWeights follow the 2 / 6 / 10 / 12 month table", () => {
  assert.deepEqual(blendWeights(0), { fixed: 1, dynamic: 0, ml: 0 });
  assert.deepEqual(blendWeights(3), { fixed: 0.75, dynamic: 0.2, ml: 0.05 });
  assert.deepEqual(blendWeights(7), { fixed: 0, dynamic: 0.55, ml: 0.45 });
  assert.deepEqual(blendWeights(10.5), { fixed: 0, dynamic: 0.5, ml: 0.5 });
  assert.deepEqual(blendWeights(12), { fixed: 0, dynamic: 0, ml: 1 });
});

test("fixedAlert is 100 C and flame", () => {
  assert.equal(fixedAlert({ t: 100, a8: 0, a9: 1 }), true);
  assert.equal(fixedAlert({ t: 99, a8: 0, a9: 1 }), false);
  assert.equal(fixedAlert({ t: 120, a8: 1, a9: 1 }), false);
});

test("dynamicAlert needs flame and a high temperature for the box", () => {
  assert.equal(dynamicAlert({ t: 85, a8: 0 }, { p90: 80 }), true);
  assert.equal(dynamicAlert({ t: 70, a8: 0 }, { p90: 80 }), false);
  assert.equal(dynamicAlert({ t: 90, a8: 1, a9: 1 }, { p90: 80 }), false);
});

test("decideAlert stays on the fixed rule in sabit mode", () => {
  const packet = { t: 100, a8: 0, a9: 1 };
  assert.equal(decideAlert({ packet, mode: "sabit", months: 12, mlScore: 0 }), true);
  assert.equal(
    decideAlert({ packet: { t: 40, a8: 0 }, mode: "sabit", months: 12, mlScore: 1 }),
    false,
  );
});

test("decideAlert at month 12 in takvim needs the ML score", () => {
  const packet = { t: 100, a8: 0, a9: 1 };
  assert.equal(decideAlert({ packet, mode: "takvim", months: 12, mlScore: 0 }), false);
  assert.equal(decideAlert({ packet, mode: "takvim", months: 12, mlScore: 0.6 }), true);
  assert.equal(decideAlert({ packet, mode: "yalniz_ml", months: 0, mlScore: 0.6 }), true);
  assert.equal(decideAlert({ packet, mode: "yalniz_ml", months: 0, mlScore: 0.2 }), false);
});

test("monthsSince and tempP90", () => {
  const now = Date.parse("2026-09-08T00:00:00Z");
  assert.ok(monthsSince("2026-03-08T00:00:00Z", now) > 5);
  assert.equal(tempP90([{ t: 1 }, { t: 2 }, { t: 3 }, { t: 4 }]), null);
  assert.equal(tempP90([{ t: 10 }, { t: 20 }, { t: 30 }, { t: 40 }, { t: 50 }]), 40);
});

test("hopLabel marks a repeated packet", () => {
  assert.equal(packetHop({ hop: 1 }), 1);
  assert.equal(hopLabel({ hop: 1 }), "hop=1");
  assert.equal(hopLabel({}), "Doğrudan");
});

test("stationFromUser reads Clerk unsafe metadata", () => {
  assert.equal(stationFromUser({ unsafeMetadata: { stationId: "AOG-DEMO-1" } }), "AOG-DEMO-1");
  assert.equal(stationFromUser({ unsafeMetadata: { stationId: "x" } }), "");
});

test("nav packs split product watch and hardware with tones", () => {
  assert.deepEqual(
    NAV_PACKS.map((pack) => pack.id),
    ["urun", "izle", "kutu"],
  );
  assert.equal(NAV_PACKS[0].tone, "tone-box");
  assert.equal(NAV_PACKS[1].tone, "tone-pan");
  assert.equal(NAV_PACKS[2].tone, "tone-dev");
  assert.ok(DESKTOP_TABS.some((tab) => tab.to === "/asistan"));
  assert.equal(DESKTOP_TABS.some((tab) => tab.to === "/makine"), false);
  const izle = NAV_PACKS.find((pack) => pack.id === "izle");
  assert.ok(izle.overlay.some((item) => item.to === "/makine"));
});
