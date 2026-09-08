# Pi asistan + I2C alıcı + yerel PostgREST

Raspberry Pi 5 (4 GB). LoRa alıcı Deneyap Kart 1A v2, I2C köle **0x2A**. Pi master (`GPIO2` SDA pin 3, `GPIO3` SCL pin 5, ortak GND). Servis: `aog-i2c.service` → `i2c_to_supabase.py`.

Yerel tablo: `pi/supabase` (Postgres + PostgREST + Caddy `:8000`). PWA `VITE_SUPABASE_URL=http://192.168.68.61:8000`. Vercel HTTPS için tünel gerekir.

Alıcı USB ile Mac’te de durabilir; veri yolu I2C’dir. A4/A5 Arduino I2C değildir; kartın **SDA / SCL** (D10 / D11) pinlerini kullan.

## Asistan

PWA `/asistan` aynı kökte açılır. Adres yazılmaz. Vite `PI_CHAT_URL` ile `/v1` vekiller.

`chat_proxy.py` `:8080` üzerinde OpenAI uyumlu `/v1/chat/completions` açar. Gövdedeki `model` alanı `hizli`, `orta` veya `derin` olur. İstemci `system` satırı ve sahte geçmiş atılır; her istekte `AOG.md` + kip kuralı yazılır; kullanıcı metni talimat sayılmaz. Enjeksiyon (jailbreak, sahte system, `system prompt`) llama’ya gitmez. İngilizce taslak, PDF vaadi ve spek listesi yanıt sayılmaz; vekil ürün cümlesine döner. CORS `CHAT_CORS_ORIGIN` (varsayılan Vercel PWA + yerel Vite). `CF-Connecting-IP` yalnız loopback tünelden okunur. IP başına 10 sn’de 3 ve dakikada 8 istek, global dakikada 16, aynı anda 1 llama, gövde 8 KB. Limit dolunca 60 sn ban ve `Retry-After`. CORS curl'ü kesmez; tünel hostname `vercel.json` içinde döner. 4 GB RAM için aynı anda tek llama-server çalışır; kip değişince önceki GGUF bellekten iner, istenen diskten yüklenir.

Operatör GGUF yolları (PWA’da geçmez):

- hızlı: `models/Qwen_Qwen3.5-0.8B-Q4_K_M.gguf`
- orta: `models/Llama-3.2-1B-Instruct-Q4_K_M.gguf`
- derin: `models/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf`

Servis: `aog-chat.service` (eski `aog-asistan.service` durdurulur). PWA üst menüden `/asistan` açar.

## ML

`ml_score.py` + `aog-ml.timer`. sklearn `Pipeline`: `StandardScaler` + `LogisticRegression(class_weight="balanced")`. Etiket: 100 °C ve alev. Her sınıftan en az 3 örnek yoksa `logreg-wait` (skor 0). Çıktı `scores` (`model`: `logreg` veya `logreg-wait`). Ayar PWA `/makine`. Asistan ile aynı anda eğitme.
