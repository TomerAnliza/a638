"use client";

import dynamic from "next/dynamic";

// הלוח נטען בצד הלקוח בלבד: החלוקה הפותחת אקראית, ורינדור בשרת היה יוצר
// אי-התאמה (hydration mismatch) בין מה שהשרת צייר למה שהדפדפן מחשב.
const Board = dynamic(() => import("./Board").then((m) => m.Board), {
  ssr: false,
  loading: () => <p className="p-6 text-center">מערבב את הקלפים…</p>,
});

export function BoardLoader() {
  return <Board />;
}
