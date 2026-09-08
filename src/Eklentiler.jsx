import { useState } from "react";
import { Link } from "react-router-dom";
import { Shell } from "./SiteNav.jsx";
import { ALARM_MODES, asHttpUrl, readPlugins, writePlugins } from "./pluginStore.js";
import "./site.css";

function PlugIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "radio" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M5 15a7 7 0 0 1 14 0M8 16a4 4 0 0 1 8 0M12 18.5v.5M4 8l16-4"
        />
      ) : null}
      {name === "chip" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M8 8h8v8H8zM8 5v3m8-3v3M8 16v3m8-3v3M5 8h3m8 0h3M5 16h3m8 0h3"
        />
      ) : null}
      {name === "alert" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M12 4l9 16H3zM12 10v5M12 17.5h.01"
        />
      ) : null}
    </svg>
  );
}

const MODE_LABEL = {
  sabit: "Sabit kural",
  takvim: "Takvim (12 ay)",
  yalniz_ml: "Yalnız ML",
};

export default function Eklentiler({ product = "software" }) {
  const [plug, setPlug] = useState(() => readPlugins());
  const [note, setNote] = useState("");

  function save(patch) {
    const next = writePlugins(patch);
    setPlug(next);
    setNote("Kaydedildi.");
  }

  function savePi(e) {
    e.preventDefault();
    const url = asHttpUrl(plug.piUrl);
    if (plug.piOn && !url) {
      setNote("Pi adresi http veya https olmalı.");
      return;
    }
    save({ piUrl: url });
  }

  function saveHop(e) {
    e.preventDefault();
    save({ hopNote: String(plug.hopNote || "").trim().slice(0, 80) });
  }

  function saveDate(e) {
    e.preventDefault();
    save({ commissionedAt: String(plug.commissionedAt || "").slice(0, 32) });
  }

  return (
    <Shell product={product}>
      <article className="coat-page">
        <header className="coat-hero">
          <div className="coat-hero-copy">
            <p className="coat-badge">
              <PlugIcon name="chip" />
              Yazılım
            </p>
            <h1>Eklentiler</h1>
            <p>
              Kapalı eklenti eski yolu bozmaz. Hop yoksa paket doğrudan alıcıya
              gider. Asistan kapalıysa pano sohbet açmaz. Alarm kipi Sabit kural
              iken 100 °C ve alev birlikte aranır.
            </p>
          </div>
        </header>

        <ul className="coat-parts plug-list">
          <li>
            <span className="coat-ico">
              <PlugIcon name="radio" />
            </span>
            <strong>Menzil hop</strong>
            <span>
              ESP32-S3 LoRa, kutunun 433 MHz paketini bir kez tekrarlar. Meshtastic
              köprü bu düğümdedir. Kapalıysa tek hop kalır.
            </span>
            <form className="plug-actions topic-row" onSubmit={saveHop}>
              <button
                type="button"
                className={plug.hopOn ? "hit" : "hit ghost"}
                aria-pressed={plug.hopOn}
                onClick={() => save({ hopOn: !plug.hopOn })}
              >
                {plug.hopOn ? "Açık" : "Kapalı"}
              </button>
              <label className="visually-hidden" htmlFor="hop-note">
                S3 MAC notu
              </label>
              <input
                id="hop-note"
                value={plug.hopNote}
                onChange={(e) => setPlug({ ...plug, hopNote: e.target.value })}
                placeholder="S3 MAC"
                autoComplete="off"
                spellCheck="false"
              />
              <button type="submit" className="hit ghost">
                Notu yaz
              </button>
            </form>
          </li>
          <li>
            <span className="coat-ico">
              <PlugIcon name="chip" />
            </span>
            <strong>Pi asistan</strong>
            <span>
              Raspberry Pi 5 üzerinde Qwen 3.5 0.8B. Soru-cevap yerelde kalır.
              Alarm kararı vermez.
            </span>
            <form className="plug-actions topic-row" onSubmit={savePi}>
              <button
                type="button"
                className={plug.piOn ? "hit" : "hit ghost"}
                aria-pressed={plug.piOn}
                onClick={() => save({ piOn: !plug.piOn })}
              >
                {plug.piOn ? "Açık" : "Kapalı"}
              </button>
              <label className="visually-hidden" htmlFor="pi-url">
                Pi adresi
              </label>
              <input
                id="pi-url"
                value={plug.piUrl}
                onChange={(e) => setPlug({ ...plug, piUrl: e.target.value })}
                placeholder="http://aog-pi.local:8080"
                autoComplete="off"
                spellCheck="false"
              />
              <button type="submit" className="hit ghost">
                Adresi yaz
              </button>
            </form>
          </li>
          <li>
            <span className="coat-ico">
              <PlugIcon name="alert" />
            </span>
            <strong>Alarm kipi</strong>
            <span>
              Sabit kural bugünkü AND. Takvim 2 / 6 / 10 / 12 ay kaydırır. Yalnız
              ML, Pi skoru gelmeden alarm açmaz. İstediğin an Sabit kurala dön.
            </span>
            <div className="plug-actions lab-tabs" role="group" aria-label="Alarm kipi">
              {ALARM_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={plug.alarmMode === mode}
                  className={plug.alarmMode === mode ? "is-on" : undefined}
                  onClick={() => save({ alarmMode: mode })}
                >
                  {MODE_LABEL[mode]}
                </button>
              ))}
            </div>
            <form className="plug-actions topic-row" onSubmit={saveDate}>
              <label className="visually-hidden" htmlFor="commissioned-at">
                Kurulu tarihi
              </label>
              <input
                id="commissioned-at"
                type="date"
                value={String(plug.commissionedAt || "").slice(0, 10)}
                onChange={(e) => setPlug({ ...plug, commissionedAt: e.target.value })}
              />
              <button type="submit" className="hit ghost">
                Tarihi yaz
              </button>
            </form>
          </li>
        </ul>

        {note ? <p role="status">{note}</p> : null}

        <div className="coat-close">
          <nav className="coat-next" aria-label="Sonraki adım">
            <Link className="fold-go" to="/dashboard">
              Panoyu aç
            </Link>
            {plug.piOn ? (
              <Link className="fold-go is-ghost" to="/asistan">
                Asistan
              </Link>
            ) : (
              <Link className="fold-go is-ghost" to="/sistem">
                Sistemi incele
              </Link>
            )}
          </nav>
        </div>
      </article>
    </Shell>
  );
}
