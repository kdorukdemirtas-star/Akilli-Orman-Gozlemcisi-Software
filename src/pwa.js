export function isStandaloneDisplay({ displayModeStandalone, iosStandalone }) {
  return Boolean(displayModeStandalone || iosStandalone);
}

export function pwaPlatform(ua) {
  const s = String(ua || "");
  if (/iPhone|iPad|iPod/i.test(s)) return "ios";
  if (/Android/i.test(s)) return "android";
  return "other";
}

export function deviceKind(raw) {
  return raw === "ios" || raw === "android" ? raw : "";
}

export function registerPwa() {
  if (!import.meta.env.PROD) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
