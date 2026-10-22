import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// לקוח Supabase לדפדפן. המשתנים מתחילים ב-NEXT_PUBLIC_ ולכן נכנסים לחבילת הלקוח —
// זה בסדר רק למפתח הציבורי (publishable). המפתח הסודי לעולם לא נכנס לכאן.
//
// יצירה עצלה: המודול לא זורק שגיאה בזמן ייבוא, רק כשמישהו באמת מבקש את הלקוח.
// כך build עובר גם בלי .env.local, ומי שחסר לו המפתח מקבל הודעה ברורה בזמן ריצה.
let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "חסר NEXT_PUBLIC_SUPABASE_URL או NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ראה .env.example",
    );
  }
  client = createClient(url, key);
  return client;
}
