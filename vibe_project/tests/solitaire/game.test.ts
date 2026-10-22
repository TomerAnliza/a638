import { describe, expect, it } from "vitest";
import { deal, isWon, RANKS, reducer, SUITS, type GameState } from "@/lib/solitaire";
import { blank, card } from "./helpers";

describe("deal", () => {
  const state = deal(42);

  it("שבע עמודות באורכים 1 עד 7", () => {
    expect(state.tableau.map((c) => c.length)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it("רק הקלף האחרון בכל עמודה גלוי", () => {
    for (const column of state.tableau) {
      column.forEach((c, i) => expect(c.faceUp).toBe(i === column.length - 1));
    }
  });
  it("stock = 24 הפוכים, waste ריק, foundations ריקות, מונה 0", () => {
    expect(state.stock).toHaveLength(24);
    expect(state.stock.every((c) => !c.faceUp)).toBe(true);
    expect(state.waste).toEqual([]);
    expect(state.foundations).toEqual([[], [], [], []]);
    expect(state.moves).toBe(0);
  });
  it("כל 52 הקלפים נמצאים בדיוק פעם אחת", () => {
    const ids = [...state.stock, ...state.tableau.flat()].map((c) => c.id);
    expect(new Set(ids).size).toBe(52);
  });
  it("דטרמיניסטית לפי seed", () => {
    expect(deal(42)).toEqual(state);
  });
});

describe("DRAW", () => {
  it("מעבירה קלף אחד מ-stock ל-waste, גלוי, ומעלה את המונה", () => {
    const s0 = deal(1);
    const top = s0.stock[s0.stock.length - 1];
    const s1 = reducer(s0, { type: "DRAW" });
    expect(s1.stock).toHaveLength(23);
    expect(s1.waste).toHaveLength(1);
    expect(s1.waste[0]).toEqual({ ...top, faceUp: true });
    expect(s1.moves).toBe(1);
  });

  it("כש-stock ריק — מחזירה את waste ל-stock בסדר הפוך, הכול הפוך", () => {
    const s = blank();
    s.waste = [card(5, "hearts"), card(9, "clubs"), card(2, "spades")];
    const r = reducer(s, { type: "DRAW" });
    expect(r.waste).toEqual([]);
    expect(r.stock.map((c) => c.id)).toEqual(["spades-2", "clubs-9", "hearts-5"]);
    expect(r.stock.every((c) => !c.faceUp)).toBe(true);
    expect(r.moves).toBe(1);
  });

  it("כששניהם ריקים — המצב לא משתנה", () => {
    const s = blank();
    expect(reducer(s, { type: "DRAW" })).toBe(s);
  });
});

describe("MOVE", () => {
  it("רצף מ-tableau ל-tableau, וחשיפת הקלף שנותר", () => {
    const s = blank();
    s.tableau[0] = [card(13, "spades", false), card(7, "diamonds"), card(6, "clubs")];
    s.tableau[1] = [card(8, "spades")];
    const r = reducer(s, {
      type: "MOVE",
      from: { kind: "tableau", index: 0, cardIndex: 1 },
      to: { kind: "tableau", index: 1 },
    });
    expect(r.tableau[1].map((c) => c.id)).toEqual(["spades-8", "diamonds-7", "clubs-6"]);
    expect(r.tableau[0]).toEqual([card(13, "spades", true)]);
    expect(r.moves).toBe(1);
  });

  it("רצף שמכיל קלף הפוך — לא חוקי, המצב לא משתנה", () => {
    const s = blank();
    s.tableau[0] = [card(7, "diamonds", false), card(6, "clubs")];
    s.tableau[1] = [card(8, "spades")];
    const r = reducer(s, {
      type: "MOVE",
      from: { kind: "tableau", index: 0, cardIndex: 0 },
      to: { kind: "tableau", index: 1 },
    });
    expect(r).toBe(s);
  });

  it("waste → foundation, ואז tableau → foundation", () => {
    const s = blank();
    s.waste = [card(1, "spades")];
    s.tableau[3] = [card(2, "spades")];
    const r1 = reducer(s, {
      type: "MOVE",
      from: { kind: "waste" },
      to: { kind: "foundation", index: 0 },
    });
    expect(r1.waste).toEqual([]);
    expect(r1.foundations[0].map((c) => c.id)).toEqual(["spades-1"]);
    const r2 = reducer(r1, {
      type: "MOVE",
      from: { kind: "tableau", index: 3, cardIndex: 0 },
      to: { kind: "foundation", index: 0 },
    });
    expect(r2.foundations[0].map((c) => c.id)).toEqual(["spades-1", "spades-2"]);
    expect(r2.tableau[3]).toEqual([]);
    expect(r2.moves).toBe(2);
  });

  it("foundation → tableau", () => {
    const s = blank();
    s.foundations[1] = [card(1, "spades"), card(2, "spades")];
    s.tableau[2] = [card(3, "hearts")];
    const r = reducer(s, {
      type: "MOVE",
      from: { kind: "foundation", index: 1 },
      to: { kind: "tableau", index: 2 },
    });
    expect(r.foundations[1].map((c) => c.id)).toEqual(["spades-1"]);
    expect(r.tableau[2].map((c) => c.id)).toEqual(["hearts-3", "spades-2"]);
  });

  it("K לעמודה ריקה — כן; 5 לעמודה ריקה — לא", () => {
    const s = blank();
    s.waste = [card(13, "hearts")];
    const ok = reducer(s, {
      type: "MOVE",
      from: { kind: "waste" },
      to: { kind: "tableau", index: 6 },
    });
    expect(ok.tableau[6].map((c) => c.id)).toEqual(["hearts-13"]);

    const s2 = blank();
    s2.waste = [card(5, "hearts")];
    expect(
      reducer(s2, { type: "MOVE", from: { kind: "waste" }, to: { kind: "tableau", index: 6 } }),
    ).toBe(s2);
  });

  it("מהלכים לא חוקיים מחזירים את אותו אובייקט מצב", () => {
    const s = blank();
    s.stock = [card(4, "clubs", false)];
    s.waste = [card(5, "diamonds")];
    s.tableau[0] = [card(8, "spades")];
    s.tableau[1] = [card(3, "diamonds"), card(2, "spades")];
    const invalid: Array<Parameters<typeof reducer>[1]> = [
      // דרגה לא מתאימה
      { type: "MOVE", from: { kind: "waste" }, to: { kind: "tableau", index: 0 } },
      // stock אינו מקור
      { type: "MOVE", from: { kind: "stock" }, to: { kind: "tableau", index: 0 } },
      // stock ו-waste אינם יעד
      { type: "MOVE", from: { kind: "waste" }, to: { kind: "stock" } },
      { type: "MOVE", from: { kind: "tableau", index: 0, cardIndex: 0 }, to: { kind: "waste" } },
      // שני קלפים ל-foundation
      { type: "MOVE", from: { kind: "tableau", index: 1, cardIndex: 0 }, to: { kind: "foundation", index: 0 } },
      // מקור ריק
      { type: "MOVE", from: { kind: "foundation", index: 2 }, to: { kind: "tableau", index: 0 } },
      // אותה ערימה
      { type: "MOVE", from: { kind: "tableau", index: 0, cardIndex: 0 }, to: { kind: "tableau", index: 0 } },
    ];
    for (const action of invalid) {
      expect(reducer(s, action)).toBe(s);
    }
    expect(s.moves).toBe(0);
  });
});

describe("מונה מהלכים", () => {
  it("עולה על מהלך חוקי ועל משיכה, לא על מהלך לא חוקי", () => {
    const s = blank();
    s.stock = [card(4, "clubs", false)];
    s.tableau[0] = [card(8, "spades")];
    s.tableau[1] = [card(7, "hearts")];
    const s1 = reducer(s, { type: "DRAW" });
    expect(s1.moves).toBe(1);
    const s2 = reducer(s1, {
      type: "MOVE",
      from: { kind: "waste" },
      to: { kind: "foundation", index: 0 },
    });
    expect(s2).toBe(s1);
    const s3 = reducer(s2, {
      type: "MOVE",
      from: { kind: "tableau", index: 1, cardIndex: 0 },
      to: { kind: "tableau", index: 0 },
    });
    expect(s3.moves).toBe(2);
  });
});

describe("isWon", () => {
  function full(): GameState {
    const s = blank();
    s.foundations = SUITS.map((suit) => RANKS.map((rank) => card(rank, suit)));
    return s;
  }
  it("true כשכל ארבע הערימות מלאות", () => {
    expect(isWon(full())).toBe(true);
  });
  it("false כשחסר קלף אחד", () => {
    const s = full();
    s.foundations[3] = s.foundations[3].slice(0, 12);
    expect(isWon(s)).toBe(false);
  });
  it("false בחלוקה פותחת", () => {
    expect(isWon(deal(3))).toBe(false);
  });
});

describe("NEW_GAME", () => {
  it("מחזירה חלוקה חדשה לפי ה-seed", () => {
    const s = reducer(blank(), { type: "NEW_GAME", seed: 7 });
    expect(s).toEqual(deal(7));
    expect(s.seed).toBe(7);
  });
});
