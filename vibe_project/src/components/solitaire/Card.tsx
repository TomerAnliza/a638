"use client";

import { type Card, isRed } from "@/lib/solitaire";

const SUIT_SYMBOL: Record<Card["suit"], string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

const RANK_LABEL = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// מידות הקלף בפיקסלים. מתואם למחלקות w-16 / h-24 של Tailwind.
export const CARD_HEIGHT = 96;

interface CardViewProps {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
}

// קלף אחד: גלוי (דרגה וסוג) או הפוך (גב). לחיץ, כדי לבחור או לכוון אליו.
export function CardView({ card, selected = false, onClick }: CardViewProps) {
  const base = "h-24 w-16 shrink-0 select-none rounded-md border shadow-md";

  if (!card.faceUp) {
    return (
      <button
        type="button"
        aria-label="קלף הפוך"
        onClick={onClick}
        className={`${base} border-blue-950 bg-blue-800 p-1`}
      >
        <span className="block h-full w-full rounded-sm border-2 border-dashed border-blue-300/60" />
      </button>
    );
  }

  const label = `${RANK_LABEL[card.rank]}${SUIT_SYMBOL[card.suit]}`;
  const color = isRed(card) ? "text-red-600" : "text-slate-900";
  const ring = selected ? "ring-4 ring-yellow-400" : "";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={`${base} flex flex-col justify-between border-slate-300 bg-white p-1 text-left ${color} ${ring}`}
    >
      <span className="text-sm leading-none font-bold">{label}</span>
      <span className="self-center text-2xl leading-none">{SUIT_SYMBOL[card.suit]}</span>
      <span className="rotate-180 self-end text-sm leading-none font-bold">{label}</span>
    </button>
  );
}

interface EmptySlotProps {
  label: string;
  symbol?: string;
  onClick?: () => void;
}

// משבצת ריקה: stock ריק, waste ריק, foundation ריקה או עמודה ריקה.
export function EmptySlot({ label, symbol, onClick }: EmptySlotProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-24 w-16 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-white/40 text-2xl text-white/40"
    >
      {symbol}
    </button>
  );
}
