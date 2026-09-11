import { Link, useLocation } from "react-router-dom";
import { CONTROLLER } from "./privacyCopy.js";
import { LEGAL_DATE, LEGAL_LINKS } from "./legalPagesCopy.js";
import { LegalSection, LegalTable } from "./legalUi.jsx";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

export function LegalNotice({ title, lead, sections, table }) {
  const location = useLocation();
  return (
    <Shell product="software">
      <article className="coat-page legal-page">
        <header className="coat-hero">
          <div className="coat-hero-copy">
            <h1>{title}</h1>
            <p>{lead}</p>
          </div>
        </header>
        <dl className="legal-meta">
          <dt>Güncelleme</dt>
          <dd>{LEGAL_DATE}</dd>
          <dt>Takım</dt>
          <dd>{CONTROLLER.name}</dd>
          <dt>Ürün</dt>
          <dd>{CONTROLLER.product}</dd>
          <dt>Başvuru</dt>
          <dd>
            <a href={CONTROLLER.github}>GitHub</a>
          </dd>
        </dl>
        <nav className="legal-toc" aria-labelledby="legal-toc-label">
          <p id="legal-toc-label">İçindekiler</p>
          <ol>
            {sections.map((row) => (
              <li key={row.id}>
                <a href={`#${row.id}`}>{row.title}</a>
              </li>
            ))}
          </ol>
        </nav>
        {sections.map((row) => (
          <LegalSection
            key={row.id}
            id={row.id}
            title={row.title}
            paragraphs={row.paragraphs}
            list={row.list}
          >
            {table && row.id === table.sectionId ? (
              <LegalTable caption={table.caption} columns={table.columns} rows={table.rows} />
            ) : null}
          </LegalSection>
        ))}
        <nav className="legal-end" aria-label="Diğer metinler">
          {LEGAL_LINKS.filter((item) => item.to !== location.pathname).map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </article>
    </Shell>
  );
}
