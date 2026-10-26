/* ==========================================================
   Build your player page
   You enter eight numbers, pick a player to compare with, and
   the page shows the gaps, your closest matches and a 12-week plan.
   Needs player-data.js (STATS, PLAYERS, RATING_NAMES, rate).
   ========================================================== */
(function () {
  'use strict';

  var state = {
    stats: { pts: 12, fg: 42, tp: 30, ft: 70, reb: 4, ast: 3, stl: 0.8, blk: 0.3 },
    tab: 'all',        // 'now' (ESPN top 10) or 'all' (all-time greats)
    fav: 'curry',      // id of the player we compare with
    body: { h: 178, w: 72 }   // height (cm) and weight (kg) of the stick man
  };

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- small helpers ---------- */
  function fmt(stat, value) { return value.toFixed(1) + (stat.percent ? '%' : ''); }

  function findPlayer(id) {
    return PLAYERS.filter(function (p) { return p.id === id; })[0] || PLAYERS[0];
  }

  // Words you write in the weakness / goal boxes -> a matching drill
  var KEYWORDS = [
    [/free ?throw|\bft\b|フリースロー|フリー・スロー/, 'ft'],
    [/three|3[- ]?pt|3[- ]?point|range|shoot|jumper|スリー|3ポイント|3point|３ポイント|シュート|ジャンパー|外角/, 'tp'],
    [/rebound|box ?out|リバウンド|ボックスアウト/, 'reb'],
    [/pass|assist|vision|playmak|handle|dribble|パス|アシスト|視野|ハンドリング|ドリブル|プレーメイク/, 'ast'],
    [/steal|defen|lock|スティール|ディフェンス|守備|守り/, 'stl'],
    [/block|rim protect|ブロック|リムプロテクト/, 'blk'],
    [/finish|layup|paint|scor|efficien|フィニッシュ|レイアップ|ペイント|得点|決定力|効率/, 'fg']
  ];

  function statByKey(key) { return STATS.filter(function (s) { return s.key === key; })[0]; }

  /* ---------- 1. sliders (built once) ---------- */
  function buildSliders() {
    var box = $('sliders');
    STATS.forEach(function (stat) {
      var wrap = document.createElement('div');
      wrap.className = 'slider';
      wrap.innerHTML =
        '<div class="slider-head"><label for="in-' + stat.key + '">' + stat.label + '</label>' +
        '<span class="slider-value" id="val-' + stat.key + '"></span></div>' +
        '<input id="in-' + stat.key + '" type="range" min="' + stat.min + '" max="' + stat.max + '" step="' + stat.step + '">';
      var input = wrap.querySelector('input');
      input.value = state.stats[stat.key];
      input.addEventListener('input', function () {
        state.stats[stat.key] = parseFloat(input.value);
        showSliderValue(stat);
        renderResults();
        renderPlan();
      });
      box.appendChild(wrap);
      showSliderValue(stat);
    });
  }
  function showSliderValue(stat) {
    $('val-' + stat.key).textContent = fmt(stat, state.stats[stat.key]);
  }

  /* ---------- 1b. height / weight and the stick man ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  var BODY = [
    { key: 'h', label: '身長', min: 150, max: 230, step: 1, unit: 'cm' },
    { key: 'w', label: '体重', min: 40, max: 150, step: 1, unit: 'kg' }
  ];
  var CURRY = { h: 188, w: 84 };            // Stephen Curry: 6 ft 2 in, 185 lb
  var GROUND = 392, PX = 1.55;              // ground line (y) and pixels per cm
  var shown = { h: state.body.h, w: state.body.w };   // what is drawn now (eases toward state.body)
  var svg, you, ref, rulerBuilt = false;

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) { parent.appendChild(e); }
    return e;
  }
  function makeFigure(parent, cls) {
    var g = el('g', { 'class': cls }, parent);
    return {
      g: g,
      legL: el('polyline', {}, g), legR: el('polyline', {}, g),
      armL: el('polyline', {}, g), armR: el('polyline', {}, g),
      sh: el('line', {}, g), body: el('line', {}, g), neck: el('line', {}, g), head: el('circle', {}, g)
    };
  }
  function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function poseFigure(f, cx, hcm, wkg) {
    var H = hcm * PX, bmi = wkg / Math.pow(hcm / 100, 2);
    var t = Math.max(0, Math.min(1, (bmi - 17) / 19));            // 0 = very lean, 1 = heavy
    var r = H * 0.062, headY = GROUND - H + r;
    var shY = GROUND - H * 0.815, hipY = GROUND - H * 0.5;
    var sw = H * (0.105 + 0.035 * t);
    var lw = H * (0.02 + 0.028 * t);                               // limb thickness
    var tw = H * (0.05 + 0.17 * t);                                // torso thickness
    f.g.setAttribute('stroke-width', lw.toFixed(1));
    f.head.setAttribute('cx', cx); f.head.setAttribute('cy', headY.toFixed(1)); f.head.setAttribute('r', r.toFixed(1));
    f.neck.setAttribute('x1', cx); f.neck.setAttribute('y1', (headY + r).toFixed(1));
    f.neck.setAttribute('x2', cx); f.neck.setAttribute('y2', shY.toFixed(1));
    f.sh.setAttribute('x1', cx - sw); f.sh.setAttribute('x2', cx + sw);
    f.sh.setAttribute('y1', shY.toFixed(1)); f.sh.setAttribute('y2', shY.toFixed(1));
    f.body.setAttribute('stroke-width', tw.toFixed(1));
    f.body.setAttribute('x1', cx); f.body.setAttribute('x2', cx);
    f.body.setAttribute('y1', (shY + tw * 0.5 + 2).toFixed(1)); f.body.setAttribute('y2', (hipY - tw * 0.3).toFixed(1));
    [[f.armL, -1], [f.armR, 1]].forEach(function (a) {
      var s = a[1];
      a[0].setAttribute('points', pts([[cx + s * sw, shY], [cx + s * (sw + H * 0.035 + tw * 0.3), shY + H * 0.15], [cx + s * (sw + H * 0.05 + tw * 0.34), shY + H * 0.29]]));
    });
    [[f.legL, -1], [f.legR, 1]].forEach(function (l) {
      var s = l[1];
      l[0].setAttribute('points', pts([[cx + s * H * 0.035, hipY], [cx + s * (H * 0.05 + tw * 0.14), (hipY + GROUND) / 2], [cx + s * (H * 0.06 + tw * 0.2), GROUND - lw / 2]]));
    });
  }
  function buildFigureSvg() {
    svg = $('bodySvg');
    // ruler: faint lines every 20 cm
    var ruler = el('g', { 'class': 'ruler' }, svg);
    for (var cm = 0; cm <= 230; cm += 10) {
      if (cm < 150 && cm % 50) { continue; }
      var y = GROUND - cm * PX;
      el('line', { x1: 36, x2: 282, y1: y, y2: y, 'class': cm % 50 === 0 ? 'ruler-line ruler-line--major' : 'ruler-line' }, ruler);
      if (cm % 50 === 0 || cm % 20 === 0 && cm >= 150) { el('text', { x: 30, y: y + 4, 'class': 'ruler-text', 'text-anchor': 'end' }, ruler).textContent = cm; }
    }
    el('line', { x1: 36, x2: 282, y1: GROUND, y2: GROUND, 'class': 'ground' }, svg);
    el('ellipse', { cx: 110, cy: GROUND + 2, rx: 44, ry: 5, 'class': 'figure-shadow', id: 'bodyShadow' }, svg);
    ref = makeFigure(svg, 'figure figure--ref');
    you = makeFigure(svg, 'figure figure--you');
    var tag = el('text', { x: 226, y: GROUND - CURRY.h * PX - 8, 'class': 'ref-tag', 'text-anchor': 'middle' }, svg);
    tag.textContent = 'カリー ' + CURRY.h + 'cm';
    poseFigure(ref, 226, CURRY.h, CURRY.w);
    drawBody();
  }
  function drawBody() {
    poseFigure(you, 112, shown.h, shown.w);
    var bmi = shown.w / Math.pow(shown.h / 100, 2);
    $('bodyShadow').setAttribute('rx', (28 + Math.max(0, Math.min(1, (bmi - 17) / 19)) * 26).toFixed(1));
  }
  var raf = 0;
  function easeBody() {
    cancelAnimationFrame(raf);
    (function tick() {
      shown.h += (state.body.h - shown.h) * 0.22;
      shown.w += (state.body.w - shown.w) * 0.22;
      var done = Math.abs(state.body.h - shown.h) < 0.05 && Math.abs(state.body.w - shown.w) < 0.05;
      if (done) { shown.h = state.body.h; shown.w = state.body.w; }
      drawBody();
      if (!done) { raf = requestAnimationFrame(tick); }
    })();
  }
  function bodyText() {
    var h = state.body.h, w = state.body.w, bmi = w / Math.pow(h / 100, 2);
    var kind = h < 185 ? 'ガード体型' : h < 198 ? 'ウイング体型' : h < 208 ? 'フォワード体型' : 'ビッグマン体型';
    var build = bmi < 19 ? '細身' : bmi < 25 ? '標準' : bmi < 30 ? 'がっしり' : 'かなり重め';
    $('bodyType').textContent = kind + '・' + build;
    var d = h - CURRY.h;
    $('bodyVs').textContent = 'BMI ' + bmi.toFixed(1) + ' ・ カリーより ' + (d === 0 ? '同じ身長' : Math.abs(d) + 'cm ' + (d > 0 ? '高い' : '低い'));
  }
  function buildBodySliders() {
    var box = $('bodySliders');
    BODY.forEach(function (b) {
      var wrap = document.createElement('div');
      wrap.className = 'slider';
      wrap.innerHTML =
        '<div class="slider-head"><label for="in-body-' + b.key + '">' + b.label + '</label>' +
        '<span class="slider-value" id="val-body-' + b.key + '"></span></div>' +
        '<input id="in-body-' + b.key + '" type="range" min="' + b.min + '" max="' + b.max + '" step="' + b.step + '">';
      var input = wrap.querySelector('input');
      input.value = state.body[b.key];
      function show() { $('val-body-' + b.key).textContent = state.body[b.key] + b.unit; }
      input.addEventListener('input', function () {
        state.body[b.key] = parseFloat(input.value);
        show(); bodyText(); easeBody();
      });
      box.appendChild(wrap);
      show();
    });
    buildFigureSvg();
    bodyText();
  }

  /* ---------- 2. compare-with tabs and player list ---------- */
  function renderPool() {
    $('tabNow').classList.toggle('is-active', state.tab === 'now');
    $('tabAll').classList.toggle('is-active', state.tab === 'all');
    $('tabNote').textContent = state.tab === 'now'
      ? 'トップ10はESPNの「NBA Rank 2026」（2026年9月24日発表）で、成績は2025-26シーズンの1試合平均です。2026年10月21日時点のスナップショットで、常に最新にするにはデータフィードが必要です。次の課題です。'
      : 'NBA 75周年記念チームから選んだ10人の名選手を、キャリア通算の1試合平均で表示しています。ランキングではありません。ビル・ラッセルとウィルト・チェンバレンは、現役時代にスティールとブロックが記録されていないため含めていません。';

    var pool = $('pool');
    pool.innerHTML = '';
    PLAYERS.filter(function (p) { return p.group === state.tab; }).forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'player-btn' + (p.id === state.fav ? ' is-active' : '');
      var sub = p.group === 'now' ? '#' + p.rank + ' · ' + p.team : 'キャリア ' + p.games.toLocaleString('en-US') + '試合';
      btn.innerHTML = '<span class="name">' + p.name + '</span><span class="meta">' + sub + '</span>' +
                      '<span class="meta">' + p.s.pts.toFixed(1) + '得点/試合</span>';
      btn.addEventListener('click', function () { state.fav = p.id; update(); });
      pool.appendChild(btn);
    });
  }

  function pickTab(tab, defaultFav) {
    state.tab = tab;
    state.fav = defaultFav;
    update();
  }

  /* ---------- 3. results: radar, bars, matches, player file ---------- */
  var AXES = [-90, -30, 30, 90, 150, 210].map(function (deg) { return deg * Math.PI / 180; });

  function ringPoints(f) {
    return AXES.map(function (a) { return (200 + 140 * f * Math.cos(a)).toFixed(1) + ',' + (200 + 140 * f * Math.sin(a)).toFixed(1); }).join(' ');
  }
  function shapePoints(ratings) {
    return AXES.map(function (a, i) {
      var f = Math.max(0.03, ratings[i] / 100);
      return (200 + 140 * f * Math.cos(a)).toFixed(1) + ',' + (200 + 140 * f * Math.sin(a)).toFixed(1);
    }).join(' ');
  }
  function extremes(ratings) {
    var hi = 0, lo = 0;
    ratings.forEach(function (v, i) { if (v > ratings[hi]) { hi = i; } if (v < ratings[lo]) { lo = i; } });
    return { hi: hi, lo: lo };
  }

  function renderResults() {
    var fav = findPlayer(state.fav);
    var you = ($('playerName').value || '').trim() || 'あなた';
    var yourRatings = rate(state.stats);
    var favRatings = rate(fav.s);

    // heading + sentence
    $('resultTitle').textContent = you + ' vs ' + fav.name;
    var mine = extremes(yourRatings);
    var matches = PLAYERS.map(function (p) {
      var r = rate(p.s), sum = 0;
      r.forEach(function (v, i) { sum += (v - yourRatings[i]) * (v - yourRatings[i]); });
      return { p: p, pct: Math.max(0, Math.round(100 - Math.sqrt(sum / 6))) };
    }).sort(function (a, b) { return b.pct - a.pct; }).slice(0, 3);
    $('resultLine').textContent = 'あなたの一番の強みは「' + RATING_NAMES[mine.hi] + '」、一番低いのは「' + RATING_NAMES[mine.lo] + '」です。この' +
      PLAYERS.length + '人の中で一番近いのは' + matches[0].p.name + '（' + matches[0].pct + '%）です。';

    // radar chart
    $('radarR1').setAttribute('points', ringPoints(0.25));
    $('radarR2').setAttribute('points', ringPoints(0.5));
    $('radarR3').setAttribute('points', ringPoints(0.75));
    $('radarR4').setAttribute('points', ringPoints(1));
    $('radarAxes').setAttribute('d', AXES.map(function (a) {
      return 'M200 200L' + (200 + 140 * Math.cos(a)).toFixed(1) + ' ' + (200 + 140 * Math.sin(a)).toFixed(1);
    }).join(''));
    $('radarYou').setAttribute('points', shapePoints(yourRatings));
    $('radarThem').setAttribute('points', shapePoints(favRatings));
    $('legendYou').textContent = you;
    $('legendThem').textContent = fav.name;

    // bar comparison
    var rows = $('compareRows');
    rows.innerHTML = '';
    STATS.forEach(function (stat) {
      var y = state.stats[stat.key];
      var t = fav.s[stat.key];
      var max = Math.max(y, t, 0.1);
      var ahead = y >= t;
      var row = document.createElement('div');
      row.className = 'compare-row';
      row.innerHTML =
        '<div class="compare-top"><span class="compare-label">' + stat.label + '</span>' +
        '<span class="compare-verdict' + (ahead ? ' is-ahead' : '') + '">' + (ahead ? '上回る' : '下回る') + '</span></div>' +
        '<div class="compare-body"><div class="compare-bars">' +
        '<div class="track"><i class="you" style="width:' + (y / max * 100).toFixed(1) + '%"></i></div>' +
        '<div class="track"><i class="them" style="width:' + (t / max * 100).toFixed(1) + '%"></i></div></div>' +
        '<div class="compare-nums"><span class="you">あなた ' + fmt(stat, y) + '</span><span>相手 ' + fmt(stat, t) + '</span></div></div>';
      rows.appendChild(row);
    });

    // closest matches
    var box = $('matches');
    box.innerHTML = '';
    matches.forEach(function (m) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'match';
      btn.innerHTML = '<span class="match-pct">' + m.pct + '%</span><span class="match-name">' + m.p.name + '</span>' +
        '<span class="match-sub">' + (m.p.group === 'now' ? 'ランキング' + m.p.rank + '位 · ' + m.p.team : '歴代の名選手') + '</span>' +
        '<span class="match-hint">タップして比べる</span>';
      btn.addEventListener('click', function () { state.tab = m.p.group; state.fav = m.p.id; update(); });
      box.appendChild(btn);
    });

    // player file
    var ex = extremes(favRatings);
    $('fileName').textContent = fav.name;
    $('fileSub').textContent = fav.group === 'now' ? 'ESPNランキング' + fav.rank + '位 · ' + fav.team : 'NBA 75周年記念チーム';
    $('fileLine').textContent = fav.s.pts.toFixed(1) + '得点、' + fav.s.reb.toFixed(1) + 'リバウンド、' + fav.s.ast.toFixed(1) +
      'アシスト、' + fav.s.stl.toFixed(1) + 'スティール、' + fav.s.blk.toFixed(1) + 'ブロック';
    $('fileSplits').textContent = 'FG ' + fav.s.fg.toFixed(1) + '% · 3P ' + fav.s.tp.toFixed(1) + '% · FT ' + fav.s.ft.toFixed(1) + '%';
    $('fileBest').textContent = RATING_NAMES[ex.hi] + ' (' + Math.min(99, Math.round(favRatings[ex.hi])) + ')';
    $('fileWorst').textContent = RATING_NAMES[ex.lo] + ' (' + Math.round(favRatings[ex.lo]) + ')';
    $('fileNote').textContent = fav.note;
  }

  /* ---------- 4. plan: gaps, 12-week table, your words ---------- */
  function renderPlan() {
    var fav = findPlayer(state.fav);
    $('gapsTitle').textContent = fav.name + 'との差が大きい項目';

    // the three biggest relative gaps
    var gaps = STATS.map(function (stat) {
      var y = state.stats[stat.key], t = fav.s[stat.key];
      return { stat: stat, y: y, t: t, rel: t >= 0.5 ? (t - y) / t : 0 };
    }).filter(function (g) { return g.rel > 0; })
      .sort(function (a, b) { return b.rel - a.rel; })
      .slice(0, 3);

    $('noGaps').hidden = gaps.length > 0;
    $('noGaps').textContent = 'あなたはすべての項目で' + fav.name + 'を上回っています。もっと強い相手と比べて、次の課題を見つけましょう。';

    var focus = $('focusList');
    focus.innerHTML = '';
    gaps.forEach(function (g, i) {
      var card = document.createElement('div');
      card.className = 'focus';
      card.innerHTML = '<span class="focus-rank">フォーカス ' + (i + 1) + '</span>' +
        '<span class="focus-title">' + g.stat.label + '</span>' +
        '<span class="focus-line">あなた ' + fmt(g.stat, g.y) + '。' + fav.name + ' ' + fmt(g.stat, g.t) + '。</span>' +
        '<span class="focus-tip">' + g.stat.tip + '</span>';
      focus.appendChild(card);
    });

    // 12-week pacing: close a quarter of the gap every three weeks
    $('planBlock').hidden = gaps.length === 0;
    var body = $('planBody');
    body.innerHTML = '';
    gaps.forEach(function (g) {
      var at = function (f) { return fmt(g.stat, g.y + (g.t - g.y) * f); };
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + g.stat.label + '</td><td>' + fmt(g.stat, g.y) + '</td><td>' + at(0.25) +
                     '</td><td>' + at(0.5) + '</td><td>' + at(0.75) + '</td><td>' + fmt(g.stat, g.t) + '</td>';
      body.appendChild(tr);
    });

    // your own words (textContent keeps anything you type safe)
    var weak = $('weak').value.trim();
    var goal = $('goal').value.trim();
    $('words').hidden = !weak && !goal;
    $('wordsWeak').hidden = !weak;
    $('wordsGoal').hidden = !goal;
    $('wordsWeakText').textContent = weak;
    $('wordsGoalText').textContent = goal;

    // a drill that matches what you wrote
    var text = (weak + ' ' + goal).toLowerCase();
    var hit = null;
    for (var i = 0; i < KEYWORDS.length && !hit; i++) {
      if (KEYWORDS[i][0].test(text)) { hit = statByKey(KEYWORDS[i][1]); }
    }
    $('keyword').hidden = !hit;
    if (hit) {
      $('keywordLabel').textContent = 'あなたの書いた内容に合う練習：' + hit.label;
      $('keywordTip').textContent = hit.tip;
    }
  }

  /* ---------- steps: one section at a time ---------- */
  var panels = Array.prototype.slice.call(document.querySelectorAll('.steps > [data-step]'));
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.step-tab'));
  var prevBtn = $('stepPrev');
  var nextBtn = $('stepNext');
  var step = 1;
  function goStep(n, scroll) {
    step = Math.max(1, Math.min(panels.length, n));
    panels.forEach(function (p) { p.hidden = Number(p.dataset.step) !== step; });
    tabs.forEach(function (t) { t.classList.toggle('is-active', Number(t.dataset.go) === step); });
    prevBtn.disabled = step === 1;
    nextBtn.disabled = step === panels.length;
    var area = document.querySelector('.steps');
    if (scroll && area && area.scrollIntoView && window.innerWidth < 960) { area.scrollIntoView({ block: 'start' }); }
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { goStep(Number(t.dataset.go), true); }); });
  prevBtn.addEventListener('click', function () { goStep(step - 1, true); });
  nextBtn.addEventListener('click', function () { goStep(step + 1, true); });

  /* ---------- start ---------- */
  function update() { renderPool(); renderResults(); renderPlan(); }

  buildBodySliders();
  buildSliders();
  $('tabNow').addEventListener('click', function () { pickTab('now', 'jokic'); });
  $('tabAll').addEventListener('click', function () { pickTab('all', 'curry'); });
  ['playerName', 'weak', 'goal'].forEach(function (id) {
    $(id).addEventListener('input', function () { renderResults(); renderPlan(); });
  });
  update();
  goStep(1);
})();
