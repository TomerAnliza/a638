"use client";

import { useReducer, useState } from "react";
import {
  deal,
  type FoundationIndex,
  isWon,
  type Location,
  reducer,
  type TableauIndex,
} from "@/lib/solitaire";
import { StockPile, TableauColumn, TopCardPile } from "./Pile";

function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

function sameLocation(a: Location, b: Location): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "tableau" && b.kind === "tableau") {
    return a.index === b.index && a.cardIndex === b.cardIndex;
  }
  if (a.kind === "foundation" && b.kind === "foundation") return a.index === b.index;
  return true;
}

// הלוח כולו. מצב המשחק ב-reducer טהור; הבחירה היא מצב ממשק בלבד.
export function Board() {
  const [state, dispatch] = useReducer(reducer, undefined, () => deal(randomSeed()));
  const [selected, setSelected] = useState<Location | null>(null);
  const won = isWon(state);

  // מודל האינטראקציה: לחיצה ראשונה בוחרת (אם יש מה לבחור), לחיצה שנייה מכוונת.
  // מהלך לא חוקי מבטל את הבחירה בשקט.
  function handleClick(target: Location, selectable: boolean) {
    if (target.kind === "stock") {
      setSelected(null);
      dispatch({ type: "DRAW" });
      return;
    }
    if (selected === null) {
      if (selectable) setSelected(target);
      return;
    }
    if (sameLocation(selected, target)) {
      setSelected(null);
      return;
    }
    dispatch({ type: "MOVE", from: selected, to: target });
    setSelected(null);
  }

  function newGame() {
    setSelected(null);
    dispatch({ type: "NEW_GAME", seed: randomSeed() });
  }

  const wasteTop = state.waste.at(-1);

  return (
    <div className="mx-auto max-w-5xl">
      <header dir="rtl" className="flex items-center justify-between gap-4 p-4">
        <h1 className="text-2xl font-bold">סוליטייר</h1>
        <div className="flex items-center gap-4">
          <span aria-live="polite">מהלכים: {state.moves}</span>
          <button
            type="button"
            onClick={newGame}
            className="rounded bg-white/20 px-3 py-1 hover:bg-white/30"
          >
            משחק חדש
          </button>
        </div>
      </header>

      {won && (
        <p
          dir="rtl"
          role="status"
          className="mx-4 rounded bg-yellow-300 p-3 text-center text-lg font-bold text-slate-900"
        >
          ניצחת! {state.moves} מהלכים
        </p>
      )}

      {/* הלוח עצמו תמיד משמאל לימין: stock, waste, ואז ארבע ערימות היסוד */}
      <section dir="ltr" className="space-y-6 overflow-x-auto p-4">
        <div className="flex gap-3">
          <StockPile top={state.stock.at(-1)} onClick={() => handleClick({ kind: "stock" }, false)} />
          <TopCardPile
            top={wasteTop}
            selected={selected?.kind === "waste"}
            emptyLabel="ערימת פסולת ריקה"
            onClick={() => handleClick({ kind: "waste" }, wasteTop !== undefined)}
          />
          <div className="w-16" aria-hidden="true" />
          {state.foundations.map((pile, i) => {
            const index = i as FoundationIndex;
            const top = pile.at(-1);
            return (
              <TopCardPile
                key={index}
                top={top}
                selected={selected?.kind === "foundation" && selected.index === index}
                emptyLabel={`ערימת יסוד ${index + 1}, ריקה`}
                emptySymbol="A"
                onClick={() => handleClick({ kind: "foundation", index }, top !== undefined)}
              />
            );
          })}
        </div>

        <div className="flex items-start gap-3">
          {state.tableau.map((column, i) => {
            const index = i as TableauIndex;
            const selectedFrom =
              selected?.kind === "tableau" && selected.index === index
                ? (selected.cardIndex ?? column.length - 1)
                : null;
            return (
              <TableauColumn
                key={index}
                cards={column}
                selectedFrom={selectedFrom}
                onCardClick={(cardIndex) =>
                  handleClick({ kind: "tableau", index, cardIndex }, column[cardIndex].faceUp)
                }
                onEmptyClick={() => handleClick({ kind: "tableau", index }, false)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
