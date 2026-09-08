import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Shell } from "./SiteNav.jsx";
import {
  asChatKip,
  CHAT_KIPS,
  chatModel,
  kipLabel,
  kipTemp,
  kipTokens,
  newThreadId,
  readKip,
  readThreads,
  cleanReply,
  systemPrompt,
  titleFromQuestion,
  writeKip,
  writeThreads,
} from "./chatStore.js";
import { chatLoadHint } from "./chatHint.js";
import { INJECTION_HINT, looksLikeInjection } from "./chatGuard.js";
import "./site.css";
import "./asistan.css";

async function askPi(question, kip, signal) {
  let res;
  try {
    res = await fetch("/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        model: chatModel(kip),
        messages: [
          { role: "system", content: systemPrompt(kip) },
          { role: "user", content: question },
        ],
        max_tokens: kipTokens(kip),
        temperature: kipTemp(kip),
      }),
    });
  } catch (err) {
    if (isAbort(err)) throw err;
    const fail = new Error(err?.message || "Failed to fetch");
    fail.status = 0;
    throw fail;
  }
  if (!res.ok) {
    let detail = "";
    try {
      const fail = await res.json();
      detail = String(fail?.error?.message || fail?.error || "").trim();
    } catch {
      /* not json */
    }
    const fail = new Error(detail || "Failed to fetch");
    fail.status = res.status;
    throw fail;
  }
  const data = await res.json();
  const msg = data?.choices?.[0]?.message || {};
  return cleanReply(msg.content, question);
}

function isAbort(err) {
  return err?.name === "AbortError";
}

export default function Asistan({ product = "software" }) {
  const [params, setParams] = useSearchParams();
  const [kip, setKip] = useState(() =>
    params.get("kip") ? asChatKip(params.get("kip")) : readKip(),
  );
  const [threads, setThreads] = useState(readThreads);
  const [activeId, setActiveId] = useState(() => readThreads()[0]?.id || "");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState("");
  const [err, setErr] = useState({ id: "", text: "" });
  const endRef = useRef(null);
  const aliveRef = useRef(true);
  const inflight = useRef(new Map());

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fromUrl = params.get("kip");
    const value = asChatKip(fromUrl || readKip());
    setKip(value);
    writeKip(value);
    if (fromUrl !== value) setParams({ kip: value }, { replace: true });
  }, [params, setParams]);

  const active = useMemo(
    () => threads.find((row) => row.id === activeId) || null,
    [threads, activeId],
  );
  const lines = active?.lines || [];
  const waiting = busyId === activeId && Boolean(activeId);
  const shownErr = err.text && err.id === activeId ? err.text : "";

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines.length, waiting]);

  function saveThreads(next) {
    const saved = writeThreads(next);
    if (aliveRef.current) setThreads(saved);
    return saved;
  }

  function pickKip(next) {
    const value = writeKip(next);
    setKip(value);
    setParams({ kip: value }, { replace: true });
  }

  function startThread() {
    const id = newThreadId();
    setThreads((prev) => writeThreads([{ id, title: "Yeni sohbet", kip, lines: [] }, ...prev]));
    setActiveId(id);
    setErr({ id: "", text: "" });
    setQ("");
  }

  function dropThread(id) {
    if (!window.confirm("Bu sohbet silinsin mi?")) return;
    inflight.current.get(id)?.abort();
    inflight.current.delete(id);
    if (busyId === id) setBusyId("");
    const next = writeThreads(threads.filter((row) => row.id !== id));
    setThreads(next);
    if (id === activeId) setActiveId(next[0]?.id || "");
    if (err.id === id) setErr({ id: "", text: "" });
  }

  async function onAsk(e) {
    e.preventDefault();
    const text = q.trim();
    const id = activeId || newThreadId();
    if (!text || busyId === id) return;
    setQ("");
    setErr({ id: "", text: "" });
    inflight.current.get(id)?.abort();
    const ac = new AbortController();
    inflight.current.set(id, ac);
    setBusyId(id);
    if (!activeId) setActiveId(id);
    setThreads((prev) => {
      const has = prev.some((row) => row.id === id);
      const list = has
        ? prev
        : [{ id, title: titleFromQuestion(text), kip, lines: [] }, ...prev];
      return writeThreads(
        list.map((row) =>
          row.id === id
            ? {
                ...row,
                title: row.lines.length ? row.title : titleFromQuestion(text),
                kip,
                lines: [...row.lines, { who: "sen", text }],
              }
            : row,
        ),
      );
    });
    if (looksLikeInjection(text)) {
      inflight.current.delete(id);
      setBusyId((cur) => (cur === id ? "" : cur));
      setErr({ id, text: chatLoadHint(400, INJECTION_HINT) });
      return;
    }
    try {
      const raw = await askPi(text, kip, ac.signal);
      const reply =
        String(raw || "").trim() ||
        "Asistan boş yanıt döndürdü. Hızlı cevapları dene.";
      saveThreads(
        readThreads().map((row) =>
          row.id === id ? { ...row, lines: [...row.lines, { who: "pi", text: reply }] } : row,
        ),
      );
    } catch (e) {
      if (isAbort(e)) return;
      setErr({
        id,
        text: chatLoadHint(e.status, e instanceof Error ? e.message : ""),
      });
    } finally {
      if (inflight.current.get(id) === ac) inflight.current.delete(id);
      setBusyId((cur) => (cur === id ? "" : cur));
    }
  }

  function onComposerKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <Shell product={product} footer={false}>
      <div className="owui">
        <aside className="owui-side">
          <button type="button" className="owui-new" onClick={startThread}>
            Yeni sohbet
          </button>
          <p className="owui-side-label">Sohbetler</p>
          <nav className="owui-chats" aria-label="Sohbetler">
            {threads.length ? (
              threads.map((row) => (
                <div
                  key={row.id}
                  className={row.id === activeId ? "owui-chat is-on" : "owui-chat"}
                >
                  <button
                    type="button"
                    className="owui-chat-open"
                    aria-current={row.id === activeId ? "true" : undefined}
                    onClick={() => setActiveId(row.id)}
                  >
                    {row.title}
                  </button>
                  <button
                    type="button"
                    className="owui-chat-drop"
                    aria-label={`${row.title} sohbetini sil`}
                    onClick={() => dropThread(row.id)}
                  >
                    Sil
                  </button>
                </div>
              ))
            ) : (
              <p className="owui-muted">Kayıtlı sohbet yok.</p>
            )}
          </nav>
        </aside>

        <section className="owui-main">
          <header className="owui-bar">
            <div className="owui-models" role="group" aria-label="Yanıt kipi">
              {CHAT_KIPS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={kip === id ? "is-on" : undefined}
                  aria-pressed={kip === id}
                  onClick={() => pickKip(id)}
                >
                  {kipLabel(id)}
                </button>
              ))}
            </div>
          </header>

          <div className="owui-thread">
            {lines.length ? (
              <ul className="owui-log">
                {lines.map((line, i) => (
                  <li
                    key={`${line.who}-${i}`}
                    className={line.who === "sen" ? "owui-msg is-user" : "owui-msg is-bot"}
                  >
                    <span className="owui-who">{line.who === "sen" ? "Sen" : "Asistan"}</span>
                    <p>{line.text}</p>
                  </li>
                ))}
                {waiting ? (
                  <li className="owui-msg is-bot is-wait" aria-live="polite">
                    <span className="owui-who">Asistan</span>
                    <p>Yanıt hazırlanıyor…</p>
                  </li>
                ) : null}
              </ul>
            ) : (
              <div className="owui-empty">
                <h1>Asistan</h1>
                <p>
                  Kutunun ölçümleri, alarm kuralı ve kaplama hakkında soru
                  sorabilirsin. Asistan alarm yazmaz.
                </p>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {shownErr ? (
            <p className="owui-alert" role="alert">
              {shownErr}
            </p>
          ) : null}

          <form className="owui-composer" onSubmit={onAsk}>
            <label className="visually-hidden" htmlFor="ask-pi">
              Soru
            </label>
            <textarea
              id="ask-pi"
              name="soru"
              rows={1}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onComposerKey}
              placeholder="Sorunu yaz"
              autoComplete="off"
              disabled={waiting}
            />
            <button type="submit" className="hit" disabled={waiting || !q.trim()}>
              {waiting ? "…" : "Gönder"}
            </button>
          </form>
        </section>
      </div>
    </Shell>
  );
}
