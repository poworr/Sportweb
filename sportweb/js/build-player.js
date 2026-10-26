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
    [/free ?throw|\bft\b/, 'ft'],
    [/three|3[- ]?pt|3[- ]?point|range|shoot|jumper/, 'tp'],
    [/rebound|box ?out/, 'reb'],
    [/pass|assist|vision|playmak|handle|dribble/, 'ast'],
    [/steal|defen|lock/, 'stl'],
    [/block|rim protect/, 'blk'],
    [/finish|layup|paint|scor|efficien/, 'fg']
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
      ? "The top 10 is ESPN's NBA Rank 2026, published September 24, 2026, with 2025-26 per-game stats. This is a snapshot taken October 21, 2026. Keeping it live needs a data feed, which is the next step."
      : 'Ten greats picked from the NBA 75th Anniversary Team, shown with career per-game averages. This is not a ranking. Bill Russell and Wilt Chamberlain are left out because steals and blocks were not tracked in their careers.';

    var pool = $('pool');
    pool.innerHTML = '';
    PLAYERS.filter(function (p) { return p.group === state.tab; }).forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'player-btn' + (p.id === state.fav ? ' is-active' : '');
      var sub = p.group === 'now' ? '#' + p.rank + ' · ' + p.team : 'Career, ' + p.games.toLocaleString('en-US') + ' games';
      btn.innerHTML = '<span class="name">' + p.name + '</span><span class="meta">' + sub + '</span>' +
                      '<span class="meta">' + p.s.pts.toFixed(1) + ' PPG</span>';
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
    var you = ($('playerName').value || '').trim() || 'You';
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
    $('resultLine').textContent = 'Your strongest area is ' + RATING_NAMES[mine.hi].toLowerCase() +
      ' and your lowest is ' + RATING_NAMES[mine.lo].toLowerCase() + '. Your closest match among these ' +
      PLAYERS.length + ' players is ' + matches[0].p.name + ' at ' + matches[0].pct + '%.';

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
        '<span class="compare-verdict' + (ahead ? ' is-ahead' : '') + '">' + (ahead ? 'Ahead' : 'Behind') + '</span></div>' +
        '<div class="compare-body"><div class="compare-bars">' +
        '<div class="track"><i class="you" style="width:' + (y / max * 100).toFixed(1) + '%"></i></div>' +
        '<div class="track"><i class="them" style="width:' + (t / max * 100).toFixed(1) + '%"></i></div></div>' +
        '<div class="compare-nums"><span class="you">You ' + fmt(stat, y) + '</span><span>Them ' + fmt(stat, t) + '</span></div></div>';
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
        '<span class="match-sub">' + (m.p.group === 'now' ? 'Ranked #' + m.p.rank + ' · ' + m.p.team : 'All-time great') + '</span>' +
        '<span class="match-hint">Tap to compare</span>';
      btn.addEventListener('click', function () { state.tab = m.p.group; state.fav = m.p.id; update(); });
      box.appendChild(btn);
    });

    // player file
    var ex = extremes(favRatings);
    $('fileName').textContent = fav.name;
    $('fileSub').textContent = fav.group === 'now' ? 'Ranked #' + fav.rank + ' by ESPN · ' + fav.team : 'NBA 75th Anniversary Team';
    $('fileLine').textContent = fav.s.pts.toFixed(1) + ' pts, ' + fav.s.reb.toFixed(1) + ' reb, ' + fav.s.ast.toFixed(1) +
      ' ast, ' + fav.s.stl.toFixed(1) + ' stl, ' + fav.s.blk.toFixed(1) + ' blk';
    $('fileSplits').textContent = fav.s.fg.toFixed(1) + '% FG · ' + fav.s.tp.toFixed(1) + '% 3P · ' + fav.s.ft.toFixed(1) + '% FT';
    $('fileBest').textContent = RATING_NAMES[ex.hi] + ' (' + Math.min(99, Math.round(favRatings[ex.hi])) + ')';
    $('fileWorst').textContent = RATING_NAMES[ex.lo] + ' (' + Math.round(favRatings[ex.lo]) + ')';
    $('fileNote').textContent = fav.note;
  }

  /* ---------- 4. plan: gaps, 12-week table, your words ---------- */
  function renderPlan() {
    var fav = findPlayer(state.fav);
    $('gapsTitle').textContent = 'Your biggest gaps to ' + fav.name;

    // the three biggest relative gaps
    var gaps = STATS.map(function (stat) {
      var y = state.stats[stat.key], t = fav.s[stat.key];
      return { stat: stat, y: y, t: t, rel: t >= 0.5 ? (t - y) / t : 0 };
    }).filter(function (g) { return g.rel > 0; })
      .sort(function (a, b) { return b.rel - a.rel; })
      .slice(0, 3);

    $('noGaps').hidden = gaps.length > 0;
    $('noGaps').textContent = 'You are ahead of ' + fav.name + ' in every category. Pick a tougher comparison to find your next gap.';

    var focus = $('focusList');
    focus.innerHTML = '';
    gaps.forEach(function (g, i) {
      var card = document.createElement('div');
      card.className = 'focus';
      card.innerHTML = '<span class="focus-rank">Focus ' + (i + 1) + '</span>' +
        '<span class="focus-title">' + g.stat.label + '</span>' +
        '<span class="focus-line">You ' + fmt(g.stat, g.y) + '. ' + fav.name + ' ' + fmt(g.stat, g.t) + '.</span>' +
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
      $('keywordLabel').textContent = 'Matched to what you wrote: ' + hit.label;
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
