# AOG Software

Akıllı Orman Gözlemcisi panosu. Aynı Supabase DEMO ile paylaşılır. QR veya istasyon kodu ile kutu eşlenir. Giriş hesabı yoktur.

iPhone ve Android bu siteyi PWA olarak ana ekrana alır. Kotlin veya Swift kabuğu yoktur.

## Dil

| Katman | Dil | Araç |
| --- | --- | --- |
| Site ve pano | JavaScript | React 19, Vite 7 |
| Görünüm | CSS | `src/tokens.css`, `site.css`, `ops.css` |
| Verici / alıcı | Arduino C++ | `firmware/*.ino` |
| Veri | SQL | Postgres, Supabase |

Sürüm: **v1.0.0** (GitHub Release).

## Çalıştırma

Vercel env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_NTFY_TOPIC`.
service_role ve Postgres şifresi buraya konmaz.

```bash
cp .env.example .env.local
npm install
npm run dev
```
