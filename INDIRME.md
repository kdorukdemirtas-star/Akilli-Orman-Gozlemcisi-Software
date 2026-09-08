# İndirme

Bu dosya yazılım deposunun bütün indirme yollarını listeler. Canlı site için GitHub gerekmez: [akilli-orman-gozlemcisi-software.vercel.app](https://akilli-orman-gozlemcisi-software.vercel.app).

Depo: [kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software](https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software).

Asistan ağırlık dosyaları GitHub'da yoktur. Pi'ye çekmek için `pi/README.md`.

## Tarayıcı

1. https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software
2. Yeşil **Code**
3. **Download ZIP**

Aynı paket: [main.zip](https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/archive/refs/heads/main.zip).

Sürüm paketleri: [Releases](https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/releases). Orada **Source code (zip)** ve **Source code (tar.gz)** vardır.

GitHub Desktop: sitede **Code** → **Open with GitHub Desktop**. Uygulama yoksa https://desktop.github.com

Tarayıcıda düzenlemek (indirme değil): https://github.dev/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software

## Git (önerilen)

HTTPS:

```bash
git clone https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software.git
cd Akilli-Orman-Gozlemcisi-Software
```

SSH:

```bash
git clone git@github.com:kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software.git
cd Akilli-Orman-Gozlemcisi-Software
```

GitHub CLI:

```bash
gh repo clone kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software
cd Akilli-Orman-Gozlemcisi-Software
```

Yalnız son commit:

```bash
git clone --depth 1 https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software.git
```

Sürüm etiketi (örnek `v1.0.1`):

```bash
git clone --branch v1.0.1 --depth 1 https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software.git
```

Tarihsiz büyük nesneleri atlayan clone (sonra `git sparse-checkout`):

```bash
git clone --filter=blob:none --sparse https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software.git
cd Akilli-Orman-Gozlemcisi-Software
git sparse-checkout set firmware
```

Yalnız `pi/` için son satır `git sparse-checkout set pi` olur. PWA için `git sparse-checkout set src public scripts` sonra `git sparse-checkout add index.html package.json package-lock.json vite.config.js vercel.json`.

Güncelleme (tam clone sonrası):

```bash
git pull origin main
```

Çatal: GitHub'da **Fork**, sonra kendi hesabındaki URL ile `git clone`.

## Zip / tar (git yoksa)

| Ne | Adres |
| --- | --- |
| `main` zip | https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/archive/refs/heads/main.zip |
| `main` tar.gz | https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/archive/refs/heads/main.tar.gz |
| `v1.0.1` zip | https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/archive/refs/tags/v1.0.1.zip |
| `v1.0.1` tar.gz | https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/archive/refs/tags/v1.0.1.tar.gz |
| `v1.0.0` zip | https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/archive/refs/tags/v1.0.0.zip |
| `v1.0.0` tar.gz | https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/archive/refs/tags/v1.0.0.tar.gz |
| Sürüm sayfası | https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/releases |

macOS / Linux, curl:

```bash
curl -L -o aog-software.zip https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/archive/refs/heads/main.zip
unzip aog-software.zip
cd Akilli-Orman-Gozlemcisi-Software-main
```

wget:

```bash
wget -O aog-software.zip https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/archive/refs/heads/main.zip
unzip aog-software.zip
cd Akilli-Orman-Gozlemcisi-Software-main
```

Windows PowerShell:

```powershell
Invoke-WebRequest -Uri "https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/archive/refs/heads/main.zip" -OutFile aog-software.zip
Expand-Archive -Path aog-software.zip -DestinationPath .
cd Akilli-Orman-Gozlemcisi-Software-main
```

GitHub CLI ile sürüm arşivi:

```bash
gh release download v1.0.1 -R kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software --archive=zip
```

`--archive=tar.gz` aynı komutta zip yerine tar alır.

git geçmişi olmadan kopya (`npx`):

```bash
npx degit kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software
```

## Tek klasör / tek dosya

Subversion istemcisi varsa (git kurmadan klasör):

```bash
svn export https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/trunk/firmware
```

`trunk/pi` veya `trunk/src` aynı biçimde.

Ham dosya (örnek verici):

```bash
curl -L -o AOG_Verici.ino https://raw.githubusercontent.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software/main/firmware/AOG_Verici.ino
```

Alıcı: `firmware/AOG_Alici.ino`. Hop: `firmware/AOG_Hop_S3.ino`.

## İndirdikten sonra

```bash
cp .env.example .env.local
npm install
npm run dev
npm test
```

Anahtarlar `.env.example` içindedir. `service_role` ve Pi şifresi bu depoya konmaz.

## Bu pakette ne var / ne yok

| Var | Yok |
| --- | --- |
| PWA (`src/`, `public/`) | `node_modules/` |
| Firmware `.ino` | Asistan ağırlık dosyaları |
| `pi/chat_proxy.py`, `pi/AOG.md`, systemd birimleri | Asistan sunucusu ikilisi |
| `.env.example` | `.env` / `.env.local` |

Ağırlık ve Pi kurulumu: `pi/README.md`. Katkı: `CONTRIBUTING.md`.
