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
    fav: 'curry'       // id of the player we compare with
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

  /* ---------- start ---------- */
  function update() { renderPool(); renderResults(); renderPlan(); }

  buildSliders();
  $('tabNow').addEventListener('click', function () { pickTab('now', 'jokic'); });
  $('tabAll').addEventListener('click', function () { pickTab('all', 'curry'); });
  ['playerName', 'weak', 'goal'].forEach(function (id) {
    $(id).addEventListener('input', function () { renderResults(); renderPlan(); });
  });
  update();
})();
