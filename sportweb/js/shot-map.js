/* ==========================================================
   Shot map page
   Shows one season at a time: numbers, dots on the court,
   and a bar chart you can click. "Play" steps through seasons.
   ========================================================== */
(function () {
  'use strict';

  // [season, games, 3PM per game, 3PA per game, 3P%, points per game]
  var SEASONS = [
    ['2009-10', 80, 2.1, 4.8, 43.7, 17.5], ['2010-11', 74, 2.0, 4.6, 44.2, 18.6],
    ['2011-12', 26, 2.1, 4.7, 45.5, 14.7], ['2012-13', 78, 3.5, 7.7, 45.3, 22.9],
    ['2013-14', 78, 3.3, 7.9, 42.4, 24.0], ['2014-15', 80, 3.6, 8.1, 44.3, 23.8],
    ['2015-16', 79, 5.1, 11.2, 45.4, 30.1], ['2016-17', 79, 4.1, 10.0, 41.1, 25.3],
    ['2017-18', 51, 4.2, 9.8, 42.3, 26.4], ['2018-19', 69, 5.1, 11.7, 43.7, 27.3],
    ['2019-20', 5, 2.4, 9.8, 24.5, 20.8], ['2020-21', 63, 5.3, 12.7, 42.1, 32.0],
    ['2021-22', 64, 4.5, 11.7, 38.0, 25.5], ['2022-23', 56, 4.9, 11.4, 42.7, 29.4],
    ['2023-24', 74, 4.8, 11.8, 40.8, 26.4], ['2024-25', 70, 4.4, 11.2, 39.7, 24.5],
    ['2025-26', 43, 4.4, 11.3, 39.3, 26.6]
  ];

  // Seasons with a special sentence (by index in SEASONS)
  var SPECIAL = {
    0: 'このデータで最初のシーズン：1試合4.8本の試投。',
    2: 'このシーズンは26試合に出場。',
    6: '2016年2月27日、オクラホマシティで12本の3ポイントを決め、延長戦では32フィート（約9.8メートル）の決勝弾も沈めた。',
    7: '2016年11月7日、ペリカンズ戦でNBA記録となる13本の3ポイントを成功させた。',
    10: 'このシーズンは5試合に出場。',
    12: '2021年12月14日、通算2,974本目の3ポイントでレイ・アレンを抜いた。'
  };

  // Where the dots go: [angle in degrees, distance from the hoop]. Layout only, not real shot locations.
  var SPOTS = [[0, 262], [24, 262], [-24, 262], [46, 258], [-46, 258], [66, 255], [-66, 255],
               [10, 300], [-12, 296], [35, 285], [-35, 285], [56, 280], [-56, 280], [84, 250]];
  var MADE_ORDER = [1, 6, 3, 9, 0, 12, 5, 10, 2, 7, 4, 11, 8, 13];   // which dots are "made" first
  var HOOP = { x: 260, y: 62.5 };                                     // hoop position in the 520 x 500 court drawing
  var BAR_SCALE = 13;                                                 // attempts that fill a full bar

  var current = 0;
  var timer = null;

  var $ = function (id) { return document.getElementById(id); };
  var els = {
    label: $('seasonLabel'), caption: $('seasonCaption'), made: $('seasonMade'), att: $('seasonAtt'),
    pct: $('seasonPct'), ppg: $('seasonPpg'), games: $('seasonGames'),
    dots: $('courtDots'), bars: $('bars'), labels: $('barLabels'), play: $('playBtn')
  };

  /* ---------- caption ---------- */
  function captionFor(i) {
    if (SPECIAL[i]) { return SPECIAL[i]; }
    var prev = i - 1;
    if (prev >= 0 && SEASONS[prev][1] < 30) { prev = i - 2; }   // skip very short seasons
    var diff = SEASONS[i][3] - SEASONS[prev][3];
    return '1試合' + SEASONS[i][3].toFixed(1) + '本の試投。' + SEASONS[prev][0] + 'から' +
           Math.abs(diff).toFixed(1) + '本' + (diff >= 0 ? '増加' : '減少') + '。';
  }

  /* ---------- dots on the court ---------- */
  function renderDots(s) {
    var attempts = Math.min(14, Math.round(s[3]));
    var makes = Math.min(attempts, Math.round(s[2]));
    var madeIdx = MADE_ORDER.filter(function (n) { return n < attempts; }).slice(0, makes);

    els.dots.innerHTML = '';
    SPOTS.slice(0, attempts).forEach(function (spot, i) {
      var rad = spot[0] * Math.PI / 180;
      var x = Math.max(24, Math.min(496, HOOP.x + spot[1] * Math.sin(rad)));
      var y = HOOP.y + spot[1] * Math.cos(rad);
      var dot = document.createElement('span');
      dot.className = 'dot ' + (madeIdx.indexOf(i) >= 0 ? 'dot--made' : 'dot--miss');
      dot.style.left = (x / 520 * 100).toFixed(2) + '%';
      dot.style.top = (y / 500 * 100).toFixed(2) + '%';
      els.dots.appendChild(dot);
    });
  }

  /* ---------- bar chart ---------- */
  function buildBars() {
    SEASONS.forEach(function (s, i) {
      var col = document.createElement('div');
      col.className = 'bar-col';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bar';
      btn.setAttribute('aria-label', s[0] + '：1試合あたり試投' + s[3].toFixed(1) + '本、成功' + s[2].toFixed(1) + '本');
      btn.innerHTML = '<span class="bar-attempts" style="height:' + (s[3] / BAR_SCALE * 87).toFixed(1) + '%">' +
                      '<span class="bar-made" style="height:' + (s[2] / s[3] * 100).toFixed(1) + '%"></span></span>';
      btn.addEventListener('click', function () { stop(); show(i); });

      var label = document.createElement('span');
      label.className = 'bar-label';
      label.textContent = s[0].slice(2, 4);

      col.appendChild(btn);
      col.appendChild(label);
      els.bars.appendChild(col);
    });
  }

  /* ---------- show one season ---------- */
  function show(i) {
    current = i;
    var s = SEASONS[i];
    els.label.textContent = s[0];
    els.caption.textContent = captionFor(i);
    els.made.textContent = s[2].toFixed(1);
    els.att.textContent = s[3].toFixed(1);
    els.pct.textContent = s[4].toFixed(1) + '%';
    els.ppg.textContent = s[5].toFixed(1);
    els.games.textContent = s[1] + '試合に出場';
    renderDots(s);
    els.bars.querySelectorAll('.bar').forEach(function (b, n) { b.classList.toggle('is-active', n === i); });
  }

  /* ---------- play / pause ---------- */
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    els.play.textContent = 'シーズンを順に再生';
  }
  function togglePlay() {
    if (timer) { stop(); return; }
    els.play.textContent = '一時停止';
    timer = setInterval(function () { show((current + 1) % SEASONS.length); }, 1100);
  }

  buildBars();
  els.play.addEventListener('click', togglePlay);
  window.addEventListener('pagehide', stop);
  show(6);   // start on 2015-16
})();
