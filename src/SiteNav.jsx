import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { isStandaloneDisplay } from "./pwa.js";

const SPECS = [
  { href: "/moduller#govde", label: "IP-67 Alüminyum kutu" },
  { href: "/moduller#max6675", label: "MAX6675 sıcaklık" },
  { href: "/moduller#gps", label: "NEO GPS" },
  { href: "/moduller#mq9", label: "MQ-9 gaz" },
  { href: "/moduller#flame", label: "Kızılötesi alev" },
  { href: "/moduller#lora", label: "Ra-02 LoRa" },
];

export const DESKTOP_TABS = [
  { to: "/", label: "Ana", end: true },
  { to: "/moduller", label: "Modüller" },
  { to: "/sistem", label: "Sistem" },
  { to: "/karisim", label: "Karışım" },
  { to: "/analizler", label: "Analizler" },
  { to: "/dashboard", label: "Pano" },
  { to: "/cihaz", label: "Cihaz" },
];

const OVERLAY_LINKS = [
  { to: "/", label: "Ana", tone: "tone-box" },
  { to: "/moduller", label: "Modüller", tone: "tone-sys" },
  { to: "/sistem", label: "Sistem", tone: "tone-sys" },
  { to: "/karisim", label: "Karışım", tone: "tone-mix" },
  { to: "/analizler", label: "Analizler", tone: "tone-lab" },
  { to: "/dashboard", label: "Pano", tone: "tone-pan" },
  { to: "/cihaz", label: "Cihaz", tone: "tone-dev" },
];

function TabLinks({ tabs, onPick }) {
  return tabs.map((tab) => (
    <NavLink
      key={tab.to}
      to={tab.to}
      end={tab.end}
      className={({ isActive }) => (isActive ? "is-on" : undefined)}
      onClick={onPick}
    >
      {tab.label}
    </NavLink>
  ));
}

export function SiteNav({ product = "demo" }) {
  const dialogRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(
      isStandaloneDisplay({
        displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
        iosStandalone: Boolean(window.navigator.standalone),
      }),
    );
  }, []);

  const tabs = standalone ? DESKTOP_TABS.filter((tab) => tab.to !== "/cihaz") : DESKTOP_TABS;
  const overlay = standalone ? OVERLAY_LINKS.filter((item) => item.to !== "/cihaz") : OVERLAY_LINKS;

  useEffect(() => {
    return () => {
      try {
        dialogRef.current?.close();
      } catch {
        /* already closed */
      }
    };
  }, []);

  function openMenu() {
    try {
      const d = dialogRef.current;
      if (d && !d.open) d.showModal();
    } catch {
      /* already open */
    }
    setMenuOpen(true);
  }

  function closeMenu() {
    try {
      const d = dialogRef.current;
      if (d?.open) d.close();
    } catch {
      /* already closed */
    }
    setMenuOpen(false);
  }

  return (
    <>
      <a className="skip" href="#icerik">
        İçeriğe atla
      </a>
      <header className="hud">
        <Link className="brand" to="/" aria-label="Akıllı Orman Gözlemcisi ana sayfası">
          <img src="/logo.png" alt="AOG" width="240" height="44" />
        </Link>
        <nav className="hud-tabs" aria-label="Sayfalar">
          <TabLinks tabs={tabs} />
        </nav>
        <div className="hud-end">
          <button
            type="button"
            className="hex"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={openMenu}
          >
            <span className="hex-face">Menü</span>
          </button>
        </div>
      </header>
      <dialog
        ref={dialogRef}
        id="site-menu"
        className="nav-dialog"
        aria-labelledby="nav-title"
        onClose={() => setMenuOpen(false)}
      >
        <div className="nav-sheet">
          <div className="nav-hud">
            <Link className="brand" to="/" onClick={closeMenu} aria-label="Ana sayfa">
              <img src="/logo.png" alt="" width="240" height="44" />
            </Link>
            <button type="button" className="hex" onClick={closeMenu} aria-label="Menüyü kapat">
              <span className="hex-face">Kapat</span>
            </button>
          </div>
          <div className="nav-body">
            <h2 id="nav-title" className="visually-hidden">
              Site menüsü
            </h2>
            <ul className="nav-primary">
              {overlay.map((item) => (
                <li key={item.to}>
                  <Link className={item.tone} to={item.to} onClick={closeMenu}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="nav-specs">
              {SPECS.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} onClick={closeMenu}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="nav-foot">
            <span>
              {product === "software" ? "Yazılım, QR eşleme" : "Akıllı Orman Gözlemcisi"}
            </span>
          </div>
        </div>
      </dialog>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-end">
      <span>Defenders Of Green</span>
      <span>Akıllı Orman Gözlemcisi</span>
      <span>TEKNOFEST 2026</span>
    </footer>
  );
}

export function Shell({ product, children, footer = true }) {
  const location = useLocation();

  // Layout effect: these attributes change padding and the scroll container,
  // so they must land before paint or the page jumps on every route change.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const onBoard =
      location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/pair");
    root.dataset.chrome = "tabs";
    root.dataset.surface = onBoard ? "ha" : "market";
    const standalone = isStandaloneDisplay({
      displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
      iosStandalone: Boolean(window.navigator.standalone),
    });
    root.dataset.display = standalone ? "standalone" : "browser";
    const theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.setAttribute("content", onBoard ? "#e4ece0" : "#e8f0e4");
    return () => {
      delete root.dataset.chrome;
      delete root.dataset.surface;
      delete root.dataset.display;
    };
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <SiteNav product={product} />
      <main className="view-pane" id="icerik">
        {children}
        {footer ? <SiteFooter /> : null}
      </main>
    </div>
  );
}
