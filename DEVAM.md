# Kayıt — 10 Eylül 2026 öğle

Yazılım `main` `b6489e2`. PWA yayında. GitHub Clerk girişi çalışıyor. Bu dosyada şifre, `sk_live_`, OAuth secret yok.

## Durum

- PWA: `https://akilli-orman-gozlemcisi-software.vercel.app`
- Clerk production: GitHub SSO açık. Google ve Microsoft kapalı.
- SW: `aog-shell-v11` (`/__clerk`, `/api/`, `/v1/` worker’a girmez)
- FAPI: `/__clerk` → Edge proxy → `frontend-api.clerk.dev`. POST body ArrayBuffer. Yanıttan `content-encoding` ve Clerk CSP düşer.
- Asistan `/v1` hâlâ kimlik doğrulamasız Vercel rewrite. HIGH. Jüri öncesi kapat veya JWT.
- Final denetim (tasarım + güvenlik) Cursor canvas: sohbetin yanındaki `final-audit`. GitHub’a canvas konmaz.

## Pi (LAN `192.168.68.61`, kullanıcı `demir`)

`pkill -f chat_proxy.py` kullanma.

```bash
cd /home/demir/aog-pi/supabase && docker compose start
cd /home/demir/aog-pi/cloudflared && docker compose start
docker compose -f /home/demir/aog-pi/cloudflared/docker-compose.try.yml up -d --force-recreate
sudo systemctl start aog-chat.service aog-i2c.service aog-ml.timer
```

Quick tunnel hostname dönerse `vercel.json` `/v1` hedefini güncelle, commit, push.

## Clerk

- App: `app_3J6jotrFwy4EMawIaQhDyq9T3Xh`
- Production: `ins_3J6p8v8hOCnuo6LHPERH3m0Zjyi`
- Callback: `https://akilli-orman-gozlemcisi-software.vercel.app/__clerk/v1/oauth_callback`
- Vercel env adları (değer yok): `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `VITE_CLERK_PROXY_URL=/__clerk`, `VITE_CLERK_JS_URL`
- GitHub client secret sohbette göründüyse GitHub’da döndür, Clerk’e patch et. Değeri buraya yazma.

Doğrulama: `/asistan` → Clerk kartı → Continue with GitHub → `github.com/login/oauth/authorize`.

## Kilit ürün kuralları

- Tokenlar `src/tokens.css`. HUD’u yeniden stil etme
- Pano alarm AND: `t >= 100` ve alev
- Asistan gerçekleri `pi/AOG.md` + `AOG_FACTS` birebir. Chat `fetch("/v1/chat/completions")`
- Kip: Hızlı / Orta / Derin cevaplar. Hop: Mesh sistemi
- Testler: sklearn, StandardScaler, LoRa, 0x2A, Mesh sistemi, Clerk. Lab pik 399 °C

## Güvenlik özeti

npm audit production: 0. HIGH: `/v1` açık; JWT yok; vekil kimlik yok; Clerk ACAO Origin yansıtır; GitHub secret döndür; Pi compose sırları.

## Git / deploy

- `kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software` `main`
- Vercel: `akilli-orman-gozlemcisi-software`
- `.env.local` commit etme
- Donanım klasörü (`Akıllı Orman Gözlemcisi`) git deposu değil
