import { Link } from "react-router-dom";
import { useLang } from "./lang.js";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

function SysIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "radio" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M5 15a7 7 0 0 1 14 0M8 16a4 4 0 0 1 8 0M12 18.5v.5M4 8l16-4"
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
      {name === "clock" ? (
        <>
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M12 8v5l3 2" />
        </>
      ) : null}
      {name === "chip" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M8 8h8v8H8zM8 5v3m8-3v3M8 16v3m8-3v3M5 8h3m8 0h3M5 16h3m8 0h3"
        />
      ) : null}
      {name === "db" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M5 7c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3zm0 0v10c0 1.7 3.1 3 7 3s7-1.3 7-3V7"
        />
      ) : null}
      {name === "bell" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M6 16h12l-1.5-7a4.5 4.5 0 0 0-9 0zM10 16v1a2 2 0 0 0 4 0v-1"
        />
      ) : null}
      {name === "flow" ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          d="M6 7h12v4H6zM6 13h12v4H6zM9 11v2m6-2v2"
        />
      ) : null}
    </svg>
  );
}

export default function Sistem({ product = "demo" }) {
  const { copy } = useLang();
  const s = copy.sistem;
  const gains = [
    { title: s.gainWifi, body: s.gainWifiBody, icon: "radio" },
    { title: s.gainFour, body: s.gainFourBody, icon: "sensor" },
    { title: s.gainAlert, body: copy.home.calendar, icon: "alert" },
    { title: s.gainDay, body: s.gainDayBody, icon: "clock" },
  ];
  const steps = [
    { title: s.step1, body: s.step1Body, icon: "sensor" },
    { title: s.step2, body: s.step2Body, icon: "chip" },
    { title: s.step3, body: s.step3Body, icon: "radio" },
    { title: s.step4, body: s.step4Body, icon: "db" },
    { title: s.step5, body: s.step5Body, icon: "alert" },
    { title: s.step6, body: s.step6Body, icon: "bell" },
  ];
  return (
    <Shell product={product}>
      <article className="coat-page">
        <header className="coat-hero">
          <div className="coat-hero-copy">
            <p className="coat-badge">
              <SysIcon name="radio" />
              {s.badge}
            </p>
            <h1>{s.h1}</h1>
            <p>{s.lede}</p>
          </div>
          <figure className="coat-stage coat-stage-flow" aria-label={s.h1}>
            <ol>
              {s.chain.map((item, index) => (
                <li key={item}>
                  <b aria-hidden="true">{index + 1}</b>
                  {item}
                </li>
              ))}
            </ol>
          </figure>
        </header>

        <ul className="coat-gains">
          {gains.map((gain) => (
            <li key={gain.title}>
              <span className="coat-ico">
                <SysIcon name={gain.icon} />
              </span>
              <strong>{gain.title}</strong>
              <span>{gain.body}</span>
            </li>
          ))}
        </ul>

        <section className="coat-block" aria-labelledby="flow-title">
          <h2 id="flow-title">
            <SysIcon name="flow" />
            {s.flowTitle}
          </h2>
          <figure className="coat-diagram">
            <img
              src="/sistem/akis.png"
              alt={s.flowAlt}
              width={900}
              height={1600}
            />
            <figcaption>{s.flowCap}</figcaption>
          </figure>
        </section>

        <section className="coat-block" aria-labelledby="how-title">
          <h2 id="how-title">{s.how}</h2>
          <ol className="coat-steps is-six">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="coat-ico">
                  <SysIcon name={step.icon} />
                </span>
                <b>
                  {index + 1}. {step.title}
                </b>
                <span>{step.body}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="coat-close">
          <p className="coat-banner">{s.close}</p>
          <nav className="coat-next" aria-label={copy.home.next}>
            <Link className="fold-go" to="/karisim">
              {s.next}
            </Link>
            <Link className="fold-go is-ghost" to="/asistan">
              {copy.home.asistan}
            </Link>
          </nav>
        </div>
      </article>
    </Shell>
  );
}
