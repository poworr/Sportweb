/* ==========================================================
   Head-to-head page
   Pick two players: the radar charts sit on top of each other
   and every stat gets a row. Needs lab.js and player-data.js.
   ========================================================== */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var a = Lab.find(Lab.param('a')) ? Lab.param('a') : 'jordan';
  var b = Lab.find(Lab.param('b')) ? Lab.param('b') : (a === 'lebron' ? 'jordan' : 'lebron');

  function fill(sel, value) {
    sel.innerHTML = '';
    [['all', T('歴代の名選手', 'All-time greats')], ['now', T('今のトップ10', 'Today\'s top 10')]].forEach(function (g) {
      var og = document.createElement('optgroup');
      og.label = g[1];
      PLAYERS.filter(function (p) { return p.group === g[0]; }).forEach(function (p) {
        var o = document.createElement('option');
        o.value = p.id; o.textContent = p.name;
        og.appendChild(o);
      });
      sel.appendChild(og);
    });
    sel.value = value;
  }

  function render() {
    var pa = Lab.find(a), pb = Lab.find(b);
    $('cmpRadar').innerHTML = Lab.radar([{ cls: 'them', vals: Lab.ratings(pb) }, { cls: 'you', vals: Lab.ratings(pa) }]);
    $('legA').textContent = pa.name;
    $('legB').textContent = pb.name;

    var winsA = 0, winsB = 0, bestA = null, bestB = null;
    var rows = STATS.map(function (s) {
      var va = pa.s[s.key], vb = pb.s[s.key], max = Math.max(va, vb, 0.1);
      var lead = Math.abs(va - vb) < 0.05 ? 0 : va > vb ? 1 : -1;
      if (lead > 0) { winsA++; } else if (lead < 0) { winsB++; }
      var gap = max > 0 ? Math.abs(va - vb) / max : 0;
      if (lead > 0 && (!bestA || gap > bestA.gap)) { bestA = { s: s, gap: gap }; }
      if (lead < 0 && (!bestB || gap > bestB.gap)) { bestB = { s: s, gap: gap }; }
      return '<div class="cmp-row"><span class="cmp-val cmp-a' + (lead > 0 ? ' is-lead' : '') + '">' + Lab.fmt(s, va) + '</span>' +
        '<div class="cmp-mid"><span class="cmp-label">' + s.label + '</span>' +
        '<div class="track"><i class="you" style="width:' + (va / max * 100).toFixed(1) + '%"></i></div>' +
        '<div class="track"><i class="them" style="width:' + (vb / max * 100).toFixed(1) + '%"></i></div></div>' +
        '<span class="cmp-val cmp-b' + (lead < 0 ? ' is-lead' : '') + '">' + Lab.fmt(s, vb) + '</span></div>';
    }).join('');
    $('cmpRows').innerHTML = rows;

        var verdict;
    if (pa.id === pb.id) {
      verdict = T('同じ選手を選んでいます。別の選手を選んでみましょう。', 'You picked the same player twice. Try someone else.');
    } else {
      verdict = T(
        pa.name + 'は8項目中' + winsA + '項目、' + pb.name + 'は' + winsB + '項目でリード。' +
          (bestA ? pa.name + 'の強みは「' + bestA.s.label + '」。' : '') + (bestB ? pb.name + 'の強みは「' + bestB.s.label + '」。' : ''),
        pa.name + ' leads in ' + winsA + ' of 8 stats, ' + pb.name + ' in ' + winsB + '. ' +
          (bestA ? pa.name + '\'s edge: ' + bestA.s.label + '. ' : '') + (bestB ? pb.name + '\'s edge: ' + bestB.s.label + '.' : ''));
    }
    $('cmpVerdict').textContent = verdict;
    $('cmpScoreA').textContent = Lab.best(pa).value + ' ' + Lab.best(pa).name;
    $('cmpScoreB').textContent = Lab.best(pb).value + ' ' + Lab.best(pb).name;
    $('cmpNameA').textContent = pa.name;
    $('cmpNameB').textContent = pb.name;
    $('cmpStyleA').textContent = Lab.style(pa).name;
    $('cmpStyleB').textContent = Lab.style(pb).name;
    $('cmpLinkA').href = 'players.html?p=' + pa.id;
    $('cmpLinkB').href = 'players.html?p=' + pb.id;
    $('cmpTarget').href = 'build-player.html?target=' + pb.id;
  }

  fill($('cmpA'), a);
  fill($('cmpB'), b);
  $('cmpA').addEventListener('change', function () { a = this.value; render(); });
  $('cmpB').addEventListener('change', function () { b = this.value; render(); });
  $('cmpSwap').addEventListener('click', function () { var t = a; a = b; b = t; $('cmpA').value = a; $('cmpB').value = b; render(); });
  render();
})();
