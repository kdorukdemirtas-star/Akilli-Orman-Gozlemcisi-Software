import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Shell } from "./SiteNav.jsx";
import { writeDevice } from "./deviceStore.js";
import { deviceKind, isStandaloneDisplay, pwaPlatform } from "./pwa.js";
import "./site.css";

function PickMark({ src, label, mark, children }) {
  return (
    <>
      <span className={mark ? `pick-mark ${mark}` : "pick-mark"}>
        {src ? <img src={src} alt="" width="72" height="72" /> : children}
      </span>
      <span className="pick-label">{label}</span>
    </>
  );
}

function PanoMark() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        d="M4 10h7V4H4zm9 10h7v-6h-7zM4 20h7v-8H4zm9-10h7V4h-7z"
      />
    </svg>
  );
}

export function Device({ product }) {
  const navigate = useNavigate();
  const { kind: kindParam } = useParams();
  const kind = deviceKind(kindParam);
  const [installEvent, setInstallEvent] = useState(null);
  const [standalone, setStandalone] = useState(false);
  const [hint, setHint] = useState("other");

  useEffect(() => {
    setStandalone(
      isStandaloneDisplay({
        displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
        iosStandalone: Boolean(window.navigator.standalone),
      }),
    );
    setHint(pwaPlatform(window.navigator.userAgent));
    function onPrompt(e) {
      e.preventDefault();
      setInstallEvent(e);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function pick(device) {
    try {
      writeDevice(device);
    } catch {
      /* private mode */
    }
    if (device === "web") {
      navigate("/dashboard");
      return;
    }
    navigate(`/cihaz/${device}`);
  }

  async function installAndroid() {
    if (!installEvent) return;
    installEvent.prompt();
    try {
      await installEvent.userChoice;
    } catch {
      /* dismissed */
    }
    setInstallEvent(null);
  }

  if (kind === "ios") {
    return (
      <Shell product={product}>
        <section className="pick-page">
          <h1>Iphone</h1>
          {standalone ? (
            <p>AOG bu Iphone'da ana ekrandan açıktır. Safari çubuğu yoktur.</p>
          ) : (
            <>
              <p>Safari'de Paylaş'a bas; Ana Ekrana Ekle'yi seç. AOG ayrı bir uygulama gibi açılır.</p>
              <ol className="pwa-steps">
                <li>Safari ile bu sayfayı aç.</li>
                <li>Paylaş</li>
                <li>Ana Ekrana Ekle</li>
              </ol>
            </>
          )}
          <div className="pick-actions">
            <Link className="hit" to="/dashboard">
              Panoyu aç
            </Link>
          </div>
        </section>
      </Shell>
    );
  }

  if (kind === "android") {
    return (
      <Shell product={product}>
        <section className="pick-page">
          <h1>Android</h1>
          {standalone ? (
            <p>AOG bu telefonda yüklüdür. Chrome çubuğu yoktur.</p>
          ) : (
            <p>Chrome menüsünden Uygulamayı yükle veya Ana ekrana ekle'yi seç. AOG ayrı bir uygulama gibi açılır.</p>
          )}
          <div className="pick-actions">
            {!standalone && installEvent ? (
              <button type="button" className="hit" onClick={installAndroid}>
                Uygulamayı yükle
              </button>
            ) : null}
            <Link className="hit ghost" to="/dashboard">
              Panoyu aç
            </Link>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell product={product}>
      <section className="pick-page">
        <h1>Hangi cihaz?</h1>
        <p>
          {hint === "ios"
            ? "Bu telefon Iphone. Safari ile ana ekrana alınır."
            : hint === "android"
              ? "Bu telefon Android. Chrome ile ana ekrana alınır."
              : "Iphone, Android veya tarayıcı. Ana ekrana ekle."}
        </p>
        <ul className="pick-list">
          <li>
            <button
              type="button"
              className={hint === "ios" ? "pick is-hint" : "pick"}
              onClick={() => pick("ios")}
            >
              <PickMark src="/brand/apple.png" label="Iphone" mark="pick-mark-apple" />
            </button>
          </li>
          <li>
            <button
              type="button"
              className={hint === "android" ? "pick is-hint" : "pick"}
              onClick={() => pick("android")}
            >
              <PickMark src="/brand/android.png" label="Android" />
            </button>
          </li>
          <li>
            <button type="button" className="pick" onClick={() => pick("web")}>
              <PickMark label="Tarayıcıda aç" mark="pick-mark-pano">
                <PanoMark />
              </PickMark>
            </button>
          </li>
        </ul>
      </section>
    </Shell>
  );
}
