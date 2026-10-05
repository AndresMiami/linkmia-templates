// Netlify build step. Runs before every deploy (production, previews, branches).
// 1. Refuses to deploy a site that would break a client page: if any check
//    fails the build fails, and Netlify keeps the last good deploy live.
// 2. Writes /version.json so anyone can see which commit is actually being
//    served: https://link.linkmia.com/version.json
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const problems = [];
const need = (cond, msg) => { if (!cond) problems.push(msg); };
const read = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (_) { return null; } };

// Files every client page depends on.
const demo = read('demos/bnseguros.html');
need(demo, 'demos/bnseguros.html is missing');
if (demo) {
    need(demo.includes('const DEMO_PAGE'), 'demos/bnseguros.html has no DEMO_PAGE (wrong file?)');
    need(demo.includes('bnseguros-logo-3d.webp'), 'demos/bnseguros.html no longer references its logo');
}
for (const f of ['demos/bnseguros-logo-3d.webp', 'p/index.html', 's/index.html'])
    need(fs.existsSync(path.join(ROOT, f)), `${f} is missing`);

// The clean URL rewrite.
const toml = read('netlify.toml') || '';
for (const from of ['/bnseguros', '/bnseguros/'])
    need(new RegExp(`from = "${from}"\\s*\\n\\s*to = "/demos/bnseguros\\.html"\\s*\\n\\s*status = 200`).test(toml),
        `netlify.toml lost the ${from} -> /demos/bnseguros.html rewrite`);

// pages.json: every /p/ and /s/ link reads it.
let pages = null;
try { pages = JSON.parse(read('data/pages.json')).pages; } catch (e) { need(false, `data/pages.json does not parse: ${e.message}`); }
if (pages) {
    need(Array.isArray(pages) && pages.length > 0, 'data/pages.json has no pages');
    const slugs = new Set(), codes = new Set();
    for (const p of Array.isArray(pages) ? pages : []) {
        need(p && typeof p.slug === 'string' && p.slug, `a page has no slug: ${JSON.stringify(p).slice(0, 80)}`);
        need(p && typeof p.name === 'string' && p.name, `page "${p && p.slug}" has no name`);
        need(!slugs.has(p.slug), `duplicate slug "${p.slug}"`); slugs.add(p.slug);
        if (p.shortCode) { need(!codes.has(p.shortCode), `duplicate short code "${p.shortCode}"`); codes.add(p.shortCode); }
        if (p.type === 'custom') need(typeof p.url === 'string' && p.url.startsWith('/'), `custom page "${p.slug}" needs a /path url`);
    }
    const bn = (pages || []).find(p => p.slug === 'bnseguros');
    need(bn && bn.type === 'custom' && bn.url === '/bnseguros', 'pages.json lost the bnseguros entry (the /s/bnseg short link needs it)');
}

if (problems.length) {
    console.error('Pre-deploy check FAILED — not deploying (the live site stays as it is):');
    for (const m of problems) console.error('  ✗ ' + m);
    process.exit(1);
}

// Netlify sets these during builds; locally they are absent.
const version = {
    commit: process.env.COMMIT_REF || 'local',
    branch: process.env.BRANCH || process.env.HEAD || 'local',
    context: process.env.CONTEXT || 'local',
    deployId: process.env.DEPLOY_ID || null,
    builtAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(ROOT, 'version.json'), JSON.stringify(version, null, 2) + '\n');
console.log('Pre-deploy check passed:', JSON.stringify(version));
