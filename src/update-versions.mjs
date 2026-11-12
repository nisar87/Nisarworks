// Looks up the newest release tag of each product on GitHub and saves it to content/versions.json.
// Run before a build when a product has a new release: `node src/update-versions.mjs`.
// It uses `git ls-remote`, so it needs git and no GitHub account. If a lookup fails, the old number is kept.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { products } from '../content/products.mjs';

const file = new URL('../content/versions.json', import.meta.url);
const saved = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
const key = (v) => v.replace(/^v/, '').split(/[.-]/).map((x) => (/^\d+$/.test(x) ? String(x).padStart(6, '0') : x)).join('.');

for (const p of products) {
  if (!p.version || p.versionFixed) continue;
  try {
    const out = execFileSync('git', ['ls-remote', '--tags', `https://github.com/nisar87/${p.repo}`], { encoding: 'utf8', timeout: 30000 });
    const tags = out.split('\n').map((l) => l.split('refs/tags/')[1]).filter((t) => t && !t.endsWith('^{}') && /^v?\d+\.\d+/.test(t))
      .filter((t) => p.prerelease || !/-/.test(t));
    // a release without a suffix sorts after its own pre-releases
    tags.sort((a, b) => (key(a) + (/-/.test(a) ? '' : '.~')).localeCompare(key(b) + (/-/.test(b) ? '' : '.~')));
    if (tags.length) saved[p.slug] = tags.at(-1).replace(/^v/, '');
    console.log(p.name, saved[p.slug]);
  } catch (e) {
    console.log(p.name, 'lookup failed, keeping', saved[p.slug] || p.version);
  }
}
writeFileSync(file, JSON.stringify(saved, null, 2) + '\n');
