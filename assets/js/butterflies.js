(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const base = new URL('../img/', document.currentScript.src).href;
  const rand = (a, b) => a + Math.random() * (b - a);
  const go = () => {
    const small = innerWidth < 761;
    const count = small ? 2 : 3;
    const layer = document.createElement('div');
    layer.className = 'flies';
    layer.setAttribute('aria-hidden', 'true');
    let W = innerWidth;
    let H = innerHeight;
    // Mostly the side margins, sometimes straight across
    const aim = (f) => {
      const edge = true;
      f.tx = edge ? (Math.random() < 0.5 ? rand(0.01, 0.07) : rand(0.93, 0.99)) * W : rand(0.1, 0.9) * W;
      f.ty = rand(0.08, 0.95) * H;
      f.until = performance.now() + rand(2600, 6000);
    };
    const flies = Array.from({ length: count }, (_, i) => {
      const el = document.createElement('div');
      el.className = 'fly';
      const s = small ? rand(26, 42) : rand(34, 72);
      el.style.setProperty('--s', `${s.toFixed(0)}px`);
      el.style.setProperty('--img', `url("${base}fly-1.webp")`);
      el.style.setProperty('--f', `${rand(0.45, 0.6).toFixed(2)}s`);
      el.innerHTML = '<span class="l"></span><span class="r"></span>';
      layer.append(el);
      const f = { el, s, x: i % 2 ? -80 : W + 80, y: rand(0, H), vx: 0, vy: 0, a: 0, seed: rand(0, 99), pace: rand(0.45, 0.65) };
      aim(f);
      return f;
    });
    document.body.append(layer);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fly-btn';
    btn.innerHTML = `<img src="${base}fly-1.webp" width="180" height="176" alt=""><span>Flying butterflies: <b>On</b></span>`;
    const bar = document.querySelector('.foot .legal, .footer-bottom');
    if (bar) bar.append(btn); else document.body.append(btn);

    let on = true;
    try { on = localStorage.getItem('butterflies') !== 'off'; } catch (e) { /* storage blocked */ }
    const mouse = { x: -999, y: -999 };
    let raf = 0;
    let prev = 0;
    let lastY = scrollY;
    let nextLook = 0;
    const TEXT = 'h1,h2,h3,h4,p,a,button,li,summary,label,input,select,textarea,.pl-bar';
    // Never sit on words: fade and head for the nearest edge
    const look = () => flies.forEach((f) => {
      const under = f.x > 0 && f.x < W && f.y > 0 && f.y < H && document.elementFromPoint(f.x, f.y);
      const over = !!(under && under.closest(TEXT));
      f.el.style.opacity = over ? 0.14 : 1;
      if (over && !f.over) { f.tx = f.x < W / 2 ? -10 : W + 10; f.ty = f.y + rand(-120, 120); f.until = performance.now() + 2500; }
      f.over = over;
    });
    const frame = (now) => {
      raf = 0;
      const dt = Math.min(0.04, (now - prev) / 1000);
      prev = now;
      if (now > nextLook) { nextLook = now + 160; look(); }
      const dy = scrollY - lastY;
      lastY = scrollY;
      flies.forEach((f) => {
        if (now > f.until || Math.hypot(f.tx - f.x, f.ty - f.y) < 50) aim(f);
        const d = Math.hypot(f.tx - f.x, f.ty - f.y) || 1;
        const pull = 150 * f.pace;
        let ax = ((f.tx - f.x) / d) * pull + Math.sin(now / 900 + f.seed) * 70;
        let ay = ((f.ty - f.y) / d) * pull + Math.cos(now / 700 + f.seed * 2) * 90;
        const mx = f.x - mouse.x;
        const my = f.y - mouse.y;
        const md = Math.hypot(mx, my) || 1;
        if (md < 140) { ax += (mx / md) * 900; ay += (my / md) * 900; }
        f.vx = (f.vx + ax * dt) * (1 - 0.9 * dt);
        f.vy = (f.vy + ay * dt) * (1 - 0.9 * dt);
        const v = Math.hypot(f.vx, f.vy);
        const cap = 230 * f.pace;
        if (v > cap) { f.vx *= cap / v; f.vy *= cap / v; }
        f.x += f.vx * dt;
        // Drift with the page so they feel part of it; larger ones are nearer
        f.y += f.vy * dt - dy * (f.s / 160);
        if (f.y < -120) f.y = H + 80; else if (f.y > H + 120) f.y = -80;
        const lean = Math.max(-0.7, Math.min(0.7, f.vx / 190));
        f.a += (lean - f.a) * Math.min(1, 6 * dt);
        f.el.style.transform = `translate3d(${(f.x - f.s / 2).toFixed(1)}px,${(f.y - f.s / 2).toFixed(1)}px,0) rotate(${f.a.toFixed(3)}rad)`;
      });
      if (on && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      layer.style.display = on ? '' : 'none';
      btn.classList.toggle('off', !on);
      btn.setAttribute('aria-pressed', String(on));
      btn.querySelector('b').textContent = on ? 'On' : 'Off';
      if (on && !document.hidden && !raf) { prev = performance.now(); lastY = scrollY; raf = requestAnimationFrame(frame); }
    };
    btn.addEventListener('click', () => {
      on = !on;
      try { localStorage.setItem('butterflies', on ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
      sync();
    });
    addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { mouse.x = e.clientX; mouse.y = e.clientY; } }, { passive: true });
    addEventListener('resize', () => { W = innerWidth; H = innerHeight; });
    document.addEventListener('visibilitychange', sync);
    sync();
  };
  if (document.readyState === 'complete') go(); else addEventListener('load', go);
})();
