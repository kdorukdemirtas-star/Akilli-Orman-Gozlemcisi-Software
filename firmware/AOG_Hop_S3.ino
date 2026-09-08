/*
 * AOG S3 hop — ESP32-S3-DevKitC-1 (N16R8)
 * Deneyap verici 433 MHz AOG paketini bir kez tekrarlar. Dongu yok.
 *
 * VCC  3V3     GND  G
 * SCK  GPIO12  MISO GPIO13  MOSI GPIO11
 * NSS  GPIO10  RST  GPIO9   DIO0 GPIO8
 */

#include <SPI.h>
#include <LoRa.h>
#include "esp_mac.h"

static const int PIN_SCK = 12;
static const int PIN_MISO = 13;
static const int PIN_MOSI = 11;
static const int PIN_SS = 10;
static const int PIN_RST = 9;
static const int PIN_DIO0 = 8;

bool loraVar = false;
uint8_t surum = 0;
long lastN = -1;
uint32_t lastMs = 0;

void rstAt() {
  pinMode(PIN_RST, OUTPUT);
  digitalWrite(PIN_RST, LOW);
  delay(20);
  digitalWrite(PIN_RST, HIGH);
  delay(50);
}

uint8_t oku42() {
  rstAt();
  pinMode(PIN_SS, OUTPUT);
  digitalWrite(PIN_SS, HIGH);
  pinMode(PIN_SCK, OUTPUT);
  digitalWrite(PIN_SCK, LOW);
  pinMode(PIN_MOSI, OUTPUT);
  pinMode(PIN_MISO, INPUT_PULLUP);
  digitalWrite(PIN_SS, LOW);
  delayMicroseconds(8);
  uint8_t addr = 0x42;
  for (int i = 7; i >= 0; i--) {
    digitalWrite(PIN_MOSI, (addr >> i) & 1);
    delayMicroseconds(5);
    digitalWrite(PIN_SCK, HIGH);
    delayMicroseconds(5);
    digitalWrite(PIN_SCK, LOW);
  }
  uint8_t v = 0;
  for (int i = 0; i < 8; i++) {
    digitalWrite(PIN_SCK, HIGH);
    delayMicroseconds(5);
    v = (uint8_t)((v << 1) | (digitalRead(PIN_MISO) ? 1 : 0));
    digitalWrite(PIN_SCK, LOW);
    delayMicroseconds(5);
  }
  digitalWrite(PIN_SS, HIGH);
  pinMode(PIN_MISO, INPUT);
  return v;
}

bool loraAc() {
  SPI.end();
  pinMode(PIN_SS, OUTPUT);
  digitalWrite(PIN_SS, HIGH);
  rstAt();
  SPI.begin(PIN_SCK, PIN_MISO, PIN_MOSI, PIN_SS);
  SPI.setHwCs(false);
  LoRa.setSPI(SPI);
  LoRa.setSPIFrequency(200000);
  LoRa.setPins(PIN_SS, PIN_RST, PIN_DIO0);
  if (!LoRa.begin(433E6)) return false;
  LoRa.setTxPower(17);
  LoRa.receive();
  return true;
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
  delay(300);
  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  Serial.printf("AOG HOP S3  MAC %02X:%02X:%02X:%02X:%02X:%02X\n",
                mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  Serial.println("SCK=12 MISO=13 MOSI=11 NSS=10 RST=9 DIO0=8  433 MHz");
  surum = oku42();
  Serial.printf("VERSION=0x%02X\n", surum);
  loraVar = (surum == 0x12) && loraAc();
  Serial.println(loraVar ? "LoRa OK  hop dinliyor" : "LoRa FAIL");
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
  if (strncmp(msg, "AOG n=", 6) != 0) return;

  long hop = alanI(msg, "hop=");
  if (hop >= 1) return;

  long pn = alanI(msg, "n=");
  if (pn == lastN && millis() - lastMs < 4000) return;
  lastN = pn;
  lastMs = millis();

  char out[200];
  snprintf(out, sizeof(out), "%s hop=1", msg);
  delay(20 + (int)(esp_random() % 60));
  if (LoRa.beginPacket()) {
    LoRa.print(out);
    LoRa.endPacket(true);
    Serial.printf("tekrar  %s\n", out);
  }
  LoRa.receive();
}
