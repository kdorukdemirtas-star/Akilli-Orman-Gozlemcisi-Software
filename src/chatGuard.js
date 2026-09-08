// Client-side refuse only. The Pi proxy is the real boundary.
// Product questions pass. Only clear jailbreaks are blocked.

const PRODUCT_RE =
  /lora|alarm|kaplama|kutu|yangın|alev|gps|mesh|mq-?9|pano|orman|gözlem|\baog\b|sıcaklık|ntfy|karışım|asistan|sistem nedir|sistem hakkında|sistem nasıl|nasıl çalış|ne işe yarar|hakkında bilgi|wi-?fi|eşik|paket/i;

const HARD_INJECT_RE =
  /ignore\s+(all\s+|any\s+)?(previous|prior|above)\s+(instructions|rules|prompts)|jailbreak|dan\s+mode|developer\s+mode|new\s+system\s+prompt|reveal\s+.{0,40}(system\s+prompt|hidden\s+prompt)|print\s+.{0,30}(system|hidden)\s+prompt|önceki\s+(talimat|kural|komut).{0,40}(unut|yoksay|görmezden|geçersiz)|sistem\s+prompt|system\s+prompt|<\/?system>|\[INST\]|<<SYS>>|\[system\]|role\s*[:=]\s*system/i;

export const INJECTION_HINT =
  "Bu istek asistanın kuralını değiştirmeye çalışıyor. Ürün, alarm veya kaplama sor.";

export function looksLikeInjection(text) {
  const blob = String(text || "").trim();
  if (!blob) return false;
  const hard = HARD_INJECT_RE.test(blob);
  if (PRODUCT_RE.test(blob) && !hard) return false;
  if (hard) return true;
  const compact = blob.replace(/\s+/g, "");
  if (
    compact.length >= 360 &&
    /^[A-Za-z0-9+/=]+$/.test(compact) &&
    (blob.match(/ /g) || []).length < 5
  ) {
    return true;
  }
  return false;
}
