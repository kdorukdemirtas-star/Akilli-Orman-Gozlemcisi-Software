import { useState } from "react";
import { Link } from "react-router-dom";
import { Shell } from "./SiteNav.jsx";
import { useLang } from "./lang.js";
import {
  PLUGIN_CATALOG,
  addPlugin,
  pluginAdded,
  readPlugins,
  removePlugin,
  writePlugins,
} from "./pluginStore.js";
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

export default function Eklentiler({ product = "software" }) {
  const { copy } = useLang();
  const e = copy.eklenti;
  const plugCopy = e.plugins || {};
  const [plug, setPlug] = useState(() => readPlugins());
  const [note, setNote] = useState("");
  const idle = PLUGIN_CATALOG.filter((item) => !pluginAdded(plug, item.id));

  function save(patch) {
    const next = writePlugins(patch);
    setPlug(next);
    setNote(e.kaydedildi);
  }

  function add(id) {
    const next = addPlugin(id);
    setPlug(next);
    setNote(e.eklendi);
  }

  function remove(id) {
    const next = removePlugin(id);
    setPlug(next);
    setNote(e.cikarildi);
  }

  function saveHop(ev) {
    ev.preventDefault();
    save({ hopNote: String(plug.hopNote || "").trim().slice(0, 80) });
  }

  return (
    <Shell product={product}>
      <article className="coat-page">
        <header className="coat-hero">
          <div className="coat-hero-copy">
            <p className="coat-badge">
              <PlugIcon name="chip" />
              {e.badge}
            </p>
            <h1>{e.h1}</h1>
          </div>
        </header>

        <ul className="coat-parts plug-list">
          {pluginAdded(plug, "hop") ? (
            <li>
              <span className="coat-ico">
                <PlugIcon name="radio" />
              </span>
              <strong>{plugCopy.hop?.title || "Mesh sistemi"}</strong>
              <form className="plug-actions topic-row" onSubmit={saveHop}>
                <button
                  type="button"
                  className={plug.hopOn ? "hit" : "hit ghost"}
                  aria-pressed={plug.hopOn}
                  onClick={() => save({ hopOn: !plug.hopOn })}
                >
                  {plug.hopOn ? e.acik : e.kapali}
                </button>
                <label className="visually-hidden" htmlFor="hop-note">
                  {e.macNote}
                </label>
                <input
                  id="hop-note"
                  value={plug.hopNote}
                  onChange={(ev) => setPlug({ ...plug, hopNote: ev.target.value })}
                  placeholder={e.macPlaceholder}
                  autoComplete="off"
                  spellCheck="false"
                />
                <button type="submit" className="hit ghost">
                  {e.notuYaz}
                </button>
                <button type="button" className="hit ghost" onClick={() => remove("hop")}>
                  {e.cikar}
                </button>
              </form>
            </li>
          ) : null}
          {pluginAdded(plug, "pi") ? (
            <li>
              <span className="coat-ico">
                <PlugIcon name="chip" />
              </span>
              <strong>{plugCopy.pi?.title || "Asistan"}</strong>
              <div className="plug-actions">
                <Link className="hit" to="/asistan">
                  {e.asistanAc}
                </Link>
                <button type="button" className="hit ghost" onClick={() => remove("pi")}>
                  {e.cikar}
                </button>
              </div>
            </li>
          ) : null}
          {pluginAdded(plug, "ml") ? (
            <li>
              <span className="coat-ico">
                <PlugIcon name="alert" />
              </span>
              <strong>{plugCopy.ml?.title || "Makine öğrenmesi"}</strong>
              <div className="plug-actions">
                <Link className="hit" to="/makine">
                  {e.ayar}
                </Link>
                <button type="button" className="hit ghost" onClick={() => remove("ml")}>
                  {e.cikar}
                </button>
              </div>
            </li>
          ) : null}
        </ul>

        {idle.length ? (
          <ul className="coat-parts plug-list">
            {idle.map((item) => (
              <li key={item.id}>
                <span className="coat-ico">
                  <PlugIcon
                    name={item.id === "hop" ? "radio" : item.id === "pi" ? "chip" : "alert"}
                  />
                </span>
                <strong>{plugCopy[item.id]?.title || item.title}</strong>
                <div className="plug-actions">
                  {item.id === "ml" ? (
                    <Link className="hit" to="/makine">
                      {e.ayar}
                    </Link>
                  ) : (
                    <button type="button" className="hit" onClick={() => add(item.id)}>
                      {e.ekle}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {note ? <p role="status">{note}</p> : null}

        <div className="coat-close">
          <nav className="coat-next" aria-label={copy.home.next}>
            <Link className="fold-go" to="/dashboard">
              {copy.home.panoGo}
            </Link>
            <Link className="fold-go is-ghost" to="/asistan">
              {copy.nav.asistan}
            </Link>
          </nav>
        </div>
      </article>
    </Shell>
  );
}
