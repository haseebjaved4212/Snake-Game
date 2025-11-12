/* Simple responsive Snake game using canvas.
   Features:
   - Responsive grid determined by CSS --cell-size
   - Keyboard (arrows/WASD) and swipe controls
   - Score, High Score (localStorage), Timer
   - Start / Pause / Reset controls
*/

(() => {
  const cfg = {
    tickMs: 120,
    initialLength: 4
  };

  // UI refs
  const highScoreEl = () => document.getElementById('high-score');
  const scoreEl = () => document.getElementById('score');
  const timeEl = () => document.getElementById('time');
  const boardEl = () => document.querySelector('.board');
  const gridEl = () => document.querySelector('.grid');

  // Controls
  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const btnReset = document.getElementById('btn-reset');

  let canvas, ctx;
  let cols = 20, rows = 20, cell = 28;
  let dpr = Math.max(1, window.devicePixelRatio || 1);

  // Game state
  let snake = [];
  let dir = { x: 1, y: 0 };
  let food = null;
  let tickHandle = null;
  let running = false;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('snake_high') || '0', 10) || 0;
  let startTime = 0; // timestamp
  let elapsedSec = 0;

  // initialize UI
  function createCanvas() {
    const g = gridEl();
    if (!g) return;
    // remove previous canvas
    const existing = g.querySelector('canvas');
    if (existing) existing.remove();
    canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = 400;
    canvas.height = 400;
    canvas.tabIndex = 0;
    g.appendChild(canvas);
    ctx = canvas.getContext('2d');
    canvas.addEventListener('focus', () => { });
  }

  function readCellSize() {
    const g = gridEl();
    const style = getComputedStyle(g);
    const val = parseInt(style.getPropertyValue('--cell-size')) || parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size-default')) || 28;
    return val;
  }

  function resize() {
    if (!canvas) createCanvas();
    const g = gridEl();
    const rect = g.getBoundingClientRect();
    cell = readCellSize();
    cols = Math.floor(rect.width / cell) || 10;
    rows = Math.floor(rect.height / cell) || 10;
    // fit canvas to exact pixel size
    const w = cols * cell;
    const h = rows * cell;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function startGame() {
    if (running) return;
    running = true;
    resetState();
    startTime = Date.now();
    elapsedSec = 0;
    tickHandle = setInterval(tick, cfg.tickMs);
    window.requestAnimationFrame(draw);
  }

  function pauseGame() {
    running = false;
    if (tickHandle) { clearInterval(tickHandle); tickHandle = null }
  }

  function resetState() {
    // center snake
    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);
    snake = [];
    for (let i = 0; i < cfg.initialLength; i++) snake.push({ x: startX - i, y: startY });
    dir = { x: 1, y: 0 };
    placeFood();
    score = 0; updateScore();
  }

  function placeFood() {
    let tries = 0;
    while (tries < 1000) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      if (!snake.some(s => s.x === x && s.y === y)) { food = { x, y }; return }
      tries++;
    }
    food = null;
  }

  function tick() {
    // update time
    elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    updateTime();

    // move
    const head = { ...snake[0] };
    head.x += dir.x; head.y += dir.y;
    // wrap or collide? we'll wrap horizontally and vertically
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      // collision -> game over
      gameOver(); return;
    }
    // self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) { gameOver(); return }
    snake.unshift(head);
    // eat
    if (food && head.x === food.x && head.y === food.y) {
      score += 1; updateScore(); placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function gameOver() {
    pauseGame();
    // update high score
    if (score > highScore) { highScore = score; localStorage.setItem('snake_high', String(highScore)); updateHigh(); }
    // simple visual
    draw();
    // show styled modal instead of confirm
    setTimeout(() => {
      showGameOverModal(score, highScore);
    }, 120);
  }

  function updateScore() { if (scoreEl()) scoreEl().textContent = String(score) }
  function updateHigh() { if (highScoreEl()) highScoreEl().textContent = String(highScore) }
  function updateTime() { if (timeEl()) timeEl().textContent = formatTime(elapsedSec) }

  function formatTime(s) { const mm = String(Math.floor(s / 60)).padStart(2, '0'); const ss = String(s % 60).padStart(2, '0'); return mm + ':' + ss }

  function draw() {
    if (!ctx) return;
    // clear
    ctx.clearRect(0, 0, cols * cell, rows * cell);
    // draw grid background slightly darker - optional
    // draw food
    if (food) { drawCell(food.x, food.y, '#e85d4a') }
    // draw snake
    for (let i = snake.length - 1; i >= 0; i--) {
      const s = snake[i];
      const col = i === 0 ? '#9fe66a' : '#5bb94f';
      drawCell(s.x, s.y, col);
    }
    // if not running overlay
    if (!running) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, cols * cell, rows * cell); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Press Start', (cols * cell) / 2, (rows * cell) / 2); }
  }

  function drawCell(x, y, color) { ctx.fillStyle = color; ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2); }

  // controls
  function setDir(nx, ny) { if ((nx === -dir.x && ny === -dir.y)) return; dir = { x: nx, y: ny }; }

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'w', 'W'].includes(e.key)) setDir(0, -1);
    if (['ArrowDown', 's', 'S'].includes(e.key)) setDir(0, 1);
    if (['ArrowLeft', 'a', 'A'].includes(e.key)) setDir(-1, 0);
    if (['ArrowRight', 'd', 'D'].includes(e.key)) setDir(1, 0);
    if (e.key === ' ') { e.preventDefault(); running ? pauseGame() : startGame(); }
  });

  // touch swipe
  let touchStart = null;
  window.addEventListener('touchstart', (e) => { const t = e.touches[0]; touchStart = { x: t.clientX, y: t.clientY }; });
  window.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive: false });
  window.addEventListener('touchend', (e) => { if (!touchStart) return; const t = e.changedTouches[0]; const dx = t.clientX - touchStart.x; const dy = t.clientY - touchStart.y; if (Math.abs(dx) > Math.abs(dy)) { if (dx > 20) setDir(1, 0); else if (dx < -20) setDir(-1, 0); } else { if (dy > 20) setDir(0, 1); else if (dy < -20) setDir(0, -1); } touchStart = null; });

  // buttons
  btnStart.addEventListener('click', () => { startGame(); });
  btnPause.addEventListener('click', () => { pauseGame(); });
  btnReset.addEventListener('click', () => { pauseGame(); resetState(); updateTime(); draw(); });

  // responsive
  window.addEventListener('resize', () => { resize(); });

  // init
  function init() { createCanvas(); resize(); updateHigh(); updateScore(); updateTime(); }

  init();

  // Modal wiring
  function showGameOverModal(scoreVal, highVal) {
    const backdrop = document.getElementById('modal-backdrop');
    const ms = document.getElementById('modal-score');
    const mh = document.getElementById('modal-high');
    const restart = document.getElementById('modal-restart');
    const close = document.getElementById('modal-close');
    if (!backdrop || !ms || !mh) return;
    ms.textContent = String(scoreVal);
    mh.textContent = String(highVal);
    backdrop.classList.add('show');
    backdrop.setAttribute('aria-hidden', 'false');

    function cleanup() {
      backdrop.classList.remove('show');
      backdrop.setAttribute('aria-hidden', 'true');
      restart.removeEventListener('click', onRestart);
      close.removeEventListener('click', onClose);
      backdrop.removeEventListener('click', onBackdrop);
      document.removeEventListener('keydown', onKey);
    }

    function onRestart() { cleanup(); startGame(); }
    function onClose() { cleanup(); }

    function onBackdrop(e) { if (e.target === backdrop) { cleanup(); } }
    function onKey(e) { if (e.key === 'Escape') { cleanup(); } }

    restart.addEventListener('click', onRestart);
    close.addEventListener('click', onClose);
    backdrop.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKey);

    // focus restart for accessibility
    restart.focus();
  }

  // expose UI
  window.ui = { setScore(v) { score = v; updateScore() }, setHigh(v) { highScore = v; updateHigh() }, setTime(v) { timeEl().textContent = v } };
})();
