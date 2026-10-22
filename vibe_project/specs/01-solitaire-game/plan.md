# תוכנית 01 — משחק סוליטייר

| שדה | ערך |
|---|---|
| מפרט | `spec.md` באותה תיקייה |
| נוצר | 20 באוקטובר 2026 |

## עקרון מנחה

**הלוגיקה טהורה, הממשק דק.** כל חוקי המשחק חיים בפונקציות TypeScript ללא React,
ללא DOM, וללא אקראיות סמויה. הממשק רק מצייר מצב ושולח פעולות. כך קריטריונים 1–10
נבדקים ב-Vitest בלי דפדפן, וקריטריון 11 נבדק ביד.

## טכנולוגיות

| רכיב | בחירה | למה |
|---|---|---|
| מסגרת | Next.js (App Router), TypeScript, תיקיית `src/` | נדרש במפרט |
| עיצוב | Tailwind CSS | מגיע עם `create-next-app`, מספיק לציור קלפים ללא תמונות |
| מצב | `useReducer` של React | מצב המשחק הוא אובייקט אחד, פעולות בדידות, ללא ספריית מצב |
| בדיקות | Vitest | מהיר, TypeScript ללא הגדרה, מתאים ללוגיקה טהורה |
| אקראיות | מחולל פסאודו-אקראי עם seed (mulberry32) | בדיקות דטרמיניסטיות. `Math.random` רק לבחירת seed במשחק חדש |

## מבנה קבצים

```text
src/
├── app/
│   ├── layout.tsx            # נוצר ע"י create-next-app, מותאם לכותרת ולשפה
│   ├── page.tsx              # מרנדר <Board />
│   └── globals.css
├── lib/solitaire/
│   ├── types.ts              # Suit, Rank, Card, Pile, GameState, Action, Location
│   ├── deck.ts               # createDeck, shuffle(deck, seed), rng
│   ├── rules.ts              # canPlaceOnTableau, canPlaceOnFoundation, isRed
│   ├── game.ts               # deal(seed), reducer(state, action), isWon
│   └── index.ts              # ייצוא
└── components/solitaire/
    ├── Card.tsx              # קלף אחד — גלוי / הפוך / נבחר
    ├── Pile.tsx              # ערימה — stock, waste, foundation או עמודת tableau
    └── Board.tsx             # הלוח, useReducer, מודל הבחירה, כותרת ומונה
tests/
└── solitaire/
    ├── deck.test.ts
    ├── rules.test.ts
    └── game.test.ts
```

## מודל הנתונים

```ts
type Suit = "spades" | "hearts" | "diamonds" | "clubs";
type Rank = 1 | 2 | ... | 13;                 // A=1, J=11, Q=12, K=13
type Card = { id: string; suit: Suit; rank: Rank; faceUp: boolean };

type Location =
  | { kind: "stock" }
  | { kind: "waste" }
  | { kind: "foundation"; index: 0 | 1 | 2 | 3 }
  | { kind: "tableau"; index: 0..6; cardIndex: number };  // cardIndex — מאיזה קלף מתחיל הרצף

type GameState = {
  stock: Card[]; waste: Card[];
  foundations: Card[][];     // 4
  tableau: Card[][];         // 7
  moves: number; seed: number;
};

type Action =
  | { type: "NEW_GAME"; seed: number }
  | { type: "DRAW" }
  | { type: "MOVE"; from: Location; to: Location };
```

הכיוון של כל מערך: האיבר האחרון הוא הקלף העליון.

## החלטות

1. **`MOVE` מקבל מקור ויעד, והreducer מאמת.** הממשק אינו יודע חוקים. מהלך לא חוקי
   מחזיר את אותו אובייקט מצב (זהות הפניה), וכך קריטריון 8 נבדק ב-`toBe`
2. **הרצף ב-tableau מוגדר ב-`cardIndex`.** הממשק בוחר קלף, הreducer גוזר משם עד הסוף
   ומוודא שכולם גלויים
3. **הבחירה חיה ב-`Board` ב-`useState`, לא ב-GameState.** היא מצב ממשק, לא מצב משחק
4. **מונה מהלכים ב-reducer**, כדי שקריטריון 9 ייבדק ללא React
5. **אתחול הפרויקט:** `create-next-app` מסרב לתיקייה שיש בה `README.md`. לכן מריצים
   אותו בתיקייה זמנית ומעבירים את התוצר לפרויקט, ללא ה-README שלו

## חלופות שנדחו

| חלופה | למה לא |
|---|---|
| Zustand / Redux | מצב אחד, שלוש פעולות. ספרייה לא מוסיפה דבר |
| גרירה ושחרור | מורכבות ממשק גבוהה, קשה לבדיקה. מחוץ לתחום לפי המפרט |
| Playwright לקריטריון 11 | תשתית כבדה למסך אחד. בדיקה ידנית מתועדת מספיקה לגרסה 1 |
| תמונות קלפים | נכסים חיצוניים, רישיון. CSS מספיק |

## סיכונים

- `create-next-app` עשוי לשנות ברירות מחדל בין גרסאות (ESLint, Turbopack). הפקודה
  המדויקת ופלטה מתועדים ביומן
- תיקיית Dropbox: `node_modules` גדולה. `.gitignore` של Next מכסה גיט, אך לא את Dropbox
