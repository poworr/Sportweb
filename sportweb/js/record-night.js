/* ==========================================================
   Record night page
   Four steps. Picking one updates the career-threes counter,
   the shot marker on the court, and the caption.
   ========================================================== */
(function () {
  'use strict';

  var STEPS = [
    { count: '2,972', showShot: false, caption: 'カリーは、記録まであと2本の状態で試合に入った。' },
    { count: '2,973', showShot: false, caption: 'このシュートの正確な位置は、ここには表示していません。' },
    { count: '2,974', showShot: true, caption: '記録を更新する3ポイント。右ウイングから。' },
    { count: '2,974', showShot: true, caption: '最終スコア：ウォリアーズ 105、ニックス 96。' }
  ];

  var buttons = document.querySelectorAll('.story-step');
  var count = document.getElementById('storyCount');
  var shot = document.getElementById('storyShot');
  var tag = document.getElementById('storyTag');
  var caption = document.getElementById('storyCaption');

  function select(i) {
    var step = STEPS[i];
    count.textContent = step.count;
    shot.hidden = !step.showShot;
    tag.hidden = !step.showShot;
    caption.textContent = step.caption;
    buttons.forEach(function (b, n) { b.classList.toggle('is-active', n === i); });
  }

  buttons.forEach(function (b, i) { b.addEventListener('click', function () { select(i); }); });
  select(0);
})();
