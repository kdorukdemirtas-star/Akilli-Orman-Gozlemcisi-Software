import { Link } from "react-router-dom";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

const PARTS = [
  {
    name: "Aloe vera jeli",
    short: "Aloe vera jeli",
    role: "Su tutar; yüzeyi ıslak ve yapışkan tutar.",
    mark: "aloe",
  },
  {
    name: "Pirinç kabuğu külü (ince ve kalın)",
    short: "Pirinç kabuğu külü",
    role: "Silisli iskelet sağlar. İnce toz boşluğu doldurur; kalın taneler kabuğu tutar.",
    mark: "ash",
  },
  {
    name: "Yumurta kabuğu tozu",
    short: "Yumurta kabuğu tozu",
    role: "Kalsiyum karbonattır. Isıda gaz çıkarır; char tabakasını destekler.",
    mark: "shell",
  },
  {
    name: "Ksantan gam",
    short: "Ksantan gam",
    role: "Karışımı ağaca yapıştırır. Yağmurda hemen akmaması içindir.",
    mark: "gum",
  },
];

const GAINS = [
  {
    title: "Doğal içerik",
    body: "Sıfır atık tarifidir. Kimyasal yangın geciktirici iddiası yoktur.",
    icon: "leaf",
  },
  {
    title: "Yüzeye tutunur",
    body: "Jel ve gam, kabuğu ağaca yapıştırır.",
    icon: "shield",
  },
  {
    title: "Yayılmayı yavaşlatır",
    body: "Amaç kesmek değil, alevin yüzeye oturmasını yavaşlatmaktır.",
    icon: "fire",
  },
  {
    title: "Zaman kazandırır",
    body: "Kazanılan süre tahliye ve müdahale içindir.",
    icon: "clock",
  },
];

const STEPS = [
  {
    title: "Uygulama",
    body: "Karışım gövdeye eşit sürülür.",
    icon: "brush",
  },
  {
    title: "Koruyucu tabaka",
    body: "Yapışkan koruyucu bir tabaka oluşur.",
    icon: "shield",
  },
  {
    title: "Alev temasını geciktirme",
    body: "Isı geçişini ve alevin yüzeye oturmasını yavaşlatır.",
    icon: "fire",
  },
  {
    title: "Müdahale süresi",
    body: "Tahliye ve müdahale için süre kazandırır.",
    icon: "clock",
  },
];

const TEMPS = [
  { value: "399 °C", label: "Kaplamasız ağaç" },
  { value: "424 °C", label: "Taze kaplama" },
  { value: "438 °C", label: "3,5 ay yaşlanmış kaplama" },
];

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
  return (
    <Shell product={product}>
      <article className="coat-page">
        <header className="coat-hero">
          <div className="coat-hero-copy">
            <p className="coat-badge">
              <CoatIcon name="leaf" />
              Pasif koruma
            </p>
            <h1>Pasif kaplama</h1>
            <p>
              Karışım yangını söndürmez. AOG'nin pasif kaplaması doğal bir yangın
              geciktiricidir: alevin yüzeye oturmasını yavaşlatır, tahliye ve müdahale
              için süre kazandırır. Formülasyon TEKNOFEST 2026 sunumundaki sıfır atık
              tarifidir. Oran yüzde olarak yazılmadı.
            </p>
          </div>
          <figure className="coat-stage coat-stage-log" aria-label="Kaplama bandı ve dört bileşen.">
            <img
              className="coat-log-photo"
              src="/karisim/coat-log.jpg"
              width="720"
              height="1400"
              alt="Çam gövdesinde açık renk pasif kaplama bandı."
            />
            <div className="coat-log-side">
              <p className="coat-swatch" aria-hidden="true">
                <i className="is-green" />
                <i className="is-white" />
              </p>
              <ul>
                {PARTS.map((part) => (
                  <li key={part.short}>{part.short}</li>
                ))}
              </ul>
            </div>
          </figure>
        </header>

        <ul className="coat-gains">
          {GAINS.map((gain) => (
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
            Karışım bileşenleri
          </h2>
          <ul className="coat-parts">
            {PARTS.map((part) => (
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
          <h2 id="how-title">Nasıl çalışır?</h2>
          <ol className="coat-steps">
            {STEPS.map((step, index) => (
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
            Laboratuvar bulguları (YTÜ)
          </h2>
          <div className="coat-lab">
            <ul className="coat-temps">
              {TEMPS.map((temp) => (
                <li key={temp.label}>
                  <strong>{temp.value}</strong>
                  <span>{temp.label}</span>
                </li>
              ))}
            </ul>
            <blockquote>
              <p>
                TGA-DSC ölçümünde ana yanma sıcaklığı kaplamasız ağaçta 399 °C, taze
                kaplamada 424 °C, 3,5 ay yaşlanmış kaplamada 438 °C bulunmuştur. Sunum,
                maksimum kütle kaybı hızının kabaca üç kat düştüğünü yazar. FTIR,
                yüzeyin örtüldüğünü ve yaşlanmayla etkinin kısmen zayıfladığını gösterir.
              </p>
              <p>
                Ham spektrumlar <Link to="/analizler">Analizler</Link> sayfasındadır.
              </p>
            </blockquote>
          </div>
          <p className="coat-cap">
            Analizler Yıldız Teknik Üniversitesi Merkezi Araştırma Laboratuvarı'nda
            gerçekleştirilmiştir.
          </p>
        </section>

        <div className="coat-close">
          <p className="coat-banner">
            Kaplama alevi geciktirir; sensörler haber verir. İkisi birlikte AOG'dir.
          </p>
          <nav className="coat-next" aria-label="Sonraki adım">
            <Link className="fold-go" to="/analizler">
              Analizlere geç
            </Link>
            <Link className="fold-go is-ghost" to="/dashboard">
              Panoyu aç
            </Link>
          </nav>
        </div>
      </article>
    </Shell>
  );
}
