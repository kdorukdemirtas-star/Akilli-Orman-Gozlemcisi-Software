// Client-side refuse only. The Pi proxy is the real boundary.

const INJECTION_RE =
  /ignore\s+(all\s+|any\s+)?(previous|prior|above)\s+(instructions|rules|prompts)|you\s+are\s+now\s+|new\s+system\s+prompt|override\s+(the\s+)?(system|rules)|disregard\s+.{0,40}(instructions|rules)|jailbreak|dan\s+mode|developer\s+mode|reveal\s+.{0,40}(system\s+prompt|hidden\s+prompt)|print\s+.{0,30}(system|hidden)\s+prompt|önceki\s+(talimat|kural|komut).{0,40}(unut|yoksay|görmezden|geçersiz)|sistem\s+prompt|system\s+prompt|talimatlar[ıi]\s+(unut|yoksay|geçersiz)|rolünü\s+değiştir|asistan\s+değilsin|<\/?system>|\[INST\]|<<SYS>>|\[system\]|role\s*[:=]\s*system|###\s*instruction/i;

export const INJECTION_HINT =
  "Bu istek asistan kapsamı dışında. Ürün, alarm veya kaplama sor.";

export function looksLikeInjection(text) {
  const blob = String(text || "").trim();
  if (!blob) return false;
  if (INJECTION_RE.test(blob)) return true;
  const compact = blob.replace(/\s+/g, "");
  if (
    compact.length >= 200 &&
    /^[A-Za-z0-9+/=]+$/.test(compact) &&
    (blob.match(/ /g) || []).length < 5
  ) {
    return true;
  }
  return false;
}
