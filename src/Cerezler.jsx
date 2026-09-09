import { Link } from "react-router-dom";
import { openConsentPanel } from "./consentStore.js";
import { COOKIE_ROWS } from "./privacyCopy.js";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

export default function Cerezler() {
  return (
    <Shell product="software">
      <article className="coat-page legal-page">
        <header className="coat-hero">
          <div className="coat-hero-copy">
            <h1>Çerezler</h1>
            <p>
              6698 ve BTK çerez rehberi. Zorunlu çerezler hesap içindir. İsteğe bağlı çerez
              redde açık rıza ile aynı yerdedir.
            </p>
          </div>
        </header>
        <ul>
          {COOKIE_ROWS.map((row) => (
            <li key={row.name}>
              <strong>{row.name}</strong>
              {" · "}
              {row.kind}
              {". "}
              {row.why}
            </li>
          ))}
        </ul>
        <p className="nav-auth">
          <button type="button" className="hit" onClick={() => openConsentPanel()}>
            Çerezleri aç
          </button>
          <Link className="hit ghost" to="/gizlilik">
            Gizlilik
          </Link>
        </p>
      </article>
    </Shell>
  );
}
