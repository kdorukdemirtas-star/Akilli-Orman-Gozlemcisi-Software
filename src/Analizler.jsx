import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

const SAMPLES = [
  {
    id: "a",
    letter: "A",
    name: "Taze karışım",
    ftir: "/analiz/ftir-a.jpg",
    tga: "/analiz/tga-a.jpg",
    ftirAlt:
      "A grafiği: FTIR spektrumu. %T, cm⁻¹. İşaretler: 3300.90, 2148.05, 1635.24, 667.20.",
    tgaAlt:
      "A grafiği: TGA, DSC ve DTG. Sıcaklık 25-600 °C. NETZSCH STA 449F3.",
    report: "/analiz/ExpAll_A.xlsx",
    reportFile: "ExpAll_A-DATA.xlsx",
  },
  {
    id: "b",
    letter: "B",
    name: "Kaplamasız ağaç",
    ftir: "/analiz/ftir-b.jpg",
    tga: "/analiz/tga-b.jpg",
    ftirAlt:
      "B grafiği: FTIR spektrumu. %T, cm⁻¹. İşaretler: 3309.2, 1629.5, 1026.04.",
    tgaAlt:
      "B grafiği: TGA, DSC ve DTG. Sıcaklık 25-600 °C. NETZSCH STA 449F3.",
    report: "/analiz/ExpAll_B.xlsx",
    reportFile: "ExpAll_B.xlsx",
  },
  {
    id: "c",
    letter: "C",
    name: "Yeni kaplanmış ağaç",
    ftir: "/analiz/ftir-c.jpg",
    tga: "/analiz/tga-c.jpg",
    ftirAlt:
      "C grafiği: FTIR spektrumu. %T, cm⁻¹. İşaretler: 3606.3, 1507.5.",
    tgaAlt:
      "C grafiği: TGA, DSC ve DTG. Sıcaklık 25-600 °C. NETZSCH STA 449F3.",
    report: "/analiz/ExpAll_C.xlsx",
    reportFile: "ExpAll_C-DATALAR.xlsx",
  },
  {
    id: "d",
    letter: "D",
    name: "3 ay kaplanmış ağaç",
    ftir: "/analiz/ftir-d.jpg",
    tga: "/analiz/tga-d.jpg",
    ftirAlt:
      "D grafiği: FTIR spektrumu. %T, cm⁻¹. İşaretler: 2919, 1017.",
    tgaAlt:
      "D grafiği: TGA, DSC ve DTG. Sıcaklık 25-600 °C. NETZSCH STA 449F3.",
    report: "/analiz/ExpAll_D.xlsx",
    reportFile: "ExpAll_D-DATALAR.xlsx",
  },
];

const SECTIONS = [
  { id: "ftir", label: "FTIR", title: "FTIR analizi" },
  { id: "tga", label: "TGA-DSC", title: "TGA-DSC analizi" },
  { id: "raporlar", label: "Raporlar", title: "Raporlar" },
];

const NOTES = {
  ftir: "Doğal içerikli yangın geciktirici kaplamamızın kimyasal yapısını FTIR analizi ile inceliyoruz.",
  tga: "Doğal içerikli yangın geciktirici kaplamamızın ısıl davranışını TGA ve DSC ile inceliyoruz.",
  raporlar: "Ham ölçüm tabloları Yıldız Teknik Üniversitesi Merkezi Araştırma Laboratuvarı çıktılarıdır.",
};

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        d="M4 18V6m0 12h16M7 14l3-4 3 2 5-7"
      />
    </svg>
  );
}

function IconFlame() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        d="M12 3s4 4.2 4 8a4 4 0 1 1-8 0c0-2.4 1.4-4.6 4-8z"
      />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        d="M8 3h6l5 5v13H8zM14 3v5h5M10 13h6M10 17h6"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M15 15l5 5" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        d="M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.18" />
      <path fill="none" stroke="currentColor" strokeWidth="2" d="M7.5 12.5l3 3 6-7" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M12 11v6M12 8h.01" />
    </svg>
  );
}

function sectionFromHash(hash) {
  const id = String(hash || "").replace(/^#/, "");
  if (id === "tga" || id === "raporlar" || id === "ftir") return id;
  return "ftir";
}

function GraphCard({ sample, src, alt, onZoom }) {
  return (
    <article className={`lab-card tone-${sample.id}`}>
      <header className="lab-card-head">
        <h2>
          <span className="lab-dot" aria-hidden="true">
            {sample.letter}
          </span>
          {sample.letter} {sample.name}
        </h2>
        <button
          type="button"
          className="lab-icon-btn"
          onClick={() => onZoom({ src, alt })}
          aria-label={`${sample.letter} ${sample.name} grafiğini büyüt`}
        >
          <IconSearch />
        </button>
      </header>
      <figure className="lab-plot">
        <img src={src} alt={alt} width={1024} height={665} />
      </figure>
    </article>
  );
}

export default function Analizler({ product = "demo" }) {
  const overlayId = useId();
  const location = useLocation();
  const navigate = useNavigate();
  const zoomRef = useRef(null);
  const [section, setSection] = useState(() => sectionFromHash(location.hash));
  const [pick, setPick] = useState("all");
  const [overlay, setOverlay] = useState(true);
  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    setSection(sectionFromHash(location.hash));
  }, [location.hash]);

  useEffect(() => {
    const dialog = zoomRef.current;
    if (!dialog) return;
    if (zoom && !dialog.open) dialog.showModal();
    if (!zoom && dialog.open) dialog.close();
  }, [zoom]);

  const visible = useMemo(
    () => (pick === "all" ? SAMPLES : SAMPLES.filter((sample) => sample.id === pick)),
    [pick],
  );

  const current = SECTIONS.find((item) => item.id === section) || SECTIONS[0];
  const stacked = overlay && section !== "raporlar" && visible.length > 1;

  function goSection(id) {
    setSection(id);
    setPick("all");
    navigate({ pathname: location.pathname, hash: id }, { replace: true });
  }

  function openZoom(next) {
    setZoom(next);
  }

  function expandAll() {
    if (section === "raporlar") return;
    openZoom({
      blend: stacked,
      stack: visible.map((sample) => ({
        src: sample[section],
        alt: sample[`${section}Alt`],
        id: sample.id,
      })),
    });
  }

  return (
    <Shell product={product}>
      <div className="lab-page">
        <div className="lab-shell">
          <aside className="lab-side">
            <p className="lab-kicker">ANALİZLER</p>
            <nav className="lab-nav" aria-label="Analiz bölümleri">
              {SECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={section === item.id ? "is-on" : undefined}
                  aria-current={section === item.id ? "page" : undefined}
                  onClick={() => goSection(item.id)}
                >
                  {item.id === "ftir" ? <IconChart /> : null}
                  {item.id === "tga" ? <IconFlame /> : null}
                  {item.id === "raporlar" ? <IconDoc /> : null}
                  {item.label}
                </button>
              ))}
            </nav>

            <section className="lab-legend" aria-labelledby="lab-legend-title">
              <h2 id="lab-legend-title">Numune açıklamaları</h2>
              <ol>
                {SAMPLES.map((sample) => (
                  <li key={sample.id} className={`tone-${sample.id}`}>
                    <span className="lab-dot" aria-hidden="true">
                      {sample.letter}
                    </span>
                    <span>
                      <b>{sample.letter}</b> {sample.name}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="lab-note">
                <IconCheck />
                {NOTES[section]}
              </p>
            </section>
          </aside>

          <div className="lab-main">
            <header className="lab-head">
              <h1>{current.title}</h1>
              {section !== "raporlar" ? (
                <div className="lab-tools">
                  <div className="lab-tabs" role="group" aria-label="Numune filtresi">
                    <button
                      type="button"
                      aria-pressed={pick === "all"}
                      className={pick === "all" ? "is-on" : undefined}
                      onClick={() => setPick("all")}
                    >
                      Tüm grafikler
                    </button>
                    {SAMPLES.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        aria-pressed={pick === sample.id}
                        className={pick === sample.id ? "is-on" : undefined}
                        onClick={() => setPick(sample.id)}
                      >
                        {sample.letter} numune
                      </button>
                    ))}
                  </div>
                  <div className="lab-tools-end">
                    <label className="lab-switch" htmlFor={overlayId}>
                      <span>Üst üste göster</span>
                      <input
                        id={overlayId}
                        type="checkbox"
                        checked={overlay}
                        onChange={(event) => setOverlay(event.target.checked)}
                      />
                    </label>
                    <button
                      type="button"
                      className="lab-icon-btn"
                      onClick={expandAll}
                      aria-label="Grafikleri genişlet"
                    >
                      <IconExpand />
                    </button>
                  </div>
                </div>
              ) : null}
            </header>

            {section === "raporlar" ? (
              <ul className="lab-reports">
                {SAMPLES.map((sample) => (
                  <li key={sample.id}>
                    <a
                      className={`lab-report tone-${sample.id}`}
                      href={sample.report}
                      download={sample.reportFile}
                    >
                      <span className="lab-dot" aria-hidden="true">
                        {sample.letter}
                      </span>
                      <span>
                        <b>
                          {sample.letter} {sample.name}
                        </b>
                        <small>{sample.reportFile}</small>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={visible.length === 1 ? "lab-grid lab-grid-one" : "lab-grid"}>
                {visible.map((sample) => (
                  <GraphCard
                    key={sample.id}
                    sample={sample}
                    src={sample[section]}
                    alt={sample[`${section}Alt`]}
                    onZoom={openZoom}
                  />
                ))}
              </div>
            )}

            <p className="lab-foot">
              <IconInfo />
              Tüm analizler Yıldız Teknik Üniversitesi Merkezi Araştırma Laboratuvarı'nda
              yapılmıştır.
            </p>
          </div>
        </div>
      </div>

      <dialog
        ref={zoomRef}
        className="lab-zoom"
        onClose={() => setZoom(null)}
        aria-label="Büyütülmüş grafik"
      >
        {zoom?.stack ? (
          <div className={zoom.blend ? "lab-stack" : "lab-zoom-list"}>
            {zoom.stack.map((item) => (
              <img key={item.id} className={`tone-${item.id}`} src={item.src} alt={item.alt} />
            ))}
          </div>
        ) : zoom ? (
          <img src={zoom.src} alt={zoom.alt} />
        ) : null}
        <form method="dialog">
          <button type="submit" className="hit">
            Kapat
          </button>
        </form>
      </dialog>
    </Shell>
  );
}
