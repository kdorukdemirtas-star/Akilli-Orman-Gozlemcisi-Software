import { useState } from "react";
import { Link } from "react-router-dom";
import { SignInButton, useUser } from "@clerk/react";
import { exportPersonalData, wipePersonalData } from "./accountData.js";
import { useClerkFlag } from "./clerkFlag.js";
import { CONTROLLER, PRIVACY_SECTIONS } from "./privacyCopy.js";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

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
        Hesap okunuyor.
      </p>
    );
  }
  if (!isSignedIn) {
    return (
      <p className="nav-auth">
        <SignInButton mode="modal">
          <button type="button" className="hit ghost">
            Giriş
          </button>
        </SignInButton>
        Haklar için giriş gerekir.
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
        {PRIVACY_SECTIONS.map((row) => (
          <section key={row.id} id={row.id}>
            <h2>{row.title}</h2>
            <p>{row.body}</p>
          </section>
        ))}
        <section id="basvuru">
          <h2>Başvuru</h2>
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
