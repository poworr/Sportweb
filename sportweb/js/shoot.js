/* ==========================================================
   Shooting practice
   Hold SPACE (or the SHOOT button): the stick man dips and rises, and a
   meter fills. Let go while the marker is in the green zone to make the
   shot. Too early or too late and it misses (short, rim out, off the board).
   The whole scene is drawn by this file inside #stage.
   ========================================================== */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage'), floorEl = $('floor'), basketBack = $('basketBack'), basketFront = $('basketFront');
  var shooterSvg = $('shooterSvg'), ballEl = $('ball'), plus3 = $('plus3'), meter = $('meter');
  var meterFill = $('meterFill'), meterMark = $('meterMark'), callout = $('callout'), shootBtn = $('shootBtn');
  if (!stage) { return; }
  var inPreview = window.self !== window.top;      // the small preview window on the pager: just draw the scene

  /* ---------- the hoop (side view; drawing space 320 x 560, ground at y = 560, rim centre at 162,124) ---------- */
  var SLATE = '#4b5f6e', DARK = '#263640', REDRIM = '#d63a3a', NETC = '#2b3a45';
  basketBack.innerHTML =
    '<svg viewBox="0 0 320 560">' +
    '<ellipse cx="296" cy="558" rx="40" ry="4" fill="#000" fill-opacity=".18"/>' +
    '<path d="M296 558V152Q296 142 289 135L242 86" fill="none" stroke="' + DARK + '" stroke-width="14" stroke-linejoin="round"/>' +
    '<rect x="214" y="20" width="28" height="132" fill="' + SLATE + '"/>' +
    '<path d="M214 112H112Q104 112 104 118Q104 124 112 124L214 136Z" fill="' + REDRIM + '"/>' +
    '</svg>';
  (function () {
    var top0 = 122, topW = 84, bot0 = 140, botW = 50, y1 = 126, y2 = 192, g = '', i, xt = [], xb = [];
    for (i = 0; i <= 6; i++) { xt.push(top0 + topW * i / 6); xb.push(bot0 + botW * i / 6); }
    g += 'M' + xt[0] + ' ' + y1 + 'L' + xb[0] + ' ' + y2 + 'M' + xt[6] + ' ' + y1 + 'L' + xb[6] + ' ' + y2;
    for (i = 0; i <= 4; i++) {
      g += 'M' + xt[i] + ' ' + y1 + 'L' + xb[i + 2] + ' ' + y2 + 'M' + xt[i + 2] + ' ' + y1 + 'L' + xb[i] + ' ' + y2;
    }
    basketFront.innerHTML =
      '<div class="basket-net"><svg viewBox="0 0 320 560">' +
      '<path d="' + g + '" fill="none" stroke="' + NETC + '" stroke-opacity=".85" stroke-width="1.3" stroke-linecap="round"/>' +
      '<path d="M' + xb[0] + ' ' + y2 + 'H' + xb[6] + '" stroke="' + NETC + '" stroke-opacity=".85" stroke-width="1.6"/>' +
      '</svg></div>';
  })();
  var net = basketFront.querySelector('.basket-net');

  /* the ball */
  ballEl.innerHTML =
    '<svg viewBox="-50 -50 100 100"><circle r="48.5" fill="#f0701c" stroke="#2b1511" stroke-width="3"/>' +
    '<path d="M-48 0H48M0 -48V48M-33 -35C-13 -14 -13 14 -33 35M33 -35C13 -14 13 14 33 35" fill="none" stroke="#2b1511" stroke-width="3" stroke-linecap="round"/></svg>';

  /* ---------- the stick-man shooter ---------- */
  /* Angles are measured from straight up, clockwise (90 = forward, 180 = down).
     He is right-handed and faces the hoop on the right: the shooting arm is the near arm. */
  var grp = document.createElementNS(NS, 'g');
  grp.setAttribute('fill', 'none'); grp.setAttribute('stroke', '#2b1511'); grp.setAttribute('stroke-width', '4.2');
  grp.setAttribute('stroke-linecap', 'round'); grp.setAttribute('stroke-linejoin', 'round');
  function mk(tag) { var e = document.createElementNS(NS, tag); grp.appendChild(e); return e; }
  var shadowEl = mk('ellipse');
  shadowEl.setAttribute('fill', 'rgba(43,21,17,.22)'); shadowEl.setAttribute('stroke', 'none');
  shadowEl.setAttribute('cx', '0'); shadowEl.setAttribute('cy', '0'); shadowEl.setAttribute('rx', '26'); shadowEl.setAttribute('ry', '4');
  var legB = mk('polyline'), armG = mk('polyline'), torso = mk('line'), legF = mk('polyline'), armS = mk('polyline');
  var head = mk('circle');
  head.setAttribute('r', '8.5'); head.setAttribute('fill', '#2b1511');
  armG.setAttribute('stroke-opacity', '.72'); legB.setAttribute('stroke-opacity', '.72');
  shooterSvg.appendChild(grp);

  // key poses of a jump shot (t in ms from the moment he starts to shoot)
  // h = hip height, j = jump height, lean = torso lean, u/f = upper arm / forearm angle, wr = wrist flick
  var KEYS = [
    { t: 0,    h: 58, j: 0,  lean: 6,  u1: 150, f1: 20,  u2: 150, f2: 15,  wr: 0 },     // ball held at the chest
    { t: 230,  h: 34, j: 0,  lean: 22, u1: 160, f1: 45,  u2: 160, f2: 38,  wr: 0 },     // deep dip, knees bent
    { t: 400,  h: 54, j: 6,  lean: 8,  u1: 80,  f1: -12, u2: 95,  f2: 30,  wr: -30 },   // rise, ball cocked above the head
    { t: 540,  h: 64, j: 24, lean: -2, u1: 22,  f1: 20,  u2: 70,  f2: 50,  wr: 50 },    // release at the top of the jump
    { t: 650,  h: 65, j: 27, lean: -4, u1: 14,  f1: 28,  u2: 85,  f2: 62,  wr: 78 },    // arm reaches up, wrist flicks over
    { t: 850,  h: 63, j: 18, lean: -4, u1: 12,  f1: 34,  u2: 110, f2: 80,  wr: 105 },   // goose-neck follow-through
    { t: 1100, h: 56, j: 3,  lean: 2,  u1: 14,  f1: 36,  u2: 135, f2: 95,  wr: 108 },   // landing
    { t: 1300, h: 53, j: 0,  lean: 5,  u1: 16,  f1: 38,  u2: 145, f2: 100, wr: 108 },   // absorb the landing
    { t: 1700, h: 58, j: 0,  lean: 3,  u1: 18,  f1: 40,  u2: 150, f2: 105, wr: 105 }    // stand tall, hold the follow-through
  ];
  var REL = 540;                                   // the perfect release moment (ms after pressing)
  var METER_T = 700;                               // the meter is full after this long (and he lets go by himself)
  var FIELDS = ['h', 'j', 'lean', 'u1', 'f1', 'u2', 'f2', 'wr'];
  function smooth(x) { return x * x * (3 - 2 * x); }
  function poseAt(t) {
    if (t <= KEYS[0].t) { return KEYS[0]; }
    for (var i = 1; i < KEYS.length; i++) {
      if (t <= KEYS[i].t) {
        var a = KEYS[i - 1], b = KEYS[i], k = smooth((t - a.t) / (b.t - a.t)), p = {};
        FIELDS.forEach(function (f) { p[f] = a[f] + (b[f] - a[f]) * k; });
        return p;
      }
    }
    return KEYS[KEYS.length - 1];
  }
  function blend(a, b, k) { var p = {}; FIELDS.forEach(function (f) { p[f] = a[f] + (b[f] - a[f]) * k; }); return p; }
  function dir(a) { var r = a * Math.PI / 180; return [Math.sin(r), Math.cos(r)]; }
  function add(p, d, len) { return [p[0] + d[0] * len, p[1] + d[1] * len]; }
  function leg(H, F) {                              // two-bone leg, knee bends forward
    var L = 30, dx = F[0] - H[0], dy = F[1] - H[1], d = Math.min(Math.hypot(dx, dy), 2 * L - 0.01);
    var u = [dx / Math.hypot(dx, dy), dy / Math.hypot(dx, dy)];
    var mid = [H[0] + u[0] * d / 2, H[1] + u[1] * d / 2];
    var hh = Math.sqrt(L * L - d * d / 4);
    var perp = [-u[1], u[0]];
    if (perp[0] < 0) { perp = [-perp[0], -perp[1]]; }
    return [H, [mid[0] + perp[0] * hh, mid[1] + perp[1] * hh], F];
  }
  function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function draw(p) {                                // returns the shooting hand (figure units, y up)
    var hip = [0, p.h + p.j], td = dir(p.lean);
    var top = add(hip, td, 40), sh = add(hip, td, 36);
    torso.setAttribute('x1', hip[0]); torso.setAttribute('y1', hip[1]);
    torso.setAttribute('x2', top[0]); torso.setAttribute('y2', top[1]);
    var hc = add(hip, td, 50);
    head.setAttribute('cx', hc[0]); head.setAttribute('cy', hc[1]);
    legB.setAttribute('points', pts(leg(hip, [-11, p.j])));
    legF.setAttribute('points', pts(leg(hip, [12, p.j])));
    var e1 = add(sh, dir(p.u1), 24), h1 = add(e1, dir(p.f1), 22), w1 = add(h1, dir(p.f1 + p.wr), 6);
    var e2 = add(sh, dir(p.u2), 24), h2 = add(e2, dir(p.f2), 22);
    armS.setAttribute('points', pts([sh, e1, h1, w1]));
    armG.setAttribute('points', pts([sh, e2, h2]));
    return { hand: w1, aim: dir(p.f1 + p.wr * 0.6) };
  }

  /* ---------- layout (everything depends on the size of the stage) ---------- */
  var G = {};
  function f1(n) { return n.toFixed(1); }
  function drawFloor(w, H, R, rimX) {                // half court in perspective, real proportions (feet)
    var sx = R / 23.75, sy = H * 0.84 / 50, cy = H * 0.5;
    var base = rimX + 5.25 * sx, far = cy - 25 * sy, near = cy + 25 * sy;
    var ftX = base - 19 * sx, laneT = cy - 8 * sy, laneB = cy + 8 * sy;
    var cornerX = rimX - Math.sqrt(23.75 * 23.75 - 22 * 22) * sx, cT = cy - 22 * sy, cB = cy + 22 * sy;
    var planks = '', y;
    for (y = far + 9; y < H; y += 9) { planks += '<line x1="0" y1="' + y + '" x2="' + w + '" y2="' + y + '"/>'; }
    floorEl.style.height = H + 'px';
    floorEl.innerHTML = '<svg width="' + w + '" height="' + H + '" viewBox="0 0 ' + w + ' ' + H + '">' +
      '<rect width="' + w + '" height="' + H + '" fill="#e0580d"/>' +
      '<rect x="0" y="' + f1(far) + '" width="' + f1(base) + '" height="' + f1(near - far) + '" fill="#ff7a1f"/>' +
      '<g stroke="#000" stroke-opacity=".06" stroke-width="1.5">' + planks + '</g>' +
      '<rect x="' + f1(ftX) + '" y="' + f1(laneT) + '" width="' + f1(base - ftX) + '" height="' + f1(laneB - laneT) + '" fill="#d9500c" fill-opacity=".75"/>' +
      '<g fill="none" stroke="#fff6ea" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M0 ' + f1(far) + 'H' + f1(base) + 'V' + f1(near) + 'H0"/>' +
      '<rect x="' + f1(ftX) + '" y="' + f1(laneT) + '" width="' + f1(base - ftX) + '" height="' + f1(laneB - laneT) + '"/>' +
      '<path d="M' + f1(ftX) + ' ' + f1(cy - 6 * sy) + 'A' + f1(6 * sx) + ' ' + f1(6 * sy) + ' 0 0 0 ' + f1(ftX) + ' ' + f1(cy + 6 * sy) + '"/>' +
      '<path d="M' + f1(ftX) + ' ' + f1(cy - 6 * sy) + 'A' + f1(6 * sx) + ' ' + f1(6 * sy) + ' 0 0 1 ' + f1(ftX) + ' ' + f1(cy + 6 * sy) + '" stroke-dasharray="7 7"/>' +
      '<path d="M' + f1(base) + ' ' + f1(cT) + 'H' + f1(cornerX) + 'A' + f1(23.75 * sx) + ' ' + f1(23.75 * sy) + ' 0 0 0 ' + f1(cornerX) + ' ' + f1(cB) + 'H' + f1(base) + '"/>' +
      '<path d="M' + f1(rimX) + ' ' + f1(cy - 4 * sy) + 'A' + f1(4 * sx) + ' ' + f1(4 * sy) + ' 0 0 0 ' + f1(rimX) + ' ' + f1(cy + 4 * sy) + '"/>' +
      '</g></svg>';
  }

  function layout() {
    var r = stage.getBoundingClientRect(), W = r.width, H = r.height;
    var S = Math.min(1.8, H * 0.33 / 119, W / 330);
    var FH = Math.round(Math.min(240, Math.max(120, H * 0.28)));
    var FLOOR = Math.round(FH * 0.5);
    var hoopH = Math.min(H * 0.74, 540, W * 0.62), hoopW = hoopH * 320 / 560;
    var hoopLeft = W - Math.min(150, Math.max(24, W * 0.08)) - hoopW;
    var hoopTop = H - FLOOR - hoopH;
    var kx = hoopW / 320, ky = hoopH / 560;
    var rimX = hoopLeft + 162 * kx, rimY = hoopTop + 101 * ky;
    var R = Math.max(80, Math.min(560, W * 0.44));
    var mx = Math.max(Math.min(150, W * 0.28), rimX - R - Math.min(250, W * 0.2));
    R = Math.max(80, Math.min(R, rimX - mx - 30));
    G = { W: W, H: H, S: S, D: Math.max(34, 33 * S), FLOOR: FLOOR, gy: H - FLOOR, mx: mx, kx: kx, ky: ky, rimX: rimX, rimY: rimY, hoopTop: hoopTop };
    drawFloor(W, FH, R, rimX);
    [basketBack, basketFront].forEach(function (b) {
      b.style.left = hoopLeft + 'px'; b.style.top = hoopTop + 'px'; b.style.height = hoopH + 'px'; b.style.width = hoopW + 'px';
    });
    plus3.style.left = (hoopLeft + 200 * kx) + 'px';
    plus3.style.top = Math.max(4, hoopTop - 46 + 20 * ky) + 'px';
    grp.setAttribute('transform', 'translate(' + mx + ' ' + G.gy + ') scale(' + S + ' ' + (-S) + ')');
    ballEl.style.width = ballEl.style.height = G.D + 'px';
    // meter: to the left of his feet, as tall as he is
    var mh = Math.round(119 * S * 0.95);
    meter.style.left = Math.max(10, mx - Math.min(70, 60 * S)) + 'px';
    meter.style.bottom = FLOOR + 'px';
    meter.style.setProperty('--mh', mh + 'px');
    G.mh = mh;
    callout.style.left = mx + 'px';
    callout.style.top = Math.max(50, G.gy - 175 * S - 70) + 'px';
    paintMeter();
  }
  function scr(p) { return [G.mx + p[0] * G.S, G.gy - p[1] * G.S]; }
  function ballAt(hd) {                              // the ball centre while it is held, in stage pixels
    var c = [hd.hand[0] + hd.aim[0] * (G.D / 2 / G.S) * 0.9, hd.hand[1] + hd.aim[1] * (G.D / 2 / G.S) * 0.9];
    return scr(c);
  }
  function putBall(x, y, rot) {
    ballEl.style.transform = 'translate(' + (x - G.D / 2).toFixed(1) + 'px,' + (y - G.D / 2).toFixed(1) + 'px) rotate(' + (rot || 0).toFixed(1) + 'deg)';
  }

  /* ---------- the meter ---------- */
  var win = 55;                                      // half width of the green window in ms (set by the difficulty)
  function paintMeter() {
    var pc = function (ms) { return Math.max(0, Math.min(100, ms / METER_T * 100)).toFixed(2) + '%'; };
    var y0 = pc(REL - win * 2.3), g0 = pc(REL - win), g1 = pc(REL + win), y1 = pc(REL + win * 2.3);
    meter.style.setProperty('--zones',
      'linear-gradient(to top, #e0443a 0 ' + y0 + ', #f5c542 ' + y0 + ' ' + g0 + ', #2fdc4a ' + g0 + ' ' + g1 + ', #f5c542 ' + g1 + ' ' + y1 + ', #e0443a ' + y1 + ' 100%)');
  }
  function setMeter(ms) {
    var p = Math.max(0, Math.min(1, ms / METER_T));
    meterFill.style.height = (p * G.mh).toFixed(1) + 'px';
    meterMark.style.bottom = (p * G.mh).toFixed(1) + 'px';
  }

  /* ---------- score board ---------- */
  var stats = { att: 0, make: 0, pts: 0, green: 0, streak: 0, best: 0 };
  try { stats.best = parseInt(localStorage.getItem('range-shoot-best'), 10) || 0; } catch (e) { /* storage blocked */ }
  function paintStats() {
    $('hudPts').textContent = stats.pts;
    $('hudMake').textContent = stats.make + '/' + stats.att;
    $('hudPct').textContent = (stats.att ? Math.round(stats.make / stats.att * 100) : 0) + '%';
    $('hudGreen').textContent = stats.green;
    $('hudStreak').textContent = stats.streak;
    $('hudBest').textContent = stats.best;
  }
  function say(big, small, tone) {
    callout.className = 'callout is-on is-' + tone;
    callout.innerHTML = '<b></b><span></span>';
    callout.firstChild.textContent = big;
    callout.lastChild.textContent = small || '';
  }
  function hideSay() { callout.className = 'callout'; }

  /* ---------- the shot ---------- */
  var state = 'ready';                               // ready -> charging -> flight -> settle -> returning -> ready
  var tPress = 0, tRelease = 0, tReturn = 0, tSettled = 0, lastPose = KEYS[0];
  var shot = null, b = null, raf = 0, markMs = 0;

  function press() {
    if (state !== 'ready') { return; }
    state = 'charging';
    stage.setAttribute('data-state', state);
    tPress = performance.now();
    hideSay();
    meter.classList.add('is-on');
    shootBtn.classList.add('is-down');
    start();
  }
  function release() {
    shootBtn.classList.remove('is-down');
    if (state !== 'charging') { return; }
    doRelease(performance.now() - tPress);
  }

  function doRelease(ts) {
    var now = performance.now();
    var err = ts - REL, a = Math.abs(err), e = a / win, o, side = err < 0 ? 'front' : 'back';
    if (a <= win) { o = 'swish'; }
    else if (e <= 2.3) { o = Math.random() < 0.5 ? 'rimin' : 'rimout'; }
    else if (err < 0) { o = e > 4.2 ? 'air' : 'short'; }
    else { o = e > 4.2 ? 'boardhigh' : 'board'; }
    var kx = G.kx, ky = G.ky, rx = G.rimX, ry = G.rimY, T;
    switch (o) {
      case 'swish': T = [rx, ry]; break;
      case 'rimin': case 'rimout': T = [rx + (side === 'front' ? -1 : 1) * 46 * kx, ry]; break;
      case 'short': T = [rx - 68 * kx, ry + 14 * ky]; break;
      case 'air': T = [rx - 150 * kx, ry + 90 * ky]; break;
      case 'board': T = [rx + 58 * kx, ry - 22 * ky]; break;
      default: T = [rx + 62 * kx, ry - 70 * ky];
    }
    var hd = draw(poseAt(ts)), P0 = ballAt(hd);
    // a parabola that leaves the hand at about 60 degrees and curves down to the target
    var Dx = T[0] - P0[0], deg = 60, aa, bb;
    for (; deg >= 40; deg -= 2) {
      aa = Math.tan(deg * Math.PI / 180) * Dx;
      bb = T[1] - P0[1] + aa;
      if (P0[1] - aa * aa / (4 * bb) >= 36) { break; }
    }
    var FL = 1000;
    shot = { o: o, side: side, err: err, P0: P0, T: T, aa: aa, bb: bb, FL: FL, hit: false, done: false };
    stats.att++;
    markMs = ts;
    setMeter(ts);
    state = 'flight';
    tRelease = now;
    var ms = (err > 0 ? '+' : err < 0 ? '−' : '±') + Math.round(a) + 'ms';
    if (o === 'swish') { say('グリーン！', 'パーフェクト ' + ms, 'green'); stats.green++; }
    else if (o === 'rimin' || o === 'rimout') { say(err < 0 ? 'ちょっと早い' : 'ちょっと遅い', 'あと少し ' + ms, 'yellow'); }
    else { say(err < 0 ? '早すぎ！' : '遅すぎ！', ms, 'red'); }
    paintStats();
  }

  function fireNet() {
    net.classList.remove('is-swishing'); void net.offsetWidth; net.classList.add('is-swishing');
  }
  function fireScore() {
    plus3.classList.remove('is-on'); void plus3.offsetWidth; plus3.classList.add('is-on');
    stats.make++; stats.pts += 3; stats.streak++;
    if (stats.streak > stats.best) {
      stats.best = stats.streak;
      try { localStorage.setItem('range-shoot-best', String(stats.best)); } catch (e) { /* ignore */ }
    }
    paintStats();
  }
  function miss(text) {
    stats.streak = 0; paintStats();
    if (text) { say(text[0], text[1], 'red'); }
  }

  /* where the ball is after it touches something (px per ms) */
  function contact() {
    var o = shot.o, vxE = shot.T[0] - shot.P0[0], vyE;
    vxE = vxE / shot.FL; vyE = (-shot.aa + 2 * shot.bb) / shot.FL;
    b = { x: shot.T[0], y: shot.T[1], vx: vxE, vy: vyE, g: 2 * shot.bb / (shot.FL * shot.FL), rot: 0, pullUntil: 0 };
    var vx = Math.abs(vxE), vy = Math.abs(vyE), now = performance.now();
    if (o === 'swish') {
      b.vx = 0; b.vy = vyE * 0.9;
      fireNet(); fireScore();
    } else if (o === 'rimin') {
      b.vy = -vy * 0.3; b.vx = (G.rimX - b.x) / 300; b.pullUntil = now + 300;
      setTimeout(function () { fireNet(); fireScore(); say('リムイン！', 'ギリギリ入った', 'yellow'); }, 320);
    } else if (o === 'rimout') {
      if (shot.side === 'front') { b.vx = -vx * 0.7; b.vy = -vy * 0.5; } else { b.vx = -vx * 0.35; b.vy = -vy * 0.6; }
      miss(['リムアウト', 'リングに嫌われた', 'yellow']);
      callout.className = 'callout is-on is-yellow';
    } else if (o === 'short') {
      b.vx = -vx * 0.6; b.vy = -vy * 0.3; miss();
    } else if (o === 'board' || o === 'boardhigh') {
      b.vx = -vx * 0.7; b.vy = -vy * (o === 'board' ? 0.25 : 0.2); miss();
    } else { miss(); }          // air ball: no contact, the ball just keeps falling
  }

  function step(now, dt) {
    var f = (now - tRelease) / shot.FL;
    if (!b) {
      if (f < 1) {                                   // flight along the curve
        var x = shot.P0[0] + (shot.T[0] - shot.P0[0]) * f;
        var y = shot.P0[1] - shot.aa * f + shot.bb * f * f;
        putBall(x, y, -(now - tRelease) * 0.35);
        return;
      }
      contact();
      b.t0 = now;
    }
    // free fall with a few bounces on the floor
    var floorY = G.gy - G.D * 0.3;
    b.vy += b.g * dt;
    if (b.pullUntil && now > b.pullUntil) { b.vx = 0; b.pullUntil = 0; }
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < G.D / 2) { b.x = G.D / 2; b.vx = Math.abs(b.vx) * 0.5; }
    if (b.x > G.W - G.D / 2) { b.x = G.W - G.D / 2; b.vx = -Math.abs(b.vx) * 0.5; }
    if (b.y > floorY && b.vy > 0) {
      b.y = floorY; b.vy = -b.vy * 0.5; b.vx *= 0.8;
      if (Math.abs(b.vy) < 0.05) { b.vy = 0; }
    }
    if (b.y >= floorY - 0.5 && b.vy === 0) { b.vx *= Math.pow(0.994, dt); }
    b.rot += b.vx * dt * 0.9;
    putBall(b.x, b.y, b.rot);
    if (b.y >= floorY - 0.5 && b.vy === 0 && Math.abs(b.vx) < 0.04 || now - tRelease > shot.FL + 2200) {
      state = 'settle'; tSettled = now;
    }
  }

  function frame(now) {
    raf = 0;
    var dt = Math.min(32, now - (frame.last || now));
    frame.last = now;
    var ts = now - tPress, keep = true;
    if (state === 'charging') {
      if (ts >= METER_T) { doRelease(METER_T); ts = now - tPress; }
      else { setMeter(ts); }
    }
    if (state === 'charging') {
      var hd = draw(poseAt(ts)), c = ballAt(hd);
      putBall(c[0], c[1], 20 + ts * 0.05);
      lastPose = poseAt(ts);
    } else if (state === 'flight' || state === 'settle') {
      lastPose = poseAt(Math.min(ts, KEYS[KEYS.length - 1].t));
      draw(lastPose);
      if (state === 'flight') { step(now, dt); }
      if (state === 'settle' && now - tSettled > 900) { state = 'returning'; tReturn = now; }
    } else if (state === 'returning') {
      var k = Math.min(1, (now - tReturn) / 420);
      var pp = blend(lastPose, KEYS[0], smooth(k)), h2 = draw(pp), c2 = ballAt(h2);
      var fade = k;                                  // the ball is back in his hands
      if (k >= 1) { backToReady(); keep = false; }
      else { putBall(b ? b.x + (c2[0] - b.x) * fade : c2[0], b ? b.y + (c2[1] - b.y) * fade : c2[1], 0); }
    }
    stage.setAttribute('data-state', state);
    if (keep) { raf = requestAnimationFrame(frame); }
  }
  function start() { if (!raf) { frame.last = 0; raf = requestAnimationFrame(frame); } }

  function backToReady() {
    state = 'ready'; shot = null; b = null; lastPose = KEYS[0];
    stage.setAttribute('data-state', state);
    var hd = draw(KEYS[0]), c = ballAt(hd);
    putBall(c[0], c[1], 20);
    meter.classList.remove('is-on'); setMeter(0);
    plus3.classList.remove('is-on');
  }
  function resetAll() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    stats.att = stats.make = stats.pts = stats.green = stats.streak = 0;
    paintStats(); hideSay(); backToReady();
  }

  /* ---------- controls ---------- */
  if (!inPreview) {
    document.addEventListener('keydown', function (e) {
      if (e.code !== 'Space' && e.key !== ' ') { return; }
      var t = e.target, tag = t && t.tagName ? t.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') { return; }
      e.preventDefault();
      if (!e.repeat) { press(); }
    });
    document.addEventListener('keyup', function (e) {
      if (e.code !== 'Space' && e.key !== ' ') { return; }
      e.preventDefault();
      release();
    });
    shootBtn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      try { shootBtn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      press();
    });
    ['pointerup', 'pointercancel'].forEach(function (n) { shootBtn.addEventListener(n, release); });
    shootBtn.addEventListener('click', function (e) { e.preventDefault(); });
    window.addEventListener('blur', function () { if (state === 'charging') { release(); } });
    $('levels').addEventListener('click', function (e) {
      var bt = e.target.closest ? e.target.closest('button[data-win]') : null;
      if (!bt) { return; }
      win = parseInt(bt.getAttribute('data-win'), 10);
      Array.prototype.forEach.call($('levels').children, function (c) { c.classList.toggle('is-active', c === bt); });
      paintMeter();
    });
    $('resetBtn').addEventListener('click', resetAll);
  }

  /* ---------- start ---------- */
  function init() {
    layout();
    paintStats();
    backToReady();
  }
  init();
  var resizeT = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { if (raf) { cancelAnimationFrame(raf); raf = 0; } layout(); backToReady(); }, 120);
  });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { layout(); if (state === 'ready') { backToReady(); } }); }
  window.addEventListener('load', function () { layout(); if (state === 'ready') { backToReady(); } });
})();
