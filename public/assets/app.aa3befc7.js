// Small enhancements. The site works without any of this.
(function () {
  var root = document.documentElement;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal sections as they scroll into view.
  var items = document.querySelectorAll('.reveal');
  if (calm || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // The lamp follows the pointer, and the hero stage leans a little.
  if (!calm && window.matchMedia('(pointer: fine)').matches) {
    var queued = false, x = 0, y = 0;
    window.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        root.style.setProperty('--gx', x + 'px');
        root.style.setProperty('--gy', y + 'px');
        root.style.setProperty('--mx', (x / window.innerWidth - 0.5).toFixed(3));
        root.style.setProperty('--my', (y / window.innerHeight - 0.5).toFixed(3));
      });
    }, { passive: true });
  }

  // Product filter on the collection page.
  var buttons = document.querySelectorAll('.filters button');
  var cards = document.querySelectorAll('#collection .card');
  var empty = document.getElementById('empty');
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter'), shown = 0;
      buttons.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      cards.forEach(function (c) {
        var show = f === 'all' || c.getAttribute('data-platforms').split(' ').indexOf(f) > -1;
        c.hidden = !show;
        if (show) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  });

  // Gallery arrows. Without them the strip still scrolls and swipes.
  document.querySelectorAll('.s-gallery').forEach(function (g) {
    var track = g.querySelector('.g-track'), nav = g.querySelector('.g-nav');
    if (!track || !nav) return;
    nav.hidden = false;
    var step = function (dir) {
      var item = track.querySelector('.g-item');
      track.scrollBy({ left: dir * (item ? item.offsetWidth + 26 : 600), behavior: calm ? 'auto' : 'smooth' });
    };
    nav.querySelector('.g-prev').addEventListener('click', function () { step(-1); });
    nav.querySelector('.g-next').addEventListener('click', function () { step(1); });
  });

  // Reveal safety net: if anything is still waiting after 3 seconds, show it.
  setTimeout(function () { document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { el.classList.add('in'); }); }, 3000);

  // Enlarge a screenshot. Without this script the link simply opens the image.
  var zooms = [].slice.call(document.querySelectorAll('a.zoom'));
  if (zooms.length && window.HTMLDialogElement) {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Screenshot');
    dlg.innerHTML = '<div class="lb-in"><div class="lb-img"><img alt=""></div><div class="lb-bar"><p></p><div class="lb-btns">' +
      '<button type="button" class="lb-prev" aria-label="Previous screenshot"><svg class="arr" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></button>' +
      '<button type="button" class="lb-next" aria-label="Next screenshot"><svg class="arr" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></button>' +
      '<button type="button" class="lb-close">Close</button></div></div></div>';
    document.body.appendChild(dlg);
    var big = dlg.querySelector('img'), cap = dlg.querySelector('p'), set = [], at = 0, opener = null;
    var show = function (n) {
      at = (n + set.length) % set.length;
      var a = set[at], im = a.querySelector('img');
      big.src = a.getAttribute('href');
      big.alt = im ? im.alt : '';
      cap.textContent = a.getAttribute('data-caption') || '';
      var many = set.length > 1;
      dlg.querySelector('.lb-prev').hidden = !many;
      dlg.querySelector('.lb-next').hidden = !many;
    };
    zooms.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var group = a.closest('.g-track');
        set = group ? [].slice.call(group.querySelectorAll('a.zoom')) : [a];
        opener = a;
        show(set.indexOf(a));
        dlg.showModal();
        dlg.querySelector('.lb-close').focus();
      });
    });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(at - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(at + 1); });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('lb-img')) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
    });
    dlg.addEventListener('close', function () { big.removeAttribute('src'); if (opener) opener.focus(); });
  }
})();
