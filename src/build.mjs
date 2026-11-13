// Builds the whole site into public/ from content/*.mjs. No dependencies: `node src/build.mjs`.
import { mkdirSync, writeFileSync, readFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products, lab } from '../content/products.mjs';
import { site } from '../content/site.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const media = (p) => '/media/' + p;
const versionsFile = join(root, 'content/versions.json');
const versions = existsSync(versionsFile) ? JSON.parse(readFileSync(versionsFile, 'utf8')) : {};
const ver = (p) => versions[p.slug] || p.version;
// <img> attributes for a screenshot: a 720px copy for small screens when tools/media.py has made one.
const src = (path, sizes) => {
  const small = path.replace(/\.webp$/, '-720.webp');
  return existsSync(join(root, 'media', small))
    ? `src="${media(path)}" srcset="${media(small)} 720w, ${media(path)} 1440w" sizes="${sizes}"`
    : `src="${media(path)}"`;
};
const og = (name) => (existsSync(join(root, 'media/og', name + '.jpg')) ? `og/${name}.jpg` : undefined);

/* ---------- small pieces ---------- */
const mark = (p, size = 48) =>
  `<span class="mark" style="--p:${p.accent}" aria-hidden="true"><svg viewBox="0 0 48 48" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${p.mark}</svg></span>`;

const status = (p) => `<span class="status status-${p.status.kind}"><i></i>${esc(p.status.label)}</span>`;

const version = (p) => (p.version ? `<span class="ver">v${esc(ver(p))}</span>` : '');

const arrow = '<svg class="arr" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
const icons = {
  download: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13.5h10"/></svg>',
  open: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3H3v10h10v-3M9 3h4v4M13 3 7.5 8.5"/></svg>',
};

const frame = (img, { title = '', eager = false, cls = '', sizes = '(max-width: 980px) 92vw, 640px', zoom = false } = {}) => {
  const tag = `<img ${src(img.src, sizes)} width="${img.w}" height="${img.h}" alt="${esc(img.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
  return `
<figure class="frame ${cls}">
  <div class="frame-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(title)}</span></div>
  ${zoom ? `<a class="zoom" href="${media(img.src)}" data-caption="${esc(img.caption || img.alt)}" aria-label="Enlarge: ${esc(img.alt)}">${tag}</a>` : tag}
</figure>`;
};

/* A small moving signature per product. Decorative only: it hints at what the product is about. */
const motifs = {
  flow: '<svg viewBox="0 0 220 60"><path class="m-dash" d="M4 12C70 12 80 30 130 30"/><path class="m-dash m-2" d="M4 48C70 48 80 30 130 30"/><path d="M130 30H206M196 22l10 8-10 8"/><circle cx="130" cy="30" r="4" class="m-fill"/></svg>',
  signal: '<svg viewBox="0 0 220 60"><path class="m-blink" d="M10 26a22 22 0 0 1 30 0M16 33a13 13 0 0 1 18 0"/><circle cx="25" cy="42" r="3" class="m-fill"/><path class="m-2 m-blink m-late" d="M62 46v-6M70 46V34M78 46V26M86 46V18"/><path class="m-dash" d="M100 30H206M196 22l10 8-10 8"/></svg>',
  segments: `<svg viewBox="0 0 220 60">${Array.from({ length: 12 }, (_, i) => `<rect class="m-seg" style="--d:${(i * 0.18).toFixed(2)}s" x="${6 + i * 17.6}" y="22" width="13" height="16" rx="3"/>`).join('')}</svg>`,
  pages: '<svg viewBox="0 0 220 60"><g class="m-page" style="--d:0s"><rect x="10" y="6" width="36" height="48" rx="3"/><path d="M17 18h22M17 26h22M17 34h14"/></g><g class="m-page m-2" style="--d:.5s"><rect x="62" y="6" width="36" height="48" rx="3"/><path d="M69 16h10v10H69zM84 18h8M84 24h8M69 34h22M69 42h16"/></g><g class="m-page" style="--d:1s"><rect x="114" y="6" width="36" height="48" rx="3"/><path d="M114 20h36M121 30h22M121 38h22M121 46h12"/></g><g class="m-page m-2" style="--d:1.5s"><rect x="166" y="6" width="36" height="48" rx="3"/><path d="M178 6v48M184 18h12M184 26h12M184 34h8"/></g></svg>',
  proof: '<svg viewBox="0 0 220 60"><path d="M8 20h60M84 20h44M144 20h30"/><path class="m-wavy m-2" d="M84 28q5.5-6 11 0t11 0 11 0 11 0"/><path d="M8 42h36M60 42h70"/><path class="m-check" d="M182 38l8 8 16-18"/></svg>',
  wave: `<svg viewBox="0 0 220 60">${Array.from({ length: 22 }, (_, i) => `<path class="m-bar${i % 3 === 0 ? ' m-2' : ''}" style="--d:${(i * 0.07).toFixed(2)}s" d="M${10 + i * 9.5} ${(30 - (6 + 20 * Math.abs(Math.sin(i * 0.9)))).toFixed(1)}V${(30 + (6 + 20 * Math.abs(Math.sin(i * 0.9)))).toFixed(1)}"/>`).join('')}</svg>`,
};
const motif = (p) => (p.motif && motifs[p.motif] ? `<span class="motif" aria-hidden="true">${motifs[p.motif]}</span>` : '');

/* Illustrations for products that have no screenshots yet. Always labelled. */
const art = {
  clearwrite: `
<div class="art art-cw" role="img" aria-label="Illustration of a sentence with two underlined mistakes and a suggestion card.">
  <p class="art-line">Thanks for <u class="sp">recieving</u> us yesterday. The team <u class="gr">were</u> impressed by how clear the plan is.</p>
  <div class="art-card"><span class="art-old">recieving</span><span class="art-new">receiving</span><span class="art-btn">Accept</span></div>
  <span class="art-tag">Illustration, not a screenshot</span>
</div>`,
  vox: `
<div class="art art-vox" role="img" aria-label="Illustration of a voice waveform above a spoken command.">
  <div class="wave" aria-hidden="true">${Array.from({ length: 28 }, (_, i) => `<i style="--h:${(18 + 70 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37))).toFixed(0)}%;--d:${(i * 0.06).toFixed(2)}s"></i>`).join('')}</div>
  <p class="art-say">"Hi Vox, organise my desktop."</p>
  <span class="art-tag">Illustration, not a screenshot</span>
</div>`,
};

art.nma = `
<div class="art art-nma" role="img" aria-label="Illustration of a phone with a Wi-Fi line and a mobile data line joining into one.">
  <svg viewBox="0 0 420 240" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="150" y="14" width="120" height="212" rx="20" stroke="var(--line)" stroke-width="2" fill="#151310"/>
    <path class="flow" d="M10 70 C90 70 110 120 210 120" stroke="var(--p)" stroke-width="5"/>
    <path class="flow" d="M10 170 C90 170 110 120 210 120" stroke="var(--p2)" stroke-width="5"/>
    <path d="M210 120 H400" stroke="var(--ink)" stroke-width="5"/>
    <path d="M388 108 l14 12 -14 12" stroke="var(--ink)" stroke-width="5"/>
    <circle cx="210" cy="120" r="9" fill="var(--ink)"/>
    <text x="10" y="54" fill="var(--p)" font-family="var(--mono)" font-size="13">Wi-Fi</text>
    <text x="10" y="198" fill="var(--p2)" font-family="var(--mono)" font-size="13">Mobile data</text>
  </svg>
  <span class="art-tag">Illustration, not a screenshot</span>
</div>`;

const wall = (names, cls = '') => `
<div class="wall ${cls}">${names.map((n) => `<img src="${media(`ai-cv-studio/${n}.webp`)}" width="397" height="562" alt="CV template preview: ${esc(n)}, with sample data." loading="lazy">`).join('')}</div>`;

const stage = (p) => {
  const st = p.stage;
  if (!st) return cover(p);
  if (st.behind) return `<div class="stage stage-behind"><div class="st-behind">${frame(st.behind, { title: p.name })}</div>${cover(p)}</div>`;
  if (st.inset) return `<div class="stage stage-inset">${cover(p)}<img class="st-inset" src="${media(st.inset.src)}" width="${st.inset.w}" height="${st.inset.h}" alt="" loading="lazy"></div>`;
  return `<div class="stage stage-sheets">${cover(p)}<div class="st-sheets">${st.sheets.map((n) => `<img src="${media(`ai-cv-studio/${n}.webp`)}" width="397" height="562" alt="" loading="lazy">`).join('')}</div></div>`;
};

const cover = (p, opts = {}) => {
  if (p.cover.src) return frame(p.cover, { title: p.name, ...opts });
  if (p.cover.wall) return wall(p.cover.wall, 'wall-cover');
  if (p.cover.phones) return `<div class="phones" role="img" aria-label="${esc(p.cover.alt)}">${p.cover.phones.map((n) => `<span class="device"><img src="${media(`${p.slug}/${n}.webp`)}" width="540" height="1070" alt="" ${opts.eager ? '' : 'loading="lazy"'}></span>`).join('')}</div>`;
  return art[p.cover.art];
};

/* ---------- styles and script, named by their content so browsers can cache them for a long time ---------- */
const css = readFileSync(join(root, 'src/styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s+/gm, '').replace(/\n+/g, '\n');
const js = readFileSync(join(root, 'src/app.js'), 'utf8');
const hash = (t) => createHash('sha1').update(t).digest('hex').slice(0, 8);
const assets = { css: `styles.${hash(css)}.css`, js: `app.${hash(js)}.js` };

/* ---------- page shell ---------- */
const nav = (cur) => `
<header class="top">
  <a class="brand" href="/" aria-label="${site.name} home"><span class="dot"></span>${site.name}</a>
  <nav aria-label="Main">
    <a href="/products/"${cur === 'products' ? ' aria-current="page"' : ''}>Products</a>
    <a href="/about/"${cur === 'about' ? ' aria-current="page"' : ''}>About</a>
    <a href="${site.github}">GitHub</a>
  </nav>
</header>`;

const footer = () => `
<footer class="foot">
  <div class="foot-in">
    <div class="foot-brand">
      <a class="brand" href="/"><span class="dot"></span>${site.name}</a>
      <p>Software by ${site.creator}.<br>Built for the fun of it, shared in case it helps.</p>
    </div>
    <nav aria-label="Products">
      <h2>Products</h2>
      ${products.map((p) => `<a href="/products/${p.slug}/">${esc(p.name)}</a>`).join('')}
    </nav>
    <nav aria-label="Elsewhere">
      <h2>Elsewhere</h2>
      <a href="/about/">About</a>
      <a href="${site.github}">GitHub</a>
      <a href="/products/">All products</a>
    </nav>
  </div>
  <p class="foot-loop" aria-hidden="true">notice <b>→</b> wonder <b>→</b> build <b>→</b> share <b>→</b> repeat</p>
</footer>`;

const page = ({ title, desc, path, cur, body, accent, image, ld }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${site.url}${path}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${site.url}${path}">
${image ? `<meta property="og:image" content="${site.url}${media(image)}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:card" content="summary_large_image">` : ''}
<meta property="og:site_name" content="${site.name}">
<meta name="theme-color" content="#0d0c0a">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/instrument-serif-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/${assets.css}">
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : ''}
<script>document.documentElement.classList.add('js')</script>
</head>
<body${accent ? ` style="--p:${accent.a};--p2:${accent.b}"` : ''}>
<a class="skip" href="#main">Skip to content</a>
<div class="glow" aria-hidden="true"></div>
${nav(cur)}
<main id="main">
${body}
</main>
${footer()}
<script src="/assets/${assets.js}" defer></script>
</body>
</html>`;

/* ---------- product page sections ---------- */
const sec = {
  problem: (s) => `
<section class="s s-problem reveal">
  <p class="eyebrow">${esc(s.eyebrow)}</p>
  <h2 class="big">${esc(s.title)}</h2>
  <div class="prose">${s.body.map((b) => `<p>${esc(b)}</p>`).join('')}</div>
</section>`,

  features: (s) => `
<section class="s reveal">
  <h2 class="h2">${esc(s.title)}</h2>
  <ul class="feat feat-${s.layout}">
    ${s.items.map((f, i) => `<li><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></li>`).join('')}
  </ul>
</section>`,

  gallery: (s, p) => `
<section class="s s-gallery reveal" aria-label="${esc(s.title)}">
  <div class="s-head"><h2 class="h2">${esc(s.title)}</h2>
    <div class="g-nav" hidden><button type="button" class="g-prev" aria-label="Previous screenshot">${arrow}</button><button type="button" class="g-next" aria-label="Next screenshot">${arrow}</button></div>
  </div>
  <div class="g-track${s.numbered ? ' g-numbered' : ''}" tabindex="0" role="region" aria-label="${esc(p.name)} screenshots. Scroll sideways for more.">
    ${s.items.map((it) => `<div class="g-item${it.phone ? ' g-phone' : it.w < 700 ? (it.w < 320 ? ' g-tiny' : ' g-small') : ''}">${it.phone ? `<figure class="phone device"><a class="zoom" href="${media(it.src)}" data-caption="${esc(it.caption)}" aria-label="Enlarge: ${esc(it.alt)}"><img src="${media(it.src)}" width="${it.w}" height="${it.h}" alt="${esc(it.alt)}" loading="lazy"></a></figure>` : frame(it, { title: p.name, zoom: true, sizes: '(max-width: 620px) 84vw, 900px' })}<p class="cap">${esc(it.caption)}</p></div>`).join('')}
  </div>
  <div class="g-progress" aria-hidden="true"><i></i></div>
  ${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}
</section>`,

  wall: (s) => `
<section class="s reveal">
  <h2 class="h2">${esc(s.title)}</h2>
  <ul class="wall wall-full">${s.items.map(([f, n]) => `<li><a class="zoom" href="${media(`ai-cv-studio/${f}.webp`)}" data-caption="${esc(n)}. A template preview with sample data." aria-label="Enlarge the ${esc(n)} template"><img src="${media(`ai-cv-studio/${f}.webp`)}" width="397" height="562" alt="CV template preview: ${esc(n)}, with sample data." loading="lazy"></a><span>${esc(n)}</span></li>`).join('')}</ul>
  ${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}
</section>`,

  say: (s) => `
<section class="s s-say reveal">
  <p class="eyebrow">${esc(s.title)}</p>
  <ul class="say">${s.items.map((t) => `<li>“${esc(t)}”</li>`).join('')}</ul>
</section>`,

  routes: (s) => `
<section class="s reveal">
  <h2 class="h2">${esc(s.title)}</h2>
  <p class="lede">${esc(s.note)}</p>
  <ol class="routes">${s.items.map((r) => `<li><h3>${esc(r.name)}</h3><p>${esc(r.when)}</p><span class="cost">${esc(r.cost)}</span></li>`).join('')}</ol>
</section>`,

  modes: (s) => {
    const col = (m, cls) => `<div class="mode ${cls}"><span class="mode-tag">${esc(m.tag)}</span><h3>${esc(m.name)}</h3><ul>${m.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
    return `
<section class="s reveal">
  <h2 class="h2">${esc(s.title)}</h2>
  <div class="modes">${col(s.left, 'mode-a')}${col(s.right, 'mode-b')}</div>
</section>`;
  },

  explainer: (s) => `
<section class="s reveal">
  <h2 class="h2">${esc(s.title)}</h2>
  <div class="explain">${s.panels.map((pn) => `
    <div class="explain-p${pn.good ? ' good' : ''}">
      <h3>${esc(pn.title)}</h3>
      <div class="conns" aria-hidden="true">${pn.conns.map((c) => `<i class="c-${c}"></i>`).join('')}</div>
      <ul class="lines">${pn.lines.map((l) => `<li class="l-${l.id}${l.load ? '' : ' idle'}"><span>${esc(l.name)}</span><b></b><em>${esc(l.note)}</em></li>`).join('')}</ul>
      <p>${esc(pn.text)}</p>
    </div>`).join('')}
  </div>
  <p class="note">A diagram of how connections are shared, not a screenshot.</p>
</section>`,

  flow: (s) => `
<section class="s reveal">
  <h2 class="h2">${esc(s.title)}</h2>
  <ol class="flow">${s.steps.map((st) => `<li${st.key ? ' class="key"' : ''}><h3>${esc(st.name)}</h3><p>${esc(st.text)}</p></li>`).join('')}</ol>
</section>`,

  segments: (s) => `
<section class="s reveal seg">
  <h2 class="h2">${esc(s.title)}</h2>
  <div class="seg-grid">
    <div class="seg-art" role="img" aria-label="Diagram: a file downloads in ${s.parts.length} parts at once, stops when the connection is lost, then carries on from where each part stopped until the whole file is checked.">
      <div class="seg-top"><span class="seg-name">${esc(s.file)}</span><span class="seg-state"><i>downloading</i><i>connection lost</i><i>resuming</i><i>size and checksum match</i></span></div>
      <div class="seg-bar">${s.parts.map((a, i) => `<span><b style="--a:${a};--i:${i}"></b></span>`).join('')}</div>
      <div class="seg-foot"><span>${s.parts.length} parts, ${s.parts.length} connections</span><span>each part keeps what it already has</span></div>
    </div>
    <ol class="steps">${s.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
  </div>
  <p class="note">A diagram of how it works, not a screenshot.</p>
</section>`,

  specimen: (s) => `
<section class="s reveal spec">
  <p class="eyebrow">${esc(s.eyebrow)}</p>
  <p class="spec-line">${s.before}</p>
  <ul class="spec-fixes">${s.fixes.map((f) => `<li class="${f.kind}"><s>${esc(f.from)}</s><b>${esc(f.to)}</b><span>${esc(f.why)}</span></li>`).join('')}</ul>
  <p class="spec-line spec-after">${s.after}</p>
  <p class="note">${esc(s.note)}</p>
</section>`,

  transcript: (s) => `
<section class="s reveal talk">
  <div class="s-head"><h2 class="h2">${esc(s.title)}</h2><p class="talk-key" aria-hidden="true"><i class="t-h"></i>Hearing you<i class="t-t"></i>AI thinking<i class="t-d"></i>Doing it</p></div>
  <ol>${s.items.map((t) => `<li><p class="t-said"><span>You said</span>${esc(t.said)}</p><p class="t-did">${esc(t.did)}</p>
    <p class="t-meta"><span class="t-bar" aria-hidden="true"><i class="t-h" style="flex:${t.bar[0]}"></i><i class="t-t" style="flex:${t.bar[1]}"></i><i class="t-d" style="flex:${t.bar[2]}"></i></span><b>${esc(t.time)}</b> from command to done<em>${esc(t.route)}</em></p></li>`).join('')}</ol>
  <p class="note">${esc(s.note)}</p>
</section>`,

  measured: (s) => {
    const bar = (v, cls) => `<span class="bar ${cls}" style="--f:${(v / s.axis).toFixed(3)}"><b></b><em>${v.toFixed(1)}</em></span>`;
    const row = (r, cls = '') => `<li class="${cls}"><span class="m-name">${esc(r.name)}</span><span class="m-bars">${bar(r.off, 'off')}${bar(r.on, 'on')}</span><span class="m-gain">${esc(r.gain)}</span></li>`;
    return `
<section class="s reveal measured">
  <div class="s-head"><h2 class="h2">${esc(s.title)}</h2><span class="m-tag">Measured, not promised</span></div>
  <div class="m-grid">
    <div class="m-chart">
      <p class="m-key"><span class="k-off"></span>${esc(s.off)}<span class="k-on"></span>${esc(s.on)}</p>
      <ul>${s.rounds.map((r) => row(r)).join('')}${row({ name: 'Average', off: s.average.off, on: s.average.on, gain: s.average.gain + '%' }, 'avg')}</ul>
      <p class="m-axis" aria-hidden="true"><span></span><span class="m-ticks"><i>0</i><i>${s.axis / 2}</i><i>${s.axis}</i></span><span>${esc(s.unit)}</span></p>
    </div>
    <div class="m-side">
      <p class="m-big">${esc(s.average.gain)}<small>%</small></p>
      <p class="m-sub">average gain in this test</p>
      <ul>${s.caveats.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    </div>
  </div>
  <p class="note">${esc(s.context)}</p>
</section>`;
  },

  figures: (s) => `
<section class="s reveal">
  <h2 class="h2">${esc(s.title)}</h2>
  <ul class="figures">${s.items.map((f) => `<li><span class="fig">${esc(f.value)}<small>${esc(f.unit)}</small></span><span class="fig-l">${esc(f.label)}</span></li>`).join('')}</ul>
  <p class="note">${esc(s.note)}</p>
</section>`,

  video: (s, p) => `
<section class="s reveal s-video">
  ${s.eyebrow ? `<p class="eyebrow">${esc(s.eyebrow)}</p>` : ''}
  <h2 class="h2">${esc(s.title)}</h2>
  ${s.src ? `
  <div class="v-grid">
    <figure class="frame v-frame">
      <div class="frame-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(p.name)}</span></div>
      <video src="${media(s.src)}" poster="${media(s.poster)}" width="${s.w}" height="${s.h}" controls playsinline preload="none" aria-label="${esc(s.label || s.title)}"></video>
    </figure>
    ${s.chapters ? `<ol class="chapters">${s.chapters.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>` : ''}
  </div>` : `<div class="video placeholder"><span>No recording yet</span></div>`}
  ${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}
</section>`,

  install: (s) => `
<section class="s reveal">
  <h2 class="h2">${esc(s.title)}</h2>
  <ol class="steps">${s.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
</section>`,

  limits: (s) => `
<section class="s s-limits reveal">
  <h2 class="h2">${esc(s.title)}</h2>
  <ul class="limits">${s.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
</section>`,

  compat: (s, p) => `
<section class="s reveal">
  <h2 class="h2">${esc(s.title)}</h2>
  <dl class="compat">
    ${s.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
    ${p.version ? `<div><dt>Current version</dt><dd>${version(p)}</dd></div>` : ''}
    <div><dt>Status</dt><dd>${status(p)}</dd></div>
  </dl>
</section>`,

  aside: (s) => `
<section class="s s-aside reveal" id="bench">
  <p class="eyebrow">${esc(s.eyebrow)}</p>
  <h2 class="h2">${esc(s.title)}</h2>
  <p class="lede">${esc(s.body)}</p>
  <a class="link" href="${s.link.href}">${esc(s.link.label)} ${arrow}</a>
</section>`,
};

// "Honest limits" and "What you need" sit side by side as one sheet.
const renderSections = (p) => {
  const out = [];
  for (let i = 0; i < p.sections.length; i++) {
    const s = p.sections[i], n = p.sections[i + 1];
    if (s.type === 'limits' && n && n.type === 'compat') { out.push(`<div class="sheet-band"><div class="sheet">${sec.limits(s, p)}${sec.compat(n, p)}</div></div>`); i++; }
    else out.push(sec[s.type](s, p));
  }
  return out.join('');
};

const actions = (p) => `<div class="actions">${p.actions.map((a, i) =>
  `<a class="btn${i === 0 ? ' btn-p' : ''}" href="${a.href}">${icons[a.kind] || ''}${esc(a.label)}</a>`).join('')}</div>`;

const card = (p, cls = '') => `
<a class="card ${cls}" href="/products/${p.slug}/" style="--p:${p.accent};--p2:${p.accent2}" data-platforms="${p.platforms.join(' ').toLowerCase()}">
  <div class="card-top">${mark(p, 30)}<span class="card-cat">${esc(p.category)}</span>${status(p)}</div>
  <h3>${esc(p.name)}</h3>
  <p>${esc(p.tagline)}</p>
  <div class="card-cover">${cover(p)}</div>
  <span class="card-foot"><span>${esc(p.platformNote)}</span><span class="go">Explore ${arrow}</span></span>
</a>`;

const productPage = (p) => {
  const others = products.filter((o) => o.slug !== p.slug).slice(0, 3);
  const body = `
<article class="product hero-${p.hero}">
  <header class="p-hero">
    <div class="p-hero-text">
      <a class="crumb" href="/products/">${arrow} All products</a>
      <div class="p-id">${mark(p, 44)}<span>${esc(p.category)}</span></div>
      <h1>${esc(p.name)}</h1>
      <p class="p-tag">${esc(p.tagline)}</p>
      <p class="p-sum">${esc(p.summary)}</p>
      <div class="p-meta">${status(p)}${version(p)}<span>${esc(p.platformNote)}</span></div>
      ${actions(p)}
      ${motif(p)}
    </div>
    <div class="p-hero-art">${p.loop ? `
      <figure class="frame">
        <div class="frame-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(p.name)}</span></div>
        <video class="loop" src="${media(p.loop.src)}" poster="${media(p.loop.poster)}" width="${p.loop.w}" height="${p.loop.h}" autoplay muted loop playsinline aria-label="${esc(p.loop.alt)}"></video>
      </figure>
      <p class="note">${esc(p.loop.note)}</p>` : cover(p, { eager: true })}</div>
  </header>
  ${renderSections(p)}
  <section class="s s-cta reveal">
    <h2 class="big">${p.status.kind === 'live' ? 'Try it now.' : 'Give it a try.'}</h2>
    ${actions(p)}
    <p class="note">Something broken, or an idea to make it better? <a href="${site.github}/${p.repo}/issues">Tell me on GitHub</a>.</p>
  </section>
</article>
<section class="s more">
  <h2 class="h2">More from the workshop</h2>
  <div class="grid grid-3">${others.map((o) => card(o)).join('')}</div>
</section>`;
  return page({
    title: `${p.name} · ${site.name}`, desc: p.summary, path: `/products/${p.slug}/`, cur: 'products', body,
    accent: { a: p.accent, b: p.accent2 }, image: og(p.slug),
    ld: {
      '@context': 'https://schema.org', '@type': p.platforms.includes('Web') ? 'WebApplication' : 'SoftwareApplication',
      name: p.name, description: p.summary, url: `${site.url}/products/${p.slug}/`,
      applicationCategory: p.category, operatingSystem: p.platformNote,
      ...(p.version ? { softwareVersion: ver(p) } : {}),
      author: { '@type': 'Person', name: site.creator, url: `${site.url}/about/` },
    },
  });
};

/* ---------- hero artwork: a tangle unwinds into a thread that runs through every finished tool ---------- */
const bench = () => {
  const spots = [[290, 100], [452, 172], [402, 322], [240, 268], [100, 332], [172, 462]];
  const thread = 'M96 96C170 56 228 66 290 100S426 104 452 172 470 294 402 322 300 230 240 268 128 252 100 332 94 444 172 462 306 502 358 462';
  return `
<div class="bench-wrap">
<svg class="bench" viewBox="0 0 560 548" aria-label="A tangle of thread unwinds and runs through each finished tool, with one empty place left for the next.">
  <defs><pattern id="pegs" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="1.1" fill="#34302a"/></pattern></defs>
  <rect class="b-board" x="6" y="6" width="548" height="536" rx="30"/>
  <rect x="6" y="6" width="548" height="536" rx="30" fill="url(#pegs)"/>
  <path class="b-tangle" d="M28 84C22 44 84 30 92 66S44 112 38 78 96 40 104 76 60 122 52 92 84 78 96 96"/>
  <path class="b-thread" pathLength="1" d="${thread}"/>
  <circle class="b-spark" r="4.5" style="offset-path:path('${thread}')"/>
  ${products.slice(0, spots.length).map((p, i) => `
  <a href="/products/${p.slug}/" aria-label="${esc(p.name)}: ${esc(p.tagline)}" style="--p:${p.accent};--d:${i}">
    <g transform="translate(${spots[i][0] - 42} ${spots[i][1] - 42})"><g class="b-tile"><rect width="84" height="84" rx="22"/><g class="b-mark" transform="translate(18 18)" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${p.mark}</g></g></g>
    <text x="${spots[i][0]}" y="${spots[i][1] + 62}" text-anchor="middle">${esc(p.name)}</text>
  </a>`).join('')}
  <g transform="translate(316 420)"><rect class="b-next" width="84" height="84" rx="22"/><text class="b-q" x="42" y="55" text-anchor="middle">?</text></g>
  <text class="b-note" x="26" y="150">a small annoyance</text>
  <text class="b-note" x="358" y="526" text-anchor="middle">next?</text>
</svg>
</div>`;
};

/* ---------- pages ---------- */
const featured = products.filter((p) => p.featured);
const rest = products.filter((p) => !p.featured);
const byslug = Object.fromEntries(products.map((p) => [p.slug, p]));

const home = () => page({
  title: `${site.name} · Software by ${site.creator}`, desc: site.description, path: '/', image: og('home'),
  ld: { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url, description: site.description, author: { '@type': 'Person', name: site.creator, url: `${site.url}/about/` } },
  body: `
<section class="hero">
  <div class="hero-text">
    <p class="eyebrow"><span class="dot"></span>${site.name} · software by ${site.creator}</p>
    <h1>Small annoyances, <em>turned into software.</em></h1>
    <p class="hero-sub">A home for the tools I build because I wanted them to exist. They are free to use, and a new one appears whenever an idea refuses to leave me alone.</p>
    <div class="actions"><a class="btn btn-p" href="/products/">See what I've built ${arrow}</a><a class="btn" href="/about/">Who makes these?</a></div>
  </div>
  ${bench()}
</section>

<div class="ticker" aria-hidden="true"><div>${Array.from({ length: 4 }, () => products.map((p) => `<span>${esc(p.name)}</span><b>✳</b>`).join('')).join('')}</div></div>

<section class="s features-home" style="--n:${featured.length}">
  <div class="s-head"><h2 class="h2">Selected work</h2><a class="link" href="/products/">All ${products.length} products ${arrow}</a></div>
  ${featured.map((p, i) => `
  <a class="showcase reveal${i % 2 ? ' flip' : ''}" href="/products/${p.slug}/" style="--p:${p.accent};--p2:${p.accent2};--i:${i}">
    <div class="showcase-text">
      <div class="p-id">${mark(p, 36)}<span>${esc(p.category)}</span>${status(p)}</div>
      <h3>${esc(p.name)}</h3>
      <p class="p-tag">${esc(p.tagline)}</p>
      <p class="p-sum">${esc(p.summary)}</p>
      <span class="go">Explore ${esc(p.name)} ${arrow}</span>
      ${motif(p)}
    </div>
    <div class="showcase-art">${stage(p)}</div>
    ${p.motif && motifs[p.motif] ? `<span class="motif-bg" aria-hidden="true">${motifs[p.motif]}</span>` : ''}
  </a>`).join('')}
</section>

<section class="s">
  <div class="s-head"><h2 class="h2">Also in the collection</h2></div>
  <div class="grid grid-${Math.min(3, rest.length)}">${rest.map((p) => card(p)).join('')}</div>
</section>

<section class="s s-lab reveal">
  <div class="lab-head"><p class="eyebrow">On the bench</p><h2 class="h2">Things still in pieces.</h2><p class="lede">Not everything is ready for its own page. These are being worked on right now.</p></div>
  <ul class="lab">${lab.map((l) => `<li><a href="${l.href}"><h3>${esc(l.name)}</h3><p>${esc(l.text)}</p></a></li>`).join('')}</ul>
</section>

<section class="s s-person reveal">
  <a class="arch arch-s" href="/about/" aria-label="About ${site.creator}"><img src="${media(site.portrait.src)}" width="${site.portrait.w}" height="${site.portrait.h}" alt="${esc(site.portrait.alt)}" loading="lazy"></a>
  <div>
    <p class="eyebrow">The person behind them</p>
    <h2 class="big">I'm ${site.creator}. I build the tools I wish already existed.</h2>
    <p class="lede">Sometimes I need the fix myself. Sometimes the idea is just too interesting to leave alone.</p>
    <a class="link" href="/about/">More about how I work ${arrow}</a>
  </div>
</section>

<section class="s s-end reveal">
  <h2>What should exist <em>next?</em></h2>
  <p class="lede">If a small problem has been bugging you lately, tell me about it. Chances are I'll find it interesting too.</p>
  <div class="actions"><a class="btn btn-p" href="${site.github}">Say hi on GitHub</a><a class="btn" href="/products/">Browse the products</a></div>
</section>`,
});

const platforms = [...new Set(products.flatMap((p) => p.platforms))];
const productsPage = () => page({
  title: `Products · ${site.name}`, desc: `Everything ${site.creator} has built so far: ${products.map((p) => p.name).join(', ')}.`, path: '/products/', cur: 'products',
  body: `
<section class="page-head">
  <p class="eyebrow">The collection</p>
  <h1>Everything I've built <em>so far.</em></h1>
  <p class="hero-sub">${products.length} products. Some are released, some are early, and each one says plainly what it can and can't do yet.</p>
  <div class="filters" role="group" aria-label="Show products for">
    <button type="button" data-filter="all" aria-pressed="true">All</button>
    ${platforms.map((pl) => `<button type="button" data-filter="${pl.toLowerCase()}" aria-pressed="false">${esc(pl)}</button>`).join('')}
  </div>
</section>
<section class="s">
  <h2 class="sr">All products</h2>
  <div class="grid grid-bento" id="collection">
    ${[...featured, ...rest].map((p) => card(p, p.featured ? 'card-wide' : 'card-compact')).join('')}
  </div>
  <p class="empty" id="empty" hidden>Nothing for this platform yet.</p>
</section>`,
});

const loopArt = [
  '<path d="M6 40h22q6 0 6-7t6-7 6 7-3 9 9-2h22"/><path class="a-spark" d="M40 12v6M31 15l3 5M49 15l-3 5"/>',
  '<path d="M26 30c0-10 8-16 16-16s14 6 14 13c0 12-14 10-14 22"/><circle cx="42" cy="62" r="2.6" class="a-fill"/>',
  '<rect x="12" y="40" width="22" height="22" rx="3"/><rect x="38" y="40" width="22" height="22" rx="3"/><rect class="a-drop" x="25" y="14" width="22" height="22" rx="3"/>',
  '<path d="M14 34v26h40V44"/><path class="a-send" d="M34 40L62 12M44 12h18v18"/>',
  '<path d="M58 30a22 22 0 1 0 4 16"/><path d="M60 14v16H44"/>',
];
const about = () => page({
  title: `About · ${site.name}`, desc: `${site.creator} builds software for the fun of it and shares it in case it helps.`, path: '/about/', cur: 'about', image: og('home'),
  ld: { '@context': 'https://schema.org', '@type': 'Person', name: site.creator, url: `${site.url}/about/`, sameAs: [site.github] },
  body: `
<section class="about">
  <div class="about-text">
    <p class="eyebrow">About</p>
    <h1>Hi, I'm Nisar. <em>Thanks for stopping by.</em></h1>
    <div class="prose">
      <p>Most of what I build starts with a small annoyance: something that's missing, a step that's slower than it should be, a job I keep doing by hand.</p>
      <p>Sometimes I need the fix myself. Sometimes the idea is just too interesting to leave alone. When it turns out useful, I put it here, free for anyone.</p>
      <p>${site.name} is the home for all of it. It is not a company and it is not selling anything. It is where my software lives.</p>
    </div>
  </div>
  <div class="about-photo">
    <div class="arch"><img src="${media(site.portrait.src)}" width="${site.portrait.w}" height="${site.portrait.h}" alt="${esc(site.portrait.alt)}" fetchpriority="high"></div>
    <p class="arch-cap"><b>${site.creator}</b><span>the person behind ${site.name}</span></p>
    <svg class="ring" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="ring-p" d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0"/></defs><text><textPath href="#ring-p">notice · wonder · build · share · repeat · notice · wonder · build · share · repeat ·</textPath></text><circle cx="100" cy="100" r="13"/></svg>
  </div>
</section>

<section class="s story">
  <div class="story-head reveal">
    <p class="eyebrow">How it usually goes</p>
    <h2 class="big">It starts tangled. <em>It ends as a tool.</em></h2>
  </div>
  <svg class="tangle" viewBox="0 0 120 70" aria-hidden="true"><path d="M8 20c20-18 44 8 26 22S6 30 30 16s52 6 40 26-44 2-24-14 50-4 46 12-22 14-32 10"/></svg>
  <ol class="thread">${site.loop.map(([a, b], i) => `
    <li class="reveal"><span class="node" aria-hidden="true"><svg viewBox="0 0 72 72">${loopArt[i]}</svg></span>
      <div><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(a)}</h3><p>${esc(b)}</p></div></li>`).join('')}
  </ol>
</section>

<section class="s quote reveal">
  <p class="eyebrow">Why I share them</p>
  <blockquote>Not every project needs a business plan. <em>Some just need a good question and a free evening.</em></blockquote>
  <p class="lede">Sometimes a problem is interesting, a solution seems possible, and building it is reward enough. Each product page says plainly what the software can and can't do yet.</p>
</section>

<section class="s shelf reveal">
  <div class="s-head"><h2 class="h2">On the shelf so far</h2><a class="link" href="/products/">See them properly ${arrow}</a></div>
  <ul>${products.map((p) => `<li><a href="/products/${p.slug}/" style="--p:${p.accent}">${mark(p, 44)}<span>${esc(p.name)}</span><small>${esc(p.annoyance)}</small></a></li>`).join('')}</ul>
</section>

<section class="s s-end reveal">
  <h2>Come say <em>hi.</em></h2>
  <p class="lede">Use anything you find here. If something breaks or could work better, open an issue on its GitHub page. And if you have an idea for something that should exist, I'd like to hear it.</p>
  <div class="actions"><a class="btn btn-p" href="${site.github}">Find me on GitHub</a><a class="btn" href="/products/">See the products</a></div>
</section>`,
});

const notFound = () => page({
  title: `Page not found · ${site.name}`, desc: 'This page does not exist.', path: '/404', body: `
<section class="page-head nf">
  <p class="eyebrow">404</p>
  <h1>Nothing lives at <em>this address.</em></h1>
  <p class="hero-sub">The link may be old, or the page may have moved.</p>
  <div class="actions"><a class="btn btn-p" href="/">Go home</a><a class="btn" href="/products/">See the products</a></div>
</section>`,
});

/* ---------- write ---------- */
if (existsSync(out)) rmSync(out, { recursive: true });
const write = (p, html) => { const f = join(out, p); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, html); };
write('index.html', home());
write('products/index.html', productsPage());
write('about/index.html', about());
write('404.html', notFound());
for (const p of products) write(`products/${p.slug}/index.html`, productPage(p));
cpSync(join(root, 'media'), join(out, 'media'), { recursive: true });
cpSync(join(root, 'fonts'), join(out, 'fonts'), { recursive: true });
write(`assets/${assets.css}`, css);
write(`assets/${assets.js}`, js);
write('favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0d0c0a"/><circle cx="16" cy="16" r="7" fill="#f0a63a"/></svg>');
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
const urls = ['/', '/products/', '/about/', ...products.map((p) => `/products/${p.slug}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${site.url}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Built ${urls.length + 1} pages into public/`);
