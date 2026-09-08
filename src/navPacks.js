const SPECS = [
  { href: "/moduller#govde", label: "IP-67 Alüminyum kutu" },
  { href: "/moduller#max6675", label: "MAX6675 sıcaklık" },
  { href: "/moduller#gps", label: "NEO GPS" },
  { href: "/moduller#mq9", label: "MQ-9 gaz" },
  { href: "/moduller#flame", label: "Kızılötesi alev" },
  { href: "/moduller#lora", label: "Ra-02 LoRa" },
];

export const NAV_PACKS = [
  {
    id: "urun",
    label: "Ürün",
    tone: "tone-box",
    tabs: [
      { to: "/", label: "Ana", end: true, tone: "tone-box" },
      { to: "/moduller", label: "Modüller", tone: "tone-box" },
      { to: "/sistem", label: "Sistem", tone: "tone-box" },
      { to: "/karisim", label: "Karışım", tone: "tone-mix" },
      { to: "/analizler", label: "Analizler", tone: "tone-mix" },
    ],
  },
  {
    id: "izle",
    label: "İzleme",
    tone: "tone-pan",
    tabs: [
      { to: "/dashboard", label: "Pano", tone: "tone-pan" },
      { to: "/asistan", label: "Asistan", ariaLabel: "Yapay zeka asistan", tone: "tone-pan" },
      { to: "/eklentiler", label: "Eklenti", tone: "tone-pan" },
    ],
    overlay: [
      { to: "/dashboard", label: "Pano", tone: "tone-pan" },
      { to: "/asistan", label: "Asistan", tone: "tone-pan" },
      { to: "/makine", label: "Öğrenme", tone: "tone-pan" },
      { to: "/eklentiler", label: "Eklenti", tone: "tone-pan" },
    ],
  },
  {
    id: "kutu",
    label: "Donanım",
    tone: "tone-dev",
    tabs: [{ to: "/cihaz", label: "Cihaz", tone: "tone-dev" }],
    specs: SPECS,
  },
];

export const DESKTOP_TABS = NAV_PACKS.flatMap((pack) => pack.tabs);

export function overlayLinks(pack) {
  return pack.overlay || pack.tabs;
}
