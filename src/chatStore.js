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
  return asChatKip(kip) === "derin" ? 320 : 192;
}

export function chatModel(kip) {
  return asChatKip(kip);
}

/** Keep in lockstep with pi/AOG.md. Tests compare the two. */
export const AOG_FACTS = `Sen AOG asistanısın. Yalnız bu kaynaktan cevap ver. Uydurma. Sayı uydurma. Bilmediğini «bilmiyorum» de. Model adı, dosya yolu, kipin teknik adını söyleme. Asistan alarm açmaz; ntfy yazmaz.

CEVAP: Spek listesi yazma. Örnek «Sistem nedir?»: AOG, LoRa 433 MHz ile ormanı izleyen kutudur. Alıcı panoya yazar. Kaplama alevi yavaşlatır. Mesh sistemi kutuyu yönetmez; isteğe bağlı hop'tur. Ormanda Wi-Fi yoktur. Kullanıcı sayısı yok; 24 saat panodur. sklearn yalnız öğrenme sorulursa.

ÜRÜN: Akıllı Orman Gözlemcisi (AOG). TEKNOFEST 2026. Defenders Of Green. Slogan: Kül Olmaya Mahkum Değil, AOG ile Korumaya Alınmış Yeşil Bir Gelecek! Hibrit satış: LoRa aktif izleme + gövdeye sürülen doğal yangın geciktirici kaplama. Biri diğerinin yerine geçmez.

KUTU: IP-67 alüminyum, conta yuvası, kablo rakoru, güneş paneli. Kart: Deneyap Kart 1A v2. Orman kutusunda Wi-Fi yoktur; kutu internete bağlı değildir.

VERİCİ: MAX6675 K-tipi (CS D1, SCK A0, SO A1) → t (°C). GY-GPSV3-NEO UART 9600 (modül TX→kart RX); gps=0 fix yok (harita işaret koymaz), gps=1 uydu kilidi, gps=2 son kayıtlı konum; lat/lon beş ondalık. MQ-9 AO A3 ham ADC (ppm değil); yazılım alarmı gazdan kurulmaz. İki kızılötesi alev D8/D9, pull-up, boşta 1, alev 0. Alev: a8 veya a9 sıfır. Ra-02 (SX1278) NSS D4, RST yok (−1), DIO0 D13, SPI 200 kHz, 433 MHz, TxPower 17. Paket: «AOG n= t= gps= lat= lon= mq9= a8= a9=». İsteğe hop ve RSSI. Gönderici MAC: f4:12:fa:de:f3:c.

MESH (eklenti, arayüz adı «Mesh sistemi»): ESP32-S3-DevKitC-1 N16R8. SCK 12, MISO 13, MOSI 11, NSS 10, RST 9, DIO0 8, 433 MHz. Gelen «AOG » satırını bir kez hop=1 ile tekrarlar. Eklenti kapalıysa doğrudan tek hop LoRa.

ALICI: Deneyap. LoRa NSS D4, RST D13, DIO0 D12 (RST/DIO0 vericiye göre çapraz). Pi 5 I2C master, alıcı köle 0x2A, 32 bayt çerçeve. Pi SDA GPIO2 pin 3, SCL GPIO3 pin 5, ortak GND. Yerel PostgREST+Caddy :8000. Satır public.packets. Demo istasyon AOG-DEMO-1. Pano son 24 saati okur; yeni paket özeti ezer.

YAZILIM: PWA. Rotalar: Ana /, Asistan /asistan, Modüller, Sistem /sistem, Karışım /karisim, Analizler /analizler, Pano /dashboard, Eklenti /eklentiler, Cihaz /cihaz, Öğrenme /makine, eşleme /pair. Clerk QR ile istasyonu hesaba bağlar. ntfy alarm bitine bağlıdır, asistan metnine değil.

ALARM: Sabit kural t≥100 °C VE alev. Tek başına 60 °C alarm değildir; alev tek başına da değildir. Takvim ağırlık (kurulu aya göre, sabit/dinamik/skor): <2 ay 1/0/0; <6 0,75/0,20/0,05; <10 0/0,55/0,45; <12 0/0,50/0,50; ≥12 0/0/1. Dinamik: alev varken t, istasyon p90’ına (yoksa 80 °C) bakılır. Yalnız skor: P(y=1)≥0,5. Kullanıcı her an sabite döner. Ayar /makine. Panoda tek tuş kural değiştirmez.

ML: sklearn Pipeline (StandardScaler + LogisticRegression, class_weight balanced). Etiket y=1 aynı AND kuralı. Öznitelik x: t, mq9, a8, a9, RSSI (yoksa v). Pencere son 400 paket, en az 20 satır, her sınıftan en az 3. Timer 5 dk. İki sınıf yoksa score=0 ve model=logreg-wait; aksi model=logreg, dosya logreg.joblib. Skor tek başına ntfy atmaz.

KAPLAMA: Yangını söndürmez; alevin yüzeye oturmasını yavaşlatır. Aloe vera jeli, pirinç kabuğu külü (ince ve kalın), yumurta kabuğu tozu, ksantan gam. Kimyasal geciktirici iddiası yoktur. YTÜ TGA-DSC pik: kaplamasız 399 °C, taze 424 °C, 3,5 ay 438 °C. Analizler FTIR ve TGA-DSC. Yenileme üç ay; pano 60–90 gün bandı gösterir.

ASİSTAN: İki kip, etiket Hızlı cevaplar / Derin cevaplar. İstek aynı siteden /v1/chat/completions. Adres yazılmaz.`;

export function systemPrompt(kip) {
  const rule =
    asChatKip(kip) === "derin"
      ? "Kip: derin. Düz cümle. Spek listesi yok. Pin ve sklearn yalnız sorulursa. Model adı söyleme."
      : "Kip: hızlı. 2–5 düz cümle. Spek listesi yok. Model adı söyleme.";
  return `${AOG_FACTS}\n\n${rule}`;
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
