(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- menu overlay ---- */
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  if (menuBtn && menu) {
    const setOpen = (open) => {
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) menu.querySelector('a').focus();
    };
    menuBtn.addEventListener('click', () => setOpen(menu.hidden));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setOpen(false); menuBtn.focus(); } });
  }

  /* ---- header: hide the big lockup once past the hero top ---- */
  const header = document.querySelector('.site-header');
  const onScrollHeader = () => header && header.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.25);
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();
  const neonBlock = document.querySelector('.contact');
  if (header && neonBlock) {
    const checkNeon = () => {
      const r = neonBlock.getBoundingClientRect();
      header.classList.toggle('on-neon', r.top < 60 && r.bottom > 60);
    };
    window.addEventListener('scroll', checkNeon, { passive: true });
    checkNeon();
  }

  /* ---- reveal-on-view (signature draw) ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); } });
  }, { threshold: 0.45 });
  document.querySelectorAll('.note-photo').forEach((el) => io.observe(el));

  /* ---- collage parallax ---- */
  const shots = [...document.querySelectorAll('[data-speed]')];
  if (shots.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      const scale = window.innerWidth < 700 ? 0.5 : 1;
      shots.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed) * scale;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
  }

  /* ---- services: floating preview follows the cursor ---- */
  const float = document.querySelector('.svc-float');
  const canHover = window.matchMedia('(hover: hover) and (min-width: 861px)');
  if (float) {
    let x = 0, y = 0, fx = 0, fy = 0, raf = 0, active = false;
    const follow = () => {
      fx += (x - fx) * 0.18; fy += (y - fy) * 0.18;
      float.style.left = fx + 'px'; float.style.top = fy + 'px';
      if (active || Math.abs(x - fx) > 0.5) raf = requestAnimationFrame(follow); else raf = 0;
    };
    document.querySelectorAll('.svc').forEach((row) => {
      row.addEventListener('pointerenter', (e) => {
        if (!canHover.matches) return;
        float.src = row.dataset.img; active = true;
        x = fx = e.clientX + 170; y = fy = e.clientY;
        float.classList.add('show');
        if (!raf) raf = requestAnimationFrame(follow);
      });
      row.addEventListener('pointermove', (e) => { x = e.clientX + 170; y = e.clientY; });
      row.addEventListener('pointerleave', () => { active = false; float.classList.remove('show'); });
    });
  }

  /* ---- testimonials ---- */
  const voices = [...document.querySelectorAll('.voice')];
  const dots = [...document.querySelectorAll('.voice-nav button')];
  if (voices.length) {
    let idx = 0, timer = 0;
    const show = (i) => {
      idx = (i + voices.length) % voices.length;
      voices.forEach((v, n) => v.classList.toggle('is-active', n === idx));
      dots.forEach((d, n) => d.setAttribute('aria-current', String(n === idx)));
    };
    const auto = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => show(idx + 1), 7000); };
    dots.forEach((d, n) => d.addEventListener('click', () => { show(n); auto(); }));
    auto();
  }

  /* ---- service links pre-tick the matching option ---- */
  document.querySelectorAll('[data-service]').forEach((link) => {
    link.addEventListener('click', () => {
      const box = document.querySelector(`.chips input[value="${link.dataset.service}"]`);
      if (box) box.checked = true;
    });
  });

  /* ---- contact form -> WhatsApp or email ---- */
  const form = document.getElementById('contact-form');
  const err = document.getElementById('form-error');
  const PHONE = '60196369900';
  const EMAIL = 'muhammadfaiqzharfan.johari@gmail.com';
  if (form) {
    let via = 'whatsapp';
    form.querySelectorAll('button[type="submit"]').forEach((b) => b.addEventListener('click', () => { via = b.dataset.via; }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const missing = [];
      ['name', 'email', 'phone'].forEach((n) => {
        const el = form.elements[n];
        let ok = el.value.trim() !== '';
        if (ok && n === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        el.setAttribute('aria-invalid', String(!ok));
        if (!ok) missing.push(el.labels[0].textContent.toLowerCase());
      });
      if (missing.length) {
        err.textContent = `Add your ${missing.join(', ')} so we can reply.`;
        err.hidden = false;
        form.querySelector('[aria-invalid="true"]').focus();
        return;
      }
      err.hidden = true;
      const services = [...form.querySelectorAll('input[name="service"]:checked')].map((i) => i.value);
      const lines = [
        `Hi MokPixel, I'm ${form.elements.name.value.trim()}.`,
        services.length ? `I'm interested in: ${services.join(', ')}.` : '',
        form.elements.message.value.trim(),
        '',
        `Email: ${form.elements.email.value.trim()}`,
        `Phone: ${form.elements.phone.value.trim()}`,
      ].filter((l, i) => l !== '' || i === 3);
      const body = lines.join('\n');
      if (via === 'email') {
        const subject = `New project inquiry from ${form.elements.name.value.trim()}`;
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      } else {
        window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(body)}`, '_blank', 'noopener');
      }
    });
  }

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
