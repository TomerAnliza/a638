// הטיפוסים של משחק הסוליטייר. אין כאן לוגיקה, רק צורת הנתונים.

export const SUITS = ["spades", "hearts", "diamonds", "clubs"] as const;
export type Suit = (typeof SUITS)[number];

// A=1, J=11, Q=12, K=13
export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
export type Rank = (typeof RANKS)[number];

export interface Card {
  id: string; // ייחודי, למשל "hearts-12"
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export const FOUNDATION_COUNT = 4;
export const TABLEAU_COUNT = 7;

export type FoundationIndex = 0 | 1 | 2 | 3;
export type TableauIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// מיקום על הלוח. ב-tableau, cardIndex מציין מאיזה קלף בעמודה מתחיל הרצף שמזיזים.
// כמקור: אם הושמט — הקלף העליון. כיעד: אין לו משמעות.
export type Location =
  | { kind: "stock" }
  | { kind: "waste" }
  | { kind: "foundation"; index: FoundationIndex }
  | { kind: "tableau"; index: TableauIndex; cardIndex?: number };

// בכל מערך קלפים, האיבר האחרון הוא הקלף העליון.
export interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][]; // ארבע ערימות
  tableau: Card[][]; // שבע עמודות
  moves: number;
  seed: number;
}

export type Action =
  | { type: "NEW_GAME"; seed: number }
  | { type: "DRAW" }
  | { type: "MOVE"; from: Location; to: Location };
