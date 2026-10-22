import { type Card, RANKS, SUITS } from "./types";

// חפיסה מלאה: 52 קלפים, כולם הפוכים, בסדר קבוע (לפי סוג ואז דרגה).
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${suit}-${rank}`, suit, rank, faceUp: false });
    }
  }
  return deck;
}

// מחולל פסאודו-אקראי דטרמיניסטי (mulberry32). אותו seed נותן תמיד אותה סדרה,
// ולכן בדיקות יכולות לחזור על אותה חלוקה בדיוק.
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ערבוב Fisher–Yates. מחזיר מערך חדש ואינו משנה את המקור.
export function shuffle(deck: readonly Card[], seed: number): Card[] {
  const rng = createRng(seed);
  const out = deck.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
