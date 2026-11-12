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

  // Hero: small annoyances (loose specks) gather into each product's mark, then drift apart again.
  var host = document.querySelector('.forge'), dataEl = document.getElementById('forge-data');
  if (host && dataEl) {
    var items = JSON.parse(dataEl.textContent);
    var wrap = host.parentNode, capQ = wrap.querySelector('.forge-q'), capA = wrap.querySelector('.forge-a');
    var cv = host.querySelector('canvas'), ctx = cv.getContext('2d');
    var W = 0, H = 0, P = [], shapes = [], cur = 0, phase = 'noise', since = 0, last = 0, live = false, seen = true;
    var px = -9999, py = -9999;
    var N = window.innerWidth < 700 ? 700 : 1300;
    var rgb = function (h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
    var AMBER = [240, 166, 58];
    var size = function () {
      var r = host.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = Math.round(W * d); cv.height = Math.round(H * d); ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    var sample = function (it, done) {
      var S = 216, img = new Image();
      img.onload = function () {
        var o = document.createElement('canvas'); o.width = o.height = S;
        var c = o.getContext('2d'); c.drawImage(img, 0, 0, S, S);
        var d = c.getImageData(0, 0, S, S).data, pts = [];
        for (var y = 0; y < S; y += 3) for (var x = 0; x < S; x += 3) if (d[(y * S + x) * 4 + 3] > 110) pts.push([x / S, y / S]);
        if (pts.length) {
          var x0 = 1, y0 = 1, x1 = 0, y1 = 0;
          pts.forEach(function (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
          var span = Math.max(x1 - x0, y1 - y0) || 1;
          pts = pts.map(function (q) { return [0.5 + (q[0] - (x0 + x1) / 2) / span, 0.5 + (q[1] - (y0 + y1) / 2) / span]; });
        }
        done(pts);
      };
      img.onerror = function () { done([]); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S +
        '" viewBox="0 0 48 48" fill="none" stroke="#fff" color="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">' + it.mark + '</svg>');
    };
    var aim = function () {
      var pts = shapes[cur], s = Math.min(W, H) * 0.62, ox = (W - s) / 2, oy = (H - s) / 2;
      for (var i = 0; i < P.length; i++) {
        var t = pts[(i * 7) % pts.length];
        P[i].tx = ox + t[0] * s + (Math.random() - 0.5) * 3; P[i].ty = oy + t[1] * s + (Math.random() - 0.5) * 3;
      }
    };
    var caption = function (formed) {
      var it = items[cur];
      capQ.textContent = it.q;
      capA.textContent = it.name; capA.href = '/products/' + it.slug + '/';
      wrap.style.setProperty('--fc', it.accent);
      wrap.classList.toggle('formed', formed);
    };
    var draw = function (mix) {
      var c = rgb(items[cur].accent), r = Math.round(AMBER[0] + (c[0] - AMBER[0]) * mix), g = Math.round(AMBER[1] + (c[1] - AMBER[1]) * mix), b = Math.round(AMBER[2] + (c[2] - AMBER[2]) * mix);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,' + (calm ? 1 : 0.28) + ')';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.6 + 0.4 * mix) + ')';
      for (var i = 0; i < P.length; i++) { var z = P[i].z; ctx.fillRect(P[i].x, P[i].y, z, z); }
    };
    var mixNow = 0;
    var tick = function (now) {
      if (!live) return;
      var dt = Math.min(40, now - last || 16) / 16; last = now; since += dt * 16;
      var forming = phase !== 'noise';
      if (phase === 'noise' && since > 2000) { phase = 'form'; since = 0; aim(); }
      else if (phase === 'form' && since > 1300) { phase = 'hold'; since = 0; caption(true); }
      else if (phase === 'hold' && since > 3400) { phase = 'noise'; since = 0; cur = (cur + 1) % items.length; caption(false); }
      mixNow += ((forming ? 1 : 0) - mixNow) * 0.05 * dt;
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (forming) { p.vx += (p.tx - p.x) * 0.045 * dt; p.vy += (p.ty - p.y) * 0.045 * dt; p.vx *= 0.8; p.vy *= 0.8; }
        else { p.vx += (Math.random() - 0.5) * 0.9 * dt + (W / 2 - p.x) * 0.00012; p.vy += (Math.random() - 0.5) * 0.9 * dt + (H / 2 - p.y) * 0.00012; p.vx *= 0.97; p.vy *= 0.97; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
        var dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var f = (1 - d2 / 9000) * 2.4; var d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
      draw(mixNow);
      requestAnimationFrame(tick);
    };
    var wake = function () { var on = seen && !document.hidden; if (on && !live) { live = true; last = 0; requestAnimationFrame(tick); } else if (!on) live = false; };
    var left = items.length;
    items.forEach(function (it, n) {
      sample(it, function (pts) {
        shapes[n] = pts.length ? pts : [[0.5, 0.5]];
        if (--left) return;
        size();
        for (var i = 0; i < N; i++) P.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: 0, ty: 0, z: 1.6 + Math.random() * 1.6 });
        if (calm) { aim(); P.forEach(function (p) { p.x = p.tx; p.y = p.ty; }); caption(true); draw(1); return; }
        caption(false);
        host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
        host.addEventListener('pointerleave', function () { px = py = -9999; });
        window.addEventListener('resize', function () { size(); if (phase !== 'noise') aim(); });
        document.addEventListener('visibilitychange', wake);
        if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { seen = en[0].isIntersecting; wake(); }).observe(host);
        wake();
      });
    });
  }
})();
