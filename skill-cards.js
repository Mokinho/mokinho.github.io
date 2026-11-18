// Skills cards: feed the cursor position to CSS for the spotlight + border light.
// Pointer devices only; styling lives in skill-cards.css.
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('#skills .service-card').forEach((card) => {
    let raf = 0;
    let x = 0;
    let y = 0;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        card.style.setProperty('--mx', `${x.toFixed(0)}px`);
        card.style.setProperty('--my', `${y.toFixed(0)}px`);
        raf = 0;
      });
    });
  });
})();
