export const CONSENT_KEY = "aog-consent-v1";

export function defaultConsent() {
  return {
    version: 1,
    decided: false,
    necessary: true,
    fonts: false,
    map: false,
  };
}

export function readConsent() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
    if (!parsed || parsed.version !== 1 || parsed.decided !== true) {
      return defaultConsent();
    }
    return {
      version: 1,
      decided: true,
      necessary: true,
      fonts: parsed.fonts === true,
      map: parsed.map === true,
    };
  } catch {
    return defaultConsent();
  }
}

export function writeConsent({ fonts = false, map = false } = {}) {
  const next = {
    version: 1,
    decided: true,
    necessary: true,
    fonts: fonts === true,
    map: map === true,
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("aog-consent"));
  }
  return next;
}

export function hasConsent(kind) {
  if (kind === "necessary") return true;
  const row = readConsent();
  if (!row.decided) return false;
  return row[kind] === true;
}

export function openConsentPanel() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("aog-consent-open"));
  }
}
