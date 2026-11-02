/* ==========================================================
   Player Lab page
   Pick one of the 20 players and see how good they are and
   what they are best at. Needs lab.js and player-data.js.
   ========================================================== */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var ART = ['jordan','lebron','curry','kobe','magic','shaq','jokic','giannis','luka','sga','wemby','brunson','edwards','mitchell'];
  function art(id) { return ART.indexOf(id) >= 0 ? '<img src="images/players/' + id + '.webp" alt="">' : ''; }
  var current = Lab.find(Lab.param('p')) ? Lab.param('p') : 'curry';

  function buildList() {
    var box = $('labList');
    box.innerHTML = '';
    [['all', T('歴代の名選手', 'All-time greats')], ['now', T('今のトップ10（ESPN）', 'Today\'s top 10 (ESPN)')]].forEach(function (g) {
      var h = document.createElement('p');
      h.className = 'lab-group';
      h.textContent = g[1];
      box.appendChild(h);
      PLAYERS.filter(function (p) { return p.group === g[0]; }).forEach(function (p) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'lab-btn';
        b.dataset.id = p.id;
        b.innerHTML = '<span class="lab-name"></span><span class="lab-meta"></span>';
        b.firstChild.textContent = p.name;
        b.lastChild.textContent = p.group === 'now' ? '#' + p.rank + ' · ' + p.team : '';
        b.addEventListener('click', function () { show(p.id); });
        box.appendChild(b);
      });
    });
  }

  function show(id) {
    current = id;
    var p = Lab.find(id), st = Lab.style(p);
    Array.prototype.forEach.call(document.querySelectorAll('.lab-btn'), function (b) {
      var on = b.dataset.id === id;
      b.classList.toggle('is-active', on);
      if (on) { b.setAttribute('aria-current', 'true'); } else { b.removeAttribute('aria-current'); }
    });

    var strong = Lab.strengths(p, 3).map(function (s) {
      var w = (s.value / Lab.maxOf(s.stat.key) * 100).toFixed(0);
      return '<li><div class="str-top"><b>' + s.stat.label + '</b><span>' + Lab.fmt(s.stat, s.value) + ' · ' + Lab.rankText(s.rank) + '</span></div>' +
             '<div class="track"><i class="you" style="width:' + w + '%"></i></div></li>';
    }).join('');
    var weak = Lab.weakest(p);
    var chips = STATS.map(function (s) {
      return '<div class="chip"><span>' + s.label + '</span><b>' + Lab.fmt(s, p.s[s.key]) + '</b></div>';
    }).join('');
    var honors = Lab.honors(p);
    var honorsHtml = honors.length
      ? '<h4>' + T('主な実績', 'Career highlights') + '</h4><ul class="honors">' + honors.map(function (h) { return '<li>' + h + '</li>'; }).join('') + '</ul>'
      : '<h4>' + T('今シーズンの位置づけ', 'Where he stands now') + '</h4><p class="note">' + T('ESPNの2026年ランキングで', 'ESPN\'s 2026 ranking puts him at ') + '#' + p.rank + T('位。', '.') + '</p>';

    $('labProfile').innerHTML =
      '<header class="prof-head"><div class="prof-fig">' + art(p.id) + '</div><div><span class="tag">' + st.name + '</span><h3>' + p.name + '</h3><p class="sub">' + Lab.sub(p) + '</p></div>' +
      '<div class="prof-score"><span>' + T('いちばんの強み', 'Top strength') + '</span><b>' + Lab.best(p).value + '</b><em>' + Lab.best(p).name + '</em></div></header>' +
      '<div class="prof-body">' +
        '<div class="prof-radar">' + Lab.radar([{ cls: 'you', vals: Lab.ratings(p) }]) + '</div>' +
        '<div class="prof-info">' +
          '<p class="prof-style">' + st.text + '</p>' +
          '<h4>' + T('得意なこと', 'What he is best at') + '</h4><ul class="strengths">' + strong + '</ul>' +
          '<p class="note prof-weak">' + T('いちばん控えめなのは', 'Least strong: ') + '<b>' + weak.stat.label + '</b>' + T('（', ' (') + Lab.fmt(weak.stat, weak.value) + T('・', ', ') + Lab.rankText(weak.rank) + T('）。', ').') + '</p>' +
          '<div class="chips">' + chips + '</div>' +
          honorsHtml +
          '<p class="note">' + p.note + '</p>' +
        '</div>' +
      '</div>' +
      '<footer class="prof-cta">' +
        '<a class="btn btn--primary" href="build-player.html?target=' + p.id + '">' + T('この選手を目標にする', 'Make him my target') + ' →</a>' +
        '<a class="btn" href="compare.html?a=' + p.id + '">' + T('他の選手と比べる', 'Compare with someone') + ' →</a>' +
      '</footer>';
    $('labProfile').scrollTop = 0;
  }

  buildList();
  show(current);
})();
