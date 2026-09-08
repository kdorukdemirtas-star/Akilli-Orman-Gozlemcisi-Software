import { Link } from "react-router-dom";
import {
  PLUGIN_CATALOG,
  addPlugin,
  pluginAdded,
  removePlugin,
  writePlugins,
} from "./pluginStore.js";

export function BoardPlugins({ plug, onChange }) {
  const idle = PLUGIN_CATALOG.filter((item) => !pluginAdded(plug, item.id));

  function commit(next) {
    onChange(next);
  }

  function add(id) {
    commit(addPlugin(id));
  }

  function remove(id) {
    commit(removePlugin(id));
  }

  return (
    <article className="ops-card">
      <header className="ops-card-h">
        <h2>Eklentiler</h2>
      </header>

      {pluginAdded(plug, "hop") ? (
        <div className="ops-plug">
          <div>
            <strong>Mesh sistemi</strong>
          </div>
          <div className="ops-plug-actions">
            <button
              type="button"
              className={plug.hopOn ? "ops-btn" : "ops-btn ghost"}
              aria-pressed={plug.hopOn}
              onClick={() => commit(writePlugins({ hopOn: !plug.hopOn }))}
            >
              {plug.hopOn ? "Açık" : "Kapalı"}
            </button>
            <button type="button" className="ops-btn ghost" onClick={() => remove("hop")}>
              Çıkar
            </button>
          </div>
        </div>
      ) : null}

      {pluginAdded(plug, "pi") ? (
        <div className="ops-plug">
          <div>
            <strong>Asistan</strong>
          </div>
          <div className="ops-plug-actions">
            <Link className="ops-btn" to="/asistan">
              Asistanı aç
            </Link>
            <button type="button" className="ops-btn ghost" onClick={() => remove("pi")}>
              Çıkar
            </button>
          </div>
        </div>
      ) : null}

      {pluginAdded(plug, "ml") ? (
        <div className="ops-plug">
          <div>
            <strong>Makine öğrenmesi</strong>
          </div>
          <div className="ops-plug-actions">
            <Link className="ops-btn" to="/makine">
              Ayar sayfası
            </Link>
            <button type="button" className="ops-btn ghost" onClick={() => remove("ml")}>
              Çıkar
            </button>
          </div>
        </div>
      ) : null}

      {idle.length ? (
        <ul className="ops-plug-idle">
          {idle.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              {item.id === "ml" ? (
                <Link className="ops-btn" to="/makine">
                  Ayar sayfası
                </Link>
              ) : (
                <button type="button" className="ops-btn" onClick={() => add(item.id)}>
                  Ekle
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
