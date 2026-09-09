export const CONTROLLER = {
  name: "Defenders Of Green",
  product: "Akıllı Orman Gözlemcisi",
  site: "https://akilli-orman-gozlemcisi-software.vercel.app",
  github: "https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software",
};

export const COOKIE_ROWS = [
  {
    name: "Clerk oturum çerezleri",
    kind: "Zorunlu",
    why: "Giriş, kayıt ve hesabı açık tutmak. Pano, Asistan ve Cihaz bu çerez olmadan açılmaz.",
  },
  {
    name: "aog-chat-threads-v1:{hesap}",
    kind: "Zorunlu (hesap)",
    why: "Asistan sohbeti yalnız bu tarayıcıda, Clerk kullanıcı kimliğine yazılır. Başka hesabın sohbeti görünmez.",
  },
  {
    name: "aog-consent-v1",
    kind: "Zorunlu",
    why: "Çerez tercihini hatırlar. 6698 ve BTK çerez rehberi için kayıt tutulur.",
  },
  {
    name: "Google Fonts",
    kind: "İsteğe bağlı",
    why: "Yazı tipi dosyası Google’a IP gönderir. Reddedilirse sistem yazı tipi kullanılır.",
  },
  {
    name: "OpenStreetMap karoları",
    kind: "İsteğe bağlı",
    why: "Pano haritası OSM sunucusuna IP ve kare koordinatı gönderir. Konum gösterimi tanıtım pinidir; paket GPS’i panoda açılmaz.",
  },
];

export const PRIVACY_SECTIONS = [
  {
    id: "sorumlu",
    title: "Veri sorumlusu",
    body: "6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca aydınlatma metnidir. Veri sorumlusu Defenders Of Green takımıdır. Ürün Akıllı Orman Gözlemcisi, TEKNOFEST 2026. Site: https://akilli-orman-gozlemcisi-software.vercel.app. Tescilli ticaret unvanı bu metinde yoktur. Başvuru bu sayfadaki haklar bölümünden veya GitHub deposu üzerinden yapılır.",
  },
  {
    id: "neden",
    title: "Hangi veriler, hangi amaçla",
    body: "Hesap: Clerk e-posta, oturum ve isteğe bağlı ad. İstasyon kodu Clerk unsafeMetadata içinde durur; kutu QR ile hesaba bağlanır. Asistan: soru metni ve yanıt bu tarayıcıda hesaba yazılır. Soru, asistan yanıtı için Cloudflare tüneli üzerinden işletmecinin Raspberry Pi makinelerine gider; istemci sistem metni ve sohbet geçmişi gönderilmez. Pano: istasyon paketleri (sıcaklık, gaz, alev, RSSI) Supabase’te 24 saat bakılır. Paketteki GPS veri tabanında durabilir; pano haritası paket GPS’ini göstermez. ntfy konusu alarm metnini çeker. Eklenti, cihaz türü ve kaplama tarihi bu tarayıcıda, hesaba bağlı olmadan durabilir.",
  },
  {
    id: "hukuk",
    title: "Hukuki sebepler (KVKK md. 5)",
    body: "Hesap ve sohbet, sözleşmenin kurulması ve ifası ile açık rızaya dayanır. Giriş yapılmadan Pano, Asistan ve Cihaz açılmaz. İsteğe bağlı çerez (yazı tipi, harita) için açık rıza alınır; reddetmek asistanı kapatmaz. İstasyon telemetrisi orman izleme meşru menfaati ve kamu yararı çerçevesinde işlenir; kişi sayısı tutulmaz.",
  },
  {
    id: "aktarim",
    title: "Yurt dışı aktarım ve işleyenler",
    body: "Clerk, Inc. (ABD) hesabı tutar. Vercel barındırır. Supabase paket tablosunu tutar. ntfy.sh alarm konusunu barındırır. Cloudflare hem Clerk bot koruması hem asistan tünelidir. Google Fonts ve OpenStreetMap yalnız açık rıza varsa çağrılır. KVKK md. 9 kapsamında bu aktarımlar hizmetin sunulması için yapılır. ABD’de CLOUD Act kapsamı Clerk ve Vercel için geçerlidir; ayrı bir Adequacy kararı bu metinde iddia edilmez.",
  },
  {
    id: "sure",
    title: "Saklama",
    body: "Clerk hesabı silinene kadar durur. Sohbet, bu tarayıcının localStorage kaydı ve hesap kimliği ile sınırlıdır; sunucuya sohbet arşivi yazılmaz. Pi üzerinde soru geçici işlenir; kalıcı sohbet hesabı yoktur. Paketler panoda son 24 saattir. Çerez tercihi bu tarayıcıda kalır.",
  },
  {
    id: "haklar",
    title: "KVKK md. 11 hakları",
    body: "Veri konusu kişi öğrenme, düzeltme, silme, aktarılan üçüncü kişileri bilme, itiraz ve zararın giderilmesini isteme hakkına sahiptir. Bu üründe sohbet bu tarayıcıda hesaba yazılır; indirme ve silme bu sayfadadır. Clerk hesabı UserButton veya bu sayfadaki silme ile kapanır. Cevap süresi 30 gündür. Kurul’a (Kişisel Verileri Koruma Kurulu, Ankara) şikayet yolu açıktır. BTK elektronik haberleşme çerez kuralları isteğe bağlı çerez için ret imkânını zorunlu kılar; ret kabul ile aynı yerdedir.",
  },
  {
    id: "gdpr",
    title: "GDPR (AB) ve ABD",
    body: "AB sakinleri için GDPR md. 13/14 bilgilendirme, md. 15 erişim, md. 17 silme, md. 20 taşınabilirlik bu sayfadaki indirme ve silme ile karşılanır. Satış yoktur. Reklam ağı yoktur. Kaliforniya CCPA/CPRA: kişisel veri satılmaz ve reklam için paylaşılmaz. Do Not Sell or Share talebi bu ürün için fiilen boştur; yine de sohbet silme ve hesap silme çalışır. 18 yaşından küçüklerden hesap istenmez.",
  },
  {
    id: "sinir",
    title: "Sınır",
    body: "Bu metin ürünün KVKK aydınlatma metnidir. VERBIS kaydı, avukat onayı ve Clerk üretim anahtarı veri sorumlusunun işidir. GDPR sertifikası iddiası yoktur.",
  },
];

export function privacyBlob() {
  return PRIVACY_SECTIONS.map((row) => `${row.title}\n${row.body}`).join("\n");
}
