"use client";

import type { Card } from "@/lib/solitaire";
import { CARD_HEIGHT, CardView, EmptySlot } from "./Card";

interface StockPileProps {
  top: Card | undefined;
  onClick: () => void;
}

// ערימת המשיכה. לחיצה מושכת קלף; כשהיא ריקה — לחיצה מחזירה את waste.
export function StockPile({ top, onClick }: StockPileProps) {
  if (!top) return <EmptySlot label="ערימת משיכה ריקה, לחיצה מחזירה את הקלפים" symbol="↻" onClick={onClick} />;
  return <CardView card={top} onClick={onClick} />;
}

interface TopCardPileProps {
  top: Card | undefined;
  selected: boolean;
  emptyLabel: string;
  emptySymbol?: string;
  onClick: () => void;
}

// ערימה שמציגה רק את הקלף העליון: waste או foundation.
export function TopCardPile({ top, selected, emptyLabel, emptySymbol, onClick }: TopCardPileProps) {
  if (!top) return <EmptySlot label={emptyLabel} symbol={emptySymbol} onClick={onClick} />;
  return <CardView card={top} selected={selected} onClick={onClick} />;
}

interface TableauColumnProps {
  cards: Card[];
  selectedFrom: number | null; // אינדקס הקלף הראשון שנבחר, או null
  onCardClick: (cardIndex: number) => void;
  onEmptyClick: () => void;
}

// כמה פיקסלים מהקלף הקודם נשארים גלויים מתחת לקלף הבא
const FACE_UP_PEEK = 28;
const FACE_DOWN_PEEK = 12;

// עמודת tableau: הקלפים מונחים בחפיפה, כל קלף מציץ מתחת לקלף שמעליו.
export function TableauColumn({ cards, selectedFrom, onCardClick, onEmptyClick }: TableauColumnProps) {
  if (cards.length === 0) {
    return <EmptySlot label="עמודה ריקה" onClick={onEmptyClick} />;
  }
  return (
    <div className="flex flex-col">
      {cards.map((card, i) => {
        const previous = cards[i - 1];
        const peek = previous ? (previous.faceUp ? FACE_UP_PEEK : FACE_DOWN_PEEK) : 0;
        return (
          <div key={card.id} style={{ marginTop: i === 0 ? 0 : peek - CARD_HEIGHT }}>
            <CardView
              card={card}
              selected={selectedFrom !== null && i >= selectedFrom}
              onClick={() => onCardClick(i)}
            />
          </div>
        );
      })}
    </div>
  );
}
