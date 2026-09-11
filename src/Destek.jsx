import { CONTROLLER } from "./privacyCopy.js";
import { useLang } from "./lang.js";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

export default function Destek() {
  const { copy } = useLang();
  return (
    <Shell product="software">
      <article className="coat-page legal-page">
        <header className="coat-hero">
          <div className="coat-hero-copy">
            <h1>{copy.nav.destek}</h1>
          </div>
        </header>
        {copy.destek.p.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <p>{copy.destek.thanks}</p>
        <p>
          <a href={CONTROLLER.github}>{CONTROLLER.github}</a>
        </p>
      </article>
    </Shell>
  );
}
