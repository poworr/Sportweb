/* Home page: click the basketball and four photo squares pop out.
   Each square goes to one of the four pages. */
(function () {
  'use strict';
  var menu = document.getElementById('ballMenu');
  if (!menu) { return; }
  var btn = menu.querySelector('.ball-btn');
  var hero = menu.closest('.hero'), picks = hero.querySelector('.picks');

  function setOpen(open) {
    menu.classList.toggle('is-open', open);
    hero.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  /* hover (mouse) also opens it; it closes shortly after the pointer leaves, unless the ball was clicked */
  var sticky = false, timer = 0;
  btn.addEventListener('pointerenter', function (e) {
    if (e.pointerType !== 'mouse') { return; }
    clearTimeout(timer);
    setOpen(true);
  });
  [menu, picks].forEach(function (el) {
    el.addEventListener('pointerenter', function () { clearTimeout(timer); });
    el.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse' || sticky) { return; }
      clearTimeout(timer);
      timer = setTimeout(function () { setOpen(false); }, 600);
    });
  });
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = menu.classList.contains('is-open');
    if (open && !sticky && e.detail > 0) { sticky = true; return; }   // clicking after hover keeps it open
    sticky = !open;
    setOpen(!open);
  });
  document.addEventListener('click', function (e) {
    if (!menu.contains(e.target) && !picks.contains(e.target)) { sticky = false; setOpen(false); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { sticky = false; setOpen(false); }
  });
})();
