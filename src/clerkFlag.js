export function clerkPublishableKey() {
  const raw = String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "").trim();
  return raw.startsWith("pk_") ? raw : "";
}

export function clerkProxyUrl() {
  const key = clerkPublishableKey();
  return key.startsWith("pk_") && !key.startsWith("pk_test_") ? "/__clerk" : "";
}

export function clerkJsUrl() {
  return clerkProxyUrl()
    ? "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@6/dist/clerk.browser.js"
    : "";
}

export function clerkUiUrl() {
  return clerkProxyUrl()
    ? "https://cdn.jsdelivr.net/npm/@clerk/ui@1/dist/ui.browser.js"
    : "";
}

export const clerkAppearance = {
  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    unsafe_disableDevelopmentModeWarnings: true,
  },
  elements: {
    footer: { display: "none" },
    modalBackdrop: {
      alignItems: "center",
      justifyContent: "center",
    },
    modalContent: {
      margin: "auto",
    },
    socialButtons: {
      justifyContent: "center",
    },
    socialButtonsIconButton__google: { display: "none" },
    socialButtonsIconButton__microsoft: { display: "none" },
    socialButtonsBlockButton__google: { display: "none" },
    socialButtonsBlockButton__microsoft: { display: "none" },
  },
};

export function useClerkFlag() {
  return Boolean(clerkPublishableKey());
}
