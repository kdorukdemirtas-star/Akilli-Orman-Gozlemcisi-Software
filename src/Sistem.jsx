import { Link } from "react-router-dom";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

const CHAIN = [
  "Sensör Ölçümü",
  "Veri Toplama",
  "LoRa 433 MHz",
  "Supabase",
  "100 °C ve Alev",
  "Pano ve ntfy",
];

const GAINS = [
  {
    title: "Ormanda Wi-Fi yok",
    body: "Düğümde Wi-Fi yoktur. Paket Ra-02 LoRa 433 MHz ile alıcıya çıkar.",
    icon: "radio",
  },
  {
    title: "Dört ölçüm bir döngü",
    body: "MAX6675, NEO GPS, MQ-9 (A3) ve iki kızılötesi göz (D8/D9) birlikte bakılır.",
    icon: "sensor",
  },
  {
    title: "Alarm AND kuralı",
    body: "Sıcaklık ≥ 100 °C ve alev. Eşik tek başına 60 °C değildir.",
    icon: "alert",
  },
  {
    title: "Son 24 saat",
    body: "Pano TTL 24 saattir. Yeni paket eski özeti ezer. Eski satırlar listeden düşer.",
    icon: "clock",
  },
];

const STEPS = [
  {
    title: "Sensör Ölçümü",
    body: "Orman düğümü sıcaklığı MAX6675 ile okur. GPS, MQ-9 gaz ve iki kızılötesi göz (D8/D9) aynı döngüde bakılır. Düğümde Wi-Fi yoktur.",
    icon: "sensor",
  },
  {
    title: "Veri Toplama",
    body: "Deneyap Kart 1A v2 şu alanları paketler: n, t, gps, lat, lon, mq9, a8, a9. Alev, a8 veya a9 sıfır olduğunda yanar (pull-up; boşta 1).",
    icon: "chip",
  },
  {
    title: "Veri İletimi",
    body: "Ra-02 LoRa 433 MHz paketi alıcıya yollar. Gönderici MAC: f4:12:fa:de:f3:c. Alıcı internete bağlıdır; orman kutusu bağlı değildir.",
    icon: "radio",
  },
  {
    title: "Veri Merkezi",
    body: "Alıcı satırı Supabase public.packets tablosuna yazar. İstasyon kodu: AOG-DEMO-1. Pano son 24 saati çeker.",
    icon: "db",
  },
  {
    title: "Analiz ve Alarm",
    body: "Alarm AND kuralıdır: sıcaklık ≥ 100 °C ve alev. Grafikteki \"yalnız sıcaklık\" sadeleştirmesi üründe yoktur. Eşik tutunca ekibin ntfy.sh konusuna düşer.",
    icon: "alert",
  },
  {
    title: "Bildirim ve Uyarı",
    body: "Web panosu canlı kanalı INSERT ile yeniler. Iphone ve Android aynı siteyi PWA olarak ana ekrana alır. Döngü kesilmez; yeni paket eski özeti ezer.",
    icon: "bell",
  },
];

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
  return (
    <Shell product={product}>
      <article className="coat-page">
        <header className="coat-hero">
          <div className="coat-hero-copy">
            <p className="coat-badge">
              <SysIcon name="radio" />
              Aktif izleme
            </p>
            <h1>Ölçümden uyarıya</h1>
            <p>
              Akış şeması altı adımı gösterir. Ürün o adımları sıcaklık, gaz, konum
              ve alev ile doldurur. Orman kutusu internete bağlı değildir; alıcı
              bağlıdır. Eşik tek başına 60 °C değildir.
            </p>
          </div>
          <figure className="coat-stage coat-stage-flow" aria-label="Altı adımlık sistem zinciri.">
            <ol>
              {CHAIN.map((item, index) => (
                <li key={item}>
                  <b aria-hidden="true">{index + 1}</b>
                  {item}
                </li>
              ))}
            </ol>
          </figure>
        </header>

        <ul className="coat-gains">
          {GAINS.map((gain) => (
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
            İşleyiş şeması
          </h2>
          <figure className="coat-diagram">
            <img
              src="/sistem/akis.png"
              alt="AOG sistemi işleyiş akış şeması: sensör, Deneyap Kart, LoRa, Supabase, ntfy, mobil ve web."
              width={900}
              height={1600}
            />
            <figcaption>
              AOG sistemi işleyiş akış şeması. Adımlar 1-6'dır; ardından sürekli güncelleme gelir.
            </figcaption>
          </figure>
        </section>

        <section className="coat-block" aria-labelledby="how-title">
          <h2 id="how-title">Nasıl çalışır?</h2>
          <ol className="coat-steps is-six">
            {STEPS.map((step, index) => (
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
          <p className="coat-banner">
            Sistem paketi gönderir, pano 24 saat tutar; alevi geciktiren ise gövdedeki
            kaplamadır.
          </p>
          <nav className="coat-next" aria-label="Sonraki adım">
            <Link className="fold-go" to="/karisim">
              Karışımı incele
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
