import { createDeck, shuffle } from "./deck";
import { canPlaceOnFoundation, canPlaceOnTableau } from "./rules";
import {
  type Action,
  type Card,
  FOUNDATION_COUNT,
  type GameState,
  type Location,
  TABLEAU_COUNT,
} from "./types";

// חלוקה פותחת: עמודה i מקבלת i+1 קלפים, רק האחרון גלוי. השאר ל-stock.
export function deal(seed: number): GameState {
  const deck = shuffle(createDeck(), seed);
  const tableau: Card[][] = [];
  let next = 0;
  for (let col = 0; col < TABLEAU_COUNT; col++) {
    const column: Card[] = [];
    for (let i = 0; i <= col; i++) {
      column.push({ ...deck[next++], faceUp: i === col });
    }
    tableau.push(column);
  }
  return {
    stock: deck.slice(next).map((c) => ({ ...c, faceUp: false })),
    waste: [],
    foundations: Array.from({ length: FOUNDATION_COUNT }, () => []),
    tableau,
    moves: 0,
    seed,
  };
}

export function isWon(state: GameState): boolean {
  return state.foundations.every((f) => f.length === 13);
}

// משיכה: קלף אחד מ-stock ל-waste, גלוי. כש-stock ריק — waste חוזר ל-stock
// בסדר הפוך, הכול הפוך. כששניהם ריקים — אין מה לעשות.
function draw(state: GameState): GameState {
  if (state.stock.length > 0) {
    const stock = state.stock.slice();
    const card = stock.pop() as Card;
    return {
      ...state,
      stock,
      waste: [...state.waste, { ...card, faceUp: true }],
      moves: state.moves + 1,
    };
  }
  if (state.waste.length > 0) {
    const stock = state.waste
      .slice()
      .reverse()
      .map((c) => ({ ...c, faceUp: false }));
    return { ...state, stock, waste: [], moves: state.moves + 1 };
  }
  return state;
}

// אילו קלפים מנסים להזיז מהמקור. null = אין מה להזיז משם.
function takeCards(state: GameState, from: Location): Card[] | null {
  switch (from.kind) {
    case "stock":
      return null;
    case "waste": {
      const top = state.waste.at(-1);
      return top ? [top] : null;
    }
    case "foundation": {
      const top = state.foundations[from.index].at(-1);
      return top ? [top] : null;
    }
    case "tableau": {
      const column = state.tableau[from.index];
      const start = from.cardIndex ?? column.length - 1;
      if (start < 0 || start >= column.length) return null;
      const cards = column.slice(start);
      return cards.every((c) => c.faceUp) ? cards : null;
    }
  }
}

function canPlace(state: GameState, cards: Card[], to: Location): boolean {
  switch (to.kind) {
    case "stock":
    case "waste":
      return false;
    case "foundation":
      return cards.length === 1 && canPlaceOnFoundation(cards[0], state.foundations[to.index]);
    case "tableau":
      return canPlaceOnTableau(cards[0], state.tableau[to.index]);
  }
}

function samePile(a: Location, b: Location): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "tableau" && b.kind === "tableau") return a.index === b.index;
  if (a.kind === "foundation" && b.kind === "foundation") return a.index === b.index;
  return true;
}

// מהלך: מאמת, ואם חוקי — מחזיר מצב חדש. אם לא — מחזיר את אותו אובייקט מצב.
function move(state: GameState, from: Location, to: Location): GameState {
  if (samePile(from, to)) return state;
  const cards = takeCards(state, from);
  if (!cards || !canPlace(state, cards, to)) return state;

  const next: GameState = {
    ...state,
    waste: state.waste.slice(),
    foundations: state.foundations.map((f) => f.slice()),
    tableau: state.tableau.map((c) => c.slice()),
    moves: state.moves + 1,
  };

  // הסרה מהמקור, וחשיפת הקלף שנותר למעלה ב-tableau אם היה הפוך
  switch (from.kind) {
    case "stock":
      return state;
    case "waste":
      next.waste.pop();
      break;
    case "foundation":
      next.foundations[from.index].pop();
      break;
    case "tableau": {
      const column = next.tableau[from.index];
      column.splice(from.cardIndex ?? column.length - 1);
      const top = column[column.length - 1];
      if (top && !top.faceUp) column[column.length - 1] = { ...top, faceUp: true };
      break;
    }
  }

  // הוספה ליעד
  if (to.kind === "foundation") next.foundations[to.index].push(...cards);
  else if (to.kind === "tableau") next.tableau[to.index].push(...cards);
  return next;
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "NEW_GAME":
      return deal(action.seed);
    case "DRAW":
      return draw(state);
    case "MOVE":
      return move(state, action.from, action.to);
  }
}
