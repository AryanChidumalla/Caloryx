import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://okldrvijxzysbneraazb.supabase.co";
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rbGRydmlqeHp5c2JuZXJhYXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDA5OTksImV4cCI6MjA4NTI3Njk5OX0.TSwStcdqP9Akk655C9xkugvfg49tiUehomE0Jj4Eefo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
