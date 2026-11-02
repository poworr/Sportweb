/* ==========================================================
   Page pager
   Arrow Right opens the next page, Arrow Left the previous one
   (the order follows the menu and wraps around). The bottom
   corners show where each arrow goes. 
   ========================================================== */
(function () {
  'use strict';

  var PAGES = [
    ['index.html', 'ホーム'],
    ['shot-map.html', 'ショットマップ'],
    ['arenas.html', 'アリーナ'],
    ['record-night.html', '記録の夜'],
    ['build-player.html', '選手を作る'],
    ['shoot.html', 'シュート練習']
  ];

  var file = window.location.pathname.split('/').pop();
  var here = 0;
  PAGES.forEach(function (p, i) { if (p[0] === file) { here = i; } });
  var prev = PAGES[(here + PAGES.length - 1) % PAGES.length];
  var next = PAGES[(here + 1) % PAGES.length];

  var page = document.querySelector('.page');
  if (!page || window.self !== window.top) { return; }   // not inside a preview frame

  var nav = document.createElement('nav');
  nav.className = 'pager';
  nav.setAttribute('aria-label', tr('ページ移動'));
  nav.innerHTML =
    '<a class="pager-link pager-prev" href="' + prev[0] + '" rel="prev">' +
      '<span class="pager-key" aria-hidden="true">←</span>' +
      '<span class="pager-text"><span class="pager-hint">' + tr('前のページ') + '</span><span class="pager-name">' + tr(prev[1]) + '</span></span>' +
      '<span class="pager-pv" aria-hidden="true"><iframe tabindex="-1" title="" data-src="' + prev[0] + '"></iframe></span></a>' +
    '<a class="pager-link pager-next" href="' + next[0] + '" rel="next">' +
      '<span class="pager-text"><span class="pager-hint">' + tr('次のページ') + '</span><span class="pager-name">' + tr(next[1]) + '</span></span>' +
      '<span class="pager-key" aria-hidden="true">→</span>' +
      '<span class="pager-pv" aria-hidden="true"><iframe tabindex="-1" title="" data-src="' + next[0] + '"></iframe></span></a>';
  /* 日本語 / English switch, between the two arrows */
  var sw = document.createElement('div');
  sw.className = 'lang-switch';
  sw.setAttribute('role', 'group');
  sw.setAttribute('aria-label', 'Language');
  [['ja', '日本語'], ['en', 'EN']].forEach(function (l) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = l[1];
    b.lang = l[0];
    b.setAttribute('aria-pressed', window.RANGE_LANG === l[0] ? 'true' : 'false');
    b.addEventListener('click', function () { if (window.RANGE_LANG !== l[0]) { window.setLang(l[0]); } });
    sw.appendChild(b);
  });
  nav.appendChild(sw);
  page.appendChild(nav);

  /* hovering an arrow shows the page it leads to, open in a small window */
  Array.prototype.forEach.call(nav.querySelectorAll('.pager-link'), function (a) {
    function load() {
      var f = a.querySelector('iframe');
      if (f && !f.getAttribute('src')) { f.setAttribute('src', f.getAttribute('data-src')); }
    }
    a.addEventListener('mouseenter', load);
    a.addEventListener('focus', load);
  });

  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) { return; }
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') { return; }
    var t = e.target;
    var tag = t && t.tagName ? t.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || (t && t.isContentEditable)) { return; }
    e.preventDefault();
    nav.querySelector(e.key === 'ArrowRight' ? '.pager-next' : '.pager-prev').click();
  });
})();
