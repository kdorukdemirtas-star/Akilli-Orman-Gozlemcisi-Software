# Akıllı Orman Gözlemcisi

**Kül Olmaya Mahkum Değil, AOG ile Korumaya Alınmış Yeşil Bir Gelecek.**

Akıllı Orman Gözlemcisi (AOG), orman yangınına karşı hibrit bir üründür. Bir yanda güneş panelli kutu ormanı izler ve haber verir. Diğer yanda gövdeye sürülen doğal kaplama alevin yüzeye oturmasını yavaşlatır. İkisi birlikte satılır; biri diğerinin yerine geçmez.

Bu depo o ürünün yazılımıdır: tanıtım sitesi, canlı pano ve kutu firmware’i. Ekip: **Defenders Of Green**. Yarışma: **TEKNOFEST 2026**.

Sürüm: [v1.0.0](https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/releases/tag/v1.0.0).

## Sorun

Ormanda baz istasyonu ve Wi-Fi yoktur. Yangın haberi gözcüye, kuleye veya tesadüfe kalırsa müdahale penceresi kapanır. Plastik gövdeli bir sıcaklık çipi orman yangını ısısında erir. Tek başına “hava sıcak” demek de yetmez: güneş, toz ve sahte alev okuması yanlış alarm üretir.

AOG bu yüzden iki kuralı birleştirir. Kutu dört ölçümü aynı döngüde alır. Pano eşiği **100 °C ve alev** AND kuralıdır. Sıcaklık tek başına, alev tek başına alarm yazmaz.

## Aktif izleme: orman kutusu

Kutu IP-67 alüminyum gövdedir. Conta yuvası, kablo rakoru ve güneş paneli bu kabuğa oturur. İçindeki kart Deneyap Kart 1A v2’dir. Düğümde Wi-Fi yoktur.

| Modül | Görevi |
| --- | --- |
| MAX6675 + K-tipi termokupl | Sıcaklık. Paketteki `t=` buradan gelir. |
| GY-GPSV3-NEO | Konum. Fix yoksa `gps=0`; harita işaret koymaz. |
| MQ-9 | Karbonmonoksit ve yanıcı gaz, ham ADC. Alarm gazdan kurulmaz. |
| İki kızılötesi göz | Alev. Pano bunları ayrı ürün gibi göstermez; tek ateş kararı verir. |
| Ra-02 LoRa (SX1278, 433 MHz) | Paketi alıcıya taşır. Orman kutusu internete bağlı değildir. |

Paket alanları: `n`, `t`, `gps`, `lat`, `lon`, `mq9`, `a8`, `a9`. Alev, `a8` veya `a9` sıfır olduğunda yanar (pull-up; boşta 1).

Alıcı internete bağlıdır. Satırı Supabase `public.packets` tablosuna yazar. Pano son **24 saati** çeker. Yeni paket eski özeti ezer; eski satırlar listeden düşer. Eşik tutunca ekibin ntfy konusuna düşer.

## Pasif kaplama: gövdedeki karışım

Kaplama yangını söndürmez. Amaç kesmek değil, alevin yüzeye oturmasını yavaşlatmak ve tahliye ile müdahale için süre bırakmaktır. Kimyasal yangın geciktirici iddiası yoktur; sıfır atık tarifidir.

| İçerik | Rolü |
| --- | --- |
| Aloe vera jeli | Su tutar; yüzeyi ıslak ve yapışkan tutar. |
| Pirinç kabuğu külü (ince ve kalın) | Silisli iskelet. İnce toz boşluğu doldurur; kalın taneler kabuğu tutar. |
| Yumurta kabuğu tozu | Kalsiyum karbonat. Isıda gaz çıkarır; char tabakasını destekler. |
| Ksantan gam | Karışımı ağaca yapıştırır. Yağmurda hemen akmaması içindir. |

YTÜ Merkezi Araştırma Laboratuvarı TGA-DSC ölçümünde pik sıcaklıklar: kaplamasız ağaç **399 °C**, taze kaplama **424 °C**, 3,5 ay yaşlanmış kaplama **438 °C**. Ham spektrumlar sitedeki Analizler sayfasındadır.

Karışım üç ayda bir yenilenir. Pano bu döngüyü istasyon kaydında tutar.

## Pano ve site

Yazılımın jüriye ve operatöre gösterdiği yüz budur.

- **Ana / Modüller / Sistem / Karışım / Analizler** ürünü anlatır. Analizler FTIR, TGA-DSC grafikleri ve xlsx raporlarıdır.
- **Pano** eşlenen kutunun son 24 saatini gösterir: sıcaklık grafiği, harita, alev, RSSI, kaplama durumu, ntfy listesi.
- Eşleme QR veya istasyon kodu iledir. Giriş hesabı yoktur.
- iPhone ve Android aynı siteyi PWA olarak ana ekrana alır. Kotlin veya Swift kabuğu yoktur.

Demo istasyonu `AOG-DEMO-1` ile paylaşılır.

## Dil ve yığın

| Katman | Dil | Araç |
| --- | --- | --- |
| Site ve pano | JavaScript | React 19, Vite 7, React Router |
| Görünüm | CSS | `src/tokens.css`, `site.css`, `ops.css` |
| Verici / alıcı | Arduino C++ | `firmware/AOG_Verici.ino`, `firmware/AOG_Alici.ino` |
| Veri | SQL | Postgres, Supabase (RLS, realtime INSERT) |
| Bildirim | ntfy.sh | Konu adı ortam değişkenidir; koda gömülmez |

## Çalıştırma

Vercel env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_NTFY_TOPIC`.
service_role ve Postgres şifresi tarayıcıya ve bu README’ye konmaz.

```bash
cp .env.example .env.local
npm install
npm run dev
```
