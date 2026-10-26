/* ==========================================================
   Page-change animation
   Click a link to another page -> the page you are reading is
   squeezed into a round paper ball, thrown into a basket, and then the
   next page loads and rises in.

   Timeline (milliseconds):
     0     cover   page becomes a fixed sheet
     40    crush   sheet is squeezed into a round, crumpled ball
     600   up      ball is tossed up
     870   down    ball falls toward the hoop
     1210  drop    ball drops through the net
     1380  swish   net swings, "+3" pops up above the hoop
     2100  go      the new page is opened
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

  // the basket (two layers so the ball goes "inside" the net)
  function makeBasket(front) {
    var box = document.createElement('div');
    box.className = 'basket ' + (front ? 'basket--front' : 'basket--back');
    box.setAttribute('aria-hidden', 'true');
    var NAVY = '#12385e', ORANGE = '#ec5b2b';
    var rimBack = '<path d="M54 118A66 13 0 0 1 186 118" fill="none" stroke="' + NAVY + '" stroke-width="7" stroke-linecap="round"/>';
    var rimFront = '<path d="M54 118A66 13 0 0 0 186 118" fill="none" stroke="' + NAVY + '" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M58 119A62 11 0 0 0 182 119" fill="none" stroke="' + ORANGE + '" stroke-width="2" stroke-linecap="round" opacity=".9"/>';
    if (!front) {
      box.innerHTML =
        '<svg viewBox="0 0 240 220">' +
        '<polygon points="180,10 194,2 194,90 180,98" fill="' + ORANGE + '"/>' +
        '<polygon points="44,10 58,2 194,2 180,10" fill="' + ORANGE + '"/>' +
        '<rect x="44" y="10" width="136" height="88" fill="#ffffff" stroke="' + ORANGE + '" stroke-width="2.5"/>' +
        '<rect x="50" y="16" width="124" height="76" fill="none" stroke="' + ORANGE + '" stroke-width="1" opacity=".55"/>' +
        '<rect x="90" y="48" width="54" height="38" fill="none" stroke="' + ORANGE + '" stroke-width="2.5"/>' +
        '<rect x="108" y="98" width="24" height="14" fill="' + ORANGE + '"/><rect x="126" y="98" width="6" height="14" fill="' + NAVY + '"/>' +
        rimBack + '</svg>';
    } else {
      box.innerHTML =
        '<div class="basket-net"><svg viewBox="0 0 240 220">' +
        '<g fill="none" stroke="#ffffff" stroke-opacity=".92" stroke-width="2" stroke-linecap="round">' +
        '<path d="M54 118L84 190M77 123L98 190M100 126L110 190M120 127L120 190M140 126L130 190M163 123L142 190M186 118L156 190"/>' +
        '<path d="M54 118L98 190M77 123L110 190M100 126L120 190M120 127L130 190M140 126L142 190M163 123L156 190"/>' +
        '<path d="M186 118L142 190M163 123L130 190M140 126L120 190M120 127L110 190M100 126L98 190M77 123L84 190"/>' +
        '<path d="M63 138Q120 150 177 138M72 158Q120 168 168 158M80 176Q120 185 160 176"/></g>' +
        rimFront + '</svg></div>';
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

  /* ---------- 4. the animation ---------- */
  function play(url) {
    busy = true;
    var m = measure();
    var scrolled = window.scrollY || 0;

    var steps = [
      [0, function () {                                   // cover
        fly.classList.add('is-moving');
        page.style.transform = 'translateY(' + (-scrolled) + 'px)';
        shape.style.clipPath = m.rect;
      }],
      [40, function () {                                  // crush
        shape.style.transition = 'transform 520ms ' + EASE + ', clip-path 520ms ' + EASE;
        shape.style.transform = 'rotate(300deg) scale(' + m.big + ')';
        shape.style.clipPath = m.blob;
        creases.style.transition = 'opacity 380ms ease 60ms';
        creases.style.opacity = '1';
        basketBack.classList.add('is-visible');
        basketFront.classList.add('is-visible');
      }],
      [600, function () {                                 // up
        shape.style.transition = 'transform 260ms linear';
        shape.style.transform = 'rotate(420deg) scale(' + m.big + ')';
        fly.style.transition = 'transform 260ms cubic-bezier(.2,.7,.3,1)';
        fly.style.transform = 'translateY(' + Math.round(-0.2 * m.h) + 'px)';
      }],
      [870, function () {                                 // down
        shape.style.transition = 'transform 340ms ease-in';
        shape.style.transform = 'rotate(560deg) scale(' + m.small + ')';
        fly.style.transition = 'transform 340ms cubic-bezier(.5,0,.9,.55)';
        fly.style.transform = 'translateY(calc(50vh - 148px))';
      }],
      [1210, function () {                                // drop
        shape.style.transition = 'transform 170ms ease-in';
        shape.style.transform = 'rotate(600deg) scale(' + m.smaller + ')';
        fly.style.transition = 'transform 170ms ease-in, opacity 150ms ease 30ms';
        fly.style.transform = 'translateY(calc(50vh - 88px))';
        fly.style.opacity = '0';
        net.style.transition = 'transform 150ms ease-out';
        net.style.transform = 'scale(1.1, 1.22)';
      }],
      [1380, function () {                                // swish + "+3"
        net.style.transition = '';
        net.style.transform = '';
        net.classList.add('is-swishing');
        plus3.classList.add('is-on');
      }],
      [2100, function () {                                // go to the next page
        try { sessionStorage.setItem(ARRIVE_KEY, '1'); } catch (e) { /* ignore */ }
        window.location.href = url;
      }]
    ];
    steps.forEach(function (s) { setTimeout(s[1], s[0]); });
  }

  /* put everything back (needed when the browser's back button restores this page) */
  function reset() {
    busy = false;
    fly.classList.remove('is-moving');
    [fly, shape, page, creases, net, plus3].forEach(function (el) { el.removeAttribute('style'); });
    net.classList.remove('is-swishing');
    plus3.classList.remove('is-on');
    basketBack.classList.remove('is-visible');
    basketFront.classList.remove('is-visible');
  }

  /* ---------- 5. hook up the links ---------- */
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
