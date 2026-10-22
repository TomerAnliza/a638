import { describe, expect, it } from "vitest";
import { createDeck, shuffle, SUITS } from "@/lib/solitaire";

describe("createDeck", () => {
  it("מחזירה 52 קלפים ייחודיים, 13 מכל סוג, כולם הפוכים", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((c) => c.id)).size).toBe(52);
    for (const suit of SUITS) {
      expect(deck.filter((c) => c.suit === suit)).toHaveLength(13);
    }
    expect(deck.every((c) => !c.faceUp)).toBe(true);
  });
});

describe("shuffle", () => {
  it("אותו seed מחזיר אותו סדר", () => {
    const deck = createDeck();
    expect(shuffle(deck, 42)).toEqual(shuffle(deck, 42));
  });

  it("seed שונה מחזיר סדר שונה", () => {
    const deck = createDeck();
    const a = shuffle(deck, 1).map((c) => c.id);
    const b = shuffle(deck, 2).map((c) => c.id);
    expect(a).not.toEqual(b);
  });

  it("אינה משנה את המקור ושומרת על אותם קלפים", () => {
    const deck = createDeck();
    const before = deck.map((c) => c.id);
    const shuffled = shuffle(deck, 7);
    expect(deck.map((c) => c.id)).toEqual(before);
    expect(shuffled.map((c) => c.id).sort()).toEqual(before.slice().sort());
  });
});
