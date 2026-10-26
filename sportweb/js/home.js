/* Home page: click the basketball and four photo squares pop out.
   Each square goes to one of the four pages. */
(function () {
  'use strict';
  var menu = document.getElementById('ballMenu');
  if (!menu) { return; }
  var btn = menu.querySelector('.ball-btn');

  function setOpen(open) {
    menu.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!menu.classList.contains('is-open'));
  });
  document.addEventListener('click', function (e) {
    if (!menu.contains(e.target)) { setOpen(false); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setOpen(false); }
  });
})();
