// Footer: copy-email button with a short confirmation.
(() => {
  const btn = document.querySelector('.fc-copy-email');
  if (!btn) return;
  const label = btn.querySelector('.fc-copy-label');
  const email = btn.dataset.email;
  let timer = 0;
  btn.addEventListener('click', async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(email); ok = true; } catch (e) { ok = false; }
    if (!ok) { window.location.href = `mailto:${email}`; return; }
    btn.classList.add('is-copied');
    label.textContent = 'Email copied';
    clearTimeout(timer);
    timer = setTimeout(() => { btn.classList.remove('is-copied'); label.textContent = 'Copy email'; }, 2200);
  });
})();
