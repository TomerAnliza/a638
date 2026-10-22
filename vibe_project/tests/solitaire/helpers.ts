import type { Card, GameState, Rank, Suit } from "@/lib/solitaire";

// יוצר קלף לבדיקות. גלוי כברירת מחדל.
export function card(rank: Rank, suit: Suit, faceUp = true): Card {
  return { id: `${suit}-${rank}`, suit, rank, faceUp };
}

// מצב ריק לגמרי, כדי לבנות תרחישים ידניים.
export function blank(): GameState {
  return {
    stock: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
    moves: 0,
    seed: 0,
  };
}
