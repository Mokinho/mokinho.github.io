// Selected work cards: feed the cursor position to CSS for the border light + glare.
// Pointer devices only; styling lives in work-cards.css.
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('#work .selected-project').forEach((card) => {
    const media = card.querySelector('.selected-media');
    if (!media) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    media.addEventListener('pointermove', (e) => {
      const r = media.getBoundingClientRect();
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
