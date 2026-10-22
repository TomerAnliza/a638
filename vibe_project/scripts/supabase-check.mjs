// בדיקת חיבור ל-Supabase: פנייה ל-/auth/v1/health של הפרויקט עם המפתח הציבורי.
// הרצה: npm run supabase:check   (קורא את .env.local דרך --env-file)
// מדפיס רק סטטוס. לעולם לא מדפיס את המפתח.
//
// למה לא /rest/v1/ ? שורש ה-REST (מפרט OpenAPI) דורש מפתח סודי במערכת המפתחות
// החדשה של Supabase (sb_publishable_ / sb_secret_). נבדק ב-20 באוקטובר 2026:
// 401 {"message":"Secret API key required"}. נקודת health של Auth עונה 200 למפתח ציבורי.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("חסר NEXT_PUBLIC_SUPABASE_URL או NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ב-.env.local");
  process.exit(1);
}

const res = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key } });
const body = res.ok ? await res.json() : null;
console.log(
  `חיבור ל-${new URL(url).host}: סטטוס ${res.status}` +
    (body?.version ? ` (Auth ${body.version})` : ""),
);
process.exit(res.ok ? 0 : 1);
