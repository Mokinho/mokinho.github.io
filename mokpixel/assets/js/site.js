(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PHONE = '60196369900';
  const EMAIL = 'muhammadfaiqzharfan.johari@gmail.com';

  /* header border + mobile nav */
  const hdr = document.querySelector('.hdr');
  const fab = document.querySelector('.fab');
  const onScroll = () => {
    const y = window.scrollY;
    if (hdr) hdr.classList.toggle('scrolled', y > 8);
    if (fab) fab.classList.toggle('show', y > 420);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav');
  if (burger && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 960) setOpen(false); });
  }

  /* reveal on scroll */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* hero: giant word drifts sideways, photo parallax */
  const word = document.querySelector('.hero-word');
  const photo = document.querySelector('.hero-photo img');
  if ((word || photo) && !reduceMotion) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      if (word && y < window.innerHeight * 1.5) word.style.transform = `translate3d(${-y * 0.25}px,0,0)`;
      if (photo) {
        const r = photo.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
          photo.style.transform = `translate3d(0,${(-8 + p * 12).toFixed(2)}%,0)`;
        }
      }
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* project filters */
  const filters = document.querySelectorAll('.filters button');
  if (filters.length) {
    const items = document.querySelectorAll('.proj[data-cat]');
    filters.forEach((btn) => btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      items.forEach((it) => { it.hidden = cat !== 'all' && !it.dataset.cat.split(' ').includes(cat); });
    }));
  }

  /* opening hours: highlight today (Malaysia time) */
  const hours = document.querySelector('.hours');
  if (hours) {
    const day = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' })).getDay();
    const row = hours.querySelector(day === 0 ? '[data-day="sun"]' : day === 6 ? '[data-day="sat"]' : '[data-day="week"]');
    if (row) row.classList.add('today');
  }

  /* booking form -> WhatsApp or email */
  const form = document.getElementById('book-form');
  if (form) {
    const err = document.getElementById('form-error');
    const params = new URLSearchParams(window.location.search);
    const pre = params.get('service');
    if (pre) {
      const box = form.querySelector(`input[name="service"][value="${pre}"]`);
      if (box) box.checked = true;
    }
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
        if (!ok) missing.push(el.labels[0].textContent.replace('*', '').trim().toLowerCase());
      });
      if (missing.length) {
        err.textContent = `Please add your ${missing.join(', ')} so we can reply to your booking.`;
        err.hidden = false;
        form.querySelector('[aria-invalid="true"]').focus();
        return;
      }
      err.hidden = true;
      const services = [...form.querySelectorAll('input[name="service"]:checked')].map((i) => i.value);
      const budget = form.elements.budget ? form.elements.budget.value : '';
      const lines = [
        `Hi MokPixel, I'd like to book a design.`,
        `Name: ${form.elements.name.value.trim()}`,
        services.length ? `Service: ${services.join(', ')}` : '',
        budget ? `Budget: ${budget}` : '',
        form.elements.message.value.trim() ? `Project: ${form.elements.message.value.trim()}` : '',
        `Email: ${form.elements.email.value.trim()}`,
        `Phone: ${form.elements.phone.value.trim()}`,
      ].filter(Boolean);
      const body = lines.join('\n');
      if (via === 'email') {
        const subject = `Design booking: ${services[0] || 'new project'} for ${form.elements.name.value.trim()}`;
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      } else {
        window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(body)}`, '_blank', 'noopener');
      }
    });
  }

  /* project lightbox */
  const lb = document.querySelector('.lightbox');
  if (lb && window.MP_PROJECTS && typeof lb.showModal === 'function') {
    const img = lb.querySelector('img');
    const b = lb.querySelector('.lb-bar b');
    const sp = lb.querySelector('.lb-bar span');
    document.querySelectorAll('[data-lightbox]').forEach((btn) => btn.addEventListener('click', () => {
      const p = window.MP_PROJECTS[+btn.dataset.lightbox];
      img.src = p.src; img.alt = p.alt; b.textContent = p.client; sp.textContent = p.type;
      lb.showModal();
    }));
    lb.querySelector('.lb-close').addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  }

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
