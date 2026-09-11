import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MODULES } from "./catalog.js";
import { useLang } from "./lang.js";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

function Photo({ src, w, h, alt, priority, cutout, className }) {
  const cls = ["media", cutout ? "media-cutout" : null, className]
    .filter(Boolean)
    .join(" ");
  return (
    <figure className={cls}>
      <img
        src={src}
        width={w}
        height={h}
        alt={alt}
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? undefined : "lazy"}
      />
    </figure>
  );
}

function ModIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "box" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8"
        />
      ) : null}
      {name === "sensor" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M12 3v6m0 0a4 4 0 1 0 4 4h-4zm-6 14h12"
        />
      ) : null}
      {name === "alert" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M12 4l9 16H3zM12 10v5M12 17.5h.01"
        />
      ) : null}
      {name === "radio" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M5 15a7 7 0 0 1 14 0M8 16a4 4 0 0 1 8 0M12 18.5v.5M4 8l16-4"
        />
      ) : null}
      {name === "chip" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M8 8h8v8H8zM8 5v3m8-3v3M8 16v3m8-3v3M5 8h3m8 0h3M5 16h3m8 0h3"
        />
      ) : null}
      {name === "leaf" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M5 13c6-9 14-9 14-9s0 8-6 14c-4 4-9 2-9 2s1-3 1-7zM8 16l7-7"
        />
      ) : null}
    </svg>
  );
}

function Hero() {
  const { copy } = useLang();
  const h = copy.home;
  const chips = [
    { title: h.chipLora, body: h.chipLoraBody, icon: "radio" },
    { title: h.chipAlarm, body: h.chipAlarmBody, icon: "alert" },
    { title: h.chipCoat, body: h.chipCoatBody, icon: "leaf" },
  ];
  return (
    <article className="fold">
      <section className="fold-hero" aria-labelledby="hero-title">
        <div className="hero-frost" aria-hidden="true" />
        <div className="fold-copy">
          <h1 id="hero-title">
            <span className="hero-line">Akıllı Orman</span>
            <span className="hero-goz">Gözlemcisi</span>
          </h1>
          <p className="hero-slogan">{h.slogan}</p>
          <p className="fold-lede">{h.lede}</p>
          <Link className="fold-go" to="/sistem">
            {h.sisteme}
          </Link>
          <ul className="fold-chips">
            {chips.map((chip) => (
              <li key={chip.title}>
                <span className="fold-ico">
                  <ModIcon name={chip.icon} />
                </span>
                <strong>{chip.title}</strong>
                <span>{chip.body}</span>
              </li>
            ))}
          </ul>
        </div>
        <figure className="fold-shot">
          <img
            src="/fold/field.jpg"
            width="1536"
            height="1024"
            alt={h.fieldAlt}
            fetchPriority="high"
          />
        </figure>
      </section>

      <section className="fold-pair" aria-label={h.panoPair}>
        <article className="fold-card is-shot is-phone">
          <figure className="fold-phone">
            <img src="/fold/phone.jpg" width="1024" height="1536" alt={h.phoneAlt} />
          </figure>
          <ul className="fold-ticks">
            {h.panoTicks.map((tick) => (
              <li key={tick}>{tick}</li>
            ))}
          </ul>
        </article>
        <article className="fold-card is-shot">
          <Photo src="/fold/guts.jpg" w={1200} h={800} alt={h.gutsAlt} />
          <h2>{h.gutsTitle}</h2>
          <Link className="fold-go is-ghost" to="/moduller">
            {h.modsGo}
          </Link>
        </article>
      </section>

      <div className="coat-close">
        <p className="coat-banner">{h.banner}</p>
        <nav className="coat-next" aria-label={h.next}>
          <Link className="fold-go" to="/sistem">
            {h.sisteme}
          </Link>
          <Link className="fold-go is-ghost" to="/asistan">
            {h.asistan}
          </Link>
        </nav>
      </div>
    </article>
  );
}

function modsFor(copy) {
  return MODULES.map((mod) => {
    const over = copy.modules?.[mod.id];
    return over ? { ...mod, ...over } : mod;
  });
}

function Mods() {
  const { copy } = useLang();
  const h = copy.home;
  const mods = modsFor(copy);
  const gains = [
    { title: h.gainBox, body: h.gainBoxBody, icon: "box" },
    { title: h.gainFour, body: h.gainFourBody, icon: "sensor" },
    { title: h.gainAlert, body: h.calendar, icon: "alert" },
    { title: h.gainRadio, body: h.gainRadioBody, icon: "radio" },
  ];
  return (
    <article className="coat-page">
      <header className="coat-hero">
        <div className="coat-hero-copy">
          <p className="coat-badge">
            <ModIcon name="chip" />
            {h.hwBadge}
          </p>
          <h1 id="mods-title">{h.modsTitle}</h1>
          <p>{h.modsLede}</p>
        </div>
        <figure className="coat-stage coat-stage-flow" aria-label={h.modsList}>
          <ol>
            {mods.map((mod, index) => (
              <li key={mod.id}>
                <b aria-hidden="true">{index + 1}</b>
                {mod.name}
              </li>
            ))}
          </ol>
        </figure>
      </header>

      <ul className="coat-gains">
        {gains.map((gain) => (
          <li key={gain.title}>
            <span className="coat-ico">
              <ModIcon name={gain.icon} />
            </span>
            <strong>{gain.title}</strong>
            <span>{gain.body}</span>
          </li>
        ))}
      </ul>

      <section className="coat-block" aria-labelledby="mod-list-title">
        <h2 id="mod-list-title">
          <ModIcon name="box" />
          {h.modsList}
        </h2>
        <ul className="coat-mods">
          {mods.map((mod) => (
            <li key={mod.id} id={mod.id}>
              <Photo src={mod.src} alt={mod.alt} cutout={mod.cutout !== false} />
              <strong>{mod.name}</strong>
              <span>{mod.body}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="coat-close">
        <p className="coat-banner">{h.modsBanner}</p>
        <nav className="coat-next" aria-label={h.next}>
          <Link className="fold-go" to="/sistem">
            {h.flowGo}
          </Link>
          <Link className="fold-go is-ghost" to="/dashboard">
            {h.panoGo}
          </Link>
        </nav>
      </div>
    </article>
  );
}

export function Home({ product }) {
  const location = useLocation();
  const view = location.pathname === "/moduller" ? "moduller" : "ana";

  useEffect(() => {
    if (view !== "moduller") return;
    const id = location.hash.replace("#", "");
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [view, location.hash]);

  return (
    <Shell product={product}>
      {view === "ana" ? <Hero /> : null}
      {view === "moduller" ? <Mods /> : null}
    </Shell>
  );
}
