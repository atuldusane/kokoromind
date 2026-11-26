(() => {
  const root = document.documentElement;
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window)) return;
  root.classList.add('js');

  const reveal = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach((el) => reveal.observe(el));
  const idle = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('offscreen', !e.isIntersecting)));
  $$('.flutter').forEach((el) => idle.observe(el));

  // One scroll loop; only scenes near the viewport are measured.
  if (!reduced) {
    const clamp = (n) => Math.min(1, Math.max(0, n));
    const live = new Set();
    let queued = false;
    const paint = () => {
      queued = false;
      const vh = innerHeight;
      const jobs = [...live].map((el) => [el, el.getBoundingClientRect()]);
      jobs.forEach(([el, r]) => {
        const kind = el.dataset.scroll;
        if (kind === 'out') el.style.setProperty('--p', clamp(-r.top / r.height).toFixed(4));
        if (kind === 'through') el.style.setProperty('--p', clamp((vh - r.top) / (vh + r.height)).toFixed(4));
        if (kind === 'unfold') el.style.setProperty('--c', (1 - clamp((vh - r.top) / (vh * 0.85))).toFixed(4));
        if (kind === 'draw') el.style.setProperty('--k', clamp((vh * 0.92 - r.top) / (vh * 0.6)).toFixed(4));
      });
    };
    const ask = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
    const near = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? live.add(e.target) : live.delete(e.target)));
      ask();
    }, { rootMargin: '20%' });
    $$('[data-scroll]').forEach((el) => near.observe(el));
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask);
  }

  const clips = $$('.fan video');
  const toggle = document.querySelector('#clip-toggle');
  let playing = !reduced && !(navigator.connection && navigator.connection.saveData);
  const visible = new Set();
  const sync = () => {
    clips.forEach((v) => {
      if (playing && visible.has(v)) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
    });
    toggle.textContent = playing ? 'Pause clips' : 'Play clips';
  };
  toggle.hidden = false;
  toggle.addEventListener('click', () => { playing = !playing; sync(); });
  const watch = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))); sync(); }, { rootMargin: '120px' });
  clips.forEach((v) => watch.observe(v));
  sync();
})();
