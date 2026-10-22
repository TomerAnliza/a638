/*
 * game.js — הלוגיקה של סוליטייר קלונדייק.
 *
 * הקובץ טהור: אין בו DOM ואין גישה לדפדפן, רק נתונים ופונקציות.
 * לכן אפשר לבדוק אותו ב-Node (tests/game.test.js) ולהעביר אותו כמו שהוא
 * לפרויקט Next.js בהמשך.
 *
 * מבנה המצב (state):
 *   stock        חבילת המשיכה, הפוכה (הקלף העליון הוא האחרון במערך)
 *   waste        קלפים שנמשכו, גלויים (העליון הוא האחרון במערך)
 *   foundations  ארבע קרנות, לפי הסדר SUITS, כל אחת עולה מ-A עד K
 *   tableau      שבעה טורים; הקלף האחרון בטור הוא הקלף החשוף
 *
 * מקור מהלך (src):   { zone: 'waste' | 'foundation' | 'tableau', index?, row? }
 * יעד מהלך (dest):   { zone: 'foundation' | 'tableau', index }
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Solitaire = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // סדר הקרנות קבוע: כל קרן שייכת לצורה אחת
  const SUITS = ['S', 'H', 'D', 'C'];
  const isRed = (card) => card.suit === 'H' || card.suit === 'D';

  // מחולל מספרים אקראיים עם זרע: אותו זרע נותן תמיד אותה חלוקה.
  // כך אפשר לשחזר משחק ולכתוב בדיקות יציבות.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function newDeck() {
    const deck = [];
    for (const suit of SUITS) {
      for (let rank = 1; rank <= 13; rank++) deck.push({ suit, rank, up: false });
    }
    return deck;
  }

  // ערבוב Fisher-Yates
  function shuffle(deck, rng) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function newGame(opts) {
    opts = opts || {};
    const seed = opts.seed != null ? opts.seed : Math.floor(Math.random() * 4294967296);
    const drawCount = opts.drawCount === 3 ? 3 : 1;
    const deck = shuffle(newDeck(), mulberry32(seed));

    // טור i מקבל i+1 קלפים, ורק העליון שבהם גלוי
    const tableau = [];
    for (let i = 0; i < 7; i++) {
      const pile = deck.splice(0, i + 1);
      pile[i].up = true;
      tableau.push(pile);
    }

    return {
      seed,
      drawCount,
      stock: deck, // 24 הקלפים שנשארו
      waste: [],
      foundations: [[], [], [], []],
      tableau,
      moves: 0,
      score: 0,
      history: [], // תמונות מצב לביטול מהלך
    };
  }

  // ---------- ביטול מהלך ----------

  function snapshot(s) {
    return JSON.stringify({
      stock: s.stock,
      waste: s.waste,
      foundations: s.foundations,
      tableau: s.tableau,
      moves: s.moves,
      score: s.score,
    });
  }

  function undo(s) {
    if (!s.history.length) return false;
    Object.assign(s, JSON.parse(s.history.pop()));
    return true;
  }

  // ---------- בדיקת חוקיות ----------

  // מחזיר את הקלפים שהמקור מייצג, או null אם אי אפשר להרים אותם.
  // מטור אפשר להרים רצף גלוי שיורד לסירוגין באדום ושחור.
  function getCards(s, src) {
    if (src.zone === 'waste') {
      return s.waste.length ? [s.waste[s.waste.length - 1]] : null;
    }
    if (src.zone === 'foundation') {
      const pile = s.foundations[src.index];
      return pile && pile.length ? [pile[pile.length - 1]] : null;
    }
    if (src.zone === 'tableau') {
      const pile = s.tableau[src.index];
      const row = src.row;
      if (!pile || row == null || row < 0 || row >= pile.length || !pile[row].up) return null;
      const cards = pile.slice(row);
      for (let i = 0; i < cards.length - 1; i++) {
        const ok = isRed(cards[i]) !== isRed(cards[i + 1]) && cards[i].rank === cards[i + 1].rank + 1;
        if (!ok) return null;
      }
      return cards;
    }
    return null;
  }

  function canMove(s, src, dest) {
    const cards = getCards(s, src);
    if (!cards) return false;
    if (src.zone === dest.zone && src.index === dest.index) return false;
    const first = cards[0];

    if (dest.zone === 'foundation') {
      if (cards.length !== 1) return false; // לקרן עולה קלף אחד בכל פעם
      if (SUITS[dest.index] !== first.suit) return false;
      const pile = s.foundations[dest.index];
      const top = pile[pile.length - 1];
      return top ? first.rank === top.rank + 1 : first.rank === 1;
    }

    if (dest.zone === 'tableau') {
      const pile = s.tableau[dest.index];
      if (!pile) return false;
      const top = pile[pile.length - 1];
      if (!top) {
        // טור ריק מקבל רק מלך. העברת מלך שכבר יושב בתחילת טור לטור ריק חסרת תועלת.
        if (first.rank !== 13) return false;
        return !(src.zone === 'tableau' && src.row === 0);
      }
      return top.up && isRed(top) !== isRed(first) && top.rank === first.rank + 1;
    }
    return false;
  }

  // ---------- ביצוע מהלך ----------

  function move(s, src, dest) {
    if (!canMove(s, src, dest)) return false;
    s.history.push(snapshot(s));

    let cards;
    if (src.zone === 'waste') cards = [s.waste.pop()];
    else if (src.zone === 'foundation') cards = [s.foundations[src.index].pop()];
    else cards = s.tableau[src.index].splice(src.row);

    if (dest.zone === 'foundation') s.foundations[dest.index].push(...cards);
    else s.tableau[dest.index].push(...cards);

    // ניקוד: קרן +10, מהערימה לטור +5, חשיפת קלף +5, החזרה מהקרן -15
    if (dest.zone === 'foundation') s.score += 10;
    else if (src.zone === 'waste') s.score += 5;
    else if (src.zone === 'foundation') s.score = Math.max(0, s.score - 15);

    // אחרי הרמת רצף מטור, הקלף שנחשף הופך פנים
    if (src.zone === 'tableau') {
      const pile = s.tableau[src.index];
      if (pile.length && !pile[pile.length - 1].up) {
        pile[pile.length - 1].up = true;
        s.score += 5;
      }
    }
    s.moves++;
    return true;
  }

  // משיכה מהחבילה. כשהחבילה ריקה, הערימה הגלויה חוזרת אליה בסדר המקורי.
  function draw(s) {
    if (s.stock.length) {
      s.history.push(snapshot(s));
      for (let i = 0; i < s.drawCount && s.stock.length; i++) {
        const card = s.stock.pop();
        card.up = true;
        s.waste.push(card);
      }
      s.moves++;
      return true;
    }
    if (s.waste.length) {
      s.history.push(snapshot(s));
      while (s.waste.length) {
        const card = s.waste.pop();
        card.up = false;
        s.stock.push(card);
      }
      s.moves++;
      if (s.drawCount === 1) s.score = Math.max(0, s.score - 100);
      return true;
    }
    return false;
  }

  // ---------- עזרים לממשק ----------

  // היעד הטוב ביותר לקלף שנלחץ: קודם קרן, אחר כך טור עם קלפים, ובסוף טור ריק.
  // מקלף שיושב בקרן לא מזיזים אוטומטית.
  function bestMove(s, src) {
    if (!getCards(s, src) || src.zone === 'foundation') return null;
    for (let i = 0; i < 4; i++) {
      const dest = { zone: 'foundation', index: i };
      if (canMove(s, src, dest)) return dest;
    }
    for (const wantEmpty of [false, true]) {
      for (let i = 0; i < 7; i++) {
        if ((s.tableau[i].length === 0) !== wantEmpty) continue;
        const dest = { zone: 'tableau', index: i };
        if (canMove(s, src, dest)) return dest;
      }
    }
    return null;
  }

  // מהלך אחד לקרן מהערימה או מראש אחד הטורים
  function findFoundationMove(s) {
    const sources = [{ zone: 'waste' }];
    for (let i = 0; i < 7; i++) {
      const n = s.tableau[i].length;
      if (n) sources.push({ zone: 'tableau', index: i, row: n - 1 });
    }
    for (const src of sources) {
      for (let f = 0; f < 4; f++) {
        const dest = { zone: 'foundation', index: f };
        if (canMove(s, src, dest)) return { src, dest };
      }
    }
    return null;
  }

  function isWon(s) {
    return s.foundations.every((pile) => pile.length === 13);
  }

  // כשהחבילה והערימה ריקות וכל קלפי הטורים גלויים, הניצחון מובטח
  function canAutoComplete(s) {
    return (
      !isWon(s) &&
      s.stock.length === 0 &&
      s.waste.length === 0 &&
      s.tableau.every((pile) => pile.every((card) => card.up))
    );
  }

  return {
    SUITS,
    isRed,
    mulberry32,
    newGame,
    undo,
    getCards,
    canMove,
    move,
    draw,
    bestMove,
    findFoundationMove,
    isWon,
    canAutoComplete,
  };
});
