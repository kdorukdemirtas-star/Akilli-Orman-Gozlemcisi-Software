export function clerkPublishableKey() {
  const raw = String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "").trim();
  return raw.startsWith("pk_") ? raw : "";
}

export function useClerkFlag() {
  return Boolean(clerkPublishableKey());
}
