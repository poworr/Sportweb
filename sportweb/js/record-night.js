/* ==========================================================
   Record night page
   Four steps. Picking one updates the career-threes counter,
   the shot marker on the court, and the caption.
   ========================================================== */
(function () {
  'use strict';

  var STEPS = [
    { count: '2,972', showShot: false, caption: 'Curry enters the game two threes behind the record.' },
    { count: '2,973', showShot: false, caption: 'The exact spot of this shot is not shown here.' },
    { count: '2,974', showShot: true, caption: 'The record-breaking three, from the right wing.' },
    { count: '2,974', showShot: true, caption: 'Final: Warriors 105, Knicks 96.' }
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
