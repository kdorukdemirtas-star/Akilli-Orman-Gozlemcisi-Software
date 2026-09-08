import { createClient } from "@supabase/supabase-js";
import { supabaseAnon, supabaseUrl } from "./config.js";

function clientUrl() {
  // Loopback pages cannot fetch the Pi LAN address (private network).
  // Vite proxies /rest to PostgREST in both `dev` and `preview`.
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (protocol === "http:" && (hostname === "127.0.0.1" || hostname === "localhost")) {
      return window.location.origin;
    }
  }
  return supabaseUrl || "https://invalid.supabase.co";
}

const url = clientUrl();
const anon = supabaseAnon || "anon";

export const supabase = createClient(url, anon);
