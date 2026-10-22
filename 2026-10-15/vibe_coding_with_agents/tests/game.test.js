// בדיקות ללוגיקה של המשחק. הרצה: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../src/game.js');

// עוזרים: בונים מצב ריק ואז מסדרים בו קלפים ידנית
const card = (suit, rank, up = true) => ({ suit, rank, up });
function emptyState(drawCount = 1) {
  const s = G.newGame({ seed: 1, drawCount });
  s.stock = [];
  s.waste = [];
  s.foundations = [[], [], [], []];
  s.tableau = [[], [], [], [], [], [], []];
  s.moves = 0;
  s.score = 0;
  s.history = [];
  return s;
}

test('חלוקה: 52 קלפים ייחודיים, טורים 1 עד 7, רק העליון גלוי', () => {
  const s = G.newGame({ seed: 42 });
  const all = [...s.stock, ...s.waste, ...s.foundations.flat(), ...s.tableau.flat()];
  assert.equal(all.length, 52);
  assert.equal(new Set(all.map((c) => c.suit + c.rank)).size, 52);
  assert.equal(s.stock.length, 24);
  s.tableau.forEach((pile, i) => {
    assert.equal(pile.length, i + 1);
    pile.forEach((c, j) => assert.equal(c.up, j === i));
  });
});

test('אותו זרע נותן אותה חלוקה, וזרע אחר נותן חלוקה אחרת', () => {
  const a = G.newGame({ seed: 7 });
  const b = G.newGame({ seed: 7 });
  const c = G.newGame({ seed: 8 });
  assert.deepEqual(a.tableau, b.tableau);
  assert.notDeepEqual(a.tableau, c.tableau);
});

test('טור: רק צבע הפוך וערך נמוך באחד', () => {
  const s = emptyState();
  s.tableau[0] = [card('S', 7)];
  s.tableau[1] = [card('H', 6)]; // אדום 6 על שחור 7: חוקי
  s.tableau[2] = [card('C', 6)]; // שחור 6 על שחור 7: אסור
  s.tableau[3] = [card('H', 5)]; // אדום 5 על שחור 7: אסור, פער של שניים
  assert.ok(G.canMove(s, { zone: 'tableau', index: 1, row: 0 }, { zone: 'tableau', index: 0 }));
  assert.ok(!G.canMove(s, { zone: 'tableau', index: 2, row: 0 }, { zone: 'tableau', index: 0 }));
  assert.ok(!G.canMove(s, { zone: 'tableau', index: 3, row: 0 }, { zone: 'tableau', index: 0 }));
});

test('טור ריק מקבל רק מלך, ולא מלך שכבר פותח טור', () => {
  const s = emptyState();
  s.tableau[0] = [card('S', 13)];
  s.tableau[1] = [card('H', 12)];
  s.tableau[2] = [card('D', 5, false), card('C', 13)]; // מלך מעל קלף הפוך
  assert.ok(!G.canMove(s, { zone: 'tableau', index: 1, row: 0 }, { zone: 'tableau', index: 3 }));
  assert.ok(G.canMove(s, { zone: 'tableau', index: 2, row: 1 }, { zone: 'tableau', index: 3 }));
  assert.ok(!G.canMove(s, { zone: 'tableau', index: 0, row: 0 }, { zone: 'tableau', index: 3 }));
});

test('קרן: מתחילה בלהיות אס, באותה צורה, ובקלף אחד בכל פעם', () => {
  const s = emptyState();
  s.tableau[0] = [card('S', 2)];
  s.tableau[1] = [card('S', 1)];
  s.tableau[2] = [card('H', 1)];
  assert.ok(!G.canMove(s, { zone: 'tableau', index: 0, row: 0 }, { zone: 'foundation', index: 0 }));
  assert.ok(G.move(s, { zone: 'tableau', index: 1, row: 0 }, { zone: 'foundation', index: 0 }));
  assert.ok(G.canMove(s, { zone: 'tableau', index: 0, row: 0 }, { zone: 'foundation', index: 0 }));
  // אס לב לא נכנס לקרן של פיק
  assert.ok(!G.canMove(s, { zone: 'tableau', index: 2, row: 0 }, { zone: 'foundation', index: 0 }));
  assert.ok(G.canMove(s, { zone: 'tableau', index: 2, row: 0 }, { zone: 'foundation', index: 1 }));
});

test('הרמת רצף: אפשר רק רצף חוקי וגלוי, והקלף שנחשף מתהפך', () => {
  const s = emptyState();
  s.tableau[0] = [card('D', 3, false), card('S', 9), card('H', 8), card('C', 7)];
  s.tableau[1] = [card('H', 10)];
  const run = G.getCards(s, { zone: 'tableau', index: 0, row: 1 });
  assert.equal(run.length, 3);
  assert.equal(G.getCards(s, { zone: 'tableau', index: 0, row: 0 }), null); // קלף הפוך
  assert.ok(G.move(s, { zone: 'tableau', index: 0, row: 1 }, { zone: 'tableau', index: 1 }));
  assert.equal(s.tableau[1].length, 4);
  assert.equal(s.tableau[0].length, 1);
  assert.equal(s.tableau[0][0].up, true);
  assert.equal(s.score, 5); // חשיפת קלף
  assert.equal(s.moves, 1);
});

test('רצף שבור אינו ניתן להרמה', () => {
  const s = emptyState();
  s.tableau[0] = [card('S', 9), card('C', 8)]; // שחור על שחור
  assert.equal(G.getCards(s, { zone: 'tableau', index: 0, row: 0 }), null);
});

test('משיכה של קלף אחד ושל שלושה', () => {
  const one = emptyState(1);
  one.stock = [card('S', 1, false), card('S', 2, false), card('S', 3, false), card('S', 4, false)];
  G.draw(one);
  assert.equal(one.waste.length, 1);
  assert.equal(one.waste[0].rank, 4);
  assert.equal(one.waste[0].up, true);

  const three = emptyState(3);
  three.stock = [card('S', 1, false), card('S', 2, false), card('S', 3, false), card('S', 4, false)];
  G.draw(three);
  assert.deepEqual(three.waste.map((c) => c.rank), [4, 3, 2]);
  G.draw(three);
  assert.deepEqual(three.waste.map((c) => c.rank), [4, 3, 2, 1]);
});

test('כשהחבילה ריקה, הערימה חוזרת אליה באותו סדר', () => {
  const s = emptyState(1);
  s.stock = [card('S', 1, false), card('S', 2, false), card('S', 3, false)];
  const order = [];
  while (s.stock.length) { G.draw(s); order.push(s.waste[s.waste.length - 1].rank); }
  assert.ok(G.draw(s)); // מחזור
  assert.equal(s.waste.length, 0);
  assert.equal(s.stock.every((c) => !c.up), true);
  const again = [];
  while (s.stock.length) { G.draw(s); again.push(s.waste[s.waste.length - 1].rank); }
  assert.deepEqual(again, order);
});

test('ביטול מהלך מחזיר את המצב המדויק', () => {
  const s = G.newGame({ seed: 5 });
  const before = JSON.stringify([s.stock, s.waste, s.foundations, s.tableau, s.moves, s.score]);
  G.draw(s);
  assert.notEqual(JSON.stringify([s.stock, s.waste, s.foundations, s.tableau, s.moves, s.score]), before);
  assert.ok(G.undo(s));
  assert.equal(JSON.stringify([s.stock, s.waste, s.foundations, s.tableau, s.moves, s.score]), before);
  assert.ok(!G.undo(s)); // אין עוד מה לבטל
});

test('מהלך לא חוקי לא משנה כלום ולא נרשם בהיסטוריה', () => {
  const s = emptyState();
  s.tableau[0] = [card('S', 7)];
  s.tableau[1] = [card('C', 6)];
  assert.ok(!G.move(s, { zone: 'tableau', index: 1, row: 0 }, { zone: 'tableau', index: 0 }));
  assert.equal(s.history.length, 0);
  assert.equal(s.moves, 0);
});

test('bestMove: מעדיף קרן, אחר כך טור עם קלפים, ואחר כך טור ריק', () => {
  const s = emptyState();
  s.tableau[0] = [card('H', 1)];
  assert.deepEqual(G.bestMove(s, { zone: 'tableau', index: 0, row: 0 }), { zone: 'foundation', index: 1 });

  const t = emptyState();
  t.tableau[0] = [card('S', 8)];
  t.waste = [card('H', 7)];
  assert.deepEqual(G.bestMove(t, { zone: 'waste' }), { zone: 'tableau', index: 0 });

  const k = emptyState();
  k.waste = [card('S', 13)];
  assert.deepEqual(G.bestMove(k, { zone: 'waste' }), { zone: 'tableau', index: 0 });

  const none = emptyState();
  none.waste = [card('S', 5)];
  assert.equal(G.bestMove(none, { zone: 'waste' }), null);
});

test('השלמה אוטומטית מגיעה לניצחון', () => {
  const s = emptyState();
  // כל הקלפים גלויים, פזורים בטורים בסדר הפוך (הכי גבוה בתחתית)
  let col = 0;
  for (const suit of G.SUITS) {
    for (let rank = 13; rank >= 1; rank--) {
      s.tableau[col % 7].push(card(suit, rank));
      col++;
    }
  }
  assert.ok(G.canAutoComplete(s));
  assert.ok(!G.isWon(s));
  let guard = 0;
  for (let step = G.findFoundationMove(s); step && guard < 100; step = G.findFoundationMove(s), guard++) {
    assert.ok(G.move(s, step.src, step.dest));
  }
  assert.ok(G.isWon(s));
  assert.ok(!G.canAutoComplete(s));
});
