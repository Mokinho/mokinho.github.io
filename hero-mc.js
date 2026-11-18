// Hero "Mission Control": cycle the browser-window stack, pointer tilt/parallax,
// live chip label, and the floating "Let's talk" badge after the hero.
(() => {
  const hero = document.getElementById('top');
  const visual = hero && hero.querySelector('.hero-visual');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- window stack cycling ---
  if (visual) {
    const wins = [...visual.querySelectorAll('.hv-win')];
    const label = visual.querySelector('.hv-chip-name');
    let order = wins.map((_, i) => i); // order[pos] = window index
    let hovering = false;
    let onScreen = true;
    const apply = () => {
      order.forEach((wi, pos) => wins[wi].setAttribute('data-pos', String(pos)));
      if (label) label.textContent = wins[order[0]].dataset.name || '';
    };
    const next = () => { order = [...order.slice(1), order[0]]; apply(); };
    apply();
    if (!reduced && wins.length > 1) {
      new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0.2 }).observe(visual);
      setInterval(() => { if (!hovering && onScreen && !document.hidden) next(); }, 5200);
    }
    visual.addEventListener('pointerenter', () => { hovering = true; });
    visual.addEventListener('pointerleave', () => {
      hovering = false;
      visual.style.setProperty('--rx', '0deg'); visual.style.setProperty('--ry', '0deg');
      visual.style.setProperty('--fx', '0px'); visual.style.setProperty('--fy', '0px');
    });

    // --- pointer tilt + figure parallax (fine pointers only) ---
    if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let raf = 0; let px = 0; let py = 0;
      visual.addEventListener('pointermove', (e) => {
        const r = visual.getBoundingClientRect();
        px = (e.clientX - r.left) / r.width - 0.5;
        py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          visual.style.setProperty('--ry', `${(px * 10).toFixed(2)}deg`);
          visual.style.setProperty('--rx', `${(-py * 8).toFixed(2)}deg`);
          visual.style.setProperty('--fx', `${(px * -14).toFixed(1)}px`);
          visual.style.setProperty('--fy', `${(py * -10).toFixed(1)}px`);
          raf = 0;
        });
      });
    }
  }

  // --- floating "Let's talk" badge once the hero is out of view ---
  const badge = hero && hero.querySelector('.spin-badge');
  const contact = document.getElementById('contact');
  if (badge) {
    badge.classList.add('spin-badge--float');
    document.body.appendChild(badge);
    let pastHero = false; let atContact = false;
    const update = () => badge.classList.toggle('is-visible', pastHero && !atContact);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; update(); }, { threshold: 0.05 }).observe(hero);
    if (contact) new IntersectionObserver(([e]) => { atContact = e.isIntersecting; update(); }, { threshold: 0.15 }).observe(contact);
  }
})();
