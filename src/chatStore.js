const THREAD_KEY = "aog-chat-threads-v1";
const KIP_KEY = "aog-chat-kip-v1";

export const CHAT_KIPS = ["hizli", "derin"];

export function asChatKip(raw) {
  return raw === "derin" ? "derin" : "hizli";
}

export function kipLabel(kip) {
  return asChatKip(kip) === "derin" ? "Derin cevaplar" : "Hızlı cevaplar";
}

export function kipHint(kip) {
  return asChatKip(kip) === "derin"
    ? "Daha uzun bakış. Aynı kutu, daha çok adım."
    : "Kısa yanıt. Kutunun kuralını sor.";
}

export function kipTokens(kip) {
  return asChatKip(kip) === "derin" ? 512 : 192;
}

export function chatModel(kip) {
  return asChatKip(kip);
}

export function systemPrompt(kip) {
  const base =
    "AOG.md: orman kutusunda Wi-Fi yok. Paket Ra-02 ile 433 MHz LoRa gider. Sabit alarm: sıcaklık 100 °C ve üzeri VE alev (a8 veya a9 sıfır). Tek başına 60 °C alarm değildir. Asistan alarm açmaz. Model adı söyleme. Bilmediğini bilmiyorum de.";
  if (asChatKip(kip) === "derin") {
    return `${base} Gerekirse adım adım yaz. Yine kısa tut.`;
  }
  return `${base} Tek paragraf, kısa cevap.`;
}

export function stripThink(text) {
  return String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^\s*(?:thinking|reasoning)\s*:\s*/i, "")
    .replace(/qwen[\w.\-]*/gi, "")
    .replace(/deepseek[\w.\-]*/gi, "")
    .replace(/llama[\w.\-]*/gi, "")
    .replace(/\br1\b/gi, "")
    .replace(/\.gguf\b/gi, "")
    .replace(/\b0\.8b\b/gi, "")
    .replace(/\b1\.5b\b/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function readKip() {
  try {
    return asChatKip(localStorage.getItem(KIP_KEY));
  } catch {
    return "hizli";
  }
}

export function writeKip(kip) {
  const next = asChatKip(kip);
  try {
    localStorage.setItem(KIP_KEY, next);
  } catch {
    /* quota */
  }
  return next;
}

function asThread(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = String(raw.id || "").slice(0, 32);
  if (!id) return null;
  const lines = Array.isArray(raw.lines)
    ? raw.lines
        .filter((row) => row && (row.who === "sen" || row.who === "pi"))
        .map((row) => ({
          who: row.who,
          text: String(row.text || "").slice(0, 4000),
        }))
        .slice(-40)
    : [];
  return {
    id,
    title: String(raw.title || "Yeni soru").slice(0, 48),
    kip: asChatKip(raw.kip),
    lines,
  };
}

export function readThreads() {
  try {
    const parsed = JSON.parse(localStorage.getItem(THREAD_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(asThread).filter(Boolean).slice(0, 24);
  } catch {
    return [];
  }
}

export function writeThreads(list) {
  const next = (list || []).map(asThread).filter(Boolean).slice(0, 24);
  try {
    localStorage.setItem(THREAD_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  return next;
}

export function newThreadId() {
  return `s${Date.now().toString(36)}`;
}

export function titleFromQuestion(text) {
  const t = String(text || "").trim().replace(/\s+/g, " ");
  if (!t) return "Yeni soru";
  return t.length > 36 ? `${t.slice(0, 34)}…` : t;
}
