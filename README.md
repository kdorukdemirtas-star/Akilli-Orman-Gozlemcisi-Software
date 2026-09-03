# Akıllı Orman Gözlemcisi

Kül olmaya mahkum değil. AOG, orman yangınını iki yoldan karşılar: kutu haberi erken verir, gövdedeki kaplama alevin oturmasını yavaşlatır.

Bu depo o ürünün yazılımıdır. TEKNOFEST 2026, Defenders Of Green.

## Neden var

Ormanda Wi-Fi yoktur. Yangın haberi geç kalırsa müdahale penceresi kapanır. AOG bunu iki parça olarak çözer:

1. **Aktif izleme.** Güneş panelli kutuda sıcaklık (MAX6675), alev (iki kızılötesi göz), MQ-9 ve GPS vardır. Paket LoRa 433 MHz ile alıcıya çıkar; orman düğümü internete bağlı değildir.
2. **Pasif kaplama.** Aloe vera, pirinç kabuğu külü, yumurta kabuğu tozu ve ksantan gam gövdeye sürülür. Karışım yangını söndürmez. Isı geçişini yavaşlatır; tahliye ve müdahale için süre bırakır.

Alarm tek başına sıcaklık değildir. Pano ancak **100 °C ve alev** birlikteyse eşik yazar. Son 24 saat tutulur; yeni paket eski özeti ezer.

## Bu yazılım ne yapar

- Kutunun QR kodu veya istasyon kodu ile panoyu o istasyona bağlar. Giriş hesabı yoktur.
- Sıcaklık grafiği, harita, alev ve bildirim listesini canlı gösterir.
- Sistem, karışım ve YTÜ laboratuvar analizlerini jüriye anlatır.
- Aynı site iPhone ve Android’de PWA olarak ana ekrana alınır. Kotlin veya Swift kabuğu yoktur.

Sürüm: [v1.0.0](https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/releases/tag/v1.0.0).

## Dil

| Katman | Dil | Araç |
| --- | --- | --- |
| Site ve pano | JavaScript | React 19, Vite 7 |
| Görünüm | CSS | `src/tokens.css`, `site.css`, `ops.css` |
| Verici / alıcı | Arduino C++ | `firmware/*.ino` |
| Veri | SQL | Postgres, Supabase |

## Çalıştırma

Vercel env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_NTFY_TOPIC`.
service_role ve Postgres şifresi buraya konmaz.

```bash
cp .env.example .env.local
npm install
npm run dev
```
