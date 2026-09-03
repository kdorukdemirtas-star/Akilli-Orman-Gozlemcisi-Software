import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase.js";
import { NTFY_TOPIC } from "./config.js";
import { asStationId } from "./stationPair.js";
import { packetLoadHint } from "./packetHint.js";
import { coatProgress, readCoatRenewed, writeCoatRenewed } from "./coatCycle.js";
import { ntfyPollUrl, parseNtfyFeed } from "./ntfyFeed.js";
import { rssiLabel } from "./packetView.js";
import { chartLayout, clockLabel } from "./tempChart.js";
import "./ops.css";

const MapCard = lazy(() => import("./MapCard.jsx"));

const DAY_MS = 24 * 60 * 60 * 1000;

export function flameOn(p) {
  if (!p) return false;
  return Number(p.a8) === 0 || Number(p.a9) === 0;
}

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

function livePacket(row, stationId) {
  if (!row || typeof row !== "object") return false;
  if (row.id == null || row.station_id !== stationId) return false;
  const age = Date.now() - Date.parse(row.created_at);
  if (!Number.isFinite(age) || age > DAY_MS) return false;
  return true;
}

function mergePacketRows(fetched, live, stationId) {
  const map = new Map();
  for (const row of fetched || []) {
    if (row?.id != null && row.station_id === stationId) map.set(row.id, row);
  }
  for (const row of live || []) {
    if (livePacket(row, stationId)) map.set(row.id, row);
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
  // A 640-wide viewBox scaled into a ~280px card renders 8px axis text; a 360 box keeps it ~14px.
  const chart = chartLayout(rows, Date.now(), narrow ? { w: 360, h: 240 } : { w: 640, h: 240 });
  if (chart.empty) {
    return (
      <p className="ops-empty">
        {loading ? "Sıcaklık paketleri okunuyor." : "Son 24 saatte sıcaklık paketi yok."}
      </p>
    );
  }
  const peakRight = chart.peak.x > chart.w - 180;
  const peakX = peakRight ? chart.peak.x - 8 : chart.peak.x + 8;
  const peakAnchor = peakRight ? "end" : "start";
  return (
    <div className="ops-chart">
      <svg
        viewBox={`0 0 ${chart.w} ${chart.h}`}
        width="100%"
        height="240"
        role="img"
        aria-label={`Sıcaklık ${fmt(chart.min, 1)} ile ${fmt(chart.max, 1)} derece arasında. Tepe ${fmt(chart.peak.t, 1)} °C, ${clockLabel(chart.peak.ts)}.`}
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
            <text className="ops-axis" x={tick.x} y={chart.h - 8} textAnchor="middle">
              {tick.label}
            </text>
          </g>
        ))}
        <line className="ops-axis-line" x1={chart.pad.l} y1={chart.baseY} x2={chart.w - chart.pad.r} y2={chart.baseY} />
        <path className="ops-area" d={chart.area} />
        <polyline className="ops-line" points={chart.line} />
        <circle className="ops-peak-dot" cx={chart.peak.x} cy={chart.peak.y} r="4.5" />
        <text className="ops-peak-label" x={peakX} y={chart.peak.y - 10} textAnchor={peakAnchor}>
          {clockLabel(chart.peak.ts)} · {fmt(chart.peak.t, 1)} °C
        </text>
      </svg>
    </div>
  );
}

function IcoPhone() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <rect x="7" y="3" width="10" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 18h2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
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
function IcoWarn() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path d="M12 4l9 16H3z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10v4M12 16.5h.01" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function IcoShield() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path d="M12 3l8 3v6c0 5-3.2 8.2-8 10-4.8-1.8-8-5-8-10V6z" fill="none" stroke="currentColor" strokeWidth="1.8" />
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

export function Lookout({ stationId, kicker, lede }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [reloadTick, setReloadTick] = useState(0);
  const [nowTick, setNowTick] = useState(0);
  const [notes, setNotes] = useState([]);
  const [notesErr, setNotesErr] = useState(false);
  const [renewedAt, setRenewedAt] = useState(readCoatRenewed);
  const stationRef = useRef(stationId);
  const latest = rows[0] || null;
  const silent = !loading && !err && !latest;
  const alertOn = isAlert(latest);
  const fire = flameOn(latest);
  const coat = useMemo(() => coatProgress(renewedAt, Date.now()), [renewedAt, nowTick]);
  const packetAlerts = useMemo(() => rows.filter(isAlert).slice(0, 8), [rows]);

  useEffect(() => {
    const id = window.setInterval(() => setNowTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let ignore = false;
    const scopedId = asStationId(stationId);
    const stationChanged = stationRef.current !== scopedId;
    stationRef.current = scopedId;
    setLoading(true);
    setErr("");
    if (stationChanged) setRows([]);
    if (!scopedId) {
      setLoading(false);
      setErr("Paketler okunamadı.");
      return undefined;
    }
    const sinceIso = new Date(Date.now() - DAY_MS).toISOString();
    async function load() {
      try {
        const { data, error } = await supabase
          .from("packets")
          .select("*")
          .eq("station_id", scopedId)
          .gte("created_at", sinceIso)
          .order("created_at", { ascending: false })
          .limit(40);
        if (ignore) return;
        if (error) setErr(error.message);
        else setRows((prev) => mergePacketRows(data || [], prev, scopedId));
      } catch {
        if (!ignore) setErr("Paketler okunamadı.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
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
          setRows((prev) => mergePacketRows(prev, [row], scopedId));
        },
      )
      .subscribe((status) => {
        if (ignore) return;
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setErr((prev) => prev || "Canlı kanal düştü. Yeniden dene.");
        }
      });
    return () => {
      ignore = true;
      supabase.removeChannel(ch);
    };
  }, [stationId, reloadTick]);

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
  const warnCount = notes.length ? notes.length : packetAlerts.length;
  const coatNote =
    coat.elapsedDays == null
      ? "Yenileme kaydı yok"
      : coat.remainingDays > 0
        ? `${coat.remainingDays} gün kaldı`
        : "Süre doldu";

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
        title: "Eşik: 100 °C ve alev",
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
          {loading
            ? "Paket okunuyor."
            : silent
              ? "Son 24 saatte paket gelmedi. Kutunun açık olduğunu ve istasyon kodunu kontrol et."
              : alertOn
                ? "Eşik: 100 °C ve alev."
                : fire
                  ? "Alev var, sıcaklık eşiğin altındadır."
                  : "Eşik yok."}
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

      <section className="ops-metrics" aria-label="Özet">
        <Metric tone="is-moss" title="Aktif cihaz" value="2" note="Orman kutusu ve alıcı">
          <IcoPhone />
        </Metric>
        <Metric tone="is-blue" title="Sıcaklık" value={tempLabel} note={loading ? "Okunuyor" : ageLabel}>
          <IcoTemp />
        </Metric>
        <Metric
          tone={warnCount ? "is-warn" : "is-moss"}
          title="Uyarılar"
          value={String(warnCount)}
          note={notes.length ? "Gönderilen bildirim" : "Eşik geçen paket"}
        >
          <IcoWarn />
        </Metric>
        <Metric tone="is-moss" title="Kaplama durumu" value={`%${coat.pct}`} note={coatNote}>
          <IcoShield />
        </Metric>
        <Metric tone="is-bark" title="RSSI değeri" value={loading ? "-" : rssiLabel(latest)} note="LoRa paket alanı">
          <IcoRssi />
        </Metric>
      </section>

      <section className="ops-mid">
        <article className="ops-card">
          <header className="ops-card-h">
            <div>
              <h2>Sıcaklık grafiği</h2>
              <p>Son 24 saatlik sıcaklık değişimi</p>
            </div>
          </header>
          <TempChart rows={rows} loading={loading} />
        </article>
        <article className="ops-card">
          <header className="ops-card-h">
            <h2>Harita</h2>
          </header>
          <div className="ops-map">
            <Suspense fallback={<p className="ops-empty">Harita yükleniyor.</p>}>
              <MapCard lat={latest?.lat} lon={latest?.lon} gps={latest?.gps} heading={false} />
            </Suspense>
          </div>
        </article>
      </section>

      <section className="ops-bot">
        <article className="ops-card">
          <header className="ops-card-h">
            <div>
              <h2>Son uyarılar</h2>
              <p>
                {notesErr
                  ? "Bildirimler okunamadı. Eşik geçen paketler gösterilir."
                  : notes.length
                    ? "ntfy konusuna düşen gönderiler."
                    : packetAlerts.length
                      ? "Konuya düşen bildirim yok. Eşik geçen paketler."
                      : "Gönderilmiş bildirim yok."}
              </p>
            </div>
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
            <div>
              <h2>Kaplama durumu</h2>
              <p>Karışım 3 ayda bir yenilenir. Çubuk kalan süreye göredir.</p>
            </div>
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
