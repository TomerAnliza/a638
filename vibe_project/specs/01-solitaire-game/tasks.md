# משימות 01 — משחק סוליטייר

| שדה | ערך |
|---|---|
| מפרט | `spec.md` |
| תוכנית | `plan.md` |
| נוצר | 20 באוקטובר 2026 |

סטטוסים: `todo` · `in-progress` · `done` · `blocked`

| # | משימה | תוצר | קריטריונים | סטטוס |
|---|---|---|---|---|
| 1 | אתחול Next.js (TypeScript, Tailwind, App Router, `src/`), Vitest מוגדר, סקריפט `test` | `npm run dev` מציג עמוד; `npm test` רץ על בדיקה ריקה | 12 | `done` |
| 2 | `types.ts` + `deck.ts`: חפיסה, ערבוב עם seed | `tests/solitaire/deck.test.ts` עובר | 1, 2 | `done` |
| 3 | `game.ts`: `deal(seed)` — חלוקה פותחת | `deal` בבדיקה | 3 | `done` |
| 4 | `rules.ts`: `canPlaceOnTableau`, `canPlaceOnFoundation` | `tests/solitaire/rules.test.ts` עובר | 4, 5 | `done` |
| 5 | `game.ts`: `reducer` — `DRAW` כולל מיחזור, `MOVE` לכל המקורות והיעדים, חשיפה, מונה, `NEW_GAME`, `isWon` | `tests/solitaire/game.test.ts` עובר | 6–10 | `done` |
| 6 | רכיבי `Card`, `Pile`, `Board` עם מודל לחיצה-לבחירה; `page.tsx` | לוח מוצג, מהלכים עובדים בדפדפן | 11 | `done` |
| 7 | כותרת: משחק חדש, מונה מהלכים, הודעת ניצחון | נבדק ביד | 11 | `done` |
| 8 | אימות סופי: `lint`, `test`, `build`; עדכון "איך מריצים" ב-README; רשומת יומן; מפרט → `done` | הכול ירוק, יומן כתוב | 12 | `done` |

| 9 | פריסת הגרסה המקומית לייצור ב־Vercel לפי בקשת תומר מ־20 באוקטובר 2026 | כתובת ציבורית ואימות זמינות | בדיקות, בנייה ומענה HTTP תקין | `done` |

## תלויות

```text
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
```

משימות 2–5 הן לוגיקה טהורה וניתנות לביצוע ללא דפדפן.
