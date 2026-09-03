/*
 * AOG verici — son calisan paket (Deneyap Kart 1A v2)
 * LoRa 433 MHz  NSS D4  RST yok (-1)  DIO0 D13  SPI 200 kHz
 * MAX6675  CS D1  SCK A0  SO A1
 * GPS  Serial0 9600  modul TX->kart RX  RX->TX
 * MQ-9  AO A3  isitici 5V  AO<=3.3V
 * Ates  D8 ve D9  DO pullup  1=bos 0=alev  VCC=3V3
 *
 * Paket (alici ayni stringi basar):
 *   AOG n= t= gps= lat= lon= mq9= a8= a9=
 */

#include <SPI.h>
#include <LoRa.h>
#include "driver/gpio.h"
#include "esp_mac.h"

static const int LORA_SS = D4;
static const int LORA_DIO0 = D13;
static const int PIN_MQ9 = A3;
static const int PIN_ATES1 = D8;
static const int PIN_ATES2 = D9;

bool loraVar = false;
int maxCs = D1, maxSck = A0, maxSo = A1;
bool maxVar = false;
bool maxKenar = true;
uint32_t n = 0;

uint32_t gpsByte = 0;
uint32_t gpsNmea = 0;
uint32_t gpsBaud = 9600;
bool gpsFix = false;
float gpsLat = NAN, gpsLon = NAN;
char gpsSatir[128];
uint8_t gpsSatirN = 0;
char gpsOrnek[88];

void gpsPompa();

void bekle(uint32_t ms) {
  uint32_t bitis = millis() + ms;
  while ((int32_t)(millis() - bitis) < 0) {
    gpsPompa();
    delay(1);
  }
}

uint8_t oku42() {
  SPI.end();
  pinMode(LORA_SS, OUTPUT);
  digitalWrite(LORA_SS, HIGH);
  pinMode(SCK, OUTPUT);
  digitalWrite(SCK, LOW);
  pinMode(MOSI, OUTPUT);
  pinMode(MISO, INPUT_PULLUP);
  digitalWrite(LORA_SS, LOW);
  delayMicroseconds(8);
  uint8_t a = 0x42;
  for (int i = 7; i >= 0; i--) {
    digitalWrite(MOSI, (a >> i) & 1);
    delayMicroseconds(5);
    digitalWrite(SCK, HIGH);
    delayMicroseconds(5);
    digitalWrite(SCK, LOW);
  }
  uint8_t v = 0;
  for (int i = 0; i < 8; i++) {
    digitalWrite(SCK, HIGH);
    delayMicroseconds(5);
    v = (uint8_t)((v << 1) | (digitalRead(MISO) ? 1 : 0));
    digitalWrite(SCK, LOW);
    delayMicroseconds(5);
  }
  digitalWrite(LORA_SS, HIGH);
  return v;
}

bool loraAc() {
  SPI.end();
  pinMode(LORA_SS, OUTPUT);
  digitalWrite(LORA_SS, HIGH);
  SPI.begin(SCK, MISO, MOSI, LORA_SS);
  SPI.setHwCs(false);
  LoRa.setSPI(SPI);
  LoRa.setSPIFrequency(200000);
  LoRa.setPins(LORA_SS, -1, LORA_DIO0);
  if (!LoRa.begin(433E6)) return false;
  LoRa.setTxPower(17);
  return true;
}

uint16_t maxOku16(int cs, int sck, int so, bool onceYuksek) {
  digitalWrite(LORA_SS, HIGH);
  pinMode(cs, OUTPUT);
  digitalWrite(cs, HIGH);
  pinMode(sck, OUTPUT);
  pinMode(so, INPUT_PULLUP);
  digitalWrite(sck, LOW);
  bekle(220);
  digitalWrite(cs, LOW);
  delayMicroseconds(5);
  uint16_t v = 0;
  for (int i = 0; i < 16; i++) {
    if (onceYuksek) {
      digitalWrite(sck, HIGH);
      delayMicroseconds(8);
      v = (uint16_t)((v << 1) | (digitalRead(so) ? 1 : 0));
      digitalWrite(sck, LOW);
      delayMicroseconds(8);
    } else {
      digitalWrite(sck, LOW);
      delayMicroseconds(8);
      v = (uint16_t)((v << 1) | (digitalRead(so) ? 1 : 0));
      digitalWrite(sck, HIGH);
      delayMicroseconds(8);
    }
  }
  digitalWrite(sck, LOW);
  digitalWrite(cs, HIGH);
  return v;
}

bool maxMakul(uint16_t ham) {
  if (ham & 0x04) return false;
  if (ham == 0 || ham == 0xFFFF) return false;
  float c = (ham >> 3) * 0.25f;
  return c > -20.0f && c < 800.0f;
}

float nmeaDerece(const char *raw, char hem) {
  float v = atof(raw);
  int deg = (int)(v / 100.0f);
  float min = v - deg * 100.0f;
  float d = deg + min / 60.0f;
  if (hem == 'S' || hem == 'W') d = -d;
  return d;
}

void gpsAlan(const char *s) {
  bool gga = strncmp(s, "$GPGGA", 6) == 0 || strncmp(s, "$GNGGA", 6) == 0;
  bool rmc = strncmp(s, "$GPRMC", 6) == 0 || strncmp(s, "$GNRMC", 6) == 0;
  if (!gga && !rmc) return;
  const char *f[16];
  int nf = 0;
  f[nf++] = s;
  for (const char *p = s; *p && nf < 16; p++) {
    if (*p == ',') f[nf++] = p + 1;
  }
  if (nf < 7) return;
  const char *latS;
  const char *lonS;
  char ns, ew;
  if (gga) {
    latS = f[2];
    ns = f[3][0];
    lonS = f[4];
    ew = f[5][0];
  } else {
    latS = f[3];
    ns = f[4][0];
    lonS = f[5];
    ew = f[6][0];
  }
  if (latS[0] < '0' || lonS[0] < '0') return;
  char latBuf[16], lonBuf[16];
  uint8_t i = 0;
  while (latS[i] && latS[i] != ',' && i < 15) {
    latBuf[i] = latS[i];
    i++;
  }
  latBuf[i] = 0;
  i = 0;
  while (lonS[i] && lonS[i] != ',' && i < 15) {
    lonBuf[i] = lonS[i];
    i++;
  }
  lonBuf[i] = 0;
  if (i < 5) return;
  float la = nmeaDerece(latBuf, ns);
  float lo = nmeaDerece(lonBuf, ew);
  if (fabsf(la) > 0.1f && fabsf(lo) > 0.1f) {
    gpsLat = la;
    gpsLon = lo;
    gpsFix = true;
  }
}

void gpsOku(uint8_t ch) {
  gpsByte++;
  if (ch == '\n') {
    gpsSatir[gpsSatirN] = 0;
    if (strstr(gpsSatir, "$G") || strstr(gpsSatir, "$B")) {
      gpsNmea++;
      if (gpsOrnek[0] == 0) {
        strncpy(gpsOrnek, gpsSatir, sizeof(gpsOrnek) - 1);
      }
      gpsAlan(gpsSatir);
    }
    gpsSatirN = 0;
  } else if (ch != '\r' && gpsSatirN < sizeof(gpsSatir) - 1) {
    gpsSatir[gpsSatirN++] = (char)ch;
  }
}

void gpsPompa() {
  while (Serial0.available()) gpsOku((uint8_t)Serial0.read());
}

void gpsAc(uint32_t baud) {
  Serial0.end();
  delay(30);
  Serial0.begin(baud, SERIAL_8N1, RX, TX);
  gpsBaud = baud;
  gpsSatirN = 0;
}

void gpsTara() {
  const uint32_t baudlar[] = {9600, 38400, 115200};
  for (int i = 0; i < 3; i++) {
    gpsByte = 0;
    gpsNmea = 0;
    gpsAc(baudlar[i]);
    uint32_t bitis = millis() + 1500;
    while (millis() < bitis) {
      gpsPompa();
      delay(1);
    }
    Serial.printf("  GPS baud %lu  byte=%lu nmea=%lu\n",
                  (unsigned long)baudlar[i],
                  (unsigned long)gpsByte,
                  (unsigned long)gpsNmea);
    Serial.flush();
    if (gpsNmea > 0) {
      Serial.printf("  GPS kilit baud=%lu\n", (unsigned long)gpsBaud);
      if (gpsOrnek[0]) Serial.printf("  ornek %s\n", gpsOrnek);
      return;
    }
  }
  gpsAc(9600);
  Serial.println("  GPS NMEA yok  TX->RX 3V3 anten");
}

void setup() {
  Serial.begin(115200);
  uint32_t t = millis();
  while (!Serial && millis() - t < 4000) delay(10);
  delay(200);
  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  Serial.printf("AOG VERICI  MAC %02X:%02X:%02X:%02X:%02X:%02X\n",
                mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

  uint8_t ver = oku42();
  Serial.printf("LoRa VERSION=0x%02X\n", ver);
  if (ver == 0x12) loraVar = loraAc();
  Serial.println(loraVar ? "LoRa OK  433 MHz TX" : "LoRa FAIL");
  Serial.flush();

  gpsTara();

  pinMode(PIN_MQ9, INPUT);
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_MQ9, ADC_11db);
  delay(20);
  Serial.printf("MQ-9 A3 ham=%d\n", analogRead(PIN_MQ9));

  gpio_reset_pin((gpio_num_t)PIN_ATES1);
  gpio_reset_pin((gpio_num_t)PIN_ATES2);
  pinMode(PIN_ATES1, INPUT_PULLUP);
  pinMode(PIN_ATES2, INPUT_PULLUP);
  delay(10);
  Serial.printf("ates D8=%d D9=%d  (1=bos 0=alev)\n",
                digitalRead(PIN_ATES1), digitalRead(PIN_ATES2));
  Serial.flush();

  maxCs = D1;
  maxSck = A0;
  maxSo = A1;
  for (int k = 0; k < 2 && !maxVar; k++) {
    maxKenar = (k == 0);
    uint16_t ham = maxOku16(maxCs, maxSck, maxSo, maxKenar);
    bool ok = maxMakul(ham);
    Serial.printf("  MAX D1/A0/A1 kenar=%d ham=0x%04X %s\n",
                  maxKenar, ham, ok ? "OK" : "-");
    Serial.flush();
    if (ok) {
      maxVar = true;
      Serial.printf("MAX kilit t=%.2f\n", (ham >> 3) * 0.25f);
    }
  }
  if (!maxVar) Serial.println("MAX yok  CS=D1 SCK=A0 SO=A1  TC+/TC-");
  Serial.flush();
}

void loop() {
  gpsPompa();
  uint16_t ham = 0;
  bool ok = false;
  float c = NAN;
  if (maxVar) {
    ham = maxOku16(maxCs, maxSck, maxSo, maxKenar);
    ok = maxMakul(ham);
    if (ok) c = (ham >> 3) * 0.25f;
  }
  gpsPompa();
  int mq9 = analogRead(PIN_MQ9);
  int a8 = digitalRead(PIN_ATES1);
  int a9 = digitalRead(PIN_ATES2);
  n++;

  char paket[160];
  snprintf(paket, sizeof(paket),
           "AOG n=%lu t=%.2f gps=%d lat=%.5f lon=%.5f mq9=%d a8=%d a9=%d",
           (unsigned long)n,
           ok ? c : NAN,
           gpsFix ? 1 : 0,
           gpsFix ? gpsLat : NAN,
           gpsFix ? gpsLon : NAN,
           mq9, a8, a9);

  Serial.printf("t=%s gps=%d mq9=%d a8=%d a9=%d | ",
                ok ? String(c, 2).c_str() : "yok",
                gpsFix ? 1 : 0, mq9, a8, a9);

  if (loraVar) {
    digitalWrite(maxCs, HIGH);
    digitalWrite(LORA_SS, HIGH);
    if (LoRa.beginPacket()) {
      LoRa.print(paket);
      LoRa.endPacket(true);
      bekle(160);
      Serial.printf("gitti  %s\n", paket);
    } else {
      Serial.println("busy");
    }
  } else {
    Serial.println("LoRa yok");
  }
  Serial.flush();
  bekle(300);
}
