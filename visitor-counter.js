/* Lightweight shared visitor count for the public GitHub Pages site.
   One count per browser per KST day; not a verified unique-person metric. */
(() => {
  'use strict';

  const todayNode = document.querySelector('[data-visitor-today]');
  const totalNode = document.querySelector('[data-visitor-total]');
  if (!todayNode || !totalNode) return;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const datePart = type => parts.find(part => part.type === type)?.value || '';
  const kstDate = `${datePart('year')}${datePart('month')}${datePart('day')}`;
  const namespace = 'mr-radio.github.io-bukahyeon3';
  const endpoint = 'https://abacus.jasoncameron.dev';
  const liveSite = location.hostname === 'mr-radio.github.io'
    && (location.pathname === '/bukahyeon3/' || location.pathname.startsWith('/bukahyeon3/'));
  const formatter = new Intl.NumberFormat('ko-KR');

  async function loadCount(node, type, key) {
    const storageKey = `buk3-visitor-v1-${kstDate}-${type}`;
    let countedToday = false;
    try { countedToday = localStorage.getItem(storageKey) === '1'; } catch (_) {}

    // Local preview pages only read counts; they never inflate public visits.
    const action = liveSite && !countedToday ? 'hit' : 'get';
    const url = `${endpoint}/${action}/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`;
    try {
      const result = await fetch(url, {
        cache: 'no-store', mode: 'cors', referrerPolicy: 'no-referrer'
      });
      if (!result.ok) throw new Error(`Visitor API ${result.status}`);
      const body = await result.json();
      if (!Number.isSafeInteger(body.value) || body.value < 0) throw new Error('Invalid visit count');
      node.textContent = formatter.format(body.value);
      if (action === 'hit') {
        try { localStorage.setItem(storageKey, '1'); } catch (_) {}
      }
    } catch (_) {
      // An unavailable external counter should never block the website.
      node.textContent = '—';
    }
  }

  loadCount(todayNode, 'today', `day-${kstDate}`);
  loadCount(totalNode, 'total', 'all-time');
})();
