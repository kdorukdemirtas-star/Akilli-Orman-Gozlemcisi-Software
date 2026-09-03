import assert from "node:assert/strict";
import { test } from "node:test";
import { coatProgress } from "../src/coatCycle.js";
import { chartLayout, hourMarks, yScale } from "../src/tempChart.js";
import { ntfyPollUrl, parseNtfyFeed } from "../src/ntfyFeed.js";
import { flameLabel, flameNote, gpsLabel, gpsNote, mq9Label, packetRssi, rssiLabel } from "../src/packetView.js";
import { deviceKind, isStandaloneDisplay, pwaPlatform } from "../src/pwa.js";
import { packetLoadHint } from "../src/packetHint.js";
import { pairHref, parseStation, STATION_STORAGE_KEY } from "../src/stationPair.js";

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
  assert.equal(gpsLabel({ gps: 1, lat: 41.22559, lon: 27.88869 }), "41.22559, 27.88869");
  assert.equal(gpsNote({ gps: 1 }), "Uydu kilidi");
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
});

test("chartLayout is empty without temperatures", () => {
  assert.equal(chartLayout([], Date.now()).empty, true);
  assert.equal(
    chartLayout([{ n: 1, created_at: new Date().toISOString() }], Date.now()).empty,
    true,
  );
});
