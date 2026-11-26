(() => {
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Googly eyes follow the pointer
  const eyes = $$('.eye');
  if (!reduced && matchMedia('(hover: hover)').matches) {
    let queued = false;
    addEventListener('pointermove', (e) => {
      if (queued || scrollY > innerHeight) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const boxes = eyes.map((el) => el.getBoundingClientRect());
        eyes.forEach((el, i) => {
          const dx = e.clientX - (boxes[i].left + boxes[i].width / 2);
          const dy = e.clientY - (boxes[i].top + boxes[i].height / 2);
          const d = Math.hypot(dx, dy) || 1;
          const k = Math.min(1, d / 120);
          el.style.setProperty('--ex', ((dx / d) * k).toFixed(2));
          el.style.setProperty('--ey', ((dy / d) * k).toFixed(2));
        });
      });
    }, { passive: true });
  }
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
    $$('.doodle').forEach((el) => io.observe(el));
    const dock = document.querySelector('.dock');
    const seen = new Map();
    const dw = new IntersectionObserver((es) => { es.forEach((e) => seen.set(e.target, e.isIntersecting)); dock.classList.toggle('show', ![...seen.values()].some(Boolean)); });
    ['.hero', '#courses', '.foot'].forEach((s) => dw.observe(document.querySelector(s)));
  }
  // Each video group loads only near the viewport and has its own pause control
  const saver = navigator.connection && navigator.connection.saveData;
  const group = (selector, toggle, noun) => {
    const list = $$(selector);
    const visible = new Set();
    let playing = !reduced && !saver;
    const sync = () => {
      list.forEach((v) => {
        if (playing && visible.has(v)) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
      });
      const label = `${playing ? 'Pause' : 'Play'} ${noun}`;
      if (toggle.querySelector('svg')) { toggle.setAttribute('aria-label', label); toggle.classList.toggle('off', !playing); } else toggle.textContent = label;
    };
    toggle.hidden = false;
    toggle.addEventListener('click', () => { playing = !playing; sync(); });
    if ('IntersectionObserver' in window) {
      const w = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))); sync(); }, { rootMargin: '120px' });
      list.forEach((v) => w.observe(v));
    } else list.forEach((v) => visible.add(v));
    sync();
  };
  const start = () => group('.snaps video', document.querySelector('#snap-toggle'), 'videos');
  if (document.readyState === 'complete') start(); else addEventListener('load', start);
  group('.clips video', document.querySelector('#clip-toggle'), 'clips');
})();
