import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { hasConsent, readConsent, writeConsent } from "./consentStore.js";
import { useLang } from "./lang.js";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800&family=Figtree:wght@400;800&family=IBM+Plex+Mono:wght@400;800&display=swap";

function loadFonts() {
  if (document.getElementById("aog-fonts")) return;
  const pre1 = document.createElement("link");
  pre1.rel = "preconnect";
  pre1.href = "https://fonts.googleapis.com";
  pre1.id = "aog-fonts-pre-1";
  const pre2 = document.createElement("link");
  pre2.rel = "preconnect";
  pre2.href = "https://fonts.gstatic.com";
  pre2.crossOrigin = "anonymous";
  pre2.id = "aog-fonts-pre-2";
  const sheet = document.createElement("link");
  sheet.rel = "stylesheet";
  sheet.href = FONT_HREF;
  sheet.id = "aog-fonts";
  document.head.append(pre1, pre2, sheet);
}

function dropFonts() {
  for (const id of ["aog-fonts", "aog-fonts-pre-1", "aog-fonts-pre-2"]) {
    document.getElementById(id)?.remove();
  }
}

export function FontConsent() {
  useEffect(() => {
    const sync = () => {
      if (hasConsent("fonts")) loadFonts();
      else dropFonts();
    };
    sync();
    window.addEventListener("aog-consent", sync);
    return () => window.removeEventListener("aog-consent", sync);
  }, []);
  return null;
}

export function CookieBanner() {
  const titleId = useId();
  const { copy } = useLang();
  const c = copy.cookie;
  const [open, setOpen] = useState(() => !readConsent().decided);
  const [fonts, setFonts] = useState(() => hasConsent("fonts"));
  const [map, setMap] = useState(() => hasConsent("map"));

  useEffect(() => {
    const reopen = () => {
      const row = readConsent();
      setFonts(row.fonts);
      setMap(row.map);
      setOpen(true);
    };
    window.addEventListener("aog-consent-open", reopen);
    return () => window.removeEventListener("aog-consent-open", reopen);
  }, []);

  if (!open) return null;

  function save(nextFonts, nextMap) {
    writeConsent({ fonts: nextFonts, map: nextMap });
    setFonts(nextFonts);
    setMap(nextMap);
    setOpen(false);
  }

  return (
    <aside className="cookie-bar" role="region" aria-labelledby={titleId}>
      <div className="cookie-bar-copy">
        <p id={titleId}>{c.title}</p>
        <p>
          {c.body}{" "}
          <Link to="/gizlilik">{copy.legal.gizlilik}</Link>
          {" · "}
          <Link to="/cerezler">{copy.legal.cerezler}</Link>
        </p>
        <fieldset className="cookie-picks">
          <legend>{c.optional}</legend>
          <label htmlFor="aog-cookie-fonts">
            <input
              id="aog-cookie-fonts"
              type="checkbox"
              checked={fonts}
              onChange={(e) => setFonts(e.target.checked)}
            />
            {c.fonts}
          </label>
          <label htmlFor="aog-cookie-map">
            <input
              id="aog-cookie-map"
              type="checkbox"
              checked={map}
              onChange={(e) => setMap(e.target.checked)}
            />
            {c.map}
          </label>
        </fieldset>
      </div>
      <p className="nav-auth cookie-bar-hits">
        <button type="button" className="hit ghost" onClick={() => save(false, false)}>
          {c.reject}
        </button>
        <button type="button" className="hit ghost" onClick={() => save(fonts, map)}>
          {c.save}
        </button>
        <button type="button" className="hit" onClick={() => save(true, true)}>
          {c.accept}
        </button>
      </p>
    </aside>
  );
}
