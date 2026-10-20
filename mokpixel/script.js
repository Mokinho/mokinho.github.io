(() => {
  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  // Work strip: arrows + drag to scroll
  const strip = document.querySelector('.strip');
  if (strip) {
    const step = () => {
      const card = strip.querySelector('.card');
      return card ? card.getBoundingClientRect().width + 20 : 320;
    };
    document.querySelectorAll('.arrow').forEach((btn) => {
      btn.addEventListener('click', () => strip.scrollBy({ left: step() * Number(btn.dataset.dir), behavior: 'smooth' }));
    });
    strip.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: step(), behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -step(), behavior: 'smooth' }); e.preventDefault(); }
    });
    let down = false, startX = 0, startScroll = 0, moved = false;
    strip.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startScroll = strip.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('dragging'); }
      strip.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      strip.classList.remove('dragging');
    });
    strip.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  // Pricing "Get started" pre-ticks the matching service
  document.querySelectorAll('[data-service]').forEach((link) => {
    link.addEventListener('click', () => {
      const box = document.querySelector(`.chips input[value="${link.dataset.service}"]`);
      if (box) box.checked = true;
    });
  });

  // Contact form -> WhatsApp or email
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
