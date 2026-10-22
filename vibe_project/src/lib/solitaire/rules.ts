import type { Card } from "./types";

export function isRed(card: Card): boolean {
  return card.suit === "hearts" || card.suit === "diamonds";
}

// עמודת tableau: הקלף המונח נמוך בדרגה אחת מהעליון ובצבע הפוך.
// עמודה ריקה מקבלת רק מלך.
export function canPlaceOnTableau(card: Card, column: readonly Card[]): boolean {
  const top = column[column.length - 1];
  if (!top) return card.rank === 13;
  return top.faceUp && top.rank === card.rank + 1 && isRed(top) !== isRed(card);
}

// ערימת יסוד: ריקה מקבלת רק אס. אחרת — אותו סוג, דרגה גבוהה באחת.
export function canPlaceOnFoundation(card: Card, foundation: readonly Card[]): boolean {
  const top = foundation[foundation.length - 1];
  if (!top) return card.rank === 1;
  return top.suit === card.suit && top.rank === card.rank - 1;
}
