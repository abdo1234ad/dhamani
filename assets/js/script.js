(() => {
  const body = document.body;
  const toggle = document.querySelector('[data-theme-toggle]');
  const toggleIcon = toggle?.querySelector('.theme-toggle__icon');
  const toggleLabel = toggle?.querySelector('.theme-toggle__label');

  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

  function setTheme(theme) {
    body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    if (toggleIcon && toggleLabel) {
      const isDark = theme === 'dark';
      toggleIcon.textContent = isDark ? '☀️' : '🌙';
      toggleLabel.textContent = isDark ? 'Light' : 'Dark';
      toggle?.setAttribute('aria-pressed', String(isDark));
    }
  }

  if (toggle) {
    setTheme(initialTheme);
    toggle.addEventListener('click', () => {
      const nextTheme = body.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
    });
  } else {
    body.dataset.theme = initialTheme;
  }

  // Game setup
  const board = document.querySelector('[data-game-board]');
  const playerEl = document.querySelector('[data-player]');
  const targetEl = document.querySelector('[data-target]');
  const scoreEl = document.querySelector('[data-score]');
  const bestEl = document.querySelector('[data-best]');
  const resetButton = document.querySelector('[data-reset-game]');

  if (board && playerEl && targetEl && scoreEl && bestEl) {
    let boardSize = { width: board.clientWidth, height: board.clientHeight };
    const playerSize = playerEl.offsetWidth || 42;
    const targetSize = targetEl.offsetWidth || 34;
    const speed = 3.2;

    const state = {
      score: 0,
      best: 0,
      player: { x: 12, y: 12 },
      target: { x: 140, y: 120 },
      keys: { up: false, down: false, left: false, right: false },
    };

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function updateBoardSize() {
      boardSize = { width: board.clientWidth, height: board.clientHeight };
      state.player.x = clamp(state.player.x, 0, boardSize.width - playerSize);
      state.player.y = clamp(state.player.y, 0, boardSize.height - playerSize);
      state.target.x = clamp(state.target.x, 0, boardSize.width - targetSize);
      state.target.y = clamp(state.target.y, 0, boardSize.height - targetSize);
    }

    function placePieces() {
      playerEl.style.transform = `translate(${state.player.x}px, ${state.player.y}px)`;
      targetEl.style.transform = `translate(${state.target.x}px, ${state.target.y}px)`;
    }

    function randomizeTarget() {
      state.target.x = Math.random() * (boardSize.width - targetSize - 16) + 8;
      state.target.y = Math.random() * (boardSize.height - targetSize - 16) + 8;
    }

    function updateScoreboard() {
      scoreEl.textContent = state.score.toString();
      bestEl.textContent = state.best.toString();
    }

    function resetGame() {
      state.score = 0;
      state.player = { x: 12, y: 12 };
      randomizeTarget();
      updateScoreboard();
      placePieces();
    }

    function handleKey(event, isDown) {
      const key = event.key.toLowerCase();
      if (['arrowup', 'w'].includes(key)) state.keys.up = isDown;
      if (['arrowdown', 's'].includes(key)) state.keys.down = isDown;
      if (['arrowleft', 'a'].includes(key)) state.keys.left = isDown;
      if (['arrowright', 'd'].includes(key)) state.keys.right = isDown;
    }

    function detectCollision() {
      const playerCenter = {
        x: state.player.x + playerSize / 2,
        y: state.player.y + playerSize / 2,
      };
      const targetCenter = {
        x: state.target.x + targetSize / 2,
        y: state.target.y + targetSize / 2,
      };
      const distance = Math.hypot(
        playerCenter.x - targetCenter.x,
        playerCenter.y - targetCenter.y
      );
      return distance < (playerSize + targetSize) / 2;
    }

    function loop() {
      const dx = (state.keys.right ? 1 : 0) - (state.keys.left ? 1 : 0);
      const dy = (state.keys.down ? 1 : 0) - (state.keys.up ? 1 : 0);

      if (dx !== 0 || dy !== 0) {
        state.player.x = clamp(state.player.x + dx * speed, 0, boardSize.width - playerSize);
        state.player.y = clamp(state.player.y + dy * speed, 0, boardSize.height - playerSize);
        placePieces();
      }

      if (detectCollision()) {
        state.score += 1;
        state.best = Math.max(state.best, state.score);
        randomizeTarget();
        updateScoreboard();
        placePieces();
      }

      requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => {
      updateBoardSize();
      placePieces();
    });

    window.addEventListener('keydown', (event) => handleKey(event, true));
    window.addEventListener('keyup', (event) => handleKey(event, false));
    resetButton?.addEventListener('click', resetGame);

    updateBoardSize();
    randomizeTarget();
    updateScoreboard();
    placePieces();
    requestAnimationFrame(loop);
  }
})();
