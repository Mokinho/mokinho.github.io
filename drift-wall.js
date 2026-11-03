/*
 * DriftWall — vanilla JS port of the React Bits <DriftWall /> component.
 * Turns an existing grid of cards into a tilted 3D wall of drifting columns.
 * Cards keep their natural height, so columns stack like a masonry wall.
 * The cards keep their own markup; only the layout, motion and hover treatment change.
 *
 * Usage: DriftWall(gridEl, { itemSelector, columns, tileWidth, gap, tilt, turn, ... })
 *  - The original cards stay in the DOM once (in the middle copy of each column) so they
 *    remain focusable and readable by screen readers; the looping copies are aria-hidden.
 */
(function () {
  const DEFAULTS = {
    itemSelector: ':scope > *',
    columns: 5,
    tileWidth: 260,
    gap: 18,
    tilt: 16,
    turn: -14,
    roll: 0,
    perspective: 1200,
    depth: 120,
    speed: 42,
    direction: 'up',
    variance: 0.45,
    parallax: 0.6,
    pauseOnHover: false,
    lift: 64,
    fade: 0.6,
    dim: 0.55,
    grayscale: false,
    overlayColor: '#060010',
    responsive: null, // [{ maxWidth, ...overrides }] — first match wins
    ariaLabel: 'Drifting wall of projects'
  };

  const columnFactor = (index, variance) => {
    const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
    return 1 + variance * pseudo;
  };

  function DriftWall(source, options) {
    const base = Object.assign({}, DEFAULTS, options);
    const cards = Array.from(source.querySelectorAll(base.itemSelector));
    if (!cards.length) return null;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = mq.matches;

    cards.forEach(card => card.classList.remove('reveal', 'in-view'));

    const wall = document.createElement('div');
    wall.className = 'drift-wall';
    wall.setAttribute('role', 'group');
    wall.setAttribute('aria-label', base.ariaLabel);
    const plane = document.createElement('div');
    plane.className = 'drift-wall__plane';
    wall.appendChild(plane);
    source.replaceWith(wall);

    let cfg = base;
    let cols = []; // { el, track, copies: [el], copyHeight, origin, offset, velocity, base }
    let containerHeight = 600;
    let active = null; // { tile, col }
    let focusedCol = -1;
    let wallHovered = false;
    const pointer = { x: 0, y: 0 };
    const damped = { x: 0, y: 0 };
    let raf = null;
    let lastTs = null;
    let visible = true;

    const resolveConfig = () => {
      let next = Object.assign({}, base);
      if (Array.isArray(base.responsive)) {
        const match = base.responsive.find(r => window.innerWidth <= r.maxWidth);
        if (match) next = Object.assign(next, match);
      }
      return next;
    };

    const applyVars = () => {
      const s = wall.style;
      s.setProperty('--dw-tile-w', `${cfg.tileWidth}px`);
      s.setProperty('--dw-gap', `${cfg.gap}px`);
      s.setProperty('--dw-perspective', `${cfg.perspective}px`);
      s.setProperty('--dw-lift', `${cfg.lift}px`);
      s.setProperty('--dw-dim', cfg.dim);
      s.setProperty('--dw-gray', cfg.grayscale ? 1 : 0);
      s.setProperty('--dw-overlay', cfg.overlayColor);
      s.setProperty('--dw-edge', `${Math.max(0, (1 - cfg.fade) * 100)}%`);
    };

    const makeTile = (card, colIndex, isClone) => {
      const tile = document.createElement('div');
      tile.className = 'drift-wall__tile';
      tile.dataset.col = colIndex;
      const node = isClone ? card.cloneNode(true) : card;
      if (isClone) {
        node.removeAttribute('id');
        node.setAttribute('aria-hidden', 'true');
        node.querySelectorAll('a, button, [tabindex]').forEach(el => el.setAttribute('tabindex', '-1'));
      }
      tile.appendChild(node);
      return tile;
    };

    const build = () => {
      cfg = resolveConfig();
      applyVars();
      plane.textContent = '';
      cols = [];
      active = null;
      focusedCol = -1;

      const groups = Array.from({ length: cfg.columns }, () => []);
      cards.forEach((card, i) => groups[i % cfg.columns].push(card));

      // First pass: place originals so heights can be measured at the tile width.
      groups.forEach((group, c) => {
        const col = document.createElement('div');
        col.className = 'drift-wall__col';
        const track = document.createElement('div');
        track.className = 'drift-wall__track';
        const original = document.createElement('div');
        original.className = 'drift-wall__copy';
        (group.length ? group : [cards[0]]).forEach(card =>
          original.appendChild(makeTile(card, c, !group.length))
        );
        track.appendChild(original);
        col.appendChild(track);
        plane.appendChild(col);
        cols.push({ el: col, track, group: group.length ? group : [cards[0]], original });
      });

      containerHeight = wall.clientHeight || 600;

      const dirSign = cfg.direction === 'up' ? 1 : -1;
      cols.forEach((col, c) => {
        col.copyHeight = Math.max(1, col.original.offsetHeight);
        const copies = Math.max(3, Math.ceil((containerHeight * 1.6) / col.copyHeight) + 2);
        const originIndex = Math.floor(copies / 2);
        const before = [];
        const after = [];
        for (let k = 0; k < copies; k++) {
          if (k === originIndex) continue;
          const copy = document.createElement('div');
          copy.className = 'drift-wall__copy';
          copy.setAttribute('aria-hidden', 'true');
          col.group.forEach(card => copy.appendChild(makeTile(card, c, true)));
          (k < originIndex ? before : after).push(copy);
        }
        before.forEach(copy => col.track.insertBefore(copy, col.original));
        after.forEach(copy => col.track.appendChild(copy));
        col.originTop = originIndex * col.copyHeight;
        col.trackHeight = copies * col.copyHeight;
        col.offset = col.copyHeight * ((c * 0.37) % 1);
        col.velocity = 0;
        col.base = cfg.speed * columnFactor(c, cfg.variance) * dirSign * (c % 2 === 0 ? 1 : -1);
        col.track.style.transform = `translate3d(0, ${-col.offset}px, 0)`;
      });
    };

    const applyPlane = (px, py) => {
      plane.style.transform =
        `translate(-50%, -50%) scale(1.18) ` +
        `rotateX(${cfg.tilt + py}deg) rotateY(${cfg.turn + px}deg) rotateZ(${cfg.roll}deg) ` +
        `translateZ(${-cfg.depth}px)`;
    };

    const setActive = tile => {
      if (active && active.tile === tile) return;
      if (active) active.tile.classList.remove('is-active');
      active = tile ? { tile, col: Number(tile.dataset.col) } : null;
      if (tile) tile.classList.add('is-active');
    };

    const frame = ts => {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(0.05, Math.max(0, ts - lastTs) / 1000);
      lastTs = ts;

      const maxTilt = reduced ? 0 : cfg.parallax * 8;
      const damp = 1 - Math.exp(-dt / 0.12);
      damped.x += (pointer.x * maxTilt - damped.x) * damp;
      damped.y += (-pointer.y * maxTilt - damped.y) * damp;
      applyPlane(damped.x, damped.y);

      if (!reduced) {
        const paused = wallHovered && cfg.pauseOnHover;
        cols.forEach((col, c) => {
          if (c === focusedCol) return; // keyboard focus pins this column in place
          const stop = paused || (active && active.col === c);
          const target = stop ? 0 : col.base;
          const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
          col.velocity += (target - col.velocity) * ease;
          let next = col.offset + col.velocity * dt;
          next = ((next % col.copyHeight) + col.copyHeight) % col.copyHeight;
          col.offset = next;
          col.track.style.transform = `translate3d(0, ${-next}px, 0)`;
        });
      }

      raf = visible ? requestAnimationFrame(frame) : null;
    };

    const start = () => {
      if (raf || !visible) return;
      lastTs = null;
      raf = requestAnimationFrame(frame);
    };

    // Pointer: parallax tilt + hover lift (pauses that column).
    wall.addEventListener('pointerenter', () => { wallHovered = true; });
    wall.addEventListener('pointermove', e => {
      const rect = wall.getBoundingClientRect();
      if (cfg.parallax > 0 && !reduced && e.pointerType === 'mouse') {
        pointer.x = (e.clientX - rect.left) / rect.width - 0.5;
        pointer.y = (e.clientY - rect.top) / rect.height - 0.5;
      }
      const tile = e.target.closest && e.target.closest('.drift-wall__tile');
      if (tile) setActive(tile);
    });
    wall.addEventListener('pointerdown', e => {
      const tile = e.target.closest && e.target.closest('.drift-wall__tile');
      if (tile) setActive(tile);
    });
    wall.addEventListener('pointerleave', () => {
      wallHovered = false;
      pointer.x = 0;
      pointer.y = 0;
      if (focusedCol === -1) setActive(null);
    });

    // Keyboard: bring the focused (original) card to the middle of its column and hold it.
    wall.addEventListener('focusin', e => {
      const tile = e.target.closest('.drift-wall__tile');
      if (!tile) return;
      const c = Number(tile.dataset.col);
      const col = cols[c];
      setActive(tile);
      focusedCol = c;
      if (col) {
        const center = col.originTop + tile.offsetTop + tile.offsetHeight / 2;
        col.offset = center - col.trackHeight / 2;
        col.velocity = 0;
        col.track.style.transform = `translate3d(0, ${-col.offset}px, 0)`;
      }
    });
    wall.addEventListener('focusout', e => {
      if (wall.contains(e.relatedTarget)) return;
      focusedCol = -1;
      setActive(null);
    });

    // Only animate while the wall is on screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) start();
      }, { rootMargin: '100px' }).observe(wall);
    }

    mq.addEventListener && mq.addEventListener('change', e => { reduced = e.matches; });

    let lastWidth = window.innerWidth;
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth === lastWidth && Math.abs(wall.clientHeight - containerHeight) < 40) return;
        lastWidth = window.innerWidth;
        build();
      }, 200);
    });

    build();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    start();
    return { wall, rebuild: build };
  }

  window.DriftWall = DriftWall;
})();
