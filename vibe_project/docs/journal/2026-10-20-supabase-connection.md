# 20 באוקטובר 2026 — חיבור ל-Supabase (מפרט 02)

**מפרט:** `specs/02-supabase-connection/` · **סטטוס בסיום:** `done`

## מה נעשה

1. נכתב מפרט תשתית: לקוח, משתני סביבה, בדיקת חיבור. ללא סכמה, ללא Auth
2. הותקנה `@supabase/supabase-js` 2.118
3. תומר יצר בלוח הבקרה פרויקט חדש בשם `solitaire` בארגון TomerAnliza (הפרויקט
   הקיים `wellbeing-shop` מושהה ואינו קשור). סיסמת בסיס הנתונים הוזנה על ידו בלבד
4. שמות המשתנים נלקחו מחלון Connect של הפרויקט: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. תומר הדביק את המפתח הציבורי בצ׳אט והוא
   נכתב ל-`.env.local` בלבד
5. לקוח עצל ב-`src/lib/supabase/client.ts`, `.env.example` בגיט, סקריפט
   `npm run supabase:check`

## למה כך

- **לקוח עצל ולא singleton בזמן ייבוא:** build חייב לעבור גם בלי `.env.local`,
  ומי שחסר לו המפתח מקבל שגיאה ברורה רק כשהוא באמת משתמש
- **ללא `@supabase/ssr` ו-proxy:** חלון Connect מציע אותם, אבל הם משרתים sessions
  של Auth, שמחוץ לתחום. יוכנסו במפרט Auth כשיידרש
- **`!.env.example` ב-.gitignore:** הכלל `.env*` של Next מחריג גם את התבנית

## תקלה ולקח

בדיקת החיבור הראשונה פנתה ל-`GET /rest/v1/` וקיבלה 401 שש פעמים. ההנחה הראשונה
הייתה שהפרויקט עדיין מאתחל. גוף התשובה גילה את האמת:
`{"message":"Secret API key required","hint":"Only secret API keys can be used for this endpoint."}`.
במערכת המפתחות החדשה (`sb_publishable_` / `sb_secret_`) שורש ה-REST חסום למפתח ציבורי.
`/auth/v1/health` ענה 200 מיד. **הלקח:** לקרוא את גוף התשובה לפני שמנחשים סיבה.
המפרט תוקן במפורש (קריטריון 3), לא בשקט.

## מה אומת

| בדיקה | תוצאה |
|---|---|
| `npm run supabase:check` | סטטוס 200, Auth v2.197.0 |
| `git check-ignore .env.local` | מוחרג |
| `git check-ignore .env.example` | נכנס לגיט |
| `tsc`, `lint`, `build` | עוברים |

## מה נשאר פתוח

- לא בוצע קומיט, לא התבקש
- המפתח הסודי לא נשמר בשום מקום אצלנו, ואין צורך בו כרגע
- מה נשמר ב-Supabase (ניקוד? משחקים?) — מפרט 03 כשתומר יחליט
