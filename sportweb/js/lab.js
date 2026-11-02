/* ==========================================================
   Player Lab helpers (used by players.js and compare.js)
   Ratings, ranks inside the group of 20 players, play style,
   honours of the legends, and the radar chart.
   Needs i18n.js and player-data.js.
   ========================================================== */
var Lab = (function () {
  'use strict';

  /* honours of the legends (well-known career facts) */
  var HONORS = {
    jordan: { ja: ['NBA優勝6回（ファイナルMVP 6回）', 'シーズンMVP 5回', '得点王10回', '守備年間最優秀選手（1988年）'],
              en: ['6 NBA titles (6 Finals MVPs)', '5 MVP awards', '10 scoring titles', '1988 Defensive Player of the Year'] },
    lebron: { ja: ['NBA優勝4回（ファイナルMVP 4回）', 'シーズンMVP 4回', '歴代最多得点（2023年にカリーム・アブドゥル＝ジャバーを抜く）'],
              en: ['4 NBA titles (4 Finals MVPs)', '4 MVP awards', 'All-time leading scorer (passed Kareem Abdul-Jabbar in 2023)'] },
    curry: { ja: ['NBA優勝4回', 'シーズンMVP 2回（2回目は史上初の満票）', '3ポイント成功数 歴代1位', 'ファイナルMVP（2022年）'],
             en: ['4 NBA titles', '2 MVP awards (the second was the first unanimous vote ever)', 'Most three-pointers made in NBA history', '2022 Finals MVP'] },
    kareem: { ja: ['NBA優勝6回', 'シーズンMVP 6回（史上最多）', 'スカイフックで有名', 'オールスター19回'],
              en: ['6 NBA titles', '6 MVP awards (the most ever)', 'Famous for the skyhook', '19 All-Star selections'] },
    magic: { ja: ['NBA優勝5回', 'シーズンMVP 3回', 'ファイナルMVP 3回', '1試合平均アシストは歴代1位'],
             en: ['5 NBA titles', '3 MVP awards', '3 Finals MVPs', 'Highest career assists per game in NBA history'] },
    bird: { ja: ['NBA優勝3回', 'シーズンMVP 3年連続（1984〜86年）', 'オールスター12回'],
            en: ['3 NBA titles', '3 straight MVP awards (1984–86)', '12 All-Star selections'] },
    kobe: { ja: ['NBA優勝5回', 'シーズンMVP 1回（2008年）', '1試合81得点', 'オールスター18回'],
            en: ['5 NBA titles', '2008 MVP', '81 points in one game', '18 All-Star selections'] },
    duncan: { ja: ['NBA優勝5回', 'シーズンMVP 2回', 'ファイナルMVP 3回', 'オールスター15回'],
              en: ['5 NBA titles', '2 MVP awards', '3 Finals MVPs', '15 All-Star selections'] },
    shaq: { ja: ['NBA優勝4回', 'シーズンMVP 1回（2000年）', 'ファイナルMVP 3回', 'オールスター15回'],
            en: ['4 NBA titles', '2000 MVP', '3 Finals MVPs', '15 All-Star selections'] },
    hakeem: { ja: ['NBA優勝2回', 'シーズンMVP 1回（1994年）', '守備年間最優秀選手 2回', '通算ブロック3,830本'],
              en: ['2 NBA titles', '1994 MVP', '2 Defensive Player of the Year awards', '3,830 career blocks'] }
  };

  /* play style = the highest of the six ratings */
  var STYLES = [
    { ja: 'スコアラー型', en: 'Scorer', jaD: 'とにかく点を取る。得点力がいちばんの武器。', enD: 'Puts the ball in the basket. Scoring is the biggest weapon.' },
    { ja: 'シャープシューター型', en: 'Sharpshooter', jaD: 'シュートの精度がいちばんの武器。外からも決める。', enD: 'Shooting accuracy is the biggest weapon, from the outside too.' },
    { ja: 'プレーメーカー型', en: 'Playmaker', jaD: 'パスで味方を活かす司令塔。', enD: 'A floor general who makes teammates better with passes.' },
    { ja: 'リバウンダー型', en: 'Rebounder', jaD: 'ゴール下を支配する。', enD: 'Controls the paint and the boards.' },
    { ja: 'ディフェンダー型', en: 'Defender', jaD: 'スティールとブロックで試合を変える。', enD: 'Changes games with steals and blocks.' },
    { ja: 'フィニッシャー型', en: 'Finisher', jaD: '高い成功率で確実に決める、効率型。', enD: 'An efficient scorer who finishes at a very high percentage.' }
  ];

  function cap(v) { return Math.max(0, Math.min(99, v)); }
  function ratings(p) { return rate(p.s).map(cap); }
  function overall(p) { var r = ratings(p), s = 0; r.forEach(function (v) { s += v; }); return s / r.length; }

  function style(p) {
    var r = ratings(p), hi = 0;
    r.forEach(function (v, i) { if (v > r[hi]) { hi = i; } });
    return { index: hi, name: T(STYLES[hi].ja, STYLES[hi].en), text: T(STYLES[hi].jaD, STYLES[hi].enD) };
  }

  /* rank (1 = best) of a player in one stat among all players */
  function rank(p, key) {
    var v = p.s[key], better = 0;
    PLAYERS.forEach(function (q) { if (q.s[key] > v) { better++; } });
    return better + 1;
  }
  function maxOf(key) { var m = 0; PLAYERS.forEach(function (q) { if (q.s[key] > m) { m = q.s[key]; } }); return m; }
  function overallRank(p) {
    var v = overall(p), better = 0;
    PLAYERS.forEach(function (q) { if (overall(q) > v + 1e-9) { better++; } });
    return better + 1;
  }
  /* the player's single highest rating and its name */
  function best(p) {
    var r = ratings(p), hi = 0;
    r.forEach(function (v, i) { if (v > r[hi]) { hi = i; } });
    return { value: Math.round(r[hi]), name: RATING_NAMES[hi] };
  }
  function find(id) { return PLAYERS.filter(function (p) { return p.id === id; })[0]; }
  function fmt(stat, v) { return v.toFixed(1) + (stat.percent ? '%' : ''); }
  function rankText(n) { return T(PLAYERS.length + '人中' + n + '位', '#' + n + ' of ' + PLAYERS.length); }
  function honors(p) { var h = HONORS[p.id]; return h ? (window.RANGE_LANG === 'en' ? h.en : h.ja) : []; }
  function sub(p) {
    return p.group === 'now' ? '#' + p.rank + ' · ' + p.team : T('歴代の名選手 · キャリア平均', 'All-time great · career averages');
  }

  /* strengths: the stats where the player ranks best */
  function strengths(p, n) {
    return STATS.map(function (s) { return { stat: s, rank: rank(p, s.key), value: p.s[s.key] }; })
      .sort(function (a, b) { return a.rank - b.rank || (b.value / maxOf(b.stat.key)) - (a.value / maxOf(a.stat.key)); })
      .slice(0, n);
  }
  function weakest(p) {
    var list = STATS.map(function (s) { return { stat: s, rank: rank(p, s.key), value: p.s[s.key] }; })
      .sort(function (a, b) { return b.rank - a.rank; });
    return list[0];
  }

  /* radar chart as an SVG string. series: [{ cls: 'you' | 'them', vals: [six numbers] }] */
  function radar(series) {
    var cx = 200, cy = 205, R = 140;
    function pt(i, r) { var a = (-90 + 60 * i) * Math.PI / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }
    function poly(r) { var a = []; for (var i = 0; i < 6; i++) { a.push(pt(i, r).map(function (n) { return n.toFixed(1); }).join(',')); } return a.join(' '); }
    var out = '<svg viewBox="-75 0 550 410" role="img" aria-label="' + T('6つの評価のレーダーチャート', 'Radar chart of the six ratings') + '">';
    for (var k = 4; k >= 1; k--) { out += '<polygon class="radar-ring" points="' + poly(R * k / 4) + '"/>'; }
    var axes = '';
    for (var i = 0; i < 6; i++) { var e = pt(i, R); axes += 'M' + cx + ' ' + cy + 'L' + e[0].toFixed(1) + ' ' + e[1].toFixed(1); }
    out += '<path class="radar-ring" d="' + axes + '"/>';
    series.forEach(function (s) {
      var pts = s.vals.map(function (v, j) { return pt(j, R * cap(v) / 100).map(function (n) { return n.toFixed(1); }).join(','); }).join(' ');
      out += '<polygon class="radar-' + s.cls + '" points="' + pts + '"/>';
    });
    var anchors = ['middle', 'start', 'start', 'middle', 'end', 'end'];
    RATING_NAMES.forEach(function (name, j) {
      var p = pt(j, R + 20);
      var y = p[1] + (j === 0 ? -6 : j === 3 ? 14 : 5);
      out += '<text class="radar-label" x="' + p[0].toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="' + anchors[j] + '">' + name + '</text>';
    });
    return out + '</svg>';
  }

  function param(name) {
    var m = new RegExp('[?&]' + name + '=([a-z0-9-]+)').exec(window.location.search);
    return m ? m[1] : '';
  }

  return { ratings: ratings, best: best, style: style, rank: rank, maxOf: maxOf, find: find,
           fmt: fmt, rankText: rankText, honors: honors, sub: sub, strengths: strengths, weakest: weakest, radar: radar, param: param };
})();
