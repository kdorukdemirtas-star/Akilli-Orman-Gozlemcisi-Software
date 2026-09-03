/*
 * AOG alici — verici paketini LoRa 433 MHz'de dinler
 * Kart eline gecince yukle. Vericiyle AYNI anda USB takili olsun.
 *
 * NSS D4  RST D13  DIO0 D12   *** TX ile RST/DIO0 CAPRAZ ***
 * SPI 200 kHz  Sandeep Mistry LoRa.h
 *
 * Beklenen paket:
 *   AOG n= t= gps= lat= lon= mq9= a8= a9=
 * a8/a9: 1=bos  0=alev
 */

#include <SPI.h>
#include <LoRa.h>
#include "esp_mac.h"

static const int LORA_SS = D4;
static const int LORA_RST = D13;
static const int LORA_DIO0 = D12;

bool loraVar = false;
uint8_t surum = 0;
uint32_t alinan = 0;

uint8_t oku42() {
  pinMode(LORA_RST, OUTPUT);
  digitalWrite(LORA_RST, LOW);
  delay(20);
  digitalWrite(LORA_RST, HIGH);
  delay(20);
  pinMode(LORA_SS, OUTPUT);
  digitalWrite(LORA_SS, HIGH);
  pinMode(SCK, OUTPUT);
  digitalWrite(SCK, LOW);
  pinMode(MOSI, OUTPUT);
  pinMode(MISO, INPUT_PULLUP);
  digitalWrite(LORA_SS, LOW);
  delayMicroseconds(8);
  uint8_t addr = 0x42;
  for (int i = 7; i >= 0; i--) {
    digitalWrite(MOSI, (addr >> i) & 1);
    delayMicroseconds(4);
    digitalWrite(SCK, HIGH);
    delayMicroseconds(4);
    digitalWrite(SCK, LOW);
  }
  uint8_t v = 0;
  for (int i = 0; i < 8; i++) {
    digitalWrite(SCK, HIGH);
    delayMicroseconds(4);
    v = (uint8_t)((v << 1) | (digitalRead(MISO) ? 1 : 0));
    digitalWrite(SCK, LOW);
    delayMicroseconds(4);
  }
  digitalWrite(LORA_SS, HIGH);
  pinMode(MISO, INPUT);
  return v;
}

float alanF(const char *s, const char *key) {
  const char *p = strstr(s, key);
  if (!p) return NAN;
  return atof(p + strlen(key));
}

long alanI(const char *s, const char *key) {
  const char *p = strstr(s, key);
  if (!p) return -1;
  return atol(p + strlen(key));
}

void setup() {
  Serial.begin(115200);
  uint32_t t = millis();
  while (!Serial && millis() - t < 4000) delay(10);

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  Serial.printf("AOG ALICI  MAC %02X:%02X:%02X:%02X:%02X:%02X\n",
                mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  Serial.println("pin NSS=D4 RST=D13 DIO0=D12  433 MHz");
  Serial.println("verici paketini bekliyor  (alici kart yoksa bu kodu sonra yukle)");

  surum = oku42();
  Serial.printf("VERSION=0x%02X  (0x12 = cip var)\n", surum);

  SPI.end();
  delay(10);
  pinMode(LORA_SS, OUTPUT);
  digitalWrite(LORA_SS, HIGH);
  pinMode(LORA_RST, OUTPUT);
  digitalWrite(LORA_RST, LOW);
  delay(20);
  digitalWrite(LORA_RST, HIGH);
  delay(20);
  SPI.begin(SCK, MISO, MOSI, -1);
  SPI.setHwCs(false);
  LoRa.setSPI(SPI);
  LoRa.setSPIFrequency(200000);
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  loraVar = LoRa.begin(433E6);
  Serial.println(loraVar ? "LoRa OK, dinleniyor" : "LoRa.begin FAIL");
}

void loop() {
  if (!loraVar) {
    Serial.printf("FAIL  VERSION=0x%02X\n", surum);
    delay(1500);
    return;
  }
  int n = LoRa.parsePacket();
  if (!n) return;

  char msg[192];
  int i = 0;
  while (LoRa.available() && i < (int)sizeof(msg) - 1) {
    msg[i++] = (char)LoRa.read();
  }
  msg[i] = 0;

  alinan++;
  int rssi = LoRa.packetRssi();
  float snr = LoRa.packetSnr();
  Serial.printf("ALINDI #%lu rssi=%d snr=%.1f  %s\n",
                (unsigned long)alinan, rssi, snr, msg);

  if (strncmp(msg, "AOG ", 4) != 0) return;

  long a8 = alanI(msg, "a8=");
  long a9 = alanI(msg, "a9=");
  Serial.printf("  t=%.2f  gps=%ld  lat=%.5f  lon=%.5f  mq9=%ld  ates D8=%ld D9=%ld\n",
                alanF(msg, "t="),
                alanI(msg, "gps="),
                alanF(msg, "lat="),
                alanF(msg, "lon="),
                alanI(msg, "mq9="),
                a8, a9);
  if (a8 == 0 || a9 == 0) {
    Serial.printf("  ATES  D8=%s  D9=%s\n",
                  a8 == 0 ? "ALEV" : "bos",
                  a9 == 0 ? "ALEV" : "bos");
  }
}
