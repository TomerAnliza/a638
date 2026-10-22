/*
 * app.js — הממשק של המשחק: מצייר את המצב על המסך ומטפל בעכבר ובמגע.
 * כל חוקי המשחק נמצאים ב-game.js. כאן רק ציור ואירועים.
 */
(function () {
  'use strict';
  const G = window.Solitaire;

  const SYMBOLS = { S: '♠︎', H: '♥︎', D: '♦︎', C: '♣︎' };
  const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const SUIT_NAMES = { S: 'פיק', H: 'לב', D: 'יהלום', C: 'תלתן' };

  const $ = (id) => document.getElementById(id);
  const stockEl = $('stock');
  const wasteEl = $('waste');
  const tableauEl = $('tableau');
  const foundationEls = [...document.querySelectorAll('.foundation')];
  const autoBtn = $('btn-auto');
  const undoBtn = $('btn-undo');
  const newBtn = $('btn-new');
  const drawSelect = $('draw-mode');

  let state = G.newGame({ drawCount: 1 });
  let startedAt = null; // הטיימר מתחיל במהלך הראשון
  let elapsed = 0;
  let won = false;
  let autoRunning = false;
  let drag = null;

  // ---------- ציור ----------

  function cardEl(card, zone, index, row) {
    const el = document.createElement('div');
    el.dataset.zone = zone;
    el.dataset.index = index;
    el.dataset.row = row;
    if (card.up) {
      el.className = 'card up ' + (G.isRed(card) ? 'red' : 'black');
      el.setAttribute('aria-label', RANKS[card.rank] + ' ' + SUIT_NAMES[card.suit]);
      const corner = document.createElement('span');
      corner.className = 'corner';
      corner.append(RANKS[card.rank], document.createElement('br'), SYMBOLS[card.suit]);
      const pip = document.createElement('span');
      pip.className = 'pip';
      pip.textContent = SYMBOLS[card.suit];
      el.append(corner, pip);
    } else {
      el.className = 'card down';
    }
    return el;
  }

  function render() {
    // חבילת המשיכה: קלף הפוך אחד מייצג את כולה
    stockEl.replaceChildren();
    stockEl.classList.toggle('empty', state.stock.length === 0);
    if (state.stock.length) stockEl.append(cardEl({ up: false }, 'stock', 0, 0));

    // הערימה הגלויה. במשיכה של שלושה פורסים עד שלושה קלפים, ורק העליון זמין
    wasteEl.replaceChildren();
    const shown = state.drawCount === 3 ? state.waste.slice(-3) : state.waste.slice(-1);
    shown.forEach((card, i) => {
      const el = cardEl(card, 'waste', 0, 0);
      el.style.left = `calc(var(--fan) * ${i})`;
      if (i < shown.length - 1) el.style.pointerEvents = 'none'; // רק העליון נתפס
      wasteEl.append(el);
    });

    // ארבע הקרנות
    foundationEls.forEach((pileEl, i) => {
      pileEl.replaceChildren();
      const pile = state.foundations[i];
      if (pile.length) pileEl.append(cardEl(pile[pile.length - 1], 'foundation', i, pile.length - 1));
    });

    // שבעת הטורים: ההיסט האנכי נגזר ממספר הקלפים ההפוכים והגלויים שמעל
    tableauEl.replaceChildren();
    state.tableau.forEach((pile, i) => {
      const pileEl = document.createElement('div');
      pileEl.className = 'pile';
      pileEl.dataset.pile = 'tableau';
      pileEl.dataset.index = i;
      let down = 0;
      let up = 0;
      pile.forEach((card, row) => {
        const el = cardEl(card, 'tableau', i, row);
        el.style.top = `calc(var(--down) * ${down} + var(--up) * ${up})`;
        pileEl.append(el);
        if (card.up) up++; else down++;
      });
      // גובה הטור: מספיק לכל הקלפים, ולפחות שלוש קומות כדי שיהיה קל לשחרר עליו
      const lastDown = pile.length ? down - (pile[pile.length - 1].up ? 0 : 1) : 0;
      const lastUp = pile.length ? up - (pile[pile.length - 1].up ? 1 : 0) : 0;
      pileEl.style.minHeight =
        `calc(max(var(--h) * 3, var(--h) + var(--down) * ${lastDown} + var(--up) * ${lastUp}))`;
      tableauEl.append(pileEl);
    });

    $('moves').textContent = state.moves;
    $('score').textContent = state.score;
    renderTime();
    undoBtn.disabled = state.history.length === 0 || autoRunning;
    autoBtn.hidden = !G.canAutoComplete(state) || autoRunning;
  }

  function renderTime() {
    const secs = Math.floor(elapsed);
    $('time').textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
  }

  // ---------- טיימר ----------

  setInterval(() => {
    if (startedAt && !won) {
      elapsed = (Date.now() - startedAt) / 1000;
      renderTime();
    }
  }, 500);

  function markStarted() {
    if (!startedAt) startedAt = Date.now() - elapsed * 1000;
  }

  // ---------- פעולות ----------

  function afterMove() {
    markStarted();
    render();
    if (G.isWon(state)) showWin();
  }

  function showWin() {
    won = true;
    elapsed = (Date.now() - startedAt) / 1000;
    renderTime();
    $('win-summary').textContent =
      `${state.moves} מהלכים · ${state.score} נקודות · ${$('time').textContent}`;
    $('win').hidden = false;
    $('btn-win-new').focus();
  }

  function startNewGame() {
    state = G.newGame({ drawCount: Number(drawSelect.value) });
    startedAt = null;
    elapsed = 0;
    won = false;
    autoRunning = false;
    $('win').hidden = true;
    render();
  }

  // כפתור «משחק חדש»: באמצע משחק דורש לחיצה שנייה, כדי לא לאבד התקדמות בטעות
  let confirmTimer = null;
  newBtn.addEventListener('click', () => {
    if (state.moves === 0 || won || confirmTimer) {
      clearTimeout(confirmTimer);
      confirmTimer = null;
      newBtn.textContent = 'משחק חדש';
      startNewGame();
      return;
    }
    newBtn.textContent = 'בטוח? לחץ שוב';
    confirmTimer = setTimeout(() => {
      confirmTimer = null;
      newBtn.textContent = 'משחק חדש';
    }, 3000);
  });
  $('btn-win-new').addEventListener('click', startNewGame);
  drawSelect.addEventListener('change', startNewGame);

  undoBtn.addEventListener('click', () => {
    if (G.undo(state)) render();
  });

  stockEl.addEventListener('click', () => {
    if (G.draw(state)) afterMove();
  });

  // השלמה אוטומטית: מהלך לקרן כל 110 אלפיות שנייה, עד שנגמרו המהלכים
  autoBtn.addEventListener('click', () => {
    autoRunning = true;
    render();
    const timer = setInterval(() => {
      const step = G.findFoundationMove(state);
      if (!step) {
        clearInterval(timer);
        autoRunning = false;
        render();
        return;
      }
      G.move(state, step.src, step.dest);
      afterMove();
      if (won) {
        clearInterval(timer);
        autoRunning = false;
      }
    }, 110);
  });

  // ---------- גרירה ולחיצה ----------

  function srcOf(el) {
    const src = { zone: el.dataset.zone };
    if (src.zone === 'tableau') {
      src.index = Number(el.dataset.index);
      src.row = Number(el.dataset.row);
    } else if (src.zone === 'foundation') {
      src.index = Number(el.dataset.index);
    }
    return src;
  }

  function destAt(x, y) {
    const hit = document.elementFromPoint(x, y);
    const pile = hit && hit.closest('[data-pile]');
    if (!pile) return null;
    const zone = pile.dataset.pile;
    if (zone !== 'tableau' && zone !== 'foundation') return null;
    return { zone, index: Number(pile.dataset.index) };
  }

  function pileElFor(dest) {
    return dest.zone === 'foundation'
      ? foundationEls[dest.index]
      : tableauEl.children[dest.index];
  }

  function clearDropHints() {
    document.querySelectorAll('.drop-ok').forEach((el) => el.classList.remove('drop-ok'));
  }

  function beginDrag(e) {
    // הקלפים שנגררים: הקלף שנתפס וכל מה שמעליו באותו טור
    const grabbed = [drag.el];
    if (drag.src.zone === 'tableau') {
      const siblings = [...drag.el.parentElement.querySelectorAll('.card')];
      grabbed.splice(0, 1, ...siblings.slice(siblings.indexOf(drag.el)));
    }
    const first = grabbed[0].getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.className = 'ghost';
    ghost.style.width = first.width + 'px';
    grabbed.forEach((el) => {
      const r = el.getBoundingClientRect();
      const clone = el.cloneNode(true);
      clone.style.left = '0';
      clone.style.top = r.top - first.top + 'px';
      clone.style.pointerEvents = 'none';
      ghost.append(clone);
      el.classList.add('drag-hidden');
    });
    document.body.append(ghost);
    drag.ghost = ghost;
    drag.grabbed = grabbed;
    drag.offX = drag.startX - first.left;
    drag.offY = drag.startY - first.top;
    drag.moved = true;

    // מסמנים את היעדים החוקיים
    for (let i = 0; i < 4; i++) {
      if (G.canMove(state, drag.src, { zone: 'foundation', index: i })) foundationEls[i].classList.add('drop-ok');
    }
    for (let i = 0; i < 7; i++) {
      if (G.canMove(state, drag.src, { zone: 'tableau', index: i })) tableauEl.children[i].classList.add('drop-ok');
    }
    positionGhost(e);
  }

  function positionGhost(e) {
    drag.ghost.style.left = e.clientX - drag.offX + 'px';
    drag.ghost.style.top = e.clientY - drag.offY + 'px';
  }

  function endDrag() {
    if (drag && drag.ghost) drag.ghost.remove();
    clearDropHints();
    drag = null;
  }

  $('board').addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || autoRunning || won) return;
    const el = e.target.closest('.card');
    if (!el || el.dataset.zone === 'stock') return;
    const src = srcOf(el);
    if (!G.getCards(state, src)) return; // קלף הפוך או רצף שבור
    drag = { el, src, startX: e.clientX, startY: e.clientY, moved: false, ghost: null };
  });

  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.moved) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 6) return;
      beginDrag(e);
    } else {
      positionGhost(e);
    }
  });

  window.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const { src, el, moved } = drag;
    // מסתירים את הרוח לפני הבדיקה מה נמצא מתחת לאצבע
    const dest = moved ? destAt(e.clientX, e.clientY) : G.bestMove(state, src);
    endDrag();
    if (dest && G.move(state, src, dest)) {
      afterMove();
    } else {
      render(); // מחזיר את הקלפים למקומם
      if (!moved) {
        // לחיצה בלי מהלך אפשרי: רעידה קלה כרמז
        const again = document.querySelector(
          `.card[data-zone="${el.dataset.zone}"][data-index="${el.dataset.index}"][data-row="${el.dataset.row}"]`
        );
        if (again) {
          again.classList.add('nope');
          setTimeout(() => again.classList.remove('nope'), 300);
        }
      }
    }
  });

  window.addEventListener('pointercancel', () => {
    if (!drag) return;
    endDrag();
    render();
  });

  // בלי תפריט הקשר בלחיצה ימנית על הלוח
  $('board').addEventListener('contextmenu', (e) => e.preventDefault());

  render();
})();
