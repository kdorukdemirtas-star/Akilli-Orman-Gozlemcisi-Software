# AOG Software

Aynı Supabase DEMO ile paylaşılır. QR veya istasyon kodu ile kutu eşlenir. Giriş hesabı yoktur.

Iphone ve Android bu siteyi PWA olarak ana ekrana alır. Kotlin veya Swift kabuğu yoktur.

Vercel env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_NTFY_TOPIC`.
service_role ve Postgres şifresi buraya konmaz.

```bash
cp .env.example .env.local
npm install
npm run dev
```
