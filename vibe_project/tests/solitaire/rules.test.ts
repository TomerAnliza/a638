import { describe, expect, it } from "vitest";
import { canPlaceOnFoundation, canPlaceOnTableau } from "@/lib/solitaire";
import { card } from "./helpers";

describe("canPlaceOnTableau", () => {
  it("7♥ על 8♠ — כן (דרגה נמוכה באחת, צבע הפוך)", () => {
    expect(canPlaceOnTableau(card(7, "hearts"), [card(8, "spades")])).toBe(true);
  });
  it("7♥ על 8♦ — לא (אותו צבע)", () => {
    expect(canPlaceOnTableau(card(7, "hearts"), [card(8, "diamonds")])).toBe(false);
  });
  it("7♥ על 9♠ — לא (פער של שתי דרגות)", () => {
    expect(canPlaceOnTableau(card(7, "hearts"), [card(9, "spades")])).toBe(false);
  });
  it("K על עמודה ריקה — כן", () => {
    expect(canPlaceOnTableau(card(13, "clubs"), [])).toBe(true);
  });
  it("5 על עמודה ריקה — לא", () => {
    expect(canPlaceOnTableau(card(5, "clubs"), [])).toBe(false);
  });
  it("על קלף הפוך — לא", () => {
    expect(canPlaceOnTableau(card(7, "hearts"), [card(8, "spades", false)])).toBe(false);
  });
});

describe("canPlaceOnFoundation", () => {
  it("A על ערימה ריקה — כן", () => {
    expect(canPlaceOnFoundation(card(1, "spades"), [])).toBe(true);
  });
  it("2♠ על A♠ — כן", () => {
    expect(canPlaceOnFoundation(card(2, "spades"), [card(1, "spades")])).toBe(true);
  });
  it("2♠ על A♥ — לא (סוג שונה)", () => {
    expect(canPlaceOnFoundation(card(2, "spades"), [card(1, "hearts")])).toBe(false);
  });
  it("3♠ על A♠ — לא (דילוג על דרגה)", () => {
    expect(canPlaceOnFoundation(card(3, "spades"), [card(1, "spades")])).toBe(false);
  });
  it("5 על ערימה ריקה — לא", () => {
    expect(canPlaceOnFoundation(card(5, "spades"), [])).toBe(false);
  });
});
