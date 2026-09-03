import { asStationId } from "./stationPair.js";

export const supabaseUrl = String(
  import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_Akilli_Orman_Gozlemcisi_SUPABASE_URL ||
    "https://pffvskcoaqnzgvjbnlfj.supabase.co",
).trim();

export const supabaseAnon = String(
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_Akilli_Orman_Gozlemcisi_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZnZza2NvYXFuemd2amJubGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMzAyNzYsImV4cCI6MjEwMzgwNjI3Nn0.6gsxJcRHOFxEXWCncM57E6ktLPPL8ZhifLCjqr-1H5g",
).trim();

export const STATION_ID = asStationId(import.meta.env.VITE_STATION_ID) || "AOG-DEMO-1";

// ntfy.sh topics are publish credentials: anyone who knows the name can post.
// Never hardcode one here; set VITE_NTFY_TOPIC in the deploy environment.
export const NTFY_TOPIC = String(
  import.meta.env.VITE_NTFY_TOPIC || import.meta.env.NEXT_PUBLIC_NTFY_TOPIC || "",
).trim();
