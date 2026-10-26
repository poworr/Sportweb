/* Home: List / Grid toggle */
(function () {
  'use strict';
  var home = document.querySelector('.home');
  var buttons = document.querySelectorAll('.view-toggle button');
  if (!home || !buttons.length) { return; }
  function setView(view) {
    home.dataset.view = view;
    buttons.forEach(function (b) { b.classList.toggle('is-active', b.dataset.view === view); });
    try { localStorage.setItem('range-home-view', view); } catch (e) {}
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { setView(b.dataset.view); }); });
  var saved = null;
  try { saved = localStorage.getItem('range-home-view'); } catch (e) {}
  if (saved === 'list' || saved === 'grid') { setView(saved); }
})();
