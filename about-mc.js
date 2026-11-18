// About + stats: cursor light on the portrait and stat cards, count-up numbers.
(() => {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // cursor position -> CSS (--mx / --my)
  if (fine) {
    document.querySelectorAll('#about .profile-portrait, .stats .stat').forEach((el) => {
      let raf = 0; let x = 0; let y = 0;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        x = e.clientX - r.left; y = e.clientY - r.top;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          el.style.setProperty('--mx', `${x.toFixed(0)}px`);
          el.style.setProperty('--my', `${y.toFixed(0)}px`);
          raf = 0;
        });
      });
    });
  }

  // count-up when the stats scroll into view
  const nums = [...document.querySelectorAll('.stats strong[data-count]')];
  if (!nums.length || reduced || !('IntersectionObserver' in window)) return;
  const parse = (txt) => { const m = txt.match(/^(\d+)(.*)$/); return m ? { n: +m[1], suffix: m[2] } : null; };
  const run = (el) => {
    const p = parse(el.dataset.count);
    if (!p || p.n === 0) return;
    const start = performance.now(); const dur = 1400;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = `${Math.round(p.n * eased)}${p.suffix}`;
      if (k < 1) requestAnimationFrame(tick);
    };
    el.textContent = `0${p.suffix}`;
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.6 });
  nums.forEach((el) => io.observe(el));
})();
