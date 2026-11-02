/* ==========================================================
   Japanese / English
   The pages are written in Japanese. When English is chosen,
   this file swaps every known piece of text (and the aria-label,
   placeholder, alt and title attributes) for its English version.
   Scripts use T(ja, en) for text they build themselves, and
   tr(ja) for names and notes that are looked up from this list.
   The choice is saved, and the page reloads when it changes.
   ========================================================== */
(function () {
  'use strict';

  var lang = 'ja';
  try {
    var q = /[?&]lang=(ja|en)\b/.exec(window.location.search);
    if (q) { window.localStorage.setItem('range-lang', q[1]); }
    lang = window.localStorage.getItem('range-lang') || 'ja';
  } catch (e) { /* no storage: stay in Japanese */ }
  if (lang !== 'en') { lang = 'ja'; }

  var EN = {
    /* ----- menu, pager ----- */
    'ホーム': 'Home', 'ショットマップ': 'Shot Map', 'アリーナ': 'Arenas', '記録の夜': 'Record Night',
    '選手を作る': 'Build a Player', 'シュート練習': 'Shoot Practice',
    'ページ移動': 'Page navigation', '前のページ': 'Previous', '次のページ': 'Next',
    'スポーツウェブサイト | バスケットボール | Range': 'Sports Website | Basketball | Range',

    /* ----- home ----- */
    'シュート研究': 'A SHOOTING STUDY',
    'シーズン別の3ポイント': 'Three-pointers by season',
    'NBA全30チームの本拠地': 'Home courts of all 30 NBA teams',
    '2,974本目 · レイ・アレンを抜いた一本': 'No. 2,974 · Passed Ray Allen',
    '2,974本目の3ポイントを決めるステフィン・カリー': 'Stephen Curry hitting his 2,974th three-pointer',
    '自分に近いNBA選手を探す': 'Find the NBA player closest to you',
    '緑で離して、3ポイントを決める': 'Release on green, hit the three',
    '世界最高のシューター、ステフィン・カリーを研究して、シュートを上達させよう。': 'Get better at shooting by studying the best shooter in the game, Stephen Curry.',
    'ボールをクリックしてメニューを開く': 'Click the ball to open the menu',
    'ボールをクリック！': 'Click the ball!',

    /* ----- arenas ----- */
    'すべての本拠地。大きな夜は3つ。': 'Every home court. Three big nights.',
    '30チーム、地図上には28か所。赤い地点には、すでに記録された試合があります。ほかはゲームログのデータ待ちです。': '30 teams, 28 spots on the map. Red spots have a game on record; the rest are waiting on game-log data.',
    'ニューヨーク · 2021年12月': 'New York · Dec 2021',
    'オクラホマシティ · 2016年2月': 'Oklahoma City · Feb 2016',
    'ベイエリア · 2016年11月': 'Bay Area · Nov 2016',
    'この地点の試合は、まだ読み込まれていません。ゲームログが入りしだい、ここでの最高の一夜がこのカードに表示されます。': 'No game from this spot has been loaded yet. Once the game log is in, the best night here will show on this card.',
    '地図は簡略化した輪郭です。ピンは都市の位置にあり、アリーナの正確な場所ではありません。トロントは輪郭のすぐ北にあります。': 'The map is a simplified outline. Pins mark city locations, not exact arena sites. Toronto sits just north of the outline.',
    '記録された試合あり': 'Game on record', 'データ待ち': 'Waiting for data',
    '2021年12月14日': 'December 14, 2021', 'ウォリアーズ 105、ニックス 96': 'Warriors 105, Knicks 96',
    '通算2,974本目の3ポイントで、歴代記録を更新した。': 'His 2,974th career three broke the all-time record.',
    '第1クォーター残り7分33秒、右ウイングからの一本。レイ・アレンとレジー・ミラーが会場に来ていた。': 'From the right wing with 7:33 left in the first quarter. Ray Allen and Reggie Miller were in the building.',
    '2016年2月27日': 'February 27, 2016', 'ウォリアーズ 121、サンダー 118（延長）': 'Warriors 121, Thunder 118 (OT)',
    '46得点、12本の3ポイント、そして32フィート（約9.8メートル）の決勝弾。': '46 points, 12 threes, and a 32-foot (about 9.8 m) game-winner.',
    '12本はNBAの1試合記録に並んだ。この夜は自身のシーズン記録も更新し、288本に到達した。': 'The 12 tied the NBA single-game record. That night he also set his own season record, reaching 288.',
    '2016年11月7日': 'November 7, 2016', 'ウォリアーズ 116、ペリカンズ 106': 'Warriors 116, Pelicans 106',
    '46得点。17本中13本の3ポイントを決めた。': '46 points. He made 13 of 17 threes.',
    'NBAの1試合記録。コービー・ブライアントやドニエル・マーシャルと分け合っていた12本を超えた。': 'An NBA single-game record, passing the 12 he had shared with Kobe Bryant and Donyell Marshall.',

    /* teams and cities */
    'アトランタ・ホークス': 'Atlanta Hawks', 'アトランタ': 'Atlanta', 'ボストン・セルティックス': 'Boston Celtics', 'ボストン': 'Boston',
    'シャーロット・ホーネッツ': 'Charlotte Hornets', 'シャーロット': 'Charlotte', 'シカゴ・ブルズ': 'Chicago Bulls', 'シカゴ': 'Chicago',
    'クリーブランド・キャバリアーズ': 'Cleveland Cavaliers', 'クリーブランド': 'Cleveland', 'ダラス・マーベリックス': 'Dallas Mavericks', 'ダラス': 'Dallas',
    'デンバー・ナゲッツ': 'Denver Nuggets', 'デンバー': 'Denver', 'デトロイト・ピストンズ': 'Detroit Pistons', 'デトロイト': 'Detroit',
    'ゴールデンステイト・ウォリアーズ': 'Golden State Warriors', 'ベイエリア · 本拠地': 'Bay Area · Home', 'ヒューストン・ロケッツ': 'Houston Rockets', 'ヒューストン': 'Houston',
    'インディアナ・ペイサーズ': 'Indiana Pacers', 'インディアナポリス': 'Indianapolis', 'レイカーズとクリッパーズ': 'Lakers and Clippers', 'ロサンゼルス': 'Los Angeles',
    'メンフィス・グリズリーズ': 'Memphis Grizzlies', 'メンフィス': 'Memphis', 'マイアミ・ヒート': 'Miami Heat', 'マイアミ': 'Miami',
    'ミルウォーキー・バックス': 'Milwaukee Bucks', 'ミルウォーキー': 'Milwaukee', 'ミネソタ・ティンバーウルブズ': 'Minnesota Timberwolves', 'ミネアポリス': 'Minneapolis',
    'ニューオーリンズ・ペリカンズ': 'New Orleans Pelicans', 'ニューオーリンズ': 'New Orleans', 'ニックスとネッツ': 'Knicks and Nets', 'ニューヨーク': 'New York',
    'オクラホマシティ・サンダー': 'Oklahoma City Thunder', 'オクラホマシティ': 'Oklahoma City', 'オーランド・マジック': 'Orlando Magic', 'オーランド': 'Orlando',
    'フィラデルフィア・セブンティシクサーズ': 'Philadelphia 76ers', 'フィラデルフィア': 'Philadelphia', 'フェニックス・サンズ': 'Phoenix Suns', 'フェニックス': 'Phoenix',
    'ポートランド・トレイルブレイザーズ': 'Portland Trail Blazers', 'ポートランド': 'Portland', 'サクラメント・キングス': 'Sacramento Kings', 'サクラメント': 'Sacramento',
    'サンアントニオ・スパーズ': 'San Antonio Spurs', 'サンアントニオ': 'San Antonio', 'トロント・ラプターズ': 'Toronto Raptors', 'トロント': 'Toronto',
    'ユタ・ジャズ': 'Utah Jazz', 'ソルトレイクシティ': 'Salt Lake City', 'ワシントン・ウィザーズ': 'Washington Wizards', 'ワシントンD.C.': 'Washington, D.C.',
    'ロサンゼルス・レイカーズ': 'Los Angeles Lakers', 'ニューヨーク・ニックス': 'New York Knicks',

    /* ----- build a player ----- */
    'あなたはどのNBA選手に近い？': 'Which NBA player are you closest to?',
    '自分の数字を入力して、今のトップ10や歴代の名選手と比べましょう。差がどこにあるかを確認して、練習のペース配分も作れます。': "Enter your numbers and compare yourself with today's top 10 and the all-time greats. See where the gaps are, and build a pacing plan for practice.",
    'ステップ': 'Steps',
    '1 あなたの数字': '1 Your numbers', '2 比べる相手': '2 Compare with', '3 結果': '3 Results', '4 選手ファイル': '4 Player file', '5 プラン': '5 Plan',
    '戻る': 'Back', '次へ': 'Next',
    '身長と体重に合わせて変わるスティックマン': 'Stick figure that changes with height and weight',
    '1. あなたの数字': '1. Your numbers',
    '身長・体重・ウイングスパンを動かすと、左のスティックマンが変わります。成績はチームや草バスケでの平均を使ってください。': 'Move height, weight and wingspan and the stick figure on the left changes. For your stats, use your averages with your team or in pickup games.',
    'あなたの名前': 'Your name', 'あなた': 'You',
    '2. 比べる相手': '2. Compare with', '今：ESPNトップ10': 'Now: ESPN Top 10', '歴代の名選手': 'All-time greats',
    'あなたの6つの評価と選んだ選手を比べたレーダーチャート': 'Radar chart comparing your six ratings with the chosen player',
    '得点': 'Points', 'シュート': 'Shooting', 'プレーメイク': 'Playmaking', 'リバウンド': 'Rebounding', 'ディフェンス': 'Defense', '効率': 'Efficiency',
    '評価は、1試合あたりの成績から作った0〜99の独自の簡易式によるものです。比較のための目安です。': 'Ratings come from a simple 0–99 formula of my own, built from per-game stats. Treat them as a rough guide for comparison.',
    'あなたに近いNBA選手': 'NBA players closest to you',
    '選手ファイル': 'Player file', '成績': 'Stats', 'シュート内訳': 'Shooting splits',
    '6つの評価の最高': 'Best of the six ratings', '6つの評価の最低': 'Lowest of the six ratings',
    '5. あなたのプラン': '5. Your plan',
    '自分の弱点と挑戦したい目標を書いてください。下のプランは、あなたの言葉と上の差をもとに作られます。': 'Write down your weakness and the goal you want to chase. The plan below is built from your words and the gaps above.',
    '私の一番の弱点': 'My biggest weakness', '例：疲れてくるとフリースローを外す。': 'e.g. I miss free throws when I get tired.',
    '私の挑戦目標': 'My challenge goal', '例：春までにフリースロー成功率を80%にする。': 'e.g. Get my free-throw percentage to 80% by spring.',
    'あなたの言葉': 'Your words', '弱点：': 'Weakness:', '挑戦目標：': 'Goal:',
    '12週間のペース配分の目安': '12-week pacing guide',
    '3週間ごとに、差の4分の1ずつ縮めていく想定です。実際の上達は練習、年齢、体格によって変わります。約束ではなく、目安として見てください。': 'Assumes closing a quarter of the gap every 3 weeks. Real progress depends on practice, age and build. Treat it as a guide, not a promise.',
    '項目': 'Item', '現在': 'Now', '3週目': 'Week 3', '6週目': 'Week 6', '9週目': 'Week 9', '12週目': 'Week 12',
    '身長': 'Height', '体重': 'Weight', 'ウイングスパン': 'Wingspan',

    /* ----- stats and practice tips ----- */
    '1試合の得点': 'Points per game', 'フィールドゴール成功率': 'Field goal %', '3ポイント成功率': '3-point %', 'フリースロー成功率': 'Free throw %',
    '1試合のリバウンド': 'Rebounds per game', '1試合のアシスト': 'Assists per game', '1試合のスティール': 'Steals per game', '1試合のブロック': 'Blocks per game',
    '得意な位置に入る練習を。3か所で、ドリブルからの試合スピードのシュートを50本打ち、そのあとリングまで両手でフィニッシュしましょう。': 'Practice getting to your spots. From three spots, take 50 game-speed shots off the dribble, then finish at the rim with both hands.',
    'シュート選びが一番大切です。2週間、場所ごとの成功数を記録して、一番よく決まる場所からの本数を増やしましょう。': 'Shot selection matters most. For two weeks, log makes by spot, then take more shots from the spots where you shoot best.',
    'フォームと本数が大切です。キャッチ&シュートの3ポイントを週3日、100本ずつ打ち、場所ごとに成功数を記録しましょう。': 'Form and volume matter. Shoot 100 catch-and-shoot threes, three days a week, and log makes by spot.',
    '毎回の練習の最後に、走ったあとのフリースローを50本。毎回同じルーティンで打ちましょう。': 'End every practice with 50 free throws after running. Use the same routine every time.',
    'ドリルのすべてのシュートでボックスアウトし、リングから跳ねるボールを追いましょう。ボールには両手で向かいます。': 'Box out on every shot in your drills and chase the ball off the rim. Go after it with both hands.',
    'ピック&ロールの読みを磨きましょう。ヘルプが来る前にパスを出し、左右どちらの手のパスも練習します。': 'Sharpen your pick-and-roll reads. Pass before the help arrives, and practice passing with either hand.',
    'ディフェンスのスライドと先読みを練習しましょう。ボールを持つ相手のクセを観察し、低い構えを保ちます。': 'Practice defensive slides and anticipation. Watch the ball handler\'s habits and stay low.',
    'タイミングと垂直跳びが大切です。パートナー相手に、ファウルをせずまっすぐ跳んでシュートに手を出す練習をしましょう。': 'Timing and vertical jump matter. With a partner, practice jumping straight up and contesting the shot without fouling.',
    '2025-26レギュラーシーズンの1試合平均。': '2025-26 regular season per-game averages.',

    /* players */
    'ニコラ・ヨキッチ': 'Nikola Jokić', 'ビクター・ウェンバンヤマ': 'Victor Wembanyama', 'シェイ・ギルジャス＝アレクサンダー': 'Shai Gilgeous-Alexander',
    'ルカ・ドンチッチ': 'Luka Dončić', 'ヤニス・アデトクンボ': 'Giannis Antetokounmpo', 'ジェイレン・ブランソン': 'Jalen Brunson',
    'アンソニー・エドワーズ': 'Anthony Edwards', 'ケイド・カニングハム': 'Cade Cunningham', 'ジェイソン・テイタム': 'Jayson Tatum', 'ドノバン・ミッチェル': 'Donovan Mitchell',
    'マイケル・ジョーダン': 'Michael Jordan', 'レブロン・ジェームズ': 'LeBron James', 'カリーム・アブドゥル＝ジャバー': 'Kareem Abdul-Jabbar',
    'マジック・ジョンソン': 'Magic Johnson', 'ラリー・バード': 'Larry Bird', 'コービー・ブライアント': 'Kobe Bryant', 'ティム・ダンカン': 'Tim Duncan',
    'シャキール・オニール': "Shaquille O'Neal", 'ハキーム・オラジュワン': 'Hakeem Olajuwon', 'ステフィン・カリー': 'Stephen Curry',
    'キャリア通算のレギュラーシーズン1試合平均（1,072試合）。': 'Career regular-season per-game averages (1,072 games).',
    'キャリア通算のレギュラーシーズン1試合平均（1,622試合、2025-26シーズンまで）。': 'Career regular-season per-game averages (1,622 games, through 2025-26).',
    'キャリア通算の1試合平均（1,560試合）。スティールとブロックは1973-74シーズンより前は記録されていないため、この2項目は記録のあるシーズンのみの平均です。': 'Career per-game averages (1,560 games). Steals and blocks were not recorded before 1973-74, so those two stats average only the seasons on record.',
    'キャリア通算のレギュラーシーズン1試合平均（906試合）。': 'Career regular-season per-game averages (906 games).',
    'キャリア通算のレギュラーシーズン1試合平均（897試合）。': 'Career regular-season per-game averages (897 games).',
    'キャリア通算のレギュラーシーズン1試合平均（1,346試合）。': 'Career regular-season per-game averages (1,346 games).',
    'キャリア通算のレギュラーシーズン1試合平均（1,392試合）。': 'Career regular-season per-game averages (1,392 games).',
    'キャリア通算のレギュラーシーズン1試合平均（1,207試合）。': 'Career regular-season per-game averages (1,207 games).',
    'キャリア通算のレギュラーシーズン1試合平均（1,238試合）。': 'Career regular-season per-game averages (1,238 games).',
    'キャリア通算のレギュラーシーズン1試合平均（1,069試合、2025-26シーズンまで）。': 'Career regular-season per-game averages (1,069 games, through 2025-26).',
    '36試合のみ。このシーズンはミルウォーキーでプレーした。': 'Only 36 games. He played for Milwaukee that season.',
    '16試合のみのため、サンプルは小さめ。': 'Only 16 games, so the sample is small.',

    /* ----- record night ----- */
    'レイ・アレンを抜いた夜。': 'The night he passed Ray Allen.',
    '2021年12月14日、マディソン・スクエア・ガーデン。3ポイントの歴代記録を決めた瞬間を、順にたどります。': 'December 14, 2021, Madison Square Garden. Step through the moment he took the all-time three-point record.',
    '試合開始前': 'Before tip-off', 'あと2本。': 'Two to go.',
    'レイ・アレンの通算記録は2,973本。カリーが抜くには、あと2本が必要です。': "Ray Allen's career total is 2,973. Curry needs two more to pass him.",
    '第1クォーター': 'First quarter', '最初の1本で並ぶ。': 'The first one ties it.',
    'この夜1本目の3ポイントで、アレンの2,973本に並んだ。': "His first three of the night tied Allen's 2,973.",
    '第1クォーター · 残り7:33': 'First quarter · 7:33 left', '記録は彼のものに。': 'The record is his.',
    '右ウイングから放った通算2,974本目の3ポイントで、記録を更新。スティーブ・カー監督は、祝福の時間をつくるためにタイムアウトを取った。': 'His 2,974th career three, from the right wing, broke the record. Coach Steve Kerr called a timeout to make room for the celebration.',
    'タイムアウト': 'Timeout', 'アレンが会場に。': 'Allen is in the building.',
    'アレンとレジー・ミラーが、2,974と書かれたジャージーをカリーに贈った。カリーはアレンや両親、チームメートと抱き合った。ウォリアーズは105対96で勝利。': 'Allen and Reggie Miller presented Curry with a jersey reading 2,974. Curry hugged Allen, his parents and his teammates. The Warriors won 105–96.',
    'カリーの通算3ポイント': "Curry's career threes", 'アレン：2,973': 'Allen: 2,973',
    '真上から見たハーフコート。ゴールは上側': 'Half court seen from above. The basket is at the top',
    '右ウイング': 'Right wing',
    'カリーは、記録まであと2本の状態で試合に入った。': 'Curry came into the game two threes short of the record.',
    'このシュートの正確な位置は、ここには表示していません。': 'The exact spot of this shot is not shown here.',
    '記録を更新する3ポイント。右ウイングから。': 'The record-breaking three. From the right wing.',
    '最終スコア：ウォリアーズ 105、ニックス 96。': 'Final score: Warriors 105, Knicks 96.',

    /* ----- shoot practice ----- */
    '成功': 'Makes', '成功率': 'Make %', 'グリーン': 'Greens', '連続': 'Streak', 'ベスト連続': 'Best streak',
    '難易度': 'Difficulty', 'イージー': 'Easy', 'ノーマル': 'Normal', 'ハード': 'Hard', 'リセット': 'Reset',
    '遊び方': 'How to play',
    '自分で打って、緑で決める。': 'Shoot it yourself. Hit it on green.',
    'スペースキー（または下のSHOOTボタン）を押し続けると、シュートの動きとメーターが進みます。メーターの': 'Hold Space (or the SHOOT button below) and the shooting motion and the meter advance. Release in the ',
    '緑': 'green',
    'のところで離すと、ボールはリングに吸い込まれます。早すぎても遅すぎても外れます。カリーのように、毎回同じタイミングで離しましょう。': ' zone and the ball is pulled into the rim. Too early or too late and you miss. Release at the same timing every time, like Curry.',
    '押し続けて、緑で離す': 'Hold, release on green',
    'グリーン！': 'GREEN!', 'ちょっと早い': 'A bit early', 'ちょっと遅い': 'A bit late', '早すぎ！': 'Too early!', '遅すぎ！': 'Too late!',
    'リムイン！': 'Rim in!', 'ギリギリ入った': 'Just made it', 'リムアウト': 'Rim out', 'リングに嫌われた': 'The rim said no',

    /* ----- shot map ----- */
    '3ポイントラインが埋まっていく。': 'The three-point line fills in.',
    'シーズンを選ぶか、再生を押してください。点ひとつが、その年の平均的な1試合での3ポイント1本です。赤い点は成功を表します。': "Pick a season or press play. Each dot is one three-pointer in that year's average game. Red dots are makes.",
    '1試合の3ポイント成功数': '3PM per game', '1試合の試投数': '3PA per game',
    'シーズンを順に再生': 'Play through the seasons', '一時停止': 'Pause',
    '点の数は実際の1試合平均（四捨五入）にもとづいています。点の位置はレイアウトのためのもので、実際のシュート位置ではありません。実際の位置は今後追加します。': 'The number of dots is based on the real per-game averages (rounded). Dot positions are for layout only, not actual shot locations. Real locations will be added later.',
    '1試合あたりの3ポイント試投数': 'Three-point attempts per game',
    'シーズンをタップしてください。各バーの明るい部分が成功数です。': 'Tap a season. The bright part of each bar is makes.',
    'シーズンのラベルは、開幕した年を示します。': 'Season labels show the year the season began.',
    'このデータで最初のシーズン：1試合4.8本の試投。': 'First season in this data: 4.8 attempts per game.',
    'このシーズンは26試合に出場。': 'He played 26 games this season.',
    'このシーズンは5試合に出場。': 'He played 5 games this season.',
    '2016年2月27日、オクラホマシティで12本の3ポイントを決め、延長戦では32フィート（約9.8メートル）の決勝弾も沈めた。': 'On February 27, 2016 in Oklahoma City he hit 12 threes, including a 32-foot (about 9.8 m) game-winner in overtime.',
    '2016年11月7日、ペリカンズ戦でNBA記録となる13本の3ポイントを成功させた。': 'On November 7, 2016 he made 13 threes against the Pelicans, an NBA record.',
    '2021年12月14日、通算2,974本目の3ポイントでレイ・アレンを抜いた。': 'On December 14, 2021 his 2,974th career three passed Ray Allen.'
  };

  /* title attribute and friends are translated too */
  var ATTRS = ['aria-label', 'placeholder', 'alt', 'title'];

  function tr(ja) {
    if (lang !== 'en' || typeof ja !== 'string') { return ja; }
    return Object.prototype.hasOwnProperty.call(EN, ja) ? EN[ja] : ja;
  }
  function T(ja, en) { return lang === 'en' ? en : ja; }

  function swapNodes() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) {
      var p = n.parentNode && n.parentNode.nodeName;
      if (p === 'SCRIPT' || p === 'STYLE') { continue; }
      nodes.push(n);
    }
    nodes.forEach(function (node) {
      var v = node.nodeValue, core = v.trim();
      if (core && Object.prototype.hasOwnProperty.call(EN, core)) {
        var lead = v.slice(0, v.indexOf(core)), trail = v.slice(v.indexOf(core) + core.length);
        node.nodeValue = lead + EN[core] + trail;
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll('*'), function (el) {
      ATTRS.forEach(function (a) {
        var v = el.getAttribute(a);
        if (v && Object.prototype.hasOwnProperty.call(EN, v.trim())) { el.setAttribute(a, EN[v.trim()]); }
      });
    });
    var t = document.title;
    if (Object.prototype.hasOwnProperty.call(EN, t)) { document.title = EN[t]; }
    else {
      var parts = t.split(' | ');
      document.title = parts.map(function (s) { return tr(s); }).join(' | ');
    }
  }

  window.RANGE_LANG = lang;
  window.T = T;
  window.tr = tr;
  window.setLang = function (l) {
    try { window.localStorage.setItem('range-lang', l); } catch (e) { /* ignore */ }
    window.location.reload();
  };

  document.documentElement.setAttribute('lang', lang);
  if (lang === 'en') {
    document.documentElement.classList.add('is-en');
    swapNodes();
  }
})();
