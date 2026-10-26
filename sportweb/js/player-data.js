/* ==========================================================
   Player data and rating formulas (used by build-player.js)
   ========================================================== */

// The eight numbers you enter. Each has a slider range and a drill tip.
var STATS = [
  { key: 'pts', label: 'Points per game', percent: false, min: 0, max: 40, step: 0.5, tip: 'Work on getting to your best spots: take 50 game-speed shots after a dribble from three spots, then finish at the rim with both hands.' },
  { key: 'fg', label: 'Field goal %', percent: true, min: 30, max: 70, step: 0.5, tip: 'Shot selection matters most: log your makes by spot for two weeks, then take more shots from where you shoot best.' },
  { key: 'tp', label: '3-point %', percent: true, min: 0, max: 50, step: 0.5, tip: 'Form and volume: 100 catch-and-shoot threes, three days a week, and log makes by spot.' },
  { key: 'ft', label: 'Free throw %', percent: true, min: 30, max: 100, step: 0.5, tip: 'Finish every practice with 50 free throws after running, using the same routine every time.' },
  { key: 'reb', label: 'Rebounds per game', percent: false, min: 0, max: 16, step: 0.5, tip: 'Box out on every shot in drills and track the ball off the rim. Go to the ball with two hands.' },
  { key: 'ast', label: 'Assists per game', percent: false, min: 0, max: 14, step: 0.5, tip: 'Pick-and-roll reads: make the pass before the help defender arrives, and practice passes with both hands.' },
  { key: 'stl', label: 'Steals per game', percent: false, min: 0, max: 4, step: 0.1, tip: "Defensive slides and anticipation: study the ball handler's habits and stay low in your stance." },
  { key: 'blk', label: 'Blocks per game', percent: false, min: 0, max: 4, step: 0.1, tip: 'Timing and verticality: practice contesting shots with a partner without fouling, going straight up.' }
];

// The six rating axes on the radar chart (clockwise from the top)
var RATING_NAMES = ['Scoring', 'Shooting', 'Playmaking', 'Rebounding', 'Defense', 'Efficiency'];

function clamp100(x) { return Math.max(0, Math.min(100, x)); }

// Turns eight per-game numbers into six 0-99 ratings. Our own simple formulas, for comparison only.
function rate(s) {
  return [
    clamp100(s.pts / 35 * 100),
    (clamp100((s.tp - 20) / 22 * 100) + clamp100((s.ft - 50) / 42 * 100)) / 2,
    clamp100(s.ast / 11 * 100),
    clamp100(s.reb / 13 * 100),
    clamp100((s.stl + s.blk) / 4 * 100),
    clamp100((s.fg - 40) / 20 * 100)
  ];
}

// [id, name, group, rank, team, games, FG%, 3P%, FT%, REB, AST, STL, BLK, PTS, note]
function player(id, name, group, rank, team, games, fg, tp, ft, reb, ast, stl, blk, pts, note) {
  return { id: id, name: name, group: group, rank: rank, team: team, games: games,
           s: { fg: fg, tp: tp, ft: ft, reb: reb, ast: ast, stl: stl, blk: blk, pts: pts }, note: note };
}

var NOW_NOTE = '2025-26 regular season per-game averages. ';
var PLAYERS = [
  // ESPN NBA Rank 2026 top 10 (group "now")
  player('jokic', 'Nikola Jokic', 'now', 1, 'Denver Nuggets', 65, 56.9, 38.0, 83.1, 12.9, 10.7, 1.4, 0.8, 27.7, NOW_NOTE + '65 games.'),
  player('wemby', 'Victor Wembanyama', 'now', 2, 'San Antonio Spurs', 64, 51.2, 34.9, 82.7, 11.5, 3.1, 1.0, 3.1, 25.0, NOW_NOTE + '64 games.'),
  player('sga', 'Shai Gilgeous-Alexander', 'now', 3, 'Oklahoma City Thunder', 68, 55.3, 38.6, 87.9, 4.3, 6.6, 1.4, 0.8, 31.1, NOW_NOTE + '68 games.'),
  player('luka', 'Luka Doncic', 'now', 4, 'Los Angeles Lakers', 64, 47.6, 36.6, 78.0, 7.7, 8.3, 1.6, 0.5, 33.5, NOW_NOTE + '64 games.'),
  player('giannis', 'Giannis Antetokounmpo', 'now', 5, 'Miami Heat', 36, 62.4, 33.3, 65.0, 9.8, 5.4, 0.9, 0.7, 27.6, NOW_NOTE + 'Only 36 games, played for Milwaukee that season.'),
  player('brunson', 'Jalen Brunson', 'now', 6, 'New York Knicks', 74, 46.7, 36.9, 84.1, 3.3, 6.8, 0.8, 0.1, 26.0, NOW_NOTE + '74 games.'),
  player('edwards', 'Anthony Edwards', 'now', 7, 'Minnesota Timberwolves', 61, 48.9, 39.9, 79.6, 5.0, 3.7, 1.4, 0.8, 28.8, NOW_NOTE + '61 games.'),
  player('cade', 'Cade Cunningham', 'now', 8, 'Detroit Pistons', 64, 46.1, 34.2, 81.2, 5.5, 9.9, 1.4, 0.8, 23.9, NOW_NOTE + '64 games.'),
  player('tatum', 'Jayson Tatum', 'now', 9, 'Boston Celtics', 16, 41.1, 32.9, 82.3, 10.0, 5.3, 1.4, 0.2, 21.8, NOW_NOTE + 'Only 16 games, so this is a small sample.'),
  player('mitchell', 'Donovan Mitchell', 'now', 10, 'Cleveland Cavaliers', 70, 48.3, 36.4, 86.5, 4.5, 5.7, 1.5, 0.3, 27.9, NOW_NOTE + '70 games.'),

  // All-time greats from the NBA 75th Anniversary Team (group "all"), career averages
  player('jordan', 'Michael Jordan', 'all', 0, '', 1072, 49.7, 32.7, 83.5, 6.2, 5.3, 2.3, 0.8, 30.1, 'Career regular season per-game averages over 1,072 games.'),
  player('lebron', 'LeBron James', 'all', 0, '', 1622, 50.7, 34.8, 73.7, 7.5, 7.4, 1.5, 0.7, 26.8, 'Career regular season per-game averages over 1,622 games, through 2025-26.'),
  player('kareem', 'Kareem Abdul-Jabbar', 'all', 0, '', 1560, 55.9, 5.6, 72.1, 11.2, 3.6, 0.9, 2.6, 24.6, 'Career per-game averages over 1,560 games. Steals and blocks were not tracked before 1973-74, so those two averages cover tracked seasons only.'),
  player('magic', 'Magic Johnson', 'all', 0, '', 906, 52.0, 30.3, 84.8, 7.2, 11.2, 1.9, 0.4, 19.5, 'Career regular season per-game averages over 906 games.'),
  player('bird', 'Larry Bird', 'all', 0, '', 897, 49.6, 37.6, 88.6, 10.0, 6.3, 1.7, 0.8, 24.3, 'Career regular season per-game averages over 897 games.'),
  player('kobe', 'Kobe Bryant', 'all', 0, '', 1346, 44.7, 32.9, 83.7, 5.2, 4.7, 1.4, 0.5, 25.0, 'Career regular season per-game averages over 1,346 games.'),
  player('duncan', 'Tim Duncan', 'all', 0, '', 1392, 50.6, 17.9, 69.6, 10.8, 3.0, 0.7, 2.2, 19.0, 'Career regular season per-game averages over 1,392 games.'),
  player('shaq', "Shaquille O'Neal", 'all', 0, '', 1207, 58.2, 4.5, 52.7, 10.9, 2.5, 0.6, 2.3, 23.7, 'Career regular season per-game averages over 1,207 games.'),
  player('hakeem', 'Hakeem Olajuwon', 'all', 0, '', 1238, 51.2, 20.2, 71.2, 11.1, 2.5, 1.7, 3.1, 21.8, 'Career regular season per-game averages over 1,238 games.'),
  player('curry', 'Stephen Curry', 'all', 0, '', 1069, 47.1, 42.2, 91.2, 4.7, 6.3, 1.5, 0.3, 24.8, 'Career regular season per-game averages over 1,069 games, through 2025-26.')
];
