import { CONTROLLER } from "./privacyCopy.js";

export const DESTEK_PARAGRAPHS = [
  "Akıllı Orman Gözlemcisi (AOG), Defenders Of Green (DOG) takımının projesidir.",
  "Yazılım kar amacı gütmez. Bağış veya para kabul etmeyiz.",
  "Kaynak kodunun tamamı MIT lisansı ile açıktır.",
  "Destek için GitHub deposunu yıldızlayın.",
];

export const DESTEK_THANKS = "Teşekkürler.";

export function destekBlob() {
  return [...DESTEK_PARAGRAPHS, DESTEK_THANKS, CONTROLLER.github].join("\n");
}
