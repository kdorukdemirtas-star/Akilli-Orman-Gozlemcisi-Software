import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shell } from "./SiteNav.jsx";
import { STATION_ID } from "./config.js";
import { supabase } from "./supabase.js";
import {
  ALARM_MODES,
  addPlugin,
  pluginAdded,
  readPlugins,
  removePlugin,
  writePlugins,
} from "./pluginStore.js";
import "./site.css";
import "./makine.css";

const MODE_LABEL = {
  sabit: "Sabit",
  takvim: "Takvim",
  yalniz_ml: "Yalnız skor",
};

function scoreLabel(live) {
  if (live.score == null) return "—";
  return live.score.toLocaleString("tr-TR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function scoreState(live) {
  if (live.model === "logreg-wait") return "bekliyor";
  if (live.model === "logreg") return "eğitildi";
  if (live.score == null) return "yok";
  return "";
}

export default function Makine({ product = "software" }) {
  const [plug, setPlug] = useState(() => readPlugins());
  const [note, setNote] = useState("");
  const [live, setLive] = useState({ score: null, model: "" });
  const on = pluginAdded(plug, "ml");

  useEffect(() => {
    let ignore = false;
    supabase
      .from("scores")
      .select("score,model")
      .eq("station_id", STATION_ID)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (ignore || error || !data?.[0]) return;
        const n = Number(data[0].score);
        setLive({
          score: Number.isFinite(n) ? n : 0,
          model: String(data[0].model || ""),
        });
      });
    return () => {
      ignore = true;
    };
  }, []);

  function commit(patch) {
    const next = writePlugins({ commissionedAt: plug.commissionedAt, ...patch });
    setPlug(next);
    setNote("Kaydedildi.");
  }

  function saveDate(e) {
    e.preventDefault();
    commit({ commissionedAt: String(plug.commissionedAt || "").slice(0, 32) });
  }

  return (
    <Shell product={product}>
      <article className="coat-page ml-page">
        <header className="ml-head">
          <h1>Makine öğrenmesi</h1>
        </header>

        <section className="ml-set" aria-labelledby="ml-set-title">
          <h2 id="ml-set-title">Ayar</h2>

          <div className="ml-field">
            <span>Eklenti</span>
            {on ? (
              <button
                type="button"
                className="hit ghost"
                onClick={() => {
                  setPlug(removePlugin("ml"));
                  setNote("Kapandı.");
                }}
              >
                Kapat
              </button>
            ) : (
              <button
                type="button"
                className="hit"
                onClick={() => {
                  setPlug(addPlugin("ml"));
                  setNote("Açıldı.");
                }}
              >
                Aç
              </button>
            )}
          </div>

          <div className="ml-field">
            <span id="ml-alarm-label">Alarm</span>
            <div className="ml-kips" role="group" aria-labelledby="ml-alarm-label">
              {ALARM_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  disabled={!on}
                  aria-pressed={on && plug.alarmMode === mode}
                  className={on && plug.alarmMode === mode ? "is-on" : undefined}
                  onClick={() => on && commit({ alarmMode: mode })}
                >
                  {MODE_LABEL[mode]}
                </button>
              ))}
            </div>
          </div>

          {on && plug.alarmMode === "takvim" ? (
            <form className="ml-field ml-date" onSubmit={saveDate}>
              <label htmlFor="commissioned-at">Kurulu gün</label>
              <input
                id="commissioned-at"
                name="kurulu"
                type="date"
                value={String(plug.commissionedAt || "").slice(0, 10)}
                onChange={(e) => setPlug({ ...plug, commissionedAt: e.target.value })}
              />
              <button type="submit" className="hit ghost">
                Kaydet
              </button>
            </form>
          ) : null}

          <div className="ml-field">
            <span>Skor</span>
            <p className="ml-score">
              <b>{scoreLabel(live)}</b>
              {scoreState(live) ? <span>{scoreState(live)}</span> : null}
            </p>
          </div>
        </section>

        {note ? (
          <p className="ml-note" role="status">
            {note}
          </p>
        ) : null}

        <nav className="coat-next" aria-label="Sonraki adım">
          <Link className="fold-go" to="/dashboard">
            Panoyu aç
          </Link>
        </nav>
      </article>
    </Shell>
  );
}
