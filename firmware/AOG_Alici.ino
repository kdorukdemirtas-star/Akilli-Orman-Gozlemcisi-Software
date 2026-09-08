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
 *
 * I2C kose (Pi 5 master, bu kart slave 0x2A):
 *   Deneyap SDA -> Pi pin 3 (GPIO2)
 *   Deneyap SCL -> Pi pin 5 (GPIO3)
 *   GND ortak. 5V paylasma. Pi 3V3 pull-up yeter.
 */

#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <math.h>
#include <string.h>
#include "esp_mac.h"

static const int LORA_SS = D4;
static const int LORA_RST = D13;
static const int LORA_DIO0 = D12;

static const uint8_t I2C_ADDR = 0x2A;
static const uint8_t I2C_MAGIC = 0xA1;
static const size_t I2C_LEN = 32;

bool loraVar = false;
uint8_t surum = 0;
uint32_t alinan = 0;
uint8_t i2cSeq = 0;
uint8_t i2cReady[I2C_LEN];

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

void le16(uint8_t *p, uint16_t v) {
  p[0] = (uint8_t)(v & 0xFF);
  p[1] = (uint8_t)((v >> 8) & 0xFF);
}

void le32(uint8_t *p, uint32_t v) {
  p[0] = (uint8_t)(v & 0xFF);
  p[1] = (uint8_t)((v >> 8) & 0xFF);
  p[2] = (uint8_t)((v >> 16) & 0xFF);
  p[3] = (uint8_t)((v >> 24) & 0xFF);
}

void i2cYayin() {
  Wire.slaveWrite(i2cReady, I2C_LEN);
}

void onI2CRequest() {
  Wire.write(i2cReady, I2C_LEN);
}

void onI2CReceive(int len) {
  while (Wire.available()) {
    Wire.read();
  }
  (void)len;
}

void i2cPaketle(const char *msg, int rssi) {
  uint8_t b[I2C_LEN];
  memset(b, 0, I2C_LEN);
  b[0] = I2C_MAGIC;
  i2cSeq++;
  if (i2cSeq == 0) i2cSeq = 1;
  b[1] = i2cSeq;

  long n = alanI(msg, "n=");
  float t = alanF(msg, "t=");
  long gps = alanI(msg, "gps=");
  float lat = alanF(msg, "lat=");
  float lon = alanF(msg, "lon=");
  long mq9 = alanI(msg, "mq9=");
  long a8 = alanI(msg, "a8=");
  long a9 = alanI(msg, "a9=");
  long hop = alanI(msg, "hop=");

  le16(b + 2, (uint16_t)(n < 0 ? 0 : n));
  int32_t tcc = isnan(t) ? 0 : (int32_t)lroundf(t * 100.0f);
  if (tcc > 32767) tcc = 32767;
  if (tcc < -32768) tcc = -32768;
  le16(b + 4, (uint16_t)(int16_t)tcc);
  b[6] = (uint8_t)(gps < 0 ? 0 : gps);
  b[7] = (uint8_t)(a8 < 0 ? 1 : a8);
  b[8] = (uint8_t)(a9 < 0 ? 1 : a9);
  if (rssi > 127) rssi = 127;
  if (rssi < -128) rssi = -128;
  b[9] = (uint8_t)(int8_t)rssi;
  le16(b + 10, (uint16_t)(mq9 < 0 ? 0 : mq9));
  int32_t lat_e5 = isnan(lat) ? 0 : (int32_t)lroundf(lat * 1e5f);
  int32_t lon_e5 = isnan(lon) ? 0 : (int32_t)lroundf(lon * 1e5f);
  le32(b + 12, (uint32_t)lat_e5);
  le32(b + 16, (uint32_t)lon_e5);
  b[20] = (uint8_t)(hop < 0 ? 0 : hop);
  b[21] = 1;
  memcpy(i2cReady, b, I2C_LEN);
  i2cYayin();
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

  memset(i2cReady, 0, I2C_LEN);
  i2cReady[0] = I2C_MAGIC;
  Wire.onReceive(onI2CReceive);
  Wire.onRequest(onI2CRequest);
  bool i2cOk = Wire.begin(I2C_ADDR, SDA, SCL, 100000);
  i2cYayin();
  Serial.printf("I2C slave 0x%02X SDA=%d SCL=%d %s\n",
                I2C_ADDR, SDA, SCL, i2cOk ? "OK" : "FAIL");
}

void loop() {
  static uint32_t lastI2c = 0;
  if (millis() - lastI2c >= 200) {
    i2cYayin();
    lastI2c = millis();
  }

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

  if (strncmp(msg, "AOG n=", 6) != 0) return;

  i2cPaketle(msg, rssi);

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
