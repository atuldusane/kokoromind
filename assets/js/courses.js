(() => {
  const root = document.documentElement;
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  if ('IntersectionObserver' in window) {
    // Reveal once
    root.classList.add('js');
    const reveal = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.rv, .place').forEach((el) => reveal.observe(el));

    // Stop the butterfly when nobody can see it
    const idle = new IntersectionObserver((entries) => entries.forEach((e) =>
      e.target.classList.toggle('offscreen', !e.isIntersecting)));
    $$('.flutter').forEach((el) => idle.observe(el));

    // Phone enroll bar: after the hero, not while the course cards are on screen
    const dock = document.querySelector('.dock');
    const seen = new Map();
    const dockWatch = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting));
      dock.classList.toggle('show', ![...seen.values()].some(Boolean));
    });
    ['.hero', '#courses', '.foot'].forEach((s) => dockWatch.observe(document.querySelector(s)));
  }

  // Polaroid line: prints pegged to a sagging string
  const makeLine = (box, onToggle = () => {}) => {
    const path = box.querySelector('.pl-string path');
    const all = [...box.querySelectorAll('.pl-card')];
    const bar = box.querySelector('.pl-bar');
    const live = box.querySelector('.pl-live');
    const pauseBtn = bar.querySelector('[data-do=pause]');
    const cfg = { auto: +box.dataset.autoplay, k: +box.dataset.speed, sag: +box.dataset.sag, swing: reduced.matches ? 0 : +box.dataset.swing, card: +box.dataset.card, ratio: +box.dataset.ratio || 1 };
    const S = { off: 0, vel: 0, target: 0 };
    let cards = all;
    let active = -1;
    let drag = null;
    let touched = -1e9;
    let held = false;
    let auto = !reduced.matches && cfg.auto > 0;
    let g = { w: 0, cw: 300, gap: 324, y0: 60, loop: false };
    let raf = 0;
    let prev = 0;
    let visible = false;
    let wheelEnd = 0;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const mod = (i, n) => ((i % n) + n) % n;

    const measure = () => {
      const w = box.clientWidth;
      const cw = Math.round(clamp(w * 0.62, 190, cfg.card));
      const y0 = w < 700 ? 34 : 56;
      const gap = cw * 1.1;
      const total = gap * cards.length;
      box.style.setProperty('--cw', `${cw}px`);
      // string + peg + print (square photo, frame, label) + swing room + caption bar
      box.style.setProperty('--lh', `${Math.round(y0 + cfg.sag + 12 + cw * cfg.ratio + 80 + 40 + 96)}px`);
      const idx = S.target / g.gap;
      g = { w, cw, gap, y0, loop: total >= w + cw * 1.2 };
      S.off = S.target = Math.round(g.loop ? idx : clamp(idx, 0, cards.length - 1)) * gap;
      S.vel = 0;
      path.setAttribute('d', `M0 ${y0} Q${w / 2} ${y0 + 2 * cfg.sag} ${w} ${y0}`);
      wake();
    };
    const limit = (slot) => (g.loop ? slot : clamp(slot, 0, cards.length - 1));
    const goSlot = (slot) => { S.target = limit(slot) * g.gap; wake(); };
    const slotNow = () => Math.round(S.target / g.gap);
    const step = (d) => {
      touched = performance.now();
      const s = slotNow() + d;
      goSlot(g.loop ? s : mod(s, cards.length));
    };
    const goCard = (el) => {
      const i = cards.indexOf(el);
      const n = cards.length;
      const cur = slotNow();
      let d = i - mod(cur, n);
      if (g.loop) { if (d > n / 2) d -= n; if (d < -n / 2) d += n; }
      goSlot(cur + d);
    };
    const show = (i) => {
      active = i;
      cards.forEach((c, k) => c.classList.toggle('on', k === i));
      const c = cards[i];
      bar.querySelector('.pl-title').textContent = c.dataset.title;
      bar.querySelector('.pl-sub').textContent = c.dataset.sub;
      bar.querySelector('.pl-count').textContent = `${i + 1} / ${cards.length}`;
      // Announce only what the person asked for, never autoplay
      if (performance.now() - touched < 1500) live.textContent = `${c.dataset.title}, ${i + 1} of ${cards.length}`;
    };
    const frame = (now) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.033, Math.max(0.001, (now - prev) / 1000));
      prev = now;
      const before = S.off;
      let speed;
      if (drag && drag.moved) speed = drag.v * 1000;
      else {
        if (now > wheelEnd && wheelEnd) { wheelEnd = 0; goSlot(Math.round(S.off / g.gap)); }
        if (!wheelEnd) {
          S.vel += (cfg.k * (S.target - S.off) - 2 * Math.sqrt(cfg.k) * S.vel) * dt;
          S.off += S.vel * dt;
          if (reduced.matches) { S.off = S.target; S.vel = 0; }
        }
        speed = -(S.off - before) / dt;
      }
      const n = cards.length;
      const total = n * g.gap;
      const near = g.loop ? mod(Math.round(S.off / g.gap), n) : clamp(Math.round(S.off / g.gap), 0, n - 1);
      cards.forEach((el, i) => {
        let d = i * g.gap - S.off;
        if (g.loop) d = mod(d + total / 2, total) - total / 2;
        const x = g.w / 2 + d;
        if (x < -g.cw || x > g.w + g.cw) { el.style.visibility = 'hidden'; el.style.transform = 'translate(-9999px,0)'; return; }
        el.style.visibility = 'visible';
        el.av = (el.av || 0) + (-38 * (el.a || 0) - 4.2 * (el.av || 0) + speed * 0.0034 * cfg.swing) * dt;
        el.a = clamp((el.a || 0) + el.av * dt, -0.45, 0.45);
        const sway = cfg.swing ? Math.sin(now / 1300 + i * 1.7) * 0.022 * cfg.swing : 0;
        const t = clamp(x / g.w, 0, 1);
        const y = g.y0 + 4 * cfg.sag * t * (1 - t) - 8;
        el.style.transform = `translate(${(x - g.cw / 2).toFixed(1)}px,${y.toFixed(1)}px) rotate(${(el.a + sway).toFixed(4)}rad)`;
        el.style.zIndex = i === near ? 20 : 10;
      });
      if (near !== active) show(near);
      // With motion reduced, stop once settled
      if (!reduced.matches || (drag && drag.moved) || wheelEnd || S.off !== S.target) raf = requestAnimationFrame(frame);
    };
    const wake = () => { if (visible && !raf) { prev = performance.now(); raf = requestAnimationFrame(frame); } };

    box.classList.add('line-on');
    box.tabIndex = 0;
    bar.hidden = false;
    const noun = pauseBtn.getAttribute('aria-label').replace('Pause ', '');
    const label = () => { pauseBtn.classList.toggle('off', !auto); pauseBtn.setAttribute('aria-label', `${auto ? 'Pause' : 'Play'} ${noun}`); };
    label();
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.do === 'pause') { auto = !auto; touched = -1e9; label(); onToggle(auto); } else step(b.dataset.do === 'next' ? 1 : -1);
    });
    box.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      step(e.key === 'ArrowRight' ? 1 : -1);
    });
    box.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.pl-bar') || e.button > 0) return;
      touched = performance.now();
      drag = { x: e.clientX, off: S.off, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false };
    });
    box.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 5) { drag.moved = true; box.classList.add('dragging'); box.setPointerCapture(e.pointerId); wake(); }
      if (!drag.moved) return;
      const dt = Math.max(1, e.timeStamp - drag.lt);
      drag.v = 0.7 * ((e.clientX - drag.lx) / dt) + 0.3 * drag.v;
      drag.lx = e.clientX;
      drag.lt = e.timeStamp;
      let off = drag.off - dx;
      const max = (cards.length - 1) * g.gap;
      if (!g.loop) { if (off < 0) off *= 0.35; else if (off > max) off = max + (off - max) * 0.35; }
      S.off = off;
    });
    const up = (e) => {
      const d = drag;
      drag = null;
      if (!d) return;
      touched = performance.now();
      if (d.moved) {
        box.classList.remove('dragging');
        S.vel = -d.v * 1000;
        goSlot(Math.round((S.off - d.v * 200) / g.gap));
      } else if (e.type === 'pointerup') {
        const c = e.target.closest('.pl-card');
        if (c) goCard(c);
      }
    };
    box.addEventListener('pointerup', up);
    box.addEventListener('pointercancel', up);
    box.addEventListener('dragstart', (e) => e.preventDefault());
    // Sideways trackpad scroll; vertical scroll still moves the page
    box.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      touched = performance.now();
      S.off += e.deltaX * 1.2;
      if (!g.loop) S.off = clamp(S.off, 0, (cards.length - 1) * g.gap);
      S.vel = 0;
      wheelEnd = touched + 140;
      wake();
    }, { passive: false });
    box.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') held = true; });
    box.addEventListener('pointerleave', () => { held = false; });
    setInterval(() => {
      if (!auto || !visible || held || drag || document.hidden || cards.length < 2) return;
      if (box.contains(document.activeElement) && document.activeElement.matches(':focus-visible')) return;
      if (performance.now() - touched < cfg.auto) return;
      const next = slotNow() + 1;
      goSlot(g.loop || next < cards.length ? next : 0);
    }, cfg.auto || 2200);
    new ResizeObserver(() => { if (box.clientWidth !== g.w) measure(); }).observe(box);
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; wake(); }, { rootMargin: '80px' }).observe(box);
    measure();
    show(0);
    return {
      filter(key) {
        touched = performance.now();
        cards = all.filter((c) => {
          const keep = key === 'all' || c.dataset.k.split(' ').includes(key);
          c.hidden = !keep;
          return keep;
        });
        S.target = 0;
        active = -1;
        measure();
        show(0);
        return cards.length;
      },
    };
  };
  const line = makeLine(document.querySelector('#activities .pl-root'));

  // Activity filter
  const status = document.querySelector('#filter-status');
  const buttons = $$('.filters button');
  buttons.forEach((b) => b.addEventListener('click', () => {
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    status.textContent = `${line.filter(b.dataset.f)} activities shown`;
  }));

  // Videos: fetched and played only while on screen
  const studio = document.querySelector('.studio .pl-root');
  const clips = [...studio.querySelectorAll('video')];
  let playing = !reduced.matches && !(navigator.connection && navigator.connection.saveData);
  let boxOn = false;
  // Only prints actually inside the line and the window play (and download)
  const sync = () => {
    const vb = studio.getBoundingClientRect();
    clips.forEach((v) => {
      const r = v.getBoundingClientRect();
      const placed = v.closest('.pl-card').style.visibility === 'visible';
      const seen = boxOn && placed && r.right > Math.max(0, vb.left) && r.left < Math.min(innerWidth, vb.right) && r.bottom > 0 && r.top < innerHeight;
      if (playing && seen) {
        if (!v.src) v.src = v.dataset.src;
        if (v.paused) v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    });
  };
  makeLine(studio, (on) => { playing = on; sync(); });
  new IntersectionObserver((es) => { boxOn = es[0].isIntersecting; sync(); }).observe(studio);
  setInterval(() => { if (boxOn && !document.hidden) sync(); }, 400);
})();

// Sample lesson: load the YouTube player only when the parent presses play
(() => {
  const a = document.querySelector('.yt-play');
  if (!a) return;
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${a.dataset.id}?autoplay=1&rel=0&playsinline=1`;
    f.title = 'Sample lesson | Kokoromind Level 1 (Ages 4–10)';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    a.replaceWith(f);
    f.focus();
  });
})();
