import { createClient } from "@supabase/supabase-js";
import { supabaseAnon, supabaseUrl } from "./config.js";

function clientUrl() {
  // Loopback pages cannot fetch a private LAN PostgREST host.
  // Vite proxies /rest only when VITE_SUPABASE_URL is http://...
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (
      protocol === "http:" &&
      (hostname === "127.0.0.1" || hostname === "localhost") &&
      /^http:\/\//i.test(supabaseUrl)
    ) {
      return window.location.origin;
    }
  }
  return supabaseUrl || "https://invalid.supabase.co";
}

const url = clientUrl();
const anon = supabaseAnon || "anon";

export const supabase = createClient(url, anon);
