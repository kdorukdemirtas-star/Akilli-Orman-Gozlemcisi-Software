import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SignInButton, useUser } from "@clerk/react";
import { Shell } from "./SiteNav.jsx";
import { useClerkFlag } from "./clerkFlag.js";
import { bindStationToUser, stationFromUser } from "./stationBind.js";
import { parseStation } from "./stationPair.js";
import "./site.css";

function PairBody({ wanted }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [note, setNote] = useState("");
  const bound = stationFromUser(user);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !wanted || !user) return undefined;
    if (bound === wanted) {
      setNote(`${wanted} bu hesaba bağlı.`);
      return undefined;
    }
    let ignore = false;
    bindStationToUser(user, wanted)
      .then((id) => {
        if (!ignore && id) setNote(`${id} hesaba yazıldı.`);
      })
      .catch(() => {
        if (!ignore) setNote("İstasyon yazılamadı.");
      });
    return () => {
      ignore = true;
    };
  }, [isLoaded, isSignedIn, wanted, user, bound]);

  if (!isLoaded) return <p className="boot" role="status">Hesap okunuyor.</p>;

  if (!isSignedIn) {
    return (
      <>
        <p>QR’daki kutuyu bağlamak için giriş yap.</p>
        <p>
          <SignInButton mode="modal">
            <button type="button" className="hit">
              Giriş
            </button>
          </SignInButton>
        </p>
      </>
    );
  }

  return (
    <>
      <p>{wanted ? `İstasyon: ${wanted}` : "QR’da istasyon kodu yok."}</p>
      {note ? <p role="status">{note}</p> : null}
      <p>
        <Link className="hit" to="/dashboard">
          Panoyu aç
        </Link>
      </p>
    </>
  );
}

export default function Pair({ product = "software" }) {
  const clerkOn = useClerkFlag();
  const [params] = useSearchParams();
  const wanted = parseStation(params.get("station") || params.get("s") || "");

  return (
    <Shell product={product}>
      <article className="coat-page">
        <header className="coat-hero">
          <div className="coat-hero-copy">
            <p className="coat-badge">Yazılım</p>
            <h1>Kutu eşle</h1>
            <p>
              Clerk hesabı kutunun QR kodunu tutar. localStorage tek başına
              oturum değildir.
            </p>
          </div>
        </header>
        {clerkOn ? (
          <PairBody wanted={wanted} />
        ) : (
          <p role="status">
            Clerk anahtarı yok. Pano tanıtım istasyonunu okur. Anahtarı
            VITE_CLERK_PUBLISHABLE_KEY olarak yaz.
          </p>
        )}
        <div className="coat-close">
          <nav className="coat-next" aria-label="Sonraki adım">
            <Link className="fold-go" to="/dashboard">
              Panoyu aç
            </Link>
            <Link className="fold-go is-ghost" to="/eklentiler">
              Eklentiler
            </Link>
          </nav>
        </div>
      </article>
    </Shell>
  );
}
