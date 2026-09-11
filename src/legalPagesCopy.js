import { CONTROLLER } from "./privacyCopy.js";

export const LEGAL_DATE = "11 Eylül 2026";

export const LEGAL_LINKS = [
  { to: "/gizlilik", label: "Gizlilik" },
  { to: "/cerezler", label: "Çerezler" },
  { to: "/eula", label: "EULA" },
  { to: "/dmca", label: "DMCA" },
  { to: "/erisilebilirlik", label: "Erişilebilirlik" },
  { to: "/destek", label: "Destek" },
];

export const EULA_LEAD =
  "Barındırılan PWA için kullanım şartları. Kaynak kodu MIT lisansı ile açıktır. App Store EULA şablonu değildir.";

export const EULA_SECTIONS = [
  {
    id: "kaynak",
    title: "Kaynak kodu",
    paragraphs: [
      "Yazılımın kaynağı GitHub deposunda MIT lisansıdır. Lisans metnindeki telif ve izin bildirimi durduğu sürece kopyalama, değiştirme, dağıtma ve ticari kullanım serbesttir.",
      "Bu metin MIT haklarını daraltmaz. Paylaşmayı veya türev işi yasaklayan madde yoktur.",
    ],
  },
  {
    id: "kopya",
    title: "Barındırılan kopya",
    paragraphs: [
      `${CONTROLLER.site} üzerindeki kopya Clerk hesabı ve Vercel barındırması ile çalışır. Bu kopyayı kullanmak Clerk ve Vercel şartlarına da bağlıdır.`,
      "Apple cihazında ana ekrana eklersen Apple’ın standart son kullanıcı lisansına da bağlısın.",
    ],
  },
  {
    id: "sinir",
    title: "Ürün sınırı",
    paragraphs: [
      "Pano, bağlı istasyonun sıcaklık, alev ve gaz paketlerini yaklaşık 24 saat gösterir. Asistan, eşleme ve donanım notları aynı üründür.",
      "Yangın söndürme, itfaiye çağrısı veya resmi erken uyarı sistemi değildir. Alarm metni otomatik ekip göndermez.",
    ],
  },
  {
    id: "garanti",
    title: "Garanti yok",
    paragraphs: [
      "MIT metni geçerlidir: yazılım AS IS, olduğu gibi sunulur. Ticari elverişlilik, belirli amaca uygunluk ve ihlal etmeme garantisi yoktur.",
      "Sürüm, özellik veya güncelleme sözü yoktur. Kusur bildirimi için süre veya şirket e-postası tanımlanmaz.",
    ],
  },
  {
    id: "sorumluluk",
    title: "Sorumluluk",
    paragraphs: [
      "MIT: yazarlar, yazılımdan veya kullanımdan doğan talep, zarar veya başka yükümlülükten sorumlu değildir. Sözleşme, haksız fiil veya başka hukuki temel bu cümleyi değiştirmez.",
      "İstasyondaki ölçüm veya alarm üzerine müdahale kararı kullanıcıya aittir.",
    ],
  },
  {
    id: "hesap",
    title: "Hesap",
    paragraphs: [
      "Pano ve cihaz bağlama Clerk GitHub girişi ister. Hesabı Gizlilik sayfasındaki araçlarla silebilirsin.",
    ],
  },
  {
    id: "basvuru",
    title: "Başvuru",
    paragraphs: [
      "Ayrı bir şirket e-postası yayımlanmaz. Soru ve bildirim GitHub deposundadır.",
    ],
  },
];

export const DMCA_LEAD =
  "Açık kaynak olsa da dışarıdaki kopya için telif yolu. ABD’de kayıtlı 17 U.S.C. § 512 temsilcimiz yoktur.";

export const DMCA_SECTIONS = [
  {
    id: "barinma",
    title: "Ne barındırılmaz",
    paragraphs: [
      "Bu PWA üçüncü kişilerin fotoğraf, video veya dosya yüklemesine açık bir depo değildir. Asistan sohbeti bu tarayıcıda durur; herkese açık medya duvarı yoktur.",
    ],
  },
  {
    id: "lisans",
    title: "Lisans",
    paragraphs: [
      "Bizim yazdığımız kod MIT lisansıdır. Clerk, Vercel ve diğer bağımlılıkların kendi lisansları vardır.",
    ],
  },
  {
    id: "sikayet",
    title: "Şikayet",
    paragraphs: [
      "Telif şikayeti GitHub’un DMCA süreci ile gider: https://github.com/contact/dmca",
      `Depo: ${CONTROLLER.github}`,
      "Kayıtlı 512 temsilci e-postası yayımlanmaz. Bu sayfa copyright.gov ajan kaydı değildir.",
    ],
  },
  {
    id: "sahte",
    title: "Sahte bildirim",
    paragraphs: [
      "Bilerek yanlış kaldırma talebi gönderme. GitHub süreci sahte bildirimi reddeder.",
    ],
  },
];

export const A11Y_LEAD =
  "Dava riskini azaltmak için uyum belgesi yazmıyoruz. Durum ve bilinen boşluklar aşağıdadır.";

export const A11Y_SECTIONS = [
  {
    id: "var",
    title: "Ne var",
    paragraphs: [
      "Belge dili Türkçedir (html lang=tr). Klavye ile ilk odak “İçeriğe atla” atlar. HUD, menü ve yasal sayfalar sekme sırası ile dolaşılır.",
      "Çerez çubuğundaki kutuların görünür etiketi vardır. Logo metin alternatifi “AOG”.",
    ],
  },
  {
    id: "iddia",
    title: "Ne iddia edilmez",
    paragraphs: [
      "WCAG 2.2 A, AA veya AAA uygunluğu ölçülmedi. Bu metin o iddiayı taşımaz.",
      "ADA Title III, EN 301 549 veya Türk e-Devlet erişilebilirlik kılavuzu belgesi yoktur. “Erişilebilirlik politikası” bu boşluğu kapatmaz.",
    ],
  },
  {
    id: "bosluk",
    title: "Bilinen boşluklar",
    paragraphs: [
      "Aşağıdaki satırlar kasten yazıldı. Gizlenmiş uyum listesi değildir.",
    ],
  },
  {
    id: "bildirim",
    title: "Bildirim",
    paragraphs: [
      "Engel, klavye tuzağı veya etiket hatası GitHub deposuna issue olarak yazılır. Ayrı erişilebilirlik e-postası yoktur.",
    ],
  },
];

export const A11Y_GAPS = [
  {
    where: "Clerk giriş",
    gap: "Kart İngilizce kalabilir; bizim HUD değildir",
  },
  {
    where: "Çerez çubuğu",
    gap: "Sayfanın altında ızgara satırında durur; kaydedilmeden kapanmaz",
  },
  {
    where: "HUD",
    gap: "Üstte sabit şerit; küçük ekranda sekme kaydırılır",
  },
  {
    where: "Asistan",
    gap: "Uzun yanıtlar; sohbet geçmişi bu tarayıcıdadır",
  },
  {
    where: "Harita",
    gap: "OpenStreetMap karosu görseldir; rıza yoksa yüklenmez",
  },
];

function flatten(sections) {
  return sections.flatMap((row) => [
    row.title,
    ...(row.paragraphs || []),
    ...(row.list || []),
  ]);
}

export function eulaBlob() {
  return [...flatten(EULA_SECTIONS), EULA_LEAD, CONTROLLER.github].join("\n");
}

export function dmcaBlob() {
  return [...flatten(DMCA_SECTIONS), DMCA_LEAD, CONTROLLER.github].join("\n");
}

export function a11yBlob() {
  return [
    ...flatten(A11Y_SECTIONS),
    A11Y_LEAD,
    ...A11Y_GAPS.flatMap((row) => [row.where, row.gap]),
    CONTROLLER.github,
  ].join("\n");
}
