/*
 * Regional pricing. The page shows the price for the visitor's region,
 * guessed from the device time zone (no permission prompt, nothing sent
 * anywhere) and changeable with the "Prices for" selector.
 *
 * To change a price, edit PRICES. To give a region its own checkout,
 * put its SuperProfile links in LINKS (s = Starter, e = Explorer, f = Full Bundle).
 */
(() => {
  const PRICES = {
    in: { label: 'India', cur: 'INR', s: 199, e: 299, f: 799, was: 1500 },
    us: { label: 'United States & Americas', cur: 'USD', s: 6.99, e: 10.99, f: 23.99 },
    ca: { label: 'Canada', cur: 'CAD', s: 9.99, e: 14.99, f: 32.99 },
    eu: { label: 'Europe', cur: 'EUR', s: 5.99, e: 8.99, f: 18.99 },
    gb: { label: 'United Kingdom', cur: 'GBP', s: 4.99, e: 7.99, f: 16.49 },
    au: { label: 'Australia & New Zealand', cur: 'AUD', s: 10.99, e: 16.99, f: 34.99 },
    ae: { label: 'UAE & Gulf', cur: 'AED', s: 17, e: 26, f: 65 },
    sa: { label: 'Saudi Arabia', cur: 'SAR', s: 18, e: 27, f: 67 },
    sg: { label: 'Singapore', cur: 'SGD', s: 6.5, e: 9.9, f: 24 },
    as: { label: 'Rest of Asia', cur: 'INR', s: 399, e: 599, f: 1499 },
    za: { label: 'Africa', cur: 'ZAR', s: 65, e: 99, f: 240 },
  };
  const DEFAULT_LINK = {
    s: 'https://superprofile.bio/course/kokoromind-course-1-starter',
    e: 'https://superprofile.bio/course/kokoromind-course-1-explorer',
    f: 'https://superprofile.bio/course/kokoromind-course-1-full',
  };
  const LINKS = {
    // Example: us: { s: 'https://superprofile.bio/...', e: '...', f: '...' },
  };

  const SIGN = { INR: '₹', USD: '$', CAD: 'C$', EUR: '€', GBP: '£', AUD: 'A$', SGD: 'S$', ZAR: 'R' };
  const CANADA = /^America\/(Toronto|Montreal|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Glace_Bay|Goose_Bay|Whitehorse|Yellowknife|Iqaluit|Dawson_Creek|Dawson|Fort_Nelson|Cambridge_Bay|Rankin_Inlet|Resolute|Inuvik|Swift_Current|Atikokan|Creston|Nipigon|Thunder_Bay|Rainy_River|Pangnirtung|Blanc-Sablon)$|^Canada\//;

  const guess = () => {
    let tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { /* old browser */ }
    if (/^Asia\/(Kolkata|Calcutta)$/.test(tz)) return 'in';
    if (CANADA.test(tz)) return 'ca';
    if (/^(America|US)\//.test(tz)) return 'us';
    if (/^Europe\/(London|Belfast|Jersey|Guernsey|Isle_of_Man)$|^GB/.test(tz)) return 'gb';
    if (/^Europe\/|^Atlantic\/(Canary|Madeira|Azores|Faroe|Reykjavik)$/.test(tz)) return 'eu';
    if (/^(Australia\/|NZ|Pacific\/(Auckland|Chatham))/.test(tz)) return 'au';
    if (tz === 'Asia/Riyadh') return 'sa';
    if (/^Asia\/(Dubai|Muscat|Qatar|Kuwait|Bahrain|Aden)$/.test(tz)) return 'ae';
    if (tz === 'Asia/Singapore') return 'sg';
    if (/^(Asia|Indian)\//.test(tz)) return 'as';
    if (/^Africa\//.test(tz)) return 'za';
    if (!tz) return 'in';
    return 'us';
  };

  const fmt = (n, cur, html, cents) => {
    const whole = !cents && Number.isInteger(n) && cur !== 'USD' && cur !== 'CAD';
    const num = n.toLocaleString('en-IN', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 });
    if (cur === 'INR' && html) return `<span class="rs">₹</span>${num}`;
    if (SIGN[cur]) return `${SIGN[cur]}${num}`;
    return `${num} ${cur}`;
  };

  let region = guess();
  try { const saved = localStorage.getItem('kokoro-region'); if (PRICES[saved]) region = saved; } catch (e) { /* storage blocked */ }

  const apply = () => {
    const P = PRICES[region];
    document.querySelectorAll('.money[data-p]').forEach((el) => {
      const v = el.dataset.p === 'w' ? P.was : P[el.dataset.p];
      if (v == null) return;
      el.innerHTML = fmt(v / (+el.dataset.div || 1), P.cur, !el.closest('.sr'), !!el.dataset.div);
    });
    document.querySelectorAll('[data-india-only]').forEach((el) => { el.hidden = !P.was; });
    const per = { s: P.s / 2, e: P.e / 4, f: P.f / 12 };
    const top = Math.max(per.s, per.e, per.f);
    document.querySelectorAll('.bar[data-p]').forEach((el) => {
      el.style.setProperty('--w', `${((per[el.dataset.p] / top) * 100).toFixed(1)}%`);
    });
    document.querySelectorAll('a[href*="superprofile.bio"]').forEach((a) => {
      const box = a.closest('[id^="pack-"]');
      const key = box ? { 'pack-2': 's', 'pack-4': 'e', 'pack-12': 'f' }[box.id] : { 199: 's', 299: 'e', 799: 'f' }[a.dataset.course];
      if (key) a.href = (LINKS[region] && LINKS[region][key]) || DEFAULT_LINK[key];
    });
    document.querySelectorAll('.fx-note').forEach((el) => { el.hidden = P.cur === 'INR'; });
    document.documentElement.dataset.region = region;
  };

  const select = document.querySelector('#region');
  if (select) {
    select.innerHTML = Object.entries(PRICES).map(([k, p]) => `<option value="${k}">${p.label} (${SIGN[p.cur] || p.cur})</option>`).join('');
    select.value = region;
    select.closest('.region').hidden = false;
    select.addEventListener('change', () => {
      region = select.value;
      try { localStorage.setItem('kokoro-region', region); } catch (e) { /* storage blocked */ }
      apply();
    });
  }
  apply();
})();
