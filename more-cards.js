// More projects reel: give the caption the current project's accent colour.
(() => {
  const reel = document.querySelector('#more-work .project-reel');
  const caption = reel && reel.querySelector('.reel-caption');
  if (!caption) return;
  const sync = () => {
    const cur = reel.querySelector('.reel-slide.is-current');
    const acc = cur && cur.style.getPropertyValue('--acc');
    if (acc) caption.style.setProperty('--cap-acc', acc.trim());
  };
  new MutationObserver(sync).observe(caption, { childList: true });
  sync();
})();
