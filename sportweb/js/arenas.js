/* ==========================================================
   Arenas page
   Draws a simplified US map, one stop per city, and shows the
   record game for the stop you pick (3 games so far).
   ========================================================== */
(function () {
  'use strict';

  // Games on record, keyed by team id
  var GAMES = {
    nyk: { date: '2021年12月14日', result: 'ウォリアーズ 105、ニックス 96', line: '通算2,974本目の3ポイントで、歴代記録を更新した。', note: '第1クォーター残り7分33秒、右ウイングからの一本。レイ・アレンとレジー・ミラーが会場に来ていた。' },
    okc: { date: '2016年2月27日', result: 'ウォリアーズ 121、サンダー 118（延長）', line: '46得点、12本の3ポイント、そして32フィート（約9.8メートル）の決勝弾。', note: '12本はNBAの1試合記録に並んだ。この夜は自身のシーズン記録も更新し、288本に到達した。' },
    gsw: { date: '2016年11月7日', result: 'ウォリアーズ 116、ペリカンズ 106', line: '46得点。17本中13本の3ポイントを決めた。', note: 'NBAの1試合記録。コービー・ブライアントやドニエル・マーシャルと分け合っていた12本を超えた。' }
  };

  // [id, name, city, longitude, latitude]
  var TEAMS = [
    ['atl', 'アトランタ・ホークス', 'アトランタ', -84.4, 33.8], ['bos', 'ボストン・セルティックス', 'ボストン', -71.1, 42.4],
    ['cha', 'シャーロット・ホーネッツ', 'シャーロット', -80.8, 35.2], ['chi', 'シカゴ・ブルズ', 'シカゴ', -87.7, 41.9],
    ['cle', 'クリーブランド・キャバリアーズ', 'クリーブランド', -81.2, 41.2], ['dal', 'ダラス・マーベリックス', 'ダラス', -96.8, 32.8],
    ['den', 'デンバー・ナゲッツ', 'デンバー', -105.0, 39.7], ['det', 'デトロイト・ピストンズ', 'デトロイト', -83.1, 42.3],
    ['gsw', 'ゴールデンステイト・ウォリアーズ', 'ベイエリア · 本拠地', -122.8, 37.6], ['hou', 'ヒューストン・ロケッツ', 'ヒューストン', -95.4, 29.8],
    ['ind', 'インディアナ・ペイサーズ', 'インディアナポリス', -86.2, 39.8], ['la', 'レイカーズとクリッパーズ', 'ロサンゼルス', -118.3, 34.0],
    ['mem', 'メンフィス・グリズリーズ', 'メンフィス', -90.0, 35.1], ['mia', 'マイアミ・ヒート', 'マイアミ', -80.2, 25.8],
    ['mil', 'ミルウォーキー・バックス', 'ミルウォーキー', -87.9, 43.4], ['min', 'ミネソタ・ティンバーウルブズ', 'ミネアポリス', -93.3, 45.0],
    ['nop', 'ニューオーリンズ・ペリカンズ', 'ニューオーリンズ', -90.1, 29.95], ['nyk', 'ニックスとネッツ', 'ニューヨーク', -74.0, 40.7],
    ['okc', 'オクラホマシティ・サンダー', 'オクラホマシティ', -97.5, 35.5], ['orl', 'オーランド・マジック', 'オーランド', -81.4, 28.5],
    ['phi', 'フィラデルフィア・セブンティシクサーズ', 'フィラデルフィア', -75.6, 39.6], ['phx', 'フェニックス・サンズ', 'フェニックス', -112.1, 33.4],
    ['por', 'ポートランド・トレイルブレイザーズ', 'ポートランド', -122.7, 45.5], ['sac', 'サクラメント・キングス', 'サクラメント', -120.9, 38.9],
    ['sas', 'サンアントニオ・スパーズ', 'サンアントニオ', -98.5, 29.4], ['tor', 'トロント・ラプターズ', 'トロント', -79.4, 43.7],
    ['uta', 'ユタ・ジャズ', 'ソルトレイクシティ', -111.9, 40.8], ['was', 'ワシントン・ウィザーズ', 'ワシントンD.C.', -77.6, 38.4]
  ];

  // Outline of the lower 48 as [longitude, latitude] points
  var US_OUTLINE = [[-124.7, 48.4], [-123.2, 49.0], [-95.2, 49.0], [-89.6, 48.0], [-84.8, 46.8], [-83.0, 46.0], [-82.4, 43.0], [-83.1, 42.0], [-79.0, 42.8], [-76.5, 43.6], [-75.0, 45.0], [-71.5, 45.0], [-70.0, 46.7], [-67.8, 47.1], [-67.0, 44.8], [-70.2, 43.6], [-70.7, 42.7], [-70.0, 41.8], [-71.8, 41.3], [-73.7, 40.9], [-74.0, 40.5], [-74.0, 39.7], [-75.5, 38.5], [-75.9, 37.2], [-75.6, 35.5], [-77.0, 34.6], [-79.0, 33.5], [-81.0, 32.0], [-81.4, 30.4], [-80.0, 27.0], [-80.2, 25.3], [-81.1, 25.2], [-82.8, 27.8], [-82.7, 29.0], [-84.0, 30.1], [-85.3, 29.7], [-87.5, 30.3], [-89.5, 30.2], [-89.2, 29.1], [-91.5, 29.5], [-93.8, 29.7], [-95.0, 29.2], [-97.2, 27.6], [-97.4, 25.9], [-99.1, 26.4], [-100.7, 29.1], [-101.4, 29.8], [-102.7, 29.7], [-104.5, 29.6], [-106.5, 31.8], [-108.2, 31.8], [-108.2, 31.3], [-111.0, 31.3], [-114.8, 32.5], [-117.1, 32.5], [-118.5, 34.0], [-120.6, 34.5], [-121.9, 36.6], [-122.5, 37.8], [-123.8, 39.5], [-124.4, 40.4], [-124.1, 42.8], [-124.5, 43.8], [-124.0, 46.2]];

  var MAP_W = 1000;
  var MAP_H = 620;
  var selected = 'nyk';

  var $ = function (id) { return document.getElementById(id); };

  /* longitude / latitude -> position on the 1000 x 620 map */
  function project(lon, lat) {
    return [40 + (lon + 125) * 16.6, 40 + (50 - lat) * 21];
  }

  /* ---------- draw the map ---------- */
  $('usOutline').setAttribute('d', 'M' + US_OUTLINE.map(function (p) {
    var xy = project(p[0], p[1]);
    return xy[0].toFixed(1) + ' ' + xy[1].toFixed(1);
  }).join('L') + 'Z');

  var stopsBox = $('stops');
  TEAMS.forEach(function (t) {
    var xy = project(t[3], t[4]);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'stop ' + (GAMES[t[0]] ? 'stop--game' : 'stop--plain');
    btn.dataset.team = t[0];
    btn.setAttribute('aria-label', t[1]);
    btn.style.left = (xy[0] / MAP_W * 100).toFixed(2) + '%';
    btn.style.top = (xy[1] / MAP_H * 100).toFixed(2) + '%';
    btn.addEventListener('click', function () { select(t[0]); });
    stopsBox.appendChild(btn);
  });

  /* ---------- show one team ---------- */
  function select(id) {
    selected = id;
    var team = TEAMS.filter(function (t) { return t[0] === id; })[0];
    var game = GAMES[id];

    $('arenaTag').textContent = game ? '記録された試合あり' : 'データ待ち';
    $('arenaName').textContent = team[1];
    $('arenaWhere').textContent = team[2];
    $('arenaGame').hidden = !game;
    $('arenaEmpty').hidden = !!game;
    if (game) {
      $('arenaDate').textContent = game.date;
      $('arenaResult').textContent = game.result;
      $('arenaLine').textContent = game.line;
      $('arenaNote').textContent = game.note;
    }

    stopsBox.querySelectorAll('.stop').forEach(function (b) {
      b.classList.toggle('is-selected', b.dataset.team === id);
    });
    document.querySelectorAll('.arena-picks .pill').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.team === id);
    });
  }

  document.querySelectorAll('.arena-picks .pill').forEach(function (b) {
    b.addEventListener('click', function () { select(b.dataset.team); });
  });

  select(selected);
})();
