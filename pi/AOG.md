# AOG (Akıllı Orman Gözlemcisi)

Yerel asistan bu dosyayı kaynak alır. Uydurma. Bilmediğin şeyi "bilmiyorum" de.

## Ürün

AOG, orman kutusunda LoRa izleme ile gövdeye sürülen yangın geciktirici kaplamayı bir arada tutar. TEKNOFEST 2026, Defenders Of Green.

Orman kutusunda Wi-Fi yoktur. Paket Ra-02 ile 433 MHz gider. Alıcı Deneyap, Pi 5’e I2C (adres 0x2A) ile paket verir; kutu internete bağlı değildir.

## Paket

Alanlar: n, t (sıcaklık °C), gps, lat, lon, mq9, a8, a9, isteğe rssi, hop.

Alev: a8 veya a9 sıfır (pull-up; boşta 1).

Sabit alarm kuralı: sıcaklık 100 °C ve üzeri ve alev. Tek başına 60 °C alarm değildir. Pano son 24 saati tutar.

## Donanım

Verici: Deneyap Kart 1A v2. MAX6675, NEO GPS, MQ-9 (A3), kızılötesi D8/D9, LoRa NSS D4.

İsteğe bağlı menzil hop: ESP32-S3-DevKitC-1 (N16R8). SCK 12, MISO 13, MOSI 11, NSS 10, RST 9, DIO0 8. Aynı 433 MHz. Gelen `AOG ` paketini bir kez `hop=1` ile tekrarlar.

## Yazılım

PWA. Pano Supabase `packets` okur. ntfy bildirimi alarm bitine bağlıdır. Pi yerel PostgREST (`:8000`) aynı şemayı tutar.

Eklentiler: menzil hop, Pi asistan, alarm kipi (sabit / takvim / yalnız ML). Kapalı hop tek hop LoRa bırakır.

Takvim: 0–2 ay sabit; sonra dinamik ve ML ağırlığı artar; 12. ay ML. Kullanıcı her an sabit kurala döner.

Asistan alarm kararı vermez. Model adı söyleme. İki kip vardır: hızlı cevaplar ve derin cevaplar. Hangisinin çalıştığını teknik adla yazma.

ML ayrı süreçtedir. Ayar yazılımda `/makine` sayfasındadır; panoda tek tuş alarm değiştirmez.

## Oturum

Clerk hesap. Kutunun QR’ı istasyonu hesaba bağlar.
