/* ==========================================================
   Court wipe between pages.
   A blue court panel sweeps across the screen, the page changes
   underneath it, and the panel sweeps away to reveal the new page.
   Forward (next page) = from the right, back = from the left.
   Load this in <head> so the panel is up before the page paints.
   ========================================================== */
(function () {
  'use strict';
  if (window.top !== window) { return; }                        // hover-preview iframes never animate
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PAGES = ['index', 'players', 'compare', 'build-player', 'shoot'];
  var NAMES = { index: 'ホーム', players: '選手を知る', compare: '選手を比べる', 'build-player': '自分を作る', shoot: 'シュート練習' };
  var KEY = 'range-wipe';
  var T_IN = 460, T_OUT = 560;

  function pageOf(url) {
    var m = /([^\/]+?)(?:\.html)?(?:[?#].*)?$/.exec(url.pathname || '');
    var n = m ? m[1] : 'index';
    return PAGES.indexOf(n) >= 0 ? n : (n === '' ? 'index' : n);
  }
  var here = pageOf(window.location);

  /* the panel: court blue, white court lines, ink-black leading edge, the page name in the middle */
  var court = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1880 1000' preserveAspectRatio='xMidYMid slice' fill='none' stroke='%23ffffff' stroke-opacity='.55' stroke-width='8'%3E%3Crect x='40' y='40' width='1800' height='920'/%3E%3Cpath d='M940 40V960'/%3E%3Ccircle cx='940' cy='500' r='120'/%3E%3Crect x='40' y='340' width='380' height='320'/%3E%3Crect x='1460' y='340' width='380' height='320'/%3E%3Cpath d='M40 100H350A400 400 0 0 1 350 900H40'/%3E%3Cpath d='M1840 100H1530A400 400 0 0 0 1530 900H1840'/%3E%3C/svg%3E\")";
  var el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;pointer-events:none;background:#2860c0 ' + court + ' center/cover no-repeat;' +
    'display:flex;align-items:center;justify-content:center;will-change:transform;transform:translateX(100%);visibility:hidden;';
  var label = document.createElement('span');
  label.style.cssText = 'font:800 clamp(34px,7vw,96px)/1 Inter,"Noto Sans JP",sans-serif;letter-spacing:-.04em;color:#fff;text-shadow:5px 5px 0 #1b1a17;';
  el.appendChild(label);
  var edgeL = document.createElement('i'), edgeR = document.createElement('i');
  [edgeL, edgeR].forEach(function (e, i) { e.style.cssText = 'position:absolute;top:0;bottom:0;width:10px;background:#1b1a17;' + (i ? 'right:0' : 'left:0'); el.appendChild(e); });
  document.documentElement.appendChild(el);

  function set(x, ms) {
    el.style.transition = ms ? 'transform ' + ms + 'ms cubic-bezier(.76,0,.24,1)' : 'none';
    el.style.transform = 'translateX(' + x + ')';
  }

  /* arriving: if we came here through a wipe, start covered and sweep away */
  var flag = null;
  try { flag = JSON.parse(window.sessionStorage.getItem(KEY) || 'null'); window.sessionStorage.removeItem(KEY); } catch (e) { flag = null; }
  if (flag && !reduce && Date.now() - flag.t < 4000) {
    label.textContent = NAMES[here] || '';
    el.style.visibility = 'visible';
    set('0%', 0);
    var gone = false;
    var out = function () {
      if (gone) { return; } gone = true;
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        set(flag.dir === 'f' ? '-100%' : '100%', T_OUT);
        setTimeout(function () { el.style.visibility = 'hidden'; }, T_OUT + 50);
      }); });
    };
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function () { setTimeout(out, 120); }); } else { setTimeout(out, 120); }
    setTimeout(out, 1500);                                     // never get stuck
  }

  /* leaving: cover the page, then go */
  document.addEventListener('click', function (e) {
    if (reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) { return; }
    var url;
    try { url = new URL(a.href, window.location.href); } catch (err) { return; }
    if (url.origin !== window.location.origin && url.protocol !== 'file:') { return; }
    if (url.protocol === 'file:' && !/\.html$/.test(url.pathname) && !/\/$/.test(url.pathname)) { return; }
    var to = pageOf(url);
    if (PAGES.indexOf(to) < 0 || (to === here && !url.search)) { return; }
    e.preventDefault();
    var dir = PAGES.indexOf(to) >= PAGES.indexOf(here) ? 'f' : 'b';
    label.textContent = NAMES[to] || '';
    el.style.visibility = 'visible';
    set(dir === 'f' ? '100%' : '-100%', 0);
    el.getBoundingClientRect();                                // commit the start position
    set('0%', T_IN);
    var go = function () {
      try { window.sessionStorage.setItem(KEY, JSON.stringify({ dir: dir, t: Date.now() })); } catch (err) { /* ignore */ }
      window.location.href = url.href;
    };
    setTimeout(go, T_IN + 60);
  }, true);

  /* the back button can restore this page from memory: make sure the panel is gone */
  window.addEventListener('pageshow', function (ev) { if (ev.persisted) { el.style.visibility = 'hidden'; set('100%', 0); } });
})();
