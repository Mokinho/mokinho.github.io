// Intro: split the hero intro line into words so they can blur in one after another
(() => {
  const sub = document.querySelector('.hero-sub');
  if (!sub || !document.documentElement.classList.contains('intro')) return;
  const words = sub.textContent.trim().split(/\s+/);
  sub.innerHTML = words.map((w, i) => `<span class="w" style="--i:${i}">${w.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`).join(' ');
  sub.classList.add('is-split');
})();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

const closeNav = () => {
  navLinks.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
};

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
document.addEventListener('click', e => {
  if (!e.target.closest('.header-inner, .nav-wheel')) closeNav();
});

// Header background once scrolled
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Scroll reveal
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Active nav link on scroll
const navAnchors = document.querySelectorAll('.nav-links a[data-nav]');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const anchor = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
    if (!anchor) return;
    navAnchors.forEach(a => a.classList.remove('active'));
    anchor.classList.add('active');
  });
}, { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('main section[id]').forEach(s => navObserver.observe(s));

// Particles (hero + contact backgrounds); each canvas only animates while on screen
document.querySelectorAll('canvas.particles').forEach(canvas => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = ['20,92,255', '53,121,255', '114,220,255', '255,255,255'];
  let w, h, dpr, dots = [], raf = 0, visible = true;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((w * h) / 9000);
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.6 + .4,
      vx: (Math.random() - .5) * .25, vy: -(Math.random() * .3 + .05),
      a: Math.random() * .6 + .2,
      c: colors[Math.floor(Math.random() * colors.length)]
    }));
    if (reduce || !raf) draw(true);
  };

  function draw(once) {
    raf = 0;
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.x += d.vx; d.y += d.vy;
      if (d.y < -5) { d.y = h + 5; d.x = Math.random() * w; }
      if (d.x < -5) d.x = w + 5; else if (d.x > w + 5) d.x = -5;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${d.c},${d.a})`;
      ctx.fill();
    }
    if (!reduce && visible && once !== true) raf = requestAnimationFrame(draw);
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !reduce && !raf) raf = requestAnimationFrame(draw);
  }).observe(canvas);
  resize();
  window.addEventListener('resize', resize);
});

// Desktop menu — RubberSegment thumb (stretch + squash), synced with scroll-spy
(() => {
  if (!window.RubberSegment) return;
  const links = [...navLinks.querySelectorAll('a')];
  let locked = false;
  let unlockTimer = 0;
  const activeIndex = () => links.findIndex(a => a.classList.contains('active'));
  const unlock = () => { locked = false; seg.setActive(activeIndex()); };
  const lockUntilScrollEnds = () => {
    locked = true;
    const bump = () => { clearTimeout(unlockTimer); unlockTimer = setTimeout(() => { window.removeEventListener('scroll', bump); unlock(); }, 180); };
    window.addEventListener('scroll', bump, { passive: true });
    bump();
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => { window.removeEventListener('scroll', bump); unlock(); }, 900);
  };
  const seg = window.RubberSegment(navLinks, {
    links,
    inset: 5,
    radius: 22,
    stretch: 100,
    squash: 3,
    speed: 1,
    glide: 75,
    draggable: true,
    onCommit: (i, how) => {
      lockUntilScrollEnds();
      if (how === 'drag') {
        const href = links[i].getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          history.replaceState(null, '', href);
        }
      }
    }
  });
  if (!seg) return;
  // Scroll-spy moves the thumb too (ignored while a click/drag scroll is in flight).
  new MutationObserver(() => { if (!locked) seg.setActive(activeIndex()); })
    .observe(navLinks, { subtree: true, attributes: true, attributeFilter: ['class'] });
})();

// Hamburger menu (≤900px) — OptionWheel overlay
(() => {
  if (!window.OptionWheel) return;
  const mobile = window.matchMedia('(max-width: 900px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const links = [...navLinks.querySelectorAll('a')];
  const items = links.map(a => ({ label: (a.querySelector('.pill-label') || a).textContent.trim(), href: a.getAttribute('href') }));
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#145cff';

  const overlay = document.createElement('div');
  overlay.className = 'nav-wheel';
  overlay.id = 'navWheel';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<div class="nav-wheel-track"></div><p class="nav-wheel-hint">Scroll or drag · tap to go</p>';
  document.body.appendChild(overlay);

  let leaving = false;
  const go = (i, item) => {
    if (leaving) return;
    leaving = true;
    setTimeout(() => {
      closeNav();
      const el = document.querySelector(item.href);
      if (el) {
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        history.replaceState(null, '', item.href);
      }
      leaving = false;
    }, reduce ? 0 : 320);
  };

  const wheel = window.OptionWheel(overlay.querySelector('.nav-wheel-track'), {
    items,
    defaultSelected: 0,
    textColor: '#939eac',
    activeColor: accent,
    side: 'left',
    fontSize: 2.6,
    spacing: 1.45,
    curve: 1,
    tilt: 8,
    blur: 1.5,
    fade: 0.22,
    minOpacity: 0.08,
    smoothing: reduce ? 1 : 200,
    inset: 36,
    ariaLabel: 'Site sections',
    onSelect: go
  });
  navLinks.classList.add('has-wheel');

  const sync = () => {
    const open = navLinks.classList.contains('open') && mobile.matches;
    if (open === overlay.classList.contains('open')) return;
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', String(!open));
    document.documentElement.classList.toggle('nav-wheel-lock', open);
    if (open) {
      const active = Math.max(0, links.findIndex(a => a.classList.contains('active')));
      wheel.select(active, true);
      setTimeout(() => wheel.focus(), 50);
    }
  };
  new MutationObserver(sync).observe(navLinks, { attributes: true, attributeFilter: ['class'] });
  mobile.addEventListener('change', () => { if (!mobile.matches) closeNav(); sync(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeNav(); navToggle.focus(); }
  });
})();

// Contact card — Dock (magnifying icon dock), built from the contact links
(() => {
  const grid = document.querySelector('.contact-links');
  if (!grid || !window.Dock) return;
  const svg = d => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICONS = {
    email: svg('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>'),
    whatsapp: svg('<path d="M20.5 11.6a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1.4-4.4a8.5 8.5 0 1 1 15.6-4.5z"/><path d="M9 9.2c.2 2.6 2.2 4.6 4.8 4.9l1-1.1 1.8.8-.4 1.6c-3.9.2-7.6-3.4-7.4-7.3l1.6-.4.8 1.8z"/>'),
    linkedin: svg('<rect x="3" y="3" width="18" height="18" rx="3.5"/><path d="M8 10.5V17M8 7.25v.01M12 17v-6.5M12 13.5a2.5 2.5 0 0 1 5 0V17"/>'),
    resume: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>')
  };
  const items = [...grid.querySelectorAll('a.contact-link')].map(a => {
    const label = a.querySelector('.contact-label').textContent.trim();
    const value = a.querySelector('.contact-value').textContent.trim();
    return {
      href: a.getAttribute('href'),
      target: a.getAttribute('target'),
      rel: a.getAttribute('rel'),
      label: label === 'Email' ? value : label,
      icon: ICONS[label.toLowerCase()] || ICONS.resume
    };
  });
  const mount = document.createElement('div');
  mount.className = 'contact-dock';
  grid.after(mount);
  const dock = window.Dock(mount, { items, panelHeight: 68, baseItemSize: 50, magnification: 70, distance: 200 });
  if (dock) grid.classList.add('is-docked');
})();

// BorderGlow (React Bits, vanilla port) on every card with a hover effect — pointer devices only
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const cards = document.querySelectorAll('.project-card, .play-card, .feature-card, .feature-wide, .service-card');
  cards.forEach(card => {
    // feature cards clipped their zooming image with overflow:hidden; clip the image itself instead
    if (card.classList.contains('feature-card')) {
      const img = card.querySelector(':scope > img');
      if (img) {
        const clip = document.createElement('span');
        clip.className = 'glow-media-clip';
        img.before(clip);
        clip.appendChild(img);
      }
    }
    const fx = document.createElement('span');
    fx.className = 'glow-fx';
    fx.setAttribute('aria-hidden', 'true');
    fx.innerHTML = '<span class="glow-fill"></span><span class="glow-ring"></span><span class="edge-light"></span>';
    card.appendChild(fx);
    card.classList.add('glow-card');
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const cx = r.width / 2, cy = r.height / 2;
      const dx = e.clientX - r.left - cx, dy = e.clientY - r.top - cy;
      const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
      const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
      const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
      let deg = dx === 0 && dy === 0 ? 0 : Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (deg < 0) deg += 360;
      card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
      card.style.setProperty('--cursor-angle', `${deg.toFixed(3)}deg`);
    });
  });
})();

// TextLoop band between FAQ and Contact
(() => {
  const band = document.getElementById('loopBand');
  if (!band || !window.TextLoop) return;
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#145cff';
  const small = window.matchMedia('(max-width: 640px)').matches;
  window.TextLoop(band, {
    text: 'FAIQ & WEB DEV',
    shape: 'wave',
    fitWidth: true,           // full-width band, sizes below are real pixels
    period: small ? 220 : 340,
    speed: 60,
    direction: 'forward',
    separator: '✦',
    curviness: small ? 10 : 14,
    fontSize: small ? 15 : 20,
    fontWeight: 700,
    letterSpacing: 2,
    uppercase: true,
    color: '#060c1b',
    ribbon: true,
    ribbonColor: accent,
    ribbonWidth: small ? 30 : 40,
    pauseOnHover: true
  });
})();

// Hero title — TechText canvas effect
(() => {
  const title = document.getElementById('heroTitle');
  const fx = title && title.querySelector('.hero-title-fx');
  if (!fx || !window.TechText) return;
  const css = getComputedStyle(document.documentElement);
  const accent = css.getPropertyValue('--accent').trim() || '#145cff';
  const blue = css.getPropertyValue('--blue').trim() || '#8ec5ff';
  const tt = window.TechText(fx, {
    segments: [
      { text: '#', color: blue },
      { text: 'FAST\n' },
      { text: 'SECURE', color: accent },
      { text: ' &\nBUILT TO GROW' }
    ],
    sizeFrom: title,
    fontWeight: 900,
    lineHeight: 0.98,
    letterSpacing: -0.03,
    align: 'center',
    pad: 32,
    color: '#ffffff',
    accentColor: accent,
    reveal: 'letter',
    dashLength: 4,
    dashGap: 2,
    strokeWidth: 1.2,
    specks: 15
  });
  if (tt) title.classList.add('tech-ready');
})();

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// TrueFocus on the "Hello, World!" words in the About heading
(() => {
  const el = document.getElementById('helloFocus');
  if (!el || !window.TrueFocus) return;
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#145cff';
  window.TrueFocus(el, {
    sentence: '“Hello, World!”',
    blurAmount: 4,
    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--blue').trim() || '#8ec5ff',
    glowColor: 'rgba(142, 197, 255, .6)',
    animationDuration: 0.6,
    pauseBetweenAnimations: 1
  });
})();

// GradualBlur — fixed soft blur along the bottom of the viewport
(() => {
  if (!window.GradualBlur) return;
  window.GradualBlur(document.body, {
    target: 'page',
    position: 'bottom',
    height: '6rem',
    strength: 2,
    divCount: 5,
    curve: 'bezier',
    exponential: true,
    opacity: 1,
    zIndex: -10,       // page target adds +100 → 90: under the sticky header (100) and mobile menu (99)
    hideAtEnd: true    // fade out at the very bottom so the footer isn't left blurred
  });
})();

// More Projects: original vertical reel, adapted to the existing portfolio.
(() => {
  const grid = document.querySelector('#more-work .project-grid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll(':scope > .project-card')];
  if (!cards.length) return;
  const section = grid.closest('section');
  const root = document.createElement('div');
  root.className = 'project-reel';
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'Project reel. Use Previous and Next, drag, or use the arrow keys.');
  const stage = document.createElement('div');
  stage.className = 'reel-stage';
  stage.tabIndex = 0;
  stage.setAttribute('aria-label', 'Project preview. Arrow keys change project; Space pauses autoplay.');
  const caption = document.createElement('div');
  caption.className = 'reel-caption';
  const info = document.createElement('div');
  info.className = 'reel-info';
  const controls = document.createElement('div');
  controls.className = 'reel-controls';
  controls.innerHTML = '<button type="button" class="reel-prev" aria-label="Previous project">↑</button><span class="reel-count"></span><button type="button" class="reel-next" aria-label="Next project">↓</button><button type="button" class="reel-pause" aria-label="Pause project autoplay" aria-pressed="false">Pause</button>';
  const chooseLabel = document.createElement('label');
  chooseLabel.className = 'reel-picker-label';
  chooseLabel.textContent = 'Jump to a project';
  const picker = document.createElement('select');
  picker.className = 'reel-picker';
  picker.setAttribute('aria-label', 'Choose a project');
  cards.forEach((card, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = card.querySelector('h3').textContent;
    picker.appendChild(option);
    card.classList.remove('reveal', 'in-view');
    card.classList.add('reel-slide');
    card.setAttribute('role','group');
    card.setAttribute('aria-label', option.textContent);
  });
  chooseLabel.appendChild(picker);
  const hint = document.createElement('p');
  hint.className = 'reel-hint';
  hint.textContent = 'Drag to browse · Swipe sideways on mobile · Arrow keys to explore';
  grid.before(root);
  stage.appendChild(grid);
  info.append(caption, controls, chooseLabel, hint);
  root.append(stage, info);
  grid.classList.add('reel-track');
  let index = 0, paused = matchMedia('(prefers-reduced-motion: reduce)').matches, visible = false, hovered = false, dragging = null, focusWithin = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function go(value) {
    index = (value + cards.length) % cards.length;
    cards.forEach((card, i) => {
      let delta = (i - index + cards.length) % cards.length;
      if (delta > cards.length / 2) delta -= cards.length;
      card.style.setProperty('--reel-offset', delta);
      card.style.setProperty('--reel-depth', Math.abs(delta));
      card.style.opacity = Math.abs(delta) <= 2 ? (delta === 0 ? 1 : .35) : 0;
      card.style.zIndex = 10 - Math.abs(delta);
      card.style.visibility = Math.abs(delta) <= 2 ? 'visible' : 'hidden';
      card.setAttribute('aria-hidden', String(i !== index));
      card.inert = i !== index;
      card.classList.toggle('is-current', i === index);
    });
    caption.replaceChildren(cards[index].querySelector('.project-body').cloneNode(true));
    caption.classList.remove('reel-caption-enter');
    void caption.offsetWidth;
    caption.classList.add('reel-caption-enter');
    controls.querySelector('.reel-count').textContent = String(index + 1).padStart(2,'0') + ' / ' + String(cards.length).padStart(2,'0');
    picker.value = index;
  }
  function togglePause() {
    paused = !paused;
    const button = controls.querySelector('.reel-pause');
    button.textContent = paused ? 'Play' : 'Pause';
    button.setAttribute('aria-label', paused ? 'Play project autoplay' : 'Pause project autoplay');
    button.setAttribute('aria-pressed', String(paused));
  }
  controls.querySelector('.reel-prev').addEventListener('click', () => go(index - 1));
  controls.querySelector('.reel-next').addEventListener('click', () => go(index + 1));
  controls.querySelector('.reel-pause').addEventListener('click', togglePause);
  picker.addEventListener('change', () => go(Number(picker.value)));
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(cards.length - 1); }
    else if (e.key === ' ') { e.preventDefault(); togglePause(); }
  });
  stage.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    dragging = { x:e.clientX, y:e.clientY, time:performance.now(), touch:e.pointerType==='touch' };
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('is-dragging');
  });
  const finishDrag = e => {
    if (!dragging) return;
    const distance = dragging.touch ? dragging.x - e.clientX : dragging.y - e.clientY;
    const elapsed = Math.max(1, performance.now() - dragging.time);
    if (Math.abs(distance) > 35) {
      const steps = Math.min(4, Math.max(1, Math.round(Math.abs(distance) / 140 + Math.abs(distance) / elapsed * .4)));
      go(index + Math.sign(distance) * steps);
    }
    dragging = null;
    stage.classList.remove('is-dragging');
  };
  stage.addEventListener('pointerup', finishDrag);
  stage.addEventListener('pointercancel', () => { dragging = null; stage.classList.remove('is-dragging'); });
  root.addEventListener('pointerenter', () => { hovered = true; });
  root.addEventListener('pointerleave', () => { hovered = false; });
  root.addEventListener('focusin', () => { focusWithin = true; });
  root.addEventListener('focusout', e => { focusWithin = root.contains(e.relatedTarget); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, {threshold:.15}).observe(root);
  setInterval(() => {
    if (visible && !paused && !hovered && !focusWithin && !dragging && !document.hidden && !reduced.matches) go(index + 1);
  }, 5000);
  if (paused) {
    const button = controls.querySelector('.reel-pause');
    button.textContent = 'Play';
    button.setAttribute('aria-label', 'Play project autoplay');
    button.setAttribute('aria-pressed', 'true');
  }
  go(0);
})();

/* Accessible career milestones and hexagonal FAQ topic navigation. */
(() => {
  function connectTabs(rootSelector, tabSelector, panelSelector, hover) {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    const tabs = [...root.querySelectorAll(tabSelector)];
    const panels = [...root.querySelectorAll(panelSelector)];
    if (!tabs.length || tabs.length !== panels.length) return;
    function activate(index, focus) {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[i].hidden = !active;
      });
      if (focus) tabs[index].focus();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(index, false));
      if (hover) tab.addEventListener('pointerenter', e => {
        if (e.pointerType === 'mouse' && !root.contains(document.activeElement)) activate(index, false);
      });
      tab.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(next, true);
      });
    });
  }
  connectTabs('#experience', '.career-stop', '.career-detail', true);
  connectTabs('#faq', '.faq-topic', '.faq-answer', true);
})();
