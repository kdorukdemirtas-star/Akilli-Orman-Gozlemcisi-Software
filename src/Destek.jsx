import { CONTROLLER } from "./privacyCopy.js";
import { DESTEK_PARAGRAPHS, DESTEK_THANKS } from "./destekCopy.js";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

export default function Destek() {
  return (
    <Shell product="software">
      <article className="coat-page legal-page">
        <header className="coat-hero">
          <div className="coat-hero-copy">
            <h1>Destek</h1>
          </div>
        </header>
        {DESTEK_PARAGRAPHS.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <p>{DESTEK_THANKS}</p>
        <p>
          <a href={CONTROLLER.github}>{CONTROLLER.github}</a>
        </p>
      </article>
    </Shell>
  );
}
