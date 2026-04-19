// ── Map configs ───────────────────────────────────────
const CONFIGS = {
  classic: { size: 3,  win: 3, cellPx: 120, markPx: 68, gap: 6, rootW: 480 },
  gomoku:  { size: 15, win: 5, cellPx: 38,  markPx: 20, gap: 2, rootW: 720 },
};

// ── State ─────────────────────────────────────────────
const state = {
  board:    [],
  current:  'X',
  gameOver: false,
  gameMode: '2p',      // '2p' | 'ai'
  mapMode:  'classic', // 'classic' | 'gomoku'
  scores:   { X: 0, O: 0, D: 0 },
};

// ── DOM helpers ───────────────────────────────────────
const $  = (id)  => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

function setStatus(msg, cls = '') {
  const el = $('status');
  el.textContent = msg;
  el.className   = 'status-bar' + (cls ? ' ' + cls : '');
}

function updateTurnIndicator() {
  $('turn-dot').style.background = state.current === 'X' ? 'var(--x-color)' : 'var(--o-color)';
  $('turn-text').textContent = `${state.current}'s turn`;
}

function updateScore(player) {
  $(`score-${player.toLowerCase()}`).textContent = state.scores[player];
}

function cell(idx) {
  return document.querySelector(`.cell[data-i="${idx}"]`);
}

// ── Board builder ─────────────────────────────────────
function buildBoard() {
  const cfg  = CONFIGS[state.mapMode];
  const root = document.documentElement;

  // Update CSS variables to match the chosen config
  root.style.setProperty('--board-cols', cfg.size);
  root.style.setProperty('--cell-size',  cfg.cellPx + 'px');
  root.style.setProperty('--mark-size',  cfg.markPx + 'px');
  root.style.setProperty('--gap',        cfg.gap    + 'px');
  root.style.setProperty('--root-width', cfg.rootW  + 'px');

  // Generate and attach cells
  const boardEl = $('board');
  boardEl.innerHTML = Array.from(
    { length: cfg.size * cfg.size },
    (_, i) => `<div class="cell" data-i="${i}"></div>`
  ).join('');

  boardEl.querySelectorAll('.cell').forEach(c =>
    c.addEventListener('click', () => {
      if (state.gameMode === 'ai' && state.current === 'O') return;
      play(parseInt(c.dataset.i));
    })
  );
}

// ── Win detection (direction scan) ───────────────────
const DIRS = [[0,1],[1,0],[1,1],[1,-1]];

function checkWin(board, player) {
  const { size, win } = CONFIGS[state.mapMode];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r * size + c] !== player) continue;

      for (const [dr, dc] of DIRS) {
        const combo = [r * size + c];

        for (let k = 1; k < win; k++) {
          const nr = r + dr * k, nc = c + dc * k;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
          if (board[nr * size + nc] !== player) break;
          combo.push(nr * size + nc);
        }

        if (combo.length === win) return combo;
      }
    }
  }
  return null;
}

// ── Core game logic ───────────────────────────────────
function play(idx) {
  if (state.gameOver || state.board[idx]) return;

  state.board[idx] = state.current;
  renderMark(idx, state.current);

  const win = checkWin(state.board, state.current);
  if (win)                        return handleWin(win, state.current);
  if (state.board.every(Boolean)) return handleDraw();

  state.current = state.current === 'X' ? 'O' : 'X';
  updateTurnIndicator();
  setStatus('');

  if (state.gameMode === 'ai' && state.current === 'O') {
    setTimeout(aiMove, 350);
  }
}

function handleWin(combo, player) {
  combo.forEach(i => cell(i).classList.add('winning'));
  $$('.cell:not(.taken)').forEach(c => c.classList.add('gameover'));
  state.scores[player]++;
  updateScore(player);
  setStatus(`${player} wins!`, `winner-${player.toLowerCase()}`);
  state.gameOver = true;
}

function handleDraw() {
  state.scores.D++;
  updateScore('D');
  setStatus("It's a draw");
  state.gameOver = true;
}

function renderMark(idx, player) {
  const c = cell(idx);
  c.classList.add('taken', player === 'X' ? 'x-cell' : 'o-cell');
  c.innerHTML = `<span class="mark">${player}</span>`;
}

// ── AI — Classic 3×3: minimax ─────────────────────────
function minimax(board, player, depth = 0) {
  if (checkWin(board, 'O')) return { score:  10 - depth };
  if (checkWin(board, 'X')) return { score: depth - 10  };

  const empty = board.map((v, i) => v == null ? i : null).filter(i => i !== null);
  if (!empty.length) return { score: 0 };

  const opp   = player === 'O' ? 'X' : 'O';
  const isMax = player === 'O';
  let best    = { score: isMax ? -Infinity : Infinity };

  for (const i of empty) {
    board[i] = player;
    const result = minimax(board, opp, depth + 1);
    board[i] = null;
    if (isMax ? result.score > best.score : result.score < best.score) {
      best = { score: result.score, idx: i };
    }
  }
  return best;
}

// ── AI — Gomoku 15×15: threat heuristic ──────────────
//  Scores an empty cell for a given player by counting
//  consecutive marks + open ends in all 4 directions.
function scoreCell(board, idx, player) {
  const { size, win } = CONFIGS[state.mapMode];
  const r0 = Math.floor(idx / size);
  const c0 = idx % size;
  let total = 0;

  for (const [dr, dc] of DIRS) {
    let count = 1, open = 0;

    for (const sign of [1, -1]) {
      for (let k = 1; k < win; k++) {
        const r = r0 + dr * k * sign;
        const c = c0 + dc * k * sign;
        if (r < 0 || r >= size || c < 0 || c >= size) break;
        const v = board[r * size + c];
        if (v === player) { count++; }
        else { if (v === null) open++; break; }
      }
    }

    if      (count >= win)             total += 100_000;
    else if (count === win - 1)        total += open === 2 ? 10_000 : open === 1 ? 1_000 : 0;
    else if (count === win - 2)        total += open === 2 ?    500 : open === 1 ?   100 : 0;
    else if (count === win - 3 && open === 2) total += 10;
  }

  return total;
}

function gomokuBest() {
  const { board } = state;

  // First move: play center
  if (board.every(v => v === null)) return Math.floor(board.length / 2);

  let bestScore = -1, bestIdx = -1;

  for (let i = 0; i < board.length; i++) {
    if (board[i]) continue;
    const atk = scoreCell(board, i, 'O');
    const def = scoreCell(board, i, 'X');
    // Win immediately if possible; otherwise balance attack vs defence
    const score = atk >= 100_000 ? atk : Math.max(atk, def * 0.95);
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }

  // Fallback: first empty cell (edge case for a full-ish board)
  return bestIdx !== -1 ? bestIdx : board.findIndex(v => v === null);
}

function aiMove() {
  if (state.gameOver) return;
  const idx = state.mapMode === 'classic'
    ? minimax(state.board, 'O').idx
    : gomokuBest();
  play(idx);
}

// ── Controls ──────────────────────────────────────────
function toggleMapMode() {
  state.mapMode = state.mapMode === 'classic' ? 'gomoku' : 'classic';
  const isGomoku = state.mapMode === 'gomoku';
  $('map-label').textContent = isGomoku ? '3×3' : '15×15';
  state.scores = { X: 0, O: 0, D: 0 };
  ['x', 'o', 'd'].forEach(p => $(`score-${p}`).textContent = '0');
  buildBoard();
  restart();
}

function setGameMode(mode) {
  state.gameMode = mode;
  $('btn-2p').classList.toggle('active', mode === '2p');
  $('btn-ai').classList.toggle('active', mode === 'ai');
  restart();
}

function restart() {
  const { size } = CONFIGS[state.mapMode];
  state.board    = Array(size * size).fill(null);
  state.current  = 'X';
  state.gameOver = false;
  $$('.cell').forEach(c => { c.className = 'cell'; c.innerHTML = ''; });
  setStatus('X goes first');
  updateTurnIndicator();
  if (state.gameMode === 'ai' && state.current === 'O') setTimeout(aiMove, 350);
}

function toggleTheme() {
  const html   = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  $('theme-label').textContent = isDark ? 'Dark mode' : 'Light mode';
}

// ── Init ──────────────────────────────────────────────
buildBoard();
restart();