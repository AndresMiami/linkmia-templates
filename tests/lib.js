// Shared helpers for the demo browser tests. Each suite imports this, runs
// against the local test server (serve.js), and exits nonzero on failure.
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium, devices } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const PORT = process.env.TEST_PORT || 8765;
const DEMO_URL = `http://localhost:${PORT}/demos/bnseguros.html`;
const DEMO_FILE_URL = pathToFileURL(path.resolve(__dirname, '../demos/bnseguros.html')).href;
const OUT_DIR = path.join(__dirname, '.out');

function shotPath(suite, n) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  return path.join(OUT_DIR, `${suite}-${n}.png`);
}

let fails = 0, passes = 0;
function ok(cond, msg, extra) { if (cond) { passes++; console.log('  ✓ ' + msg); } else { fails++; console.log('  ✗ ' + msg + (extra !== undefined ? '  → ' + JSON.stringify(extra) : '')); } }
async function newPhone(b, opts = {}) {
  const ctx = await b.newContext({ ...devices['iPhone 13'], ...opts });
  const wa = [];
  await ctx.route(/wa\.me/, r => { wa.push(r.request().url()); return r.fulfill({ status: 200, contentType: 'text/html', body: '<title>wa</title>wa' }); });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  // Ignore stray asset 404s so a missing image never masks a real script error.
  p.on('console', m => { if (m.type() === 'error' && !/bnseguros-logo|404|ERR_/.test(m.text())) errs.push(m.text()); });
  await p.goto(DEMO_URL, { waitUntil: 'networkidle' });
  return { ctx, p, wa, errs };
}
const settle = p => p.waitForTimeout(350);
const txt = async (p, sel) => ((await p.textContent(sel)) || '').replace(/\s+/g, ' ').trim();
const state = p => p.evaluate(() => history.state);
const decode = u => decodeURIComponent(u.split('text=')[1]);

module.exports = {
  chromium, devices, ok, newPhone, settle, txt, state, decode, shotPath, DEMO_URL, DEMO_FILE_URL,
  summary: () => { console.log(`\n${passes} passed, ${fails} failed`); return fails; }
};
