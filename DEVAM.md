# Duraklatıldı — yarın buradan

10 Eylül 2026 gecesi. Yazılım `main` kaydı `5b3a83f`. Pi açık kaldı; AOG süreçleri durdu. Bu dosyada şifre, `sk_live_`, OAuth secret yok.

## Yarın sırası

1. Pi’de yığını ayağa kaldır (aşağıdaki komutlar).
2. `aog-try-llm` logundan yeni `trycloudflare` hostname’ini oku. `vercel.json` içindeki `/v1` hedefi dönmüş olabilir; 502 olursa hedefi güncelle, commit, push.
3. GitHub OAuth Clerk production’da. Google ve Microsoft kapalı. Secret git’te yok.
4. Güvenlik HIGH maddelerine dokunma (bu duraklamada bilinçli). Düzeltme ayrı iş.

## Pi (LAN `192.168.68.61`, kullanıcı `demir`)

Makine kapanmadı. Durum (10 Eyl 01:53 TRT):

- `aog-chat.service`, `aog-i2c.service`, `aog-ml.timer`, `aog-ml.service` → inactive
- Docker: `aog-try-llm`, `aog-try-rest`, `aog-tunnel`, `supabase-db-1`, `supabase-rest-1`, `supabase-proxy-1` → stopped
- `cloudflared` / `llama-server` yok
- `pkill -f chat_proxy.py` kullanma

Açılış (Pi’de, sırayla):

```bash
cd /home/demir/aog-pi/supabase && docker compose start
cd /home/demir/aog-pi/cloudflared && docker compose start
docker compose -f /home/demir/aog-pi/cloudflared/docker-compose.try.yml start
sudo systemctl start aog-chat.service
sudo systemctl start aog-i2c.service
sudo systemctl start aog-ml.timer
systemctl is-active aog-chat.service aog-i2c.service aog-ml.timer
docker ps --format '{{.Names}} {{.Status}}'
```

Quick tunnel hostname her `docker compose start` sonrası değişebilir. Named tunnel (`aog-tunnel`) ayrı compose dosyasında.

Yazılım vekili: `/home/demir/aog-pi/chat_proxy.py`, gerçekler `/home/demir/aog-pi/AOG.md`, GGUF `~/aog-pi/models/`.

## Clerk (production)

- PWA: `https://akilli-orman-gozlemcisi-software.vercel.app`
- Clerk app: `app_3J6jotrFwy4EMawIaQhDyq9T3Xh`
- Production instance: `ins_3J6p8v8hOCnuo6LHPERH3m0Zjyi`
- Geliştirme instance ayrı (`ins_3J6jomofFAhKuQ7dEsmpjfGxswf`); yarın production’a bak
- FAPI: same-origin `/__clerk` → Edge `api/clerk-proxy` → `https://frontend-api.clerk.dev`
- clerk-js / UI: jsDelivr (`VITE_CLERK_JS_URL`). `@clerk/react` 6.15 `clerkJSUrl` yok sayar; `__internal_clerkJSUrl` ve `__internal_clerkUIUrl` gerekir
- SW: `aog-shell-v5` (`/__clerk`, `/api/`, `/v1/` bypass)
- Vercel env adları: `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `VITE_CLERK_PROXY_URL=/__clerk`, `VITE_CLERK_JS_URL`. Değerleri git’e koyma

Yalnız GitHub SSO açık (Clerk dashboard’da). Google ve Microsoft `enabled: false`. Secret’ler git’te yok.

Homepage / origin:

`https://akilli-orman-gozlemcisi-software.vercel.app`

Callback (ikisini de kaydet):

- `https://akilli-orman-gozlemcisi-software.vercel.app/__clerk/v1/oauth_callback`
- `https://clerk.akilli-orman-gozlemcisi-software.vercel.app/v1/oauth_callback`

SSO panosu:

`https://dashboard.clerk.com/apps/app_3J6jotrFwy4EMawIaQhDyq9T3Xh/instances/ins_3J6p8v8hOCnuo6LHPERH3m0Zjyi/user-authentication/sso-connections`

Kimlikler girdikten sonra (değerleri sohbete yapıştırma):

```bash
npx clerk config patch --instance ins_3J6p8v8hOCnuo6LHPERH3m0Zjyi --json '{"connection_oauth_github":{"enabled":true,"client_id":"…","client_secret":"…"}}'
```

`clerk whoami` production’ı `null` gösterebilir; tam instance id kullan.

Doğrulama: `/asistan` → Giriş / Kayıt → yalnız GitHub. `Clerk.loaded === true`, `pk_live_`.

## Kilit ürün kuralları (rastgele değiştirme)

- Tokenlar `src/tokens.css`. HUD’u yeniden stil etme
- Pano alarm AND: `t >= 100` ve alev. `alertBlend.js` / firmware alarmı sorulmadan değişmez
- Asistan gerçekleri `pi/AOG.md` + `AOG_FACTS` birebir. Metinde `100 °C` / AND kuralı yok. Chat hep `fetch("/v1/chat/completions")`
- UI kip: Hızlı / Orta / Derin cevaplar. Eklenti hop: Mesh sistemi
- Testler system prompt gövdesinde `/sklearn/`, `/StandardScaler/`, `/LoRa/`, `/0x2A/`, `/Mesh sistemi/`, `/Clerk/` ister. Lab pik 399 °C

## Güvenlik (düzeltme yok, yarın ayrı)

npm audit production: 0. PWA Vercel’de duruyor; asistan `/v1` Pi kapalıyken 502 verir.

HIGH özet: `/v1` kimlik doğrulamasız Vercel rewrite; sohbet isteğinde Clerk JWT yok (`RequireAuth` yalnızca UI); `chat_proxy` `0.0.0.0:8080`; Clerk proxy her `Origin` için ACAO + credentials; `VITE_NTFY_TOPIC` bundle’da kimlik; packets SELECT `lat`/`lon`; Pi `pi/supabase` varsayılan Postgres/JWT git’te (LAN `:8000` açılınca tehlikeli).

Ayrıntı bu makinedeki Cursor canvas’ta: sohbetin yanındaki güvenlik denetimi. GitHub’a canvas konmaz.

## Git / deploy

- Yazılım: `kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software` `main`
- Vercel proje: `akilli-orman-gozlemcisi-software`
- `.env.local` commit etme
- Donanım klasörü (`Akıllı Orman Gözlemcisi`) git deposu değil
