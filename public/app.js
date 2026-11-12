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

  // Show the newest release number from GitHub. If that fails, the number in the page stays.
  var seen = {};
  document.querySelectorAll('[data-repo]').forEach(function (el) {
    var repo = el.getAttribute('data-repo'), pre = el.hasAttribute('data-pre');
    var key = repo + pre;
    if (!seen[key]) {
      seen[key] = fetch('https://api.github.com/repos/nisar87/' + repo + (pre ? '/releases?per_page=1' : '/releases/latest'))
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { var rel = Array.isArray(d) ? d[0] : d; return rel && rel.tag_name ? String(rel.tag_name).replace(/^v/, '') : null; })
        .catch(function () { return null; });
    }
    seen[key].then(function (v) { if (v) el.textContent = v; });
  });
})();
