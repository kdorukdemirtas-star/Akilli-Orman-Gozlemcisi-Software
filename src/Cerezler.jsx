import { Link } from "react-router-dom";
import { openConsentPanel } from "./consentStore.js";
import { COOKIE_INTRO, COOKIE_ROWS, NOTICE_DATE } from "./privacyCopy.js";
import { LegalTable } from "./legalUi.jsx";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

const COOKIE_COLUMNS = [
  { key: "name", label: "Ad" },
  { key: "kind", label: "Tür" },
  { key: "why", label: "Neden" },
  { key: "keep", label: "Süre" },
];

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
        <dl className="legal-meta">
          <dt>Güncelleme</dt>
          <dd>{NOTICE_DATE}</dd>
        </dl>
        {COOKIE_INTRO.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <LegalTable
          caption="Çerez ve benzeri aktarımlar"
          columns={COOKIE_COLUMNS}
          rows={COOKIE_ROWS}
        />
        <section id="geri-cekme">
          <h2>Rızayı geri çekme</h2>
          <p>
            İsteğe bağlı yazı tipi ve harita tercihini aşağıdaki düğmeden açarsın. Reddetmek
            zorunlu çerezleri silmez; Clerk oturumu çıkış veya hesap silme ile düşer.
          </p>
          <p className="nav-auth">
            <button type="button" className="hit" onClick={() => openConsentPanel()}>
              Çerezleri aç
            </button>
            <Link className="hit ghost" to="/gizlilik">
              Gizlilik
            </Link>
          </p>
        </section>
      </article>
    </Shell>
  );
}
