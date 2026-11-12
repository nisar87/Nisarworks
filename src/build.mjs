// Builds the whole site into public/ from content/*.mjs. No dependencies: `node src/build.mjs`.
import { mkdirSync, writeFileSync, readFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products, lab } from '../content/products.mjs';
import { site } from '../content/site.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const media = (p) => '/media/' + p;

/* ---------- small pieces ---------- */
const mark = (p, size = 48) =>
  `<span class="mark" style="--p:${p.accent}" aria-hidden="true"><svg viewBox="0 0 48 48" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${p.mark}</svg></span>`;

const status = (p) => `<span class="status status-${p.status.kind}"><i></i>${esc(p.status.label)}</span>`;

const version = (p) => p.version
  ? `<span class="ver">v<span${p.versionFixed ? '' : ` data-repo="${p.repo}"${p.prerelease ? ' data-pre' : ''}`}>${esc(p.version)}</span></span>` : '';

const arrow = '<svg class="arr" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
const icons = {
  download: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13.5h10"/></svg>',
  open: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3H3v10h10v-3M9 3h4v4M13 3 7.5 8.5"/></svg>',
};

const frame = (img, { title = '', eager = false, cls = '' } = {}) => `
<figure class="frame ${cls}">
  <div class="frame-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(title)}</span></div>
  <img src="${media(img.src)}" width="${img.w}" height="${img.h}" alt="${esc(img.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>
</figure>`;

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
<div class="wall ${cls}">${names.map((n) => `<img src="${media(`ai-cv-studio/${n}.webp`)}" width="397" height="562" alt="CV template preview: ${esc(n)}, with sample data." loading="lazy" decoding="async">`).join('')}</div>`;

const cover = (p, opts = {}) => {
  if (p.cover.src) return frame(p.cover, { title: p.name, ...opts });
  if (p.cover.wall) return wall(p.cover.wall, 'wall-cover');
  if (p.cover.phones) return `<div class="phones" role="img" aria-label="${esc(p.cover.alt)}">${p.cover.phones.map((n) => `<img src="${media(`${p.slug}/${n}.webp`)}" width="540" height="1070" alt="" loading="lazy">`).join('')}</div>`;
  return art[p.cover.art];
};

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

const page = ({ title, desc, path, cur, body, accent, image }) => `<!DOCTYPE html>
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
${image ? `<meta property="og:image" content="${site.url}${media(image)}">` : ''}
<meta name="theme-color" content="#0d0c0a">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
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
<script src="/app.js" defer></script>
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
  <div class="g-track" tabindex="0">
    ${s.items.map((it) => `<div class="g-item${it.phone ? ' g-phone' : it.w < 700 ? (it.w < 320 ? ' g-tiny' : ' g-small') : ''}">${it.phone ? `<figure class="phone"><img src="${media(it.src)}" width="${it.w}" height="${it.h}" alt="${esc(it.alt)}" loading="lazy"></figure>` : frame(it, { title: p.name })}<p class="cap">${esc(it.caption)}</p></div>`).join('')}
  </div>
  ${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}
</section>`,

  wall: (s) => `
<section class="s reveal">
  <h2 class="h2">${esc(s.title)}</h2>
  <ul class="wall wall-full">${s.items.map(([f, n]) => `<li><img src="${media(`ai-cv-studio/${f}.webp`)}" width="397" height="562" alt="CV template preview: ${esc(n)}, with sample data." loading="lazy" decoding="async"><span>${esc(n)}</span></li>`).join('')}</ul>
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

  figures: (s) => `
<section class="s reveal">
  <h2 class="h2">${esc(s.title)}</h2>
  <ul class="figures">${s.items.map((f) => `<li><span class="fig">${esc(f.value)}<small>${esc(f.unit)}</small></span><span class="fig-l">${esc(f.label)}</span></li>`).join('')}</ul>
  <p class="note">${esc(s.note)}</p>
</section>`,

  video: (s) => `
<section class="s reveal">
  <h2 class="h2">${esc(s.title)}</h2>
  ${s.src
    ? `<video class="video" src="${media(s.src)}" ${s.poster ? `poster="${media(s.poster)}"` : ''} muted loop playsinline controls preload="metadata"></video>`
    : `<div class="video placeholder"><span>No recording yet</span></div>`}
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
    </div>
    <div class="p-hero-art">${cover(p, { eager: true })}</div>
  </header>
  ${p.sections.map((s) => sec[s.type](s, p)).join('')}
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
    accent: { a: p.accent, b: p.accent2 }, image: p.cover.src || (p.cover.phones ? `${p.slug}/${p.cover.phones[0]}.webp` : undefined),
  });
};

/* ---------- pages ---------- */
const featured = products.filter((p) => p.featured);
const rest = products.filter((p) => !p.featured);
const byslug = Object.fromEntries(products.map((p) => [p.slug, p]));

const home = () => page({
  title: `${site.name} · Software by ${site.creator}`, desc: site.description, path: '/', image: 'netmerge/overview-cover.webp',
  body: `
<section class="hero">
  <div class="hero-text">
    <p class="eyebrow"><span class="dot"></span>${site.name} · software by ${site.creator}</p>
    <h1>Small annoyances, <em>turned into software.</em></h1>
    <p class="hero-sub">A home for the tools I build because I wanted them to exist. They are free to use, and a new one appears whenever an idea refuses to leave me alone.</p>
    <div class="actions"><a class="btn btn-p" href="/products/">See what I've built ${arrow}</a><a class="btn" href="/about/">Who makes these?</a></div>
  </div>
  <div class="hero-stage" aria-hidden="true">
    <div class="stage-a">${frame(byslug.netmerge.cover, { title: 'NetMerge', eager: true })}</div>
    <div class="stage-b">${frame(byslug.pullwell.cover, { title: 'Pullwell' })}</div>
    <img class="stage-c" src="${media('ai-cv-studio/vivid.webp')}" width="397" height="562" alt="" loading="lazy">
  </div>
</section>

<div class="ticker" aria-hidden="true"><div>${Array.from({ length: 4 }, () => products.map((p) => `<span>${esc(p.name)}</span><b>✳</b>`).join('')).join('')}</div></div>

<section class="s features-home">
  <div class="s-head"><h2 class="h2">Selected work</h2><a class="link" href="/products/">All ${products.length} products ${arrow}</a></div>
  ${featured.map((p, i) => `
  <a class="showcase reveal${i % 2 ? ' flip' : ''}" href="/products/${p.slug}/" style="--p:${p.accent};--p2:${p.accent2}">
    <div class="showcase-text">
      <div class="p-id">${mark(p, 36)}<span>${esc(p.category)}</span>${status(p)}</div>
      <h3>${esc(p.name)}</h3>
      <p class="p-tag">${esc(p.tagline)}</p>
      <p class="p-sum">${esc(p.summary)}</p>
      <span class="go">Explore ${esc(p.name)} ${arrow}</span>
    </div>
    <div class="showcase-art">${cover(p)}</div>
  </a>`).join('')}
</section>

<section class="s">
  <div class="s-head"><h2 class="h2">Also in the collection</h2></div>
  <div class="grid grid-2">${rest.map((p) => card(p)).join('')}</div>
</section>

<section class="s s-lab reveal">
  <div class="lab-head"><p class="eyebrow">On the bench</p><h2 class="h2">Things still in pieces.</h2><p class="lede">Not everything is ready for its own page. These are being worked on right now.</p></div>
  <ul class="lab">${lab.map((l) => `<li><a href="${l.href}"><h3>${esc(l.name)}</h3><p>${esc(l.text)}</p></a></li>`).join('')}</ul>
</section>

<section class="s s-person reveal">
  <img src="${media(site.portrait.src)}" width="${site.portrait.w}" height="${site.portrait.h}" alt="${esc(site.portrait.alt)}" loading="lazy" decoding="async">
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
  <div class="grid grid-bento" id="collection">
    ${products.map((p) => card(p, p.featured ? 'card-wide' : '')).join('')}
  </div>
  <p class="empty" id="empty" hidden>Nothing for this platform yet.</p>
</section>`,
});

const about = () => page({
  title: `About · ${site.name}`, desc: `${site.creator} builds software for the fun of it and shares it in case it helps.`, path: '/about/', cur: 'about', image: site.portrait.src,
  body: `
<section class="about">
  <div class="about-photo">
    <img src="${media(site.portrait.src)}" width="${site.portrait.w}" height="${site.portrait.h}" alt="${esc(site.portrait.alt)}" fetchpriority="high">
  </div>
  <div class="about-text">
    <p class="eyebrow">About</p>
    <h1>Hi, I'm Nisar. <em>Thanks for stopping by.</em></h1>
    <div class="prose">
      <p>Most of what I build starts with a small annoyance: something that's missing, a step that's slower than it should be, a job I keep doing by hand.</p>
      <p>Sometimes I need the fix myself. Sometimes the idea is just too interesting to leave alone. When it turns out useful, I put it here, free for anyone.</p>
      <p>${site.name} is the home for all of it. It is not a company and it is not selling anything. It is where my software lives.</p>
    </div>
  </div>
</section>

<section class="s reveal">
  <h2 class="h2">How it usually goes</h2>
  <ol class="loop">${site.loop.map(([a, b], i) => `<li><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(a)}</h3><p>${esc(b)}</p></li>`).join('')}</ol>
</section>

<section class="s s-problem reveal">
  <p class="eyebrow">Why I share them</p>
  <h2 class="big">Not every project needs a business plan. Some just need a good question and a free evening.</h2>
  <div class="prose">
    <p>Sometimes a problem is interesting, a solution seems possible, and building it is reward enough. Each product page says plainly what the software can and can't do yet.</p>
  </div>
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
write('styles.css', readFileSync(join(root, 'src/styles.css'), 'utf8'));
write('app.js', readFileSync(join(root, 'src/app.js'), 'utf8'));
write('favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0d0c0a"/><circle cx="16" cy="16" r="7" fill="#f0a63a"/></svg>');
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
const urls = ['/', '/products/', '/about/', ...products.map((p) => `/products/${p.slug}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${site.url}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Built ${urls.length + 1} pages into public/`);
