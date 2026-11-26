// "Add to phone": Android/desktop Chrome get the real install prompt; iPhone and others get short steps.
(() => {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
  const installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const buttons = [...document.querySelectorAll('.install-btn')];
  const dialog = document.querySelector('#install-help');
  if (installed || !buttons.length) return;
  let prompt = null;
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); prompt = e; });
  addEventListener('appinstalled', () => buttons.forEach((b) => { b.hidden = true; }));
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const steps = ios
    ? ['Tap the <b>Share</b> button <span class="ib" aria-hidden="true">⬆︎</span> at the bottom of Safari.', 'Scroll down and tap <b>Add to Home Screen</b>.', 'Tap <b>Add</b>. Kokoromind now opens like an app.']
    : ['Open the browser menu <span class="ib" aria-hidden="true">⋮</span> at the top right.', 'Tap <b>Add to Home screen</b> or <b>Install app</b>.', 'Tap <b>Install</b> or <b>Add</b>. Kokoromind now opens like an app.'];
  dialog.querySelector('ol').innerHTML = steps.map((s) => `<li>${s}</li>`).join('');
  buttons.forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', async () => {
      if (prompt) {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        prompt = null;
        if (outcome === 'accepted') buttons.forEach((x) => { x.hidden = true; });
        return;
      }
      dialog.showModal();
    });
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog || e.target.closest('[data-close]')) dialog.close(); });
})();
