import { useState } from "react";
import { Link } from "react-router-dom";
import { SignInButton, useUser } from "@clerk/react";
import { exportPersonalData, wipePersonalData } from "./accountData.js";
import { clerkAppearance, useClerkFlag } from "./clerkFlag.js";
import {
  CONTROLLER,
  DATA_ROWS,
  NOTICE_DATE,
  PRIVACY_SECTIONS,
  PROCESSOR_ROWS,
} from "./privacyCopy.js";
import { LegalSection, LegalTable } from "./legalUi.jsx";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

const DATA_COLUMNS = [
  { key: "category", label: "Kategori" },
  { key: "examples", label: "Örnek" },
  { key: "purpose", label: "Amaç" },
  { key: "basis", label: "Hukuki sebep" },
  { key: "keep", label: "Saklama" },
];

const PROCESSOR_COLUMNS = [
  { key: "name", label: "İşleyen" },
  { key: "job", label: "Ne" },
  { key: "where", label: "Nerede" },
  { key: "note", label: "Not" },
];

function downloadDump(userId) {
  const blob = new Blob([JSON.stringify(exportPersonalData(userId), null, 2)], {
    type: "application/json",
  });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = "aog-kvkk-verilerim.json";
  a.click();
  URL.revokeObjectURL(href);
}

function SignedRights() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [note, setNote] = useState("");
  if (!isLoaded) {
    return (
      <p className="boot" role="status">
        Hesap okunuyor…
      </p>
    );
  }
  if (!isSignedIn) {
    return (
      <p className="nav-auth">
        <SignInButton mode="modal" appearance={clerkAppearance}>
          <button type="button" className="hit ghost">
            Giriş
          </button>
        </SignInButton>
        İndirme ve silme için giriş gerekir. Soru için GitHub deposu yeter.
      </p>
    );
  }

  async function eraseChat() {
    wipePersonalData(user.id);
    setNote("Bu hesaba yazılmış sohbet bu tarayıcıdan silindi.");
  }

  async function eraseAccount() {
    const ok = window.confirm(
      "Clerk hesabı ve bu tarayıcıdaki sohbet silinir. İstasyon bağını da kaybedersin.",
    );
    if (!ok) return;
    wipePersonalData(user.id);
    try {
      await user.delete();
      setNote("Hesap silindi.");
    } catch {
      setNote("Hesap Clerk penceresinden silinir. Sağ üstteki profilden dene.");
    }
  }

  return (
    <div className="legal-hits">
      <p>Sohbetler hesaba yazılır. Başka hesabın sohbeti bu tarayıcıda görünmez.</p>
      <p className="nav-auth">
        <button type="button" className="hit ghost" onClick={() => downloadDump(user.id)}>
          Verilerimi indir
        </button>
        <button type="button" className="hit ghost" onClick={eraseChat}>
          Sohbeti sil
        </button>
        <button type="button" className="hit" onClick={eraseAccount}>
          Hesabı sil
        </button>
      </p>
      {note ? <p role="status">{note}</p> : null}
    </div>
  );
}

function DataRights() {
  if (!useClerkFlag()) {
    return <p>Hesap kapalıyken bu tarayıcıda Clerk verisi yoktur.</p>;
  }
  return <SignedRights />;
}

export default function Gizlilik() {
  return (
    <Shell product="software">
      <article className="coat-page legal-page">
        <header className="coat-hero">
          <div className="coat-hero-copy">
            <h1>Gizlilik</h1>
            <p>
              {CONTROLLER.product} için 6698 sayılı KVKK aydınlatma metni. GDPR (AB) ve ABD
              satış yasağı aynı metindedir.
            </p>
          </div>
        </header>
        <dl className="legal-meta">
          <dt>Güncelleme</dt>
          <dd>{NOTICE_DATE}</dd>
          <dt>Veri sorumlusu</dt>
          <dd>{CONTROLLER.name}</dd>
          <dt>Ürün</dt>
          <dd>{CONTROLLER.product}</dd>
          <dt>Başvuru</dt>
          <dd>
            Bu sayfadaki haklar ·{" "}
            <a href={CONTROLLER.github}>GitHub</a>
          </dd>
        </dl>
        <nav className="legal-toc" aria-labelledby="legal-toc-label">
          <p id="legal-toc-label">İçindekiler</p>
          <ol>
            {PRIVACY_SECTIONS.map((row) => (
              <li key={row.id}>
                <a href={`#${row.id}`}>{row.title}</a>
              </li>
            ))}
            <li>
              <a href="#basvuru">Başvuru</a>
            </li>
          </ol>
        </nav>
        {PRIVACY_SECTIONS.map((row) => (
          <LegalSection
            key={row.id}
            id={row.id}
            title={row.title}
            paragraphs={row.paragraphs}
            list={row.list}
          >
            {row.id === "neden" ? (
              <LegalTable
                caption="İşlenen kişisel veri kategorileri"
                columns={DATA_COLUMNS}
                rows={DATA_ROWS}
              />
            ) : null}
            {row.id === "aktarim" ? (
              <LegalTable
                caption="İşleyenler ve aktarım"
                columns={PROCESSOR_COLUMNS}
                rows={PROCESSOR_ROWS}
              />
            ) : null}
          </LegalSection>
        ))}
        <section id="basvuru">
          <h2>Başvuru</h2>
          <p>
            KVKK md. 13 başvurusu bu araçlarla veya GitHub üzerinden yapılır. Cevap süresi 30
            gündür.
          </p>
          <DataRights />
          <p>
            <Link to="/cerezler">Çerez bildirimi</Link>
            {" · "}
            <a href={CONTROLLER.github}>GitHub</a>
          </p>
        </section>
      </article>
    </Shell>
  );
}
