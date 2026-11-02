/* ==========================================================
   Build your player page
   You set height, weight and wingspan, choose the play style you
   like, pick a target player, and the page shows how your body
   differs and which drills to start with.
   Needs player-data.js (STATS, PLAYERS, BODY) and lab.js.
   ========================================================== */
(function () {
  'use strict';

  var state = {
    tab: 'all',        // 'now' (ESPN top 10) or 'all' (all-time greats)
    fav: 'curry',      // id of the player we compare with
    style: 1,          // index into Lab.STYLES (the play style you like)
    body: { h: 178, w: 72, s: 183 }   // height (cm), weight (kg), wingspan (cm)
  };

  var $ = function (id) { return document.getElementById(id); };

  function findPlayer(id) {
    return PLAYERS.filter(function (p) { return p.id === id; })[0] || PLAYERS[0];
  }
  function statByKey(key) { return STATS.filter(function (s) { return s.key === key; })[0]; }

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


  // which drills (STATS keys) belong to each play style, in Lab.STYLES order (positions)
  var STYLE_DRILLS = [['ast', 'stl'], ['tp', 'ft'], ['pts', 'fg'], ['reb', 'fg'], ['reb', 'blk']];

  /* ---------- 1a. play style picker ---------- */
  function examples(i) {
    return PLAYERS.filter(function (p) { return Lab.style(p).index === i; })
      .sort(function (a, b) { return Lab.best(b).value - Lab.best(a).value; })
      .slice(0, 3).map(function (p) { return p.name; }).join(' · ');
  }
  function buildStyles() {
    var grid = $('styleGrid');
    Lab.STYLES.forEach(function (st, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'style-btn';
      b.textContent = T(st.ja, st.en);
      b.addEventListener('click', function () { state.style = i; renderStyle(); renderResults(); renderPlan(); });
      grid.appendChild(b);
    });
    renderStyle();
  }
  function renderStyle() {
    var st = Lab.STYLES[state.style];
    Array.prototype.forEach.call($('styleGrid').children, function (b, i) { b.classList.toggle('is-active', i === state.style); });
    $('styleDesc').textContent = T(st.jaD, st.enD) + T(' たとえば：', ' For example: ') + examples(state.style);
  }

  /* ---------- 1b. height / weight and the stick man ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  var BODY = [
    { key: 'h', label: tr('身長'), min: 150, max: 235, step: 1, unit: 'cm' },
    { key: 'w', label: tr('体重'), min: 40, max: 150, step: 1, unit: 'kg' },
    { key: 's', label: tr('ウイングスパン'), min: 150, max: 250, step: 1, unit: 'cm' }
  ];
  var CURRY = { h: 188, w: 84, s: 190 };    // Stephen Curry: 6 ft 2 in, 185 lb, wingspan about 6 ft 3 in
  var GROUND = 392, PX = 1.55;              // ground line (y) and pixels per cm
  var shown = { h: state.body.h, w: state.body.w, s: state.body.s };   // what is drawn now (eases toward state.body)
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
  function poseFigure(f, cx, hcm, wkg, span) {
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
    var armLen = Math.max(H * 0.2, span * PX / 2 - sw), ang = 22 * Math.PI / 180;   // wingspan = shoulders + two arms
    [[f.armL, -1], [f.armR, 1]].forEach(function (a) {
      var s = a[1], dx = Math.sin(ang) * armLen, dy = Math.cos(ang) * armLen;
      a[0].setAttribute('points', pts([[cx + s * sw, shY], [cx + s * (sw + dx * 0.5 + tw * 0.1), shY + dy * 0.5], [cx + s * (sw + dx + tw * 0.12), shY + dy]]));
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
    for (var cm = 0; cm <= 240; cm += 10) {
      if (cm < 150 && cm % 50) { continue; }
      var y = GROUND - cm * PX;
      el('line', { x1: 36, x2: 352, y1: y, y2: y, 'class': cm % 50 === 0 ? 'ruler-line ruler-line--major' : 'ruler-line' }, ruler);
      if (cm % 50 === 0 || cm % 20 === 0 && cm >= 150) { el('text', { x: 30, y: y + 4, 'class': 'ruler-text', 'text-anchor': 'end' }, ruler).textContent = cm; }
    }
    el('line', { x1: 36, x2: 352, y1: GROUND, y2: GROUND, 'class': 'ground' }, svg);
    el('ellipse', { cx: 122, cy: GROUND + 2, rx: 44, ry: 5, 'class': 'figure-shadow', id: 'bodyShadow' }, svg);
    ref = makeFigure(svg, 'figure figure--ref');
    you = makeFigure(svg, 'figure figure--you');
    var tag = el('text', { x: 274, y: GROUND - CURRY.h * PX - 8, 'class': 'ref-tag', 'text-anchor': 'middle' }, svg);
    tag.textContent = T('カリー ', 'Curry ') + CURRY.h + 'cm';
    poseFigure(ref, 274, CURRY.h, CURRY.w, CURRY.s);
    drawBody();
  }
  function drawBody() {
    poseFigure(you, 122, shown.h, shown.w, shown.s);
    var bmi = shown.w / Math.pow(shown.h / 100, 2);
    $('bodyShadow').setAttribute('rx', (28 + Math.max(0, Math.min(1, (bmi - 17) / 19)) * 26).toFixed(1));
  }
  var raf = 0;
  function easeBody() {
    cancelAnimationFrame(raf);
    (function tick() {
      shown.h += (state.body.h - shown.h) * 0.22;
      shown.w += (state.body.w - shown.w) * 0.22;
      shown.s += (state.body.s - shown.s) * 0.22;
      var done = Math.abs(state.body.h - shown.h) < 0.05 && Math.abs(state.body.w - shown.w) < 0.05 && Math.abs(state.body.s - shown.s) < 0.05;
      if (done) { shown.h = state.body.h; shown.w = state.body.w; shown.s = state.body.s; }
      drawBody();
      if (!done) { raf = requestAnimationFrame(tick); }
    })();
  }
  function bodyText() {
    var h = state.body.h, w = state.body.w, bmi = w / Math.pow(h / 100, 2);
    var kind = h < 185 ? T('ガード体型', 'Guard build') : h < 198 ? T('ウイング体型', 'Wing build') : h < 208 ? T('フォワード体型', 'Forward build') : T('ビッグマン体型', 'Big-man build');
    var build = bmi < 19 ? T('細身', 'slim') : bmi < 25 ? T('標準', 'average') : bmi < 30 ? T('がっしり', 'sturdy') : T('かなり重め', 'very heavy');
    $('bodyType').textContent = kind + T('・', ' · ') + build;
    var d = h - CURRY.h;
    $('bodyVs').textContent = 'BMI ' + bmi.toFixed(1) + T(' ・ カリーより ', ' · vs Curry: ') + (d === 0 ? T('同じ身長', 'same height') : Math.abs(d) + 'cm ' + (d > 0 ? T('高い', 'taller') : T('低い', 'shorter'))) + T(' ・ 腕は身長', ' · arms vs height ') + (state.body.s - h >= 0 ? '+' : '') + (state.body.s - h) + 'cm';
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
        show(); bodyText(); easeBody(); renderResults(); renderPlan();
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
      ? T('トップ10はESPNの「NBA Rank 2026」（2026年9月24日発表）で、成績は2025-26シーズンの1試合平均です。2026年10月21日時点のスナップショットで、常に最新にするにはデータフィードが必要です。次の課題です。', 'The top 10 is from ESPN\'s "NBA Rank 2026" (published September 24, 2026), with 2025-26 per-game averages. It is a snapshot as of October 21, 2026; keeping it current would need a data feed, which is the next step.')
      : T('NBA 75周年記念チームから選んだ10人の名選手を、キャリア通算の1試合平均で表示しています。ランキングではありません。ビル・ラッセルとウィルト・チェンバレンは、現役時代にスティールとブロックが記録されていないため含めていません。', 'Ten greats from the NBA 75th Anniversary Team, shown with career per-game averages. This is not a ranking. Bill Russell and Wilt Chamberlain are left out because steals and blocks were not recorded in their careers.');

    var pool = $('pool');
    pool.innerHTML = '';
    PLAYERS.filter(function (p) { return p.group === state.tab; }).forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'player-btn' + (p.id === state.fav ? ' is-active' : '');
      var sub = p.group === 'now' ? '#' + p.rank + ' · ' + p.team : T('キャリア ', 'Career · ') + p.games.toLocaleString('en-US') + T('試合', ' games');
      btn.innerHTML = '<span class="name">' + p.name + '</span><span class="meta">' + sub + '</span>' +
                      '<span class="meta">' + p.body.h + 'cm · ' + Lab.style(p).name + '</span>';
      btn.addEventListener('click', function () { state.fav = p.id; update(); });
      pool.appendChild(btn);
    });
  }

  function pickTab(tab, defaultFav) {
    state.tab = tab;
    state.fav = defaultFav;
    update();
  }


  /* ---------- 3. results: body comparison, style, closest players ---------- */
  var UNITS = [
    { key: 'h', label: tr('身長'), unit: 'cm' },
    { key: 'w', label: tr('体重'), unit: 'kg' },
    { key: 's', label: tr('ウイングスパン'), unit: 'cm' }
  ];
  function youName() { return ($('playerName').value || '').trim() || T('あなた', 'You'); }

  function closeness(p) {
    var b = p.body, y = state.body;
    var d = Math.sqrt(Math.pow((b.h - y.h) / 10, 2) + Math.pow((b.w - y.w) / 12, 2) + Math.pow((b.s - y.s) / 10, 2));
    if (Lab.style(p).index !== state.style) { d += 1.2; }
    return Math.max(0, Math.round(100 - d * 14));
  }

  function renderResults() {
    var fav = findPlayer(state.fav), you = youName();
    var favStyle = Lab.style(fav);
    var matches = PLAYERS.map(function (p) { return { p: p, pct: closeness(p) }; })
      .sort(function (a, b) { return b.pct - a.pct; }).slice(0, 3);

    $('resultTitle').textContent = you + ' vs ' + fav.name;
    $('resultLine').textContent = T('あなたがやりたいポジションは「' + Lab.STYLES[state.style].ja + '」。体格とポジションがいちばん近いのは' + matches[0].p.name + '（' + matches[0].pct + '%）です。',
      'The position you want to play is ' + Lab.STYLES[state.style].en + '. The closest to you in body and position is ' + matches[0].p.name + ' (' + matches[0].pct + '%).');

    var rows = $('compareRows');
    rows.innerHTML = '';
    UNITS.forEach(function (u) {
      var y = state.body[u.key], t = fav.body[u.key], d = y - t, max = Math.max(y, t);
      var diff = d === 0 ? T('同じ', 'Same') : Math.abs(d) + u.unit + ' ' + (d > 0 ? T('上', 'more') : T('下', 'less'));
      var row = document.createElement('div');
      row.className = 'compare-row';
      row.innerHTML =
        '<div class="compare-top"><span class="compare-label">' + u.label + '</span><span class="compare-verdict">' + diff + '</span></div>' +
        '<div class="compare-body"><div class="compare-bars">' +
        '<div class="track"><i class="you" style="width:' + (y / max * 100).toFixed(1) + '%"></i></div>' +
        '<div class="track"><i class="them" style="width:' + (t / max * 100).toFixed(1) + '%"></i></div></div>' +
        '<div class="compare-nums"><span class="you">' + T('あなた ', 'You ') + y + u.unit + '</span><span>' + fav.name + ' ' + t + u.unit + '</span></div></div>';
      rows.appendChild(row);
    });

    var same = favStyle.index === state.style;
    $('styleCompare').innerHTML = '<h4>' + T('ポジション', 'Position') + '</h4>' +
      '<p><b>' + T('あなた：', 'You: ') + '</b>' + T(Lab.STYLES[state.style].ja, Lab.STYLES[state.style].en) + '</p>' +
      '<p><b>' + fav.name + '：</b>' + favStyle.name + '</p>' +
      '<p class="note">' + (same
        ? T('同じポジションです。体の違いをどう活かすかがカギです。', 'Same position. The key is how you use the differences in your body.')
        : T('ポジションがちがいます。この選手に近づくには、プランの練習を取り入れましょう。', 'Different positions. To get closer to him, add the drills in the plan.')) + '</p>';

    var box = $('matches');
    box.innerHTML = '';
    matches.forEach(function (m) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'match';
      btn.innerHTML = '<span class="match-pct">' + m.pct + '%</span><span class="match-name">' + m.p.name + '</span>' +
        '<span class="match-sub">' + Lab.style(m.p).name + ' · ' + m.p.body.h + 'cm</span>' +
        '<span class="match-hint">' + T('タップして比べる', 'Tap to compare') + '</span>';
      btn.addEventListener('click', function () { state.tab = m.p.group; state.fav = m.p.id; update(); });
      box.appendChild(btn);
    });

    // target player file
    var art = $('fileArt');
    art.src = 'images/players/' + fav.id + '.webp';
    $('fileName').textContent = fav.name;
    $('fileSub').textContent = fav.group === 'now' ? T('ESPNランキング' + fav.rank + '位 · ', 'ESPN rank #' + fav.rank + ' · ') + fav.team : T('NBA 75周年記念チーム', 'NBA 75th Anniversary Team');
    $('fileBody').textContent = fav.body.h + 'cm · ' + fav.body.w + 'kg · ' + T('ウイングスパン ', 'wingspan ') + fav.body.s + 'cm';
    $('fileStyle').textContent = favStyle.name;
    $('fileStrong').textContent = Lab.strengths(fav, 2).map(function (s) { return s.stat.label; }).join(' / ');
    $('fileNote').textContent = (Lab.honors(fav)[0] || '') ;
    $('fileLink').href = 'players.html?p=' + fav.id;
  }

  /* ---------- 4. plan: body notes, drills for your style, your words ---------- */
  function renderPlan() {
    var fav = findPlayer(state.fav), y = state.body, t = fav.body;
    $('gapsTitle').textContent = T('「' + Lab.STYLES[state.style].ja + '」におすすめの練習', 'Drills for a ' + Lab.STYLES[state.style].en.toLowerCase());

    var notes = [], dh = y.h - t.h, dw = y.w - t.w, ds = y.s - t.s;
    notes.push(Math.abs(dh) <= 3 ? T('身長は' + fav.name + 'とほぼ同じです。', 'Your height is about the same as ' + fav.name + '.')
      : dh < 0 ? T(fav.name + 'より身長が' + (-dh) + 'cm低いので、スピードとボールを守るドリブルを武器にしましょう。', 'You are ' + (-dh) + ' cm shorter than ' + fav.name + ', so make speed and ball protection your weapons.')
      : T(fav.name + 'より身長が' + dh + 'cm高いので、ゴール近くの高さを活かしましょう。', 'You are ' + dh + ' cm taller than ' + fav.name + ', so use that height near the basket.'));
    notes.push(Math.abs(ds) <= 3 ? T('ウイングスパンもほぼ同じです。', 'Your wingspan is about the same too.')
      : ds < 0 ? T('腕が' + (-ds) + 'cm短い分、足の運びと先読みでカバーしましょう。', 'Your arms are ' + (-ds) + ' cm shorter, so cover it with footwork and anticipation.')
      : T('腕が' + ds + 'cm長いので、パスコースを消したりブロックしたりするのに活かせます。', 'Your arms are ' + ds + ' cm longer, which helps in the passing lanes and on blocks.'));
    if (Math.abs(dw) > 8) {
      notes.push(dw < 0 ? T('体重が' + (-dw) + 'kg軽いので、当たり負けしないよう筋トレも取り入れましょう。', 'You are ' + (-dw) + ' kg lighter, so add strength training to handle contact.')
        : T('体重が' + dw + 'kg重いので、持久力とステップの軽さを意識しましょう。', 'You are ' + dw + ' kg heavier, so work on stamina and light footwork.'));
    }
    $('bodyNotes').innerHTML = '';
    notes.forEach(function (n) { var li = document.createElement('li'); li.textContent = n; $('bodyNotes').appendChild(li); });

    var focus = $('focusList');
    focus.innerHTML = '';
    STYLE_DRILLS[state.style].forEach(function (key, i) {
      var st = statByKey(key);
      var card = document.createElement('div');
      card.className = 'focus';
      card.innerHTML = '<span class="focus-rank">' + T('フォーカス ', 'Focus ') + (i + 1) + '</span>' +
        '<span class="focus-title"></span><span class="focus-tip"></span>';
      card.querySelector('.focus-title').textContent = st.label;
      card.querySelector('.focus-tip').textContent = st.tip;
      focus.appendChild(card);
    });

    var weak = $('weak').value.trim();
    var goal = $('goal').value.trim();
    $('words').hidden = !weak && !goal;
    $('wordsWeak').hidden = !weak;
    $('wordsGoal').hidden = !goal;
    $('wordsWeakText').textContent = weak;
    $('wordsGoalText').textContent = goal;

    var text = (weak + ' ' + goal).toLowerCase();
    var hit = null;
    for (var i = 0; i < KEYWORDS.length && !hit; i++) {
      if (KEYWORDS[i][0].test(text)) { hit = statByKey(KEYWORDS[i][1]); }
    }
    $('keyword').hidden = !hit;
    if (hit) {
      $('keywordLabel').textContent = T('あなたの書いた内容に合う練習：', 'Practice that fits what you wrote: ') + hit.label;
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
  (function () {
    var m = /[?&]target=([a-z0-9-]+)/.exec(window.location.search);
    if (m) { var p = findPlayer(m[1]); if (p.id === m[1]) { state.fav = p.id; state.tab = p.group; } }
  })();
  function update() { renderPool(); renderResults(); renderPlan(); }

  buildBodySliders();
  buildStyles();
  $('tabNow').addEventListener('click', function () { pickTab('now', 'jokic'); });
  $('tabAll').addEventListener('click', function () { pickTab('all', 'curry'); });
  ['playerName', 'weak', 'goal'].forEach(function (id) {
    $(id).addEventListener('input', function () { renderResults(); renderPlan(); });
  });
  update();
  goStep(1);
})();
