import { createClient } from "@supabase/supabase-js";
import { supabaseAnon, supabaseUrl } from "./config.js";

const url = supabaseUrl || "https://invalid.supabase.co";
const anon = supabaseAnon || "anon";

export const supabase = createClient(url, anon);
