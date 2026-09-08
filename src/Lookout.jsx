import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase.js";
import { NTFY_TOPIC } from "./config.js";
import { DISPLAY_PIN, withDisplayPin } from "./displayPin.js";
import { asStationId } from "./stationPair.js";
import { packetLoadHint } from "./packetHint.js";
import { alarmModeFor, pluginAdded, readPlugins } from "./pluginStore.js";
import { decideAlert, monthsSince, tempP90 } from "./alertBlend.js";
import { coatProgress, readCoatRenewed, writeCoatRenewed } from "./coatCycle.js";
import { ntfyPollUrl, parseNtfyFeed } from "./ntfyFeed.js";
import { flameLabel, flameNote, flameOn, gpsLabel, gpsNote, hopLabel, mq9Label, packetHop, packetRssi, rssiLabel } from "./packetView.js";
import { chartLayout, clockLabel } from "./tempChart.js";
import { BoardPlugins } from "./BoardPlugins.jsx";
import "./ops.css";

const MapCard = lazy(() => import("./MapCard.jsx"));

const DAY_MS = 24 * 60 * 60 * 1000;

export { flameOn } from "./packetView.js";

export function isAlert(p) {
  if (!p || p.t == null) return false;
  return Number(p.t) >= 100 && flameOn(p);
}

export function fmt(n, d = 1) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "-";
  return Number(n).toFixed(d);
}

function since(iso) {
  if (!iso) return "-";
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return "-";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} sn`;
  if (s < 3600) return `${Math.round(s / 60)} dk`;
  if (s < 86400) return `${Math.round(s / 3600)} sa`;
  return "1 günden eski";
}

function sinceUnix(sec) {
  const n = Number(sec);
  if (!Number.isFinite(n) || n <= 0) return "-";
  const ms = n > 1e12 ? n : n * 1000;
  return since(new Date(ms).toISOString());
}

function packetTime(iso) {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

const PACKET_COLS = "id,station_id,n,t,gps,mq9,a8,a9,v,hop,created_at";

function livePacket(row, stationId) {
  if (!row || typeof row !== "object") return false;
  if (row.id == null || row.station_id !== stationId) return false;
  const age = Date.now() - Date.parse(row.created_at);
  if (!Number.isFinite(age) || age > DAY_MS) return false;
  return true;
}

function scrubPacket(row) {
  if (!row || typeof row !== "object") return row;
  const next = { ...row };
  delete next.lat;
  delete next.lon;
  return withDisplayPin(next);
}

function mergePacketRows(fetched, live, stationId) {
  const map = new Map();
  for (const row of fetched || []) {
    const clean = scrubPacket(row);
    if (clean?.id != null && clean.station_id === stationId) map.set(clean.id, clean);
  }
  for (const row of live || []) {
    const clean = scrubPacket(row);
    if (livePacket(clean, stationId)) map.set(clean.id, clean);
  }
  return [...map.values()]
    .sort((a, b) => packetTime(b.created_at) - packetTime(a.created_at))
    .slice(0, 40);
}

function Metric({ tone, title, value, note, children }) {
  return (
    <article className="ops-metric">
      <span className={`ops-ico ${tone}`} aria-hidden="true">
        {children}
      </span>
      <div>
        <p className="ops-metric-k">{title}</p>
        <p className="ops-metric-v">{value}</p>
        <p className="ops-metric-s">{note}</p>
      </div>
    </article>
  );
}

const NARROW_QUERY = "(max-width: 640px)";

function useNarrow() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(NARROW_QUERY).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const onChange = (e) => setNarrow(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return narrow;
}

function TempChart({ rows, loading }) {
  const narrow = useNarrow();
  const chart = chartLayout(rows, Date.now(), narrow ? { w: 360, h: 260 } : { w: 640, h: 260 });
  if (chart.empty) {
    return (
      <p className="ops-empty">
        {loading ? "Sıcaklık paketleri okunuyor." : "Son 24 saatte sıcaklık paketi yok."}
      </p>
    );
  }
  const peakRight = chart.peak.x > chart.w - 160;
  const peakX = peakRight ? chart.peak.x - 10 : chart.peak.x + 10;
  const peakAnchor = peakRight ? "end" : "start";
  return (
    <div className="ops-chart">
      <svg
        viewBox={`0 0 ${chart.w} ${chart.h}`}
        width="100%"
        height="260"
        role="img"
        aria-label={`Sıcaklık ${fmt(chart.min, 1)} ile ${fmt(chart.max, 1)} derece arasında. Tepe ${fmt(chart.peak.t, 1)} °C, ${clockLabel(chart.peak.ts, chart.span)}.`}
      >
        {chart.yTicks.map((tick) => (
          <g key={`y-${tick.v}`}>
            <line className="ops-grid" x1={chart.pad.l} y1={tick.y} x2={chart.w - chart.pad.r} y2={tick.y} />
            <text className="ops-axis" x={chart.pad.l - 8} y={tick.y} dy="0.35em" textAnchor="end">
              {fmt(tick.v, Math.abs(tick.v - Math.round(tick.v)) < 1e-6 ? 0 : 1)}
            </text>
          </g>
        ))}
        {chart.xTicks.map((tick) => (
          <g key={`x-${tick.ts}`}>
            <line className="ops-grid is-x" x1={tick.x} y1={chart.pad.t} x2={tick.x} y2={chart.baseY} />
            <text className="ops-axis" x={tick.x} y={chart.h - 10} textAnchor="middle">
              {tick.label}
            </text>
          </g>
        ))}
        <line className="ops-axis-line" x1={chart.pad.l} y1={chart.baseY} x2={chart.w - chart.pad.r} y2={chart.baseY} />
        <path className="ops-area" d={chart.area} />
        <path className="ops-line" d={chart.path} />
        <circle className="ops-peak-dot" cx={chart.peak.x} cy={chart.peak.y} r="4" />
        <circle className="ops-now-dot" cx={chart.last.x} cy={chart.last.y} r="5" />
        <text className="ops-peak-label" x={peakX} y={Math.max(18, chart.peak.y - 12)} textAnchor={peakAnchor}>
          {clockLabel(chart.peak.ts, chart.span)} · {fmt(chart.peak.t, 1)} °C
        </text>
      </svg>
    </div>
  );
}

function IcoTemp() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path
        d="M10 14.2V6a2 2 0 1 1 4 0v8.2a3.5 3.5 0 1 1-4 0z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}
function IcoGas() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path
        d="M8 10c0-3 2-6 4-7 2 1 4 4 4 7v6a4 4 0 0 1-8 0z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M10 16h4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function IcoFlame() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path
        d="M12 3s4 4.2 4 8a4 4 0 1 1-8 0c0-2.4 1.4-4.6 4-8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}
function IcoGps() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function IcoRssi() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path d="M5 16a9 9 0 0 1 14 0M8 18a5 5 0 0 1 8 0" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}
function IcoMl() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 16c3-8 6-8 8 0s5 8 8 0" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

function alertCopy({ loading, silent, alertOn, fire, mode }) {
  if (loading) return "Paket okunuyor.";
  if (silent) return "Son 24 saatte paket gelmedi. Kutunun açık olduğunu kontrol et.";
  if (mode === "yalniz_ml" && !alertOn) return "Skor 0,5 altında.";
  if (alertOn) {
    if (mode === "takvim") return "Takvim eşiği.";
    if (mode === "yalniz_ml") return "Skor ≥ 0,5.";
    return "Eşik: 100 °C ve alev.";
  }
  if (fire) return "Alev var, sıcaklık eşiğin altındadır.";
  return "Eşik yok.";
}

function alertTitle(mode) {
  if (mode === "takvim") return "Takvim eşiği";
  if (mode === "yalniz_ml") return "Öğrenme eşiği";
  return "Eşik: 100 °C ve alev";
}

export function Lookout({ stationId, kicker, lede }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [reloadTick, setReloadTick] = useState(0);
  const [nowTick, setNowTick] = useState(0);
  const [notes, setNotes] = useState([]);
  const [notesErr, setNotesErr] = useState(false);
  const [renewedAt, setRenewedAt] = useState(readCoatRenewed);
  const [lastRssi, setLastRssi] = useState(null);
  const [plug, setPlug] = useState(readPlugins);
  const [mlScore, setMlScore] = useState(0);
  const [mlModel, setMlModel] = useState("");
  const stationRef = useRef(stationId);
  const latest = rows[0] || null;
  const shown = withDisplayPin(latest);
  const alarmMode = alarmModeFor(plug);
  const stats = useMemo(() => ({ p90: tempP90(rows) }), [rows]);
  const silent = !loading && !err && !latest;
  const alertOn = decideAlert({
    packet: latest,
    mode: alarmMode,
    months: monthsSince(plug.commissionedAt),
    mlScore,
    stats,
  });
  const fire = flameOn(latest);
  const coat = useMemo(() => coatProgress(renewedAt, Date.now()), [renewedAt, nowTick]);
  const packetAlerts = useMemo(() => {
    if (alarmMode === "yalniz_ml") return alertOn && latest ? [latest] : [];
    return rows
      .filter((row) =>
        decideAlert({
          packet: row,
          mode: alarmMode,
          months: monthsSince(plug.commissionedAt),
          mlScore,
          stats,
        }),
      )
      .slice(0, 8);
  }, [rows, latest, alertOn, alarmMode, plug.commissionedAt, stats, mlScore]);

  useEffect(() => {
    const id = window.setInterval(() => setNowTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let ignore = false;
    let loadGen = 0;
    const scopedId = asStationId(stationId);
    const stationChanged = stationRef.current !== scopedId;
    stationRef.current = scopedId;
    setLoading(true);
    setErr("");
    if (stationChanged) {
      setRows([]);
      setLastRssi(null);
      setMlScore(0);
      setMlModel("");
    }
    if (!scopedId) {
      setLoading(false);
      setErr("Paketler okunamadı.");
      return undefined;
    }
    const sinceIso = new Date(Date.now() - DAY_MS).toISOString();
    async function load() {
      const gen = ++loadGen;
      try {
        let query = supabase
          .from("packets")
          .select(PACKET_COLS)
          .eq("station_id", scopedId)
          .gte("created_at", sinceIso)
          .order("created_at", { ascending: false })
          .limit(40);
        let { data, error } = await query;
        if (error && /hop/i.test(error.message || "")) {
          ({ data, error } = await supabase
            .from("packets")
            .select("id,station_id,n,t,gps,mq9,a8,a9,v,created_at")
            .eq("station_id", scopedId)
            .gte("created_at", sinceIso)
            .order("created_at", { ascending: false })
            .limit(40));
        }
        if (ignore || gen !== loadGen) return;
        if (error) setErr(error.message);
        else {
          setErr("");
          setRows((prev) => mergePacketRows(data || [], prev, scopedId));
        }
        const scored = await supabase
          .from("scores")
          .select("score,model")
          .eq("station_id", scopedId)
          .order("created_at", { ascending: false })
          .limit(1);
        if (ignore || gen !== loadGen) return;
        if (scored.error) {
          /* keep last score row */
        } else if (scored.data?.[0]) {
          const n = Number(scored.data[0].score);
          setMlScore(Number.isFinite(n) ? n : 0);
          setMlModel(String(scored.data[0].model || ""));
        } else {
          setMlScore(0);
          setMlModel("");
        }
      } catch {
        if (!ignore && gen === loadGen) setErr("Paketler okunamadı.");
      } finally {
        if (!ignore && gen === loadGen) setLoading(false);
      }
    }
    load();
    const poll = window.setInterval(load, 4000);
    const ch = supabase
      .channel(`packets-live-${scopedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "packets",
          filter: `station_id=eq.${scopedId}`,
        },
        (payload) => {
          if (ignore) return;
          const row = payload.new;
          if (!livePacket(row, scopedId)) return;
          setRows((prev) => mergePacketRows(prev, [scrubPacket(row)], scopedId));
        },
      )
      .subscribe();
    return () => {
      ignore = true;
      window.clearInterval(poll);
      supabase.removeChannel(ch);
    };
  }, [stationId, reloadTick]);

  useEffect(() => {
    const n = packetRssi(latest);
    if (n != null) setLastRssi(n);
  }, [latest]);

  useEffect(() => {
    let ignore = false;
    const url = ntfyPollUrl(NTFY_TOPIC);
    async function loadNotes() {
      if (!url) return;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("ntfy");
        const text = await res.text();
        if (ignore) return;
        setNotesErr(false);
        setNotes(parseNtfyFeed(text).slice(0, 8));
      } catch {
        if (!ignore) setNotesErr(true);
      }
    }
    loadNotes();
    const id = window.setInterval(loadNotes, 30000);
    return () => {
      ignore = true;
      window.clearInterval(id);
    };
  }, []);

  function markRenewed() {
    const ts = Date.now();
    try {
      writeCoatRenewed(ts);
    } catch {
      /* private mode */
    }
    setRenewedAt(ts);
  }

  const tempLabel = loading || latest?.t == null ? "-" : `${fmt(latest.t, 1)} °C`;
  const ageLabel = loading ? "-" : since(latest?.created_at);

  const noticeList = notes.length
    ? notes.map((n) => ({
        id: n.id || `${n.time}-${n.message}`,
        title: n.title || "Bildirim",
        body: n.message || "",
        when: sinceUnix(n.time),
        hot: true,
      }))
    : packetAlerts.map((p) => ({
        id: p.id,
        title: alertTitle(alarmMode),
        body: `Sıcaklık ${fmt(p.t, 0)} °C. Sayaç ${p.n ?? "-"}.`,
        when: since(p.created_at),
        hot: true,
      }));

  return (
    <div className="ops">
      <header className="ops-top">
        <div>
          {kicker ? <p className="ops-kicker">{kicker}</p> : null}
          <h1>Pano</h1>
          {lede ? <p className="ops-lede">{lede}</p> : null}
        </div>
        <p
          className={`ops-flag ${alertOn ? "is-hot" : silent ? "" : "is-ok"}`}
          role="status"
          aria-live={alertOn ? "assertive" : "polite"}
        >
          {alertCopy({
            loading,
            silent,
            alertOn,
            fire,
            mode: alarmMode,
          })}
        </p>
      </header>

      {err ? (
        <div className="err-block" role="alert">
          <p className="err">{packetLoadHint(err)}</p>
          <button type="button" className="ops-btn ghost" onClick={() => setReloadTick((n) => n + 1)}>
            Yeniden dene
          </button>
        </div>
      ) : null}

      <section className="ops-metrics" aria-label="Sensörler">
        <Metric tone="is-blue" title="Sıcaklık" value={tempLabel} note={loading ? "Okunuyor" : ageLabel}>
          <IcoTemp />
        </Metric>
        <Metric tone="is-warn" title="MQ-9" value={loading ? "-" : mq9Label(latest)} note={loading ? "Okunuyor" : ageLabel}>
          <IcoGas />
        </Metric>
        <Metric
          tone={fire ? "is-warn" : "is-moss"}
          title="Alev"
          value={loading ? "-" : flameLabel(latest)}
          note={loading ? "D8 ve D9" : flameNote(latest)}
        >
          <IcoFlame />
        </Metric>
        <Metric
          tone="is-moss"
          title="GPS"
          value={loading && !DISPLAY_PIN ? "-" : gpsLabel(shown)}
          note={loading && !DISPLAY_PIN ? "Konum" : DISPLAY_PIN?.note || gpsNote(shown)}
        >
          <IcoGps />
        </Metric>
        <Metric
          tone="is-bark"
          title="RSSI"
          value={loading ? "-" : rssiLabel(packetRssi(latest) != null ? latest : lastRssi != null ? { rssi: lastRssi } : latest)}
          note={
            packetRssi(latest) != null || lastRssi != null
              ? "Alıcı LoRa"
              : loading
                ? "Okunuyor"
                : "Paket bekleniyor"
          }
        >
          <IcoRssi />
        </Metric>
        {pluginAdded(plug, "ml") ? (
          <Metric
            tone="is-moss"
            title="Skor"
            value={loading ? "-" : mlModel ? fmt(mlScore, 3) : "—"}
            note={
              mlModel === "logreg-wait"
                ? "bekliyor"
                : mlModel === "logreg"
                  ? "eğitildi"
                  : "yok"
            }
          >
            <IcoMl />
          </Metric>
        ) : null}
        {plug.hopOn ? (
          <Metric
            tone="is-bark"
            title="Mesh"
            value={loading ? "-" : hopLabel(latest)}
            note={
              packetHop(latest) != null
                ? plug.hopNote || "Mesh"
                : plug.hopNote || "Doğrudan"
            }
          >
            <IcoRssi />
          </Metric>
        ) : null}
      </section>

      <section className="ops-mid">
        <article className="ops-card">
          <header className="ops-card-h">
            <h2>Sıcaklık grafiği</h2>
          </header>
          <TempChart rows={rows} loading={loading} />
        </article>
        <article className="ops-card">
          <header className="ops-card-h">
            <h2>Harita</h2>
          </header>
          <div className="ops-map">
            <Suspense fallback={<p className="ops-empty">Harita yükleniyor.</p>}>
              <MapCard
                lat={shown?.lat}
                lon={shown?.lon}
                gps={shown?.gps}
                zoom={DISPLAY_PIN?.zoom}
                heading={false}
              />
            </Suspense>
          </div>
        </article>
      </section>

      <section className="ops-plugs" aria-label="Eklentiler">
        <BoardPlugins plug={plug} onChange={setPlug} />
      </section>

      <section className="ops-bot">
        <article className="ops-card">
          <header className="ops-card-h">
            <h2>Son uyarılar</h2>
          </header>
          {noticeList.length ? (
            <ul className="ops-notes">
              {noticeList.map((item) => (
                <li key={item.id} className={item.hot ? "is-hot" : undefined}>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                  <time>{item.when}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ops-empty">Liste boş.</p>
          )}
        </article>

        <article className="ops-card">
          <header className="ops-card-h">
            <h2>Kaplama durumu</h2>
            <button type="button" className="ops-btn" onClick={markRenewed}>
              Karışım yenilendi
            </button>
          </header>
          <p className="ops-coat-v">%{coat.pct}</p>
          <div
            className="ops-bar"
            role="meter"
            aria-label="Kaplama kalan ömrü"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={coat.pct}
          >
            <i style={{ width: `${coat.pct}%` }} />
          </div>
          <ul className="ops-stages">
            <li className={coat.stage === "yeni" ? "is-on" : undefined}>
              <strong>Yeni kaplama</strong>
              <span>0-30 gün</span>
            </li>
            <li className={coat.stage === "orta" ? "is-on" : undefined}>
              <strong>Orta süre</strong>
              <span>30-60 gün</span>
            </li>
            <li className={coat.stage === "yenileme" ? "is-on" : undefined}>
              <strong>Yenileme gerekli</strong>
              <span>60-90 gün</span>
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
