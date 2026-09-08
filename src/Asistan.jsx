import { useState } from "react";
import { Link } from "react-router-dom";
import { Shell } from "./SiteNav.jsx";
import { asHttpUrl, readPlugins } from "./pluginStore.js";
import "./site.css";

async function askPi(base, question) {
  const url = `${base}/v1/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "qwen",
      messages: [
        {
          role: "system",
          content: "AOG.md dosyasına uy. Bilmediğin şeyi bilmiyorum de. Alarm kararı verme.",
        },
        { role: "user", content: question },
      ],
      max_tokens: 256,
      temperature: 0.2,
    }),
  });
  if (!res.ok) throw new Error("pi");
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  return String(text || "").trim();
}

export default function Asistan({ product = "software" }) {
  const plug = readPlugins();
  const base = plug.piOn ? asHttpUrl(plug.piUrl) : "";
  const [q, setQ] = useState("");
  const [lines, setLines] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onAsk(e) {
    e.preventDefault();
    const text = q.trim();
    if (!text || !base || busy) return;
    setBusy(true);
    setErr("");
    setQ("");
    setLines((prev) => [...prev, { who: "sen", text }]);
    try {
      const reply = await askPi(base, text);
      setLines((prev) => [...prev, { who: "pi", text: reply || "(boş yanıt)" }]);
    } catch {
      setErr("Pi yanıt vermedi. Adres ve llama-server açık mı bak.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell product={product}>
      <article className="coat-page">
        <header className="coat-hero">
          <div className="coat-hero-copy">
            <p className="coat-badge">Yazılım</p>
            <h1>Asistan</h1>
            <p>
              Soru Pi 5 üzerindeki Qwen 3.5 0.8B’ye gider. Bulut yok. Asistan
              alarm açmaz.
            </p>
          </div>
        </header>

        {!base ? (
          <p role="status">
            Pi asistan eklentisi kapalı veya adres yok.{" "}
            <Link to="/eklentiler">Eklentiler</Link>
          </p>
        ) : (
          <>
            {lines.length ? (
              <ul className="coat-parts plug-list">
                {lines.map((line, i) => (
                  <li key={`${line.who}-${i}`}>
                    <strong>{line.who === "sen" ? "Soru" : "Yanıt"}</strong>
                    <span>{line.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Örnek: alarm kuralı nedir, kutuda Wi-Fi var mı.</p>
            )}
            <form className="topic-row" onSubmit={onAsk}>
              <label className="visually-hidden" htmlFor="ask-pi">
                Soru
              </label>
              <input
                id="ask-pi"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Sor"
                autoComplete="off"
                disabled={busy}
              />
              <button type="submit" className="hit" disabled={busy || !q.trim()}>
                {busy ? "Bekleniyor" : "Gönder"}
              </button>
            </form>
            {err ? <p role="alert">{err}</p> : null}
          </>
        )}

        <div className="coat-close">
          <nav className="coat-next" aria-label="Sonraki adım">
            <Link className="fold-go" to="/eklentiler">
              Eklentiler
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
