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

export function useClerkFlag() {
  return Boolean(clerkPublishableKey());
}
