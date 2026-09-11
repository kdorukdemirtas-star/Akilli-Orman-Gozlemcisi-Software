import { COPY } from "./uiCopy.js";

export function navPacks(lang = "tr") {
  const n = COPY[lang]?.nav ?? COPY.tr.nav;
  const specs = COPY[lang]?.specs ?? COPY.tr.specs;
  return [
    {
      id: "urun",
      label: n.urun,
      tone: "tone-box",
      tabs: [
        { to: "/", label: n.ana, end: true, tone: "tone-box" },
        { to: "/moduller", label: n.moduller, tone: "tone-box" },
        { to: "/sistem", label: n.sistem, tone: "tone-box" },
        { to: "/karisim", label: n.karisim, tone: "tone-mix" },
        { to: "/analizler", label: n.analizler, tone: "tone-mix" },
      ],
    },
    {
      id: "izle",
      label: n.izle,
      tone: "tone-pan",
      tabs: [
        { to: "/dashboard", label: n.pano, tone: "tone-pan" },
        { to: "/asistan", label: n.asistan, ariaLabel: n.asistanAria, tone: "tone-pan" },
        { to: "/eklentiler", label: n.eklenti, tone: "tone-pan" },
      ],
      overlay: [
        { to: "/dashboard", label: n.pano, tone: "tone-pan" },
        { to: "/asistan", label: n.asistan, tone: "tone-pan" },
        { to: "/makine", label: n.ogrenme, tone: "tone-pan" },
        { to: "/eklentiler", label: n.eklenti, tone: "tone-pan" },
      ],
    },
    {
      id: "kutu",
      label: n.kutu,
      tone: "tone-dev",
      tabs: [
        { to: "/cihaz", label: n.cihaz, tone: "tone-dev" },
        { to: "/destek", label: n.destek, tone: "hud-support" },
      ],
      specs,
    },
  ];
}

export const NAV_PACKS = navPacks("tr");

export const DESKTOP_TABS = NAV_PACKS.flatMap((pack) => pack.tabs);

export function overlayLinks(pack) {
  return pack.overlay || pack.tabs;
}
