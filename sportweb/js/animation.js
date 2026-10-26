/* ==========================================================
   Page-change animation
   Click a link to another page -> the page you are reading is
   squeezed into a round paper ball, thrown into a basket, and then the
   next page loads and rises in.

   Timeline (milliseconds):
     0     cover   page becomes a fixed sheet
     40    crush   sheet is squeezed into a round, crumpled ball
     120   a stick man fades in on the court
     560   the ball flies into his hands
     880   he dips, jumps and shoots (release about 540 ms later)
     ~2000 the ball drops through the net, the net swings, "+3" pops up
     ~2800 the new page is opened
   ========================================================== */
(function () {
  'use strict';

  var page = document.querySelector('.page');
  if (!page) { return; }

  var ARRIVE_KEY = 'range-arrive';
  var EASE = 'cubic-bezier(.6,0,.3,1)';
  var busy = false;

  /* ---------- 1. wrap the page and add the extra layers ---------- */
  var fly = document.createElement('div');
  fly.className = 'fly';
  var shape = document.createElement('div');
  shape.className = 'shape';
  page.parentNode.insertBefore(fly, page);
  fly.appendChild(shape);
  shape.appendChild(page);

  // [triangle points, fill] pairs that make the crumple look
  var FOLDS = [
    ['0,0 30,0 28,30', 'rgba(255,255,255,.14)'], ['0,0 28,30 0,35', 'rgba(0,0,0,.34)'],
    ['30,0 65,0 55,38', 'rgba(0,0,0,.16)'], ['30,0 55,38 28,30', 'rgba(255,255,255,.1)'],
    ['65,0 100,0 82,28', 'rgba(0,0,0,.3)'], ['65,0 82,28 55,38', 'rgba(255,255,255,.16)'],
    ['100,0 100,40 82,28', 'rgba(0,0,0,.38)'], ['0,35 28,30 25,62', 'rgba(255,255,255,.1)'],
    ['0,35 25,62 0,68', 'rgba(0,0,0,.3)'], ['28,30 55,38 52,70', 'rgba(0,0,0,.2)'],
    ['28,30 52,70 25,62', 'rgba(255,255,255,.15)'], ['55,38 82,28 80,60', 'rgba(0,0,0,.34)'],
    ['55,38 80,60 52,70', 'rgba(255,255,255,.1)'], ['82,28 100,40 100,70', 'rgba(255,255,255,.12)'],
    ['82,28 100,70 80,60', 'rgba(0,0,0,.26)'], ['0,68 25,62 35,100', 'rgba(255,255,255,.14)'],
    ['0,68 35,100 0,100', 'rgba(0,0,0,.34)'], ['25,62 52,70 35,100', 'rgba(0,0,0,.3)'],
    ['52,70 66,100 35,100', 'rgba(255,255,255,.1)'], ['52,70 80,60 66,100', 'rgba(0,0,0,.2)'],
    ['80,60 100,70 100,100', 'rgba(255,255,255,.14)'], ['80,60 100,100 66,100', 'rgba(0,0,0,.36)']
  ];
  var creases = document.createElement('div');
  creases.className = 'creases';
  creases.setAttribute('aria-hidden', 'true');
  creases.innerHTML =
    '<svg viewBox="0 0 100 100" preserveAspectRatio="none">' +
    FOLDS.map(function (f) { return '<polygon points="' + f[0] + '" fill="' + f[1] + '"/>'; }).join('') +
    '<path d="M28 30L55 38L82 28M25 62L52 70L80 60M30 0L28 30L25 62L35 100M65 0L55 38L52 70L66 100M0 35L28 30M100 40L82 28M0 68L25 62M100 70L80 60" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".35"/>' +
    '</svg><div class="sheen"></div>';
  shape.appendChild(creases);

  // the hoop seen from the side: dark pole with an angled arm, a thin slate board,
  // a flat red rim sticking out toward the shooter and a diamond-mesh net.
  // Drawing space is 320 x 560, ground at y = 560; the rim centre is at (162, 124).
  var SLATE = '#4b5f6e', DARK = '#263640', REDRIM = '#d63a3a', NETC = '#2b3a45';
  function makeBasket(front) {
    var box = document.createElement('div');
    box.className = 'basket ' + (front ? 'basket--front' : 'basket--back');
    box.setAttribute('aria-hidden', 'true');
    if (!front) {
      box.innerHTML =
        '<svg viewBox="0 0 320 560">' +
        '<ellipse cx="296" cy="558" rx="40" ry="4" fill="#000" fill-opacity=".18"/>' +
        '<path d="M296 558V152Q296 142 289 135L242 86" fill="none" stroke="' + DARK + '" stroke-width="14" stroke-linejoin="round"/>' +
        '<rect x="214" y="20" width="28" height="132" fill="' + SLATE + '"/>' +
        '<path d="M214 112H112Q104 112 104 118Q104 124 112 124L214 136Z" fill="' + REDRIM + '"/>' +
        '</svg>';
    } else {
      var top0 = 122, topW = 84, bot0 = 140, botW = 50, y1 = 126, y2 = 192, g = '', i, xt = [], xb = [];
      for (i = 0; i <= 6; i++) { xt.push(top0 + topW * i / 6); xb.push(bot0 + botW * i / 6); }
      g += 'M' + xt[0] + ' ' + y1 + 'L' + xb[0] + ' ' + y2 + 'M' + xt[6] + ' ' + y1 + 'L' + xb[6] + ' ' + y2;
      for (i = 0; i <= 4; i++) {
        g += 'M' + xt[i] + ' ' + y1 + 'L' + xb[i + 2] + ' ' + y2 + 'M' + xt[i + 2] + ' ' + y1 + 'L' + xb[i] + ' ' + y2;
      }
      box.innerHTML =
        '<div class="basket-net"><svg viewBox="0 0 320 560">' +
        '<path d="' + g + '" fill="none" stroke="' + NETC + '" stroke-opacity=".85" stroke-width="1.3" stroke-linecap="round"/>' +
        '<path d="M' + xb[0] + ' ' + y2 + 'H' + xb[6] + '" stroke="' + NETC + '" stroke-opacity=".85" stroke-width="1.6"/>' +
        '</svg></div>';
    }
    document.body.appendChild(box);
    return box;
  }
  var plus3 = document.createElement('div');
  plus3.className = 'plus3';
  plus3.setAttribute('aria-hidden', 'true');
  plus3.textContent = '+3';
  document.body.appendChild(plus3);
  var basketBack = makeBasket(false);
  var basketFront = makeBasket(true);
  var net = basketFront.querySelector('.basket-net');

  /* ---------- 2. arriving from another page ---------- */
  try {
    if (sessionStorage.getItem(ARRIVE_KEY)) {
      sessionStorage.removeItem(ARRIVE_KEY);
      page.classList.add('arrive');
    }
  } catch (e) { /* storage blocked: just skip the fade-in */ }

  /* ---------- 3. ball geometry (depends on the window size) ---------- */
  /* The whole page is squeezed (width and height shrink by different amounts)
     and clipped to an ellipse of the page box, so on screen it is a round ball
     made of the page itself. */
  function measure() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var ball = Math.min(w * 0.5, h * 0.46);           // ball diameter while it is squeezed
    var hoop = Math.min(130, ball * 0.45);            // ball diameter when it reaches the hoop
    return {
      h: h,
      big: ball / w + ', ' + ball / h,                // scale (x, y) of the ball in the middle
      small: hoop / w + ', ' + hoop / h,              // scale (x, y) when it reaches the hoop
      smaller: (hoop * 0.9) / w + ', ' + (hoop * 0.9) / h,
      rect: 'inset(0px round 0%)',                    // the full page
      blob: 'inset(0px round 50%)'                    // an ellipse that becomes a circle once squeezed
    };
  }

  /* ---------- 4. the stick-man shooter ---------- */
  /* A simple skeleton (hip, torso, head, two legs, two arms). Each pose is a set of
     numbers; the figure is redrawn every frame between key poses. Angles are measured
     from straight up, clockwise (so 90 = pointing forward, 180 = pointing down). */
  var NS = 'http://www.w3.org/2000/svg';
  var shooter = document.createElement('div');
  shooter.className = 'shooter';
  shooter.setAttribute('aria-hidden', 'true');
  var sg = document.createElementNS(NS, 'svg');
  sg.setAttribute('width', '100%');
  sg.setAttribute('height', '100%');
  var grp = document.createElementNS(NS, 'g');
  grp.setAttribute('fill', 'none');
  grp.setAttribute('stroke', '#2b1511');
  grp.setAttribute('stroke-width', '4.2');
  grp.setAttribute('stroke-linecap', 'round');
  grp.setAttribute('stroke-linejoin', 'round');
  function mk(tag) { var e = document.createElementNS(NS, tag); grp.appendChild(e); return e; }
  var shadowEl = mk('ellipse');
  shadowEl.setAttribute('fill', 'rgba(43,21,17,.22)'); shadowEl.setAttribute('stroke', 'none');
  shadowEl.setAttribute('cx', '0'); shadowEl.setAttribute('cy', '0'); shadowEl.setAttribute('rx', '26'); shadowEl.setAttribute('ry', '4');
  var legB = mk('polyline'), armS = mk('polyline'), torso = mk('line'), legF = mk('polyline'), armG = mk('polyline');
  var head = mk('circle');
  head.setAttribute('r', '8.5'); head.setAttribute('fill', '#2b1511');
  armS.setAttribute('stroke-opacity', '.72'); legB.setAttribute('stroke-opacity', '.72');
  sg.appendChild(grp);
  shooter.appendChild(sg);
  document.body.appendChild(shooter);

  // key poses of a jump shot (t in ms from the moment he starts to shoot)
  // h = hip height, j = jump height, lean = torso lean, u/f = upper arm / forearm angle, wr = wrist flick
  var KEYS = [
    { t: 0,   h: 58, j: 0,  lean: 6,  u1: 150, f1: 20, u2: 150, f2: 15, wr: 0 },   // ball held at the chest
    { t: 240, h: 42, j: 0,  lean: 18, u1: 158, f1: 38, u2: 158, f2: 32, wr: 0 },   // dip
    { t: 420, h: 56, j: 5,  lean: 8,  u1: 85,  f1: 5,  u2: 100, f2: 25, wr: 0 },   // rise, ball to the set point
    { t: 540, h: 62, j: 15, lean: 0,  u1: 25,  f1: 38, u2: 85,  f2: 60, wr: 35 },  // release at the top of the jump
    { t: 800, h: 61, j: 12, lean: -2, u1: 28,  f1: 70, u2: 100, f2: 80, wr: 55 },  // follow-through
    { t: 1100, h: 58, j: 0, lean: 2,  u1: 30,  f1: 75, u2: 110, f2: 85, wr: 55 }   // land
  ];
  var REL = 540;                                   // release time within the shot
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
    armS.setAttribute('points', pts([sh, e1, h1, w1]));   // right (shooting) arm: far side
    armG.setAttribute('points', pts([sh, e2, h2]));       // left (guide) arm: near side
    shadowEl.setAttribute('cx', 0);
    return { hand: w1, aim: dir(p.f1 + p.wr * 0.6) };
  }

  /* the court floor along the bottom of the screen (drawn when the animation starts) */
  var floor = document.createElement('div');
  floor.className = 'court-floor';
  floor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(floor);
  function drawFloor(w, H, mx, rimX) {
    var planks = '', i;
    for (i = 40; i < w; i += 46) { planks += '<line x1="' + i + '" y1="8" x2="' + i + '" y2="' + H + '"/>'; }
    var rx = Math.max(60, rimX - mx - 45), laneL = rimX - Math.min(300, w * 0.24);
    var y1 = Math.round(H * 0.2), y2 = Math.round(H * 0.86), cy = Math.round(H * 0.52), ry = Math.round(H * 0.46);
    floor.style.height = H + 'px';
    floor.innerHTML = '<svg width="' + w + '" height="' + H + '" viewBox="0 0 ' + w + ' ' + H + '">' +
      '<rect width="' + w + '" height="' + H + '" fill="#bf5d18"/>' +
      '<g stroke="#000" stroke-opacity=".07" stroke-width="2">' + planks + '</g>' +
      '<g fill="none" stroke="#fff6ea" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="0" y1="3" x2="' + w + '" y2="3"/>' +
      '<path d="M' + laneL + ' ' + y1 + 'L' + (rimX + 120) + ' ' + y1 + 'M' + laneL + ' ' + y2 + 'L' + (rimX + 120) + ' ' + y2 + 'M' + laneL + ' ' + y1 + 'V' + y2 + '"/>' +
      '<ellipse cx="' + rimX + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" clip-path="inset(0 ' + Math.max(0, w - rimX - 6) + 'px 0 0)"/>' +
      '</g></svg>';
  }

  /* ---------- 5. the animation ---------- */
  var raf = 0;
  function ease(x) { return x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x); }

  function play(url) {
    busy = true;
    var m = measure();
    var scrolled = window.scrollY || 0;
    var w = window.innerWidth, h = window.innerHeight;

    // sizes and places (pixels)
    var S = Math.min(1.8, (h * 0.27) / 119);                       // figure scale
    var D = Math.max(38, 33 * S);                                  // ball diameter in his hands
    var FH = Math.round(Math.min(240, Math.max(140, h * 0.27)));   // height of the court floor strip
    var FLOOR = Math.round(FH * 0.5);                              // the ground line: middle of the strip
    document.documentElement.style.setProperty('--floor', FLOOR + 'px');
    var br = basketFront.getBoundingClientRect();
    var kx = br.width / 320, ky = br.height / 560;
    var rimX = br.left + 162 * kx;                                  // the rim: high up on the right, facing him
    var rimY = br.top + 124 * ky - 22;                             // where the ball enters it
    var poleX = br.left + 296 * kx;
    var mx = Math.max(w * 0.07, rimX - Math.min(660, w * 0.62));    // where he stands (left of the hoop)
    var gy = h - FLOOR;                                            // the floor he stands on
    drawFloor(w, FH, mx, poleX);
    plus3.style.left = (br.left + 200 * kx) + 'px';
    plus3.style.bottom = (h - br.top - 20 * ky + 12) + 'px';
    var D0 = Math.min(w * 0.5, h * 0.46);                          // ball size after the crush
    grp.setAttribute('transform', 'translate(' + mx + ' ' + gy + ') scale(' + S + ' ' + (-S) + ')');
    function scr(p) { return [mx + p[0] * S, gy - p[1] * S]; }
    function ballAt(hd) {                                          // ball centre when held, in pixels
      var c = [hd.hand[0] + hd.aim[0] * (D / 2 / S) * 0.9, hd.hand[1] + hd.aim[1] * (D / 2 / S) * 0.9];
      return scr(c);
    }
    function put(c, d, rot, opacity) {
      fly.style.transform = 'translate(' + (c[0] - w / 2) + 'px,' + (c[1] - h / 2) + 'px)';
      shape.style.transform = 'rotate(' + rot + 'deg) scale(' + (d / w) + ',' + (d / h) + ')';
      if (opacity !== undefined) { fly.style.opacity = opacity; }
    }

    // the first part: the page covers the screen and is squeezed into a ball
    setTimeout(function () {                                       // cover
      fly.classList.add('is-moving');
      page.style.transform = 'translateY(' + (-scrolled) + 'px)';
      shape.style.clipPath = m.rect;
    }, 0);
    setTimeout(function () {                                       // crush
      shape.style.transition = 'transform 420ms ' + EASE + ', clip-path 420ms ' + EASE;
      shape.style.transform = 'rotate(300deg) scale(' + m.big + ')';
      shape.style.clipPath = m.blob;
      creases.style.transition = 'opacity 380ms ease 60ms';
      creases.style.opacity = '1';
      basketBack.classList.add('is-visible');
      basketFront.classList.add('is-visible');
      floor.classList.add('is-visible');
    }, 40);
    setTimeout(function () { draw(poseAt(0)); shooter.classList.add('is-visible'); }, 120);

    // the second part: he catches the ball, shoots, it goes in
    var TA = 280, FL = 720, DROP = 190;
    var fired = { drop: false, swish: false };
    setTimeout(function () {
      shape.style.transition = 'none';
      fly.style.transition = 'none';
      var t0 = performance.now();
      var P0 = null, C = null;
      (function tick(now) {
        var T = now - t0, c, d, rot;
        if (T < TA) {                                              // ball flies from the middle to his hands
          var hd0 = draw(poseAt(0)), b0 = ballAt(hd0), u = ease(T / TA);
          c = [w / 2 + (b0[0] - w / 2) * u, h / 2 + (b0[1] - h / 2) * u];
          d = D0 + (D - D0) * u; rot = 300 + 120 * u;
          put(c, d, rot);
        } else {
          var ts = T - TA, hd = draw(poseAt(ts));
          if (ts < REL) {                                          // held in his hands
            put(ballAt(hd), D, 420 + ts * 0.05);
          } else {
            var tf = (ts - REL) / FL;
            if (!P0) {
              P0 = ballAt(hd);
              var apex = Math.max(40, rimY - Math.max(170, h * 0.24));   // top of the arc: well above the rim
              C = [rimX - 110, (4 * apex - P0[1] - rimY) / 2];
            }
            if (tf < 1) {                                          // flight along a curve
              var q = 1 - tf;
              c = [q * q * P0[0] + 2 * q * tf * C[0] + tf * tf * rimX, q * q * P0[1] + 2 * q * tf * C[1] + tf * tf * rimY];
              put(c, D * (1 - 0.06 * tf), 420 + (ts - REL) * 0.5);
            } else {
              var td = Math.min(1, (tf - 1) * FL / DROP);          // drops through the net
              if (!fired.drop) {
                fired.drop = true;
                net.style.transition = 'transform 150ms ease-out';
                net.style.transform = 'scale(1.1, 1.22)';
              }
              put([rimX, rimY + 80 * ky * td], D * (0.94 - 0.14 * td), 420 + (ts - REL) * 0.5, 1 - td);
              if (td >= 1 && !fired.swish) {                       // swish + "+3"
                fired.swish = true;
                net.style.transition = '';
                net.style.transform = '';
                net.classList.add('is-swishing');
                plus3.classList.add('is-on');
                setTimeout(function () {
                  try { sessionStorage.setItem(ARRIVE_KEY, '1'); } catch (e) { /* ignore */ }
                  window.location.href = url;
                }, 700);
                return;
              }
            }
          }
        }
        raf = requestAnimationFrame(tick);
      })(performance.now());
    }, 560);
  }

  /* put everything back (needed when the browser's back button restores this page) */
  function reset() {
    busy = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    shooter.classList.remove('is-visible');
    floor.classList.remove('is-visible');
    document.documentElement.style.removeProperty('--floor');
    fly.classList.remove('is-moving');
    [fly, shape, page, creases, net, plus3].forEach(function (el) { el.removeAttribute('style'); });
    net.classList.remove('is-swishing');
    plus3.classList.remove('is-on');
    basketBack.classList.remove('is-visible');
    basketFront.classList.remove('is-visible');
  }

  /* ---------- 6. hook up the links ---------- */
  function isPageLink(a, e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) { return false; }
    if (a.target && a.target !== '_self') { return false; }
    var u = new URL(a.href, window.location.href);
    if (u.protocol !== window.location.protocol || u.host !== window.location.host) { return false; }
    return u.pathname !== window.location.pathname;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !isPageLink(a, e)) { return; }
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { return; }                   // skip the show, just open the page
    e.preventDefault();
    if (!busy) { play(a.href); }
  });

  window.addEventListener('pageshow', function (e) { if (e.persisted) { reset(); } });
})();
