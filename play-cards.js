// Playable portfolio cards: smooth 3D tilt, image parallax and cursor glare.
// Pointer devices only; respects prefers-reduced-motion. Styling lives in play-cards.css.
(() => {
  const cards = document.querySelectorAll('#playground .play-card');
  if (!cards.length) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const MAX_TILT = 6;      // degrees
  const PARALLAX = 12;     // px the image drifts against the cursor
  const LIFT = -8;         // px the card rises on hover
  const EASE = 0.12;

  cards.forEach((card) => {
    const tilt = card.querySelector('.play-tilt');
    const media = card.querySelector('.play-media');
    if (!tilt || !media) return;
    card.classList.add('is-tilt-js');

    const target = { x: 0, y: 0, lift: 0 };
    const cur = { x: 0, y: 0, lift: 0 };
    let raf = 0;
    let hovering = false;

    const frame = () => {
      cur.x += (target.x - cur.x) * EASE;
      cur.y += (target.y - cur.y) * EASE;
      cur.lift += (target.lift - cur.lift) * EASE;
      tilt.style.setProperty('--rx', `${(-cur.y * MAX_TILT).toFixed(3)}deg`);
      tilt.style.setProperty('--ry', `${(cur.x * MAX_TILT).toFixed(3)}deg`);
      tilt.style.setProperty('--lift', `${cur.lift.toFixed(2)}px`);
      tilt.style.setProperty('--px', `${(-cur.x * PARALLAX).toFixed(2)}px`);
      tilt.style.setProperty('--py', `${(-cur.y * PARALLAX * 0.6).toFixed(2)}px`);
      const settling = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) + Math.abs(target.lift - cur.lift) > 0.002;
      raf = hovering || settling ? requestAnimationFrame(frame) : 0;
    };
    const run = () => { if (!raf) raf = requestAnimationFrame(frame); };

    card.addEventListener('pointerenter', () => { hovering = true; target.lift = LIFT; run(); });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      target.x = Math.max(-1, Math.min(1, (x - 0.5) * 2));
      target.y = Math.max(-1, Math.min(1, (y - 0.5) * 2));
      const m = media.getBoundingClientRect();
      tilt.style.setProperty('--gx', `${(((e.clientX - m.left) / m.width) * 100).toFixed(1)}%`);
      tilt.style.setProperty('--gy', `${(((e.clientY - m.top) / m.height) * 100).toFixed(1)}%`);
      run();
    });
    card.addEventListener('pointerleave', () => {
      hovering = false;
      target.x = 0; target.y = 0; target.lift = 0;
      run();
    });
  });
})();
