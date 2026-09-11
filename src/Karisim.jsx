import { Link } from "react-router-dom";
import { useLang } from "./lang.js";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

function CoatIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "leaf" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M5 13c6-9 14-9 14-9s0 8-6 14c-4 4-9 2-9 2s1-3 1-7zM8 16l7-7"
        />
      ) : null}
      {name === "shield" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M12 3l8 3v6c0 5-3.2 8.2-8 10-4.8-1.8-8-5-8-10V6z"
        />
      ) : null}
      {name === "fire" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M12 3s4 4.2 4 8a4 4 0 1 1-8 0c0-2.4 1.4-4.6 4-8z"
        />
      ) : null}
      {name === "clock" ? (
        <>
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M12 8v5l3 2" />
        </>
      ) : null}
      {name === "brush" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M14 4l6 6-8 8H6v-6zM6 18l-2 3"
        />
      ) : null}
      {name === "beaker" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M8 4h8M9 4v5L5 18a3 3 0 0 0 2.6 4h8.8A3 3 0 0 0 19 18L15 9V4"
        />
      ) : null}
    </svg>
  );
}

function MixMark({ mark }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {mark === "aloe" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          d="M32 54V18M22 50c2-14 8-26 10-32 2 6 8 18 10 32M16 44c6-8 12-12 16-14 4 2 10 6 16 14"
        />
      ) : null}
      {mark === "ash" ? (
        <>
          <path fill="none" stroke="currentColor" strokeWidth="2.4" d="M18 42h28l-4 10H22z" />
          <circle cx="26" cy="28" r="3" fill="currentColor" />
          <circle cx="34" cy="22" r="4" fill="currentColor" />
          <circle cx="42" cy="30" r="2.5" fill="currentColor" />
        </>
      ) : null}
      {mark === "shell" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          d="M16 36c4-12 12-18 16-18s12 6 16 18c-4 10-12 14-16 14s-12-4-16-14z"
        />
      ) : null}
      {mark === "gum" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          d="M24 18c8-8 22 0 18 12-2 6-8 8-10 14 8-2 16 4 12 12-8 8-24 2-22-10 1-6 8-8 10-14-8 1-14-6-8-14z"
        />
      ) : null}
    </svg>
  );
}

export default function Karisim({ product = "demo" }) {
  const { copy } = useLang();
  const k = copy.karisim;
  return (
    <Shell product={product}>
      <article className="coat-page">
        <header className="coat-hero">
          <div className="coat-hero-copy">
            <p className="coat-badge">
              <CoatIcon name="leaf" />
              {k.badge}
            </p>
            <h1>{k.h1}</h1>
            <p>{k.lede}</p>
          </div>
          <figure className="coat-stage coat-stage-log" aria-label={k.stage}>
            <img
              className="coat-log-photo"
              src="/karisim/coat-log.jpg"
              width="720"
              height="1400"
              alt={k.logAlt}
            />
            <div className="coat-log-side">
              <ul>
                {k.parts.map((part) => (
                  <li key={part.short}>{part.short}</li>
                ))}
              </ul>
            </div>
          </figure>
        </header>

        <ul className="coat-gains">
          {k.gains.map((gain) => (
            <li key={gain.title}>
              <span className="coat-ico">
                <CoatIcon name={gain.icon} />
              </span>
              <strong>{gain.title}</strong>
              <span>{gain.body}</span>
            </li>
          ))}
        </ul>

        <section className="coat-block" aria-labelledby="mix-title">
          <h2 id="mix-title">
            <CoatIcon name="leaf" />
            {k.partsTitle}
          </h2>
          <ul className="coat-parts">
            {k.parts.map((part) => (
              <li key={part.name} className={`is-${part.mark}`}>
                <span className="coat-orb">
                  <MixMark mark={part.mark} />
                </span>
                <strong>{part.name}</strong>
                <span>{part.role}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="coat-block" aria-labelledby="how-title">
          <h2 id="how-title">{k.howTitle}</h2>
          <ol className="coat-steps">
            {k.steps.map((step, index) => (
              <li key={step.title}>
                <span className="coat-ico">
                  <CoatIcon name={step.icon} />
                </span>
                <b>
                  {index + 1}. {step.title}
                </b>
                <span>{step.body}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="coat-block" aria-labelledby="lab-title">
          <h2 id="lab-title">
            <CoatIcon name="beaker" />
            {k.labTitle}
          </h2>
          <div className="coat-lab">
            <ul className="coat-temps">
              {k.temps.map((temp) => (
                <li key={temp.label}>
                  <strong>{temp.value}</strong>
                  <span>{temp.label}</span>
                </li>
              ))}
            </ul>
            <blockquote>
              <p>{k.labBody}</p>
              <p>
                {k.labLead} <Link to="/analizler">{copy.nav.analizler}</Link> {k.labTail}
              </p>
            </blockquote>
          </div>
          <p className="coat-cap">{k.labCap}</p>
        </section>

        <div className="coat-close">
          <p className="coat-banner">{k.banner}</p>
          <nav className="coat-next" aria-label={k.next}>
            <Link className="fold-go" to="/analizler">
              {k.nextLabs}
            </Link>
            <Link className="fold-go is-ghost" to="/dashboard">
              {k.nextBoard}
            </Link>
          </nav>
        </div>
      </article>
    </Shell>
  );
}
