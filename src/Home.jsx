import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MODULES } from "./catalog.js";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

const SLOGAN =
  "Kül Olmaya Mahkum Değil, AOG ile Korumaya Alınmış Yeşil Bir Gelecek!";

const MOD_GAINS = [
  {
    title: "IP-67 gövde",
    body: "Alüminyum kutu, conta yuvası ve kablo rakoru hazır gelir. Güneş paneli bu kabuğa oturur.",
    icon: "box",
  },
  {
    title: "Dört ölçüm",
    body: "MAX6675, NEO GPS, MQ-9 (A3) ve iki kızılötesi göz (D8/D9) aynı döngüde bakılır.",
    icon: "sensor",
  },
  {
    title: "Alarm AND kuralı",
    body: "Pano eşiği 100 °C'dir. Alarm ancak sıcaklık bu çizginin üstünde ve alev de varsa yazılır.",
    icon: "alert",
  },
  {
    title: "LoRa 433 MHz",
    body: "Orman kutusu Wi-Fi taşımaz. Paket Ra-02 ile alıcıya çıkar.",
    icon: "radio",
  },
];

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

const FOLD_CHIPS = [
  {
    title: "LoRa izleme",
    body: "Orman kutusu Wi-Fi taşımaz. Paket Ra-02 433 MHz ile alıcıya çıkar.",
    icon: "radio",
  },
  {
    title: "100 °C ve alev",
    body: "Alarm ancak sıcaklık bu çizginin üstünde ve alev de varsa yazılır.",
    icon: "alert",
  },
  {
    title: "Pasif kaplama",
    body: "Karışım yangını söndürmez. Alevin yüzeye oturmasını yavaşlatır.",
    icon: "leaf",
  },
];

function Hero() {
  return (
    <article className="fold">
      <section className="fold-hero" aria-labelledby="hero-title">
        <div className="hero-frost" aria-hidden="true" />
        <div className="fold-copy">
          <h1 id="hero-title">
            <span className="hero-line">Akıllı Orman</span>
            <span className="hero-goz">Gözlemcisi</span>
          </h1>
          <p className="hero-slogan">{SLOGAN}</p>
          <p className="fold-lede">
            LoRa tabanlı aktif izleme ile doğal yangın geciktirici pasif kaplama
            aynı üründedir. Pano sıcaklık, alev, MQ-9 ve konumu son 24 saatte
            gösterir.
          </p>
          <Link className="fold-go" to="/sistem">
            Sistemi incele
          </Link>
          <ul className="fold-chips">
            {FOLD_CHIPS.map((chip) => (
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
            alt="Güneş panelli orman kutusu ve gövdeye sürülmüş kaplama bandı."
            fetchPriority="high"
          />
        </figure>
      </section>

      <section className="fold-pair" aria-label="Pano ve donanım">
        <article className="fold-card is-shot">
          <figure className="fold-phone">
            <img
              src="/fold/phone.jpg"
              width="1024"
              height="1536"
              alt="Pano telefon görünümü."
            />
          </figure>
        </article>
        <article className="fold-card is-shot">
          <Photo
            src="/fold/guts.jpg"
            w={1536}
            h={1024}
            alt="Açık orman kutusu. Kartlar turuncu conta yuvasının içinde."
          />
          <h2>Güneş panelli gövde</h2>
          <Link className="fold-go is-ghost" to="/moduller">
            Modüllere git
          </Link>
        </article>
      </section>

      <div className="coat-close">
        <p className="coat-banner">
          AOG, LoRa tabanlı aktif izleme sistemi ile doğal yangın geciktirici pasif
          kaplamayı bir araya getiren hibrit bir çözümdür.
        </p>
        <nav className="coat-next" aria-label="Sonraki adım">
          <Link className="fold-go" to="/sistem">
            Sistemi incele
          </Link>
          <Link className="fold-go is-ghost" to="/dashboard">
            Panoyu aç
          </Link>
        </nav>
      </div>
    </article>
  );
}

function Mods() {
  return (
    <article className="coat-page">
      <header className="coat-hero">
        <div className="coat-hero-copy">
          <p className="coat-badge">
            <ModIcon name="chip" />
            Donanım
          </p>
          <h1 id="mods-title">Modüller</h1>
          <p>
            Kutuda MAX6675, NEO GPS, MQ-9, iki kızılötesi göz ve Ra-02 LoRa vardır.
            Orman düğümü Wi-Fi taşımaz. Satılan ürün Akıllı Orman Gözlemcisi'dir.
          </p>
        </div>
        <figure className="coat-stage coat-stage-flow" aria-label="Kutudaki altı parça.">
          <ol>
            {MODULES.map((mod, index) => (
              <li key={mod.id}>
                <b aria-hidden="true">{index + 1}</b>
                {mod.name}
              </li>
            ))}
          </ol>
        </figure>
      </header>

      <ul className="coat-gains">
        {MOD_GAINS.map((gain) => (
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
          Parça listesi
        </h2>
        <ul className="coat-mods">
          {MODULES.map((mod) => (
            <li key={mod.id} id={mod.id}>
              <Photo src={mod.src} alt={mod.alt} cutout={mod.cutout !== false} />
              <strong>{mod.name}</strong>
              <span>{mod.body}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="coat-close">
        <p className="coat-banner">
          Altı modül tek kutuda toplanır; paket LoRa ile ağ geçidine, oradan panoya
          ulaşır.
        </p>
        <nav className="coat-next" aria-label="Sonraki adım">
          <Link className="fold-go" to="/sistem">
            Veri akışını gör
          </Link>
          <Link className="fold-go is-ghost" to="/dashboard">
            Panoyu aç
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
