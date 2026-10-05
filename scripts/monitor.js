// Uptime monitor for the live client pages. Run by .github/workflows/monitor.yml
// every ~10 minutes. It opens each page in a real browser (like a phone would),
// so it catches a page that answers "200 OK" but shows "Page Not Found".
//
// A check must fail twice, about 45 seconds apart, before it counts, so a
// single slow load never wakes anyone up.
//
// Alerts go to Telegram (secrets TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID):
//   - every failing run, while something is down
//   - once when everything is back up
// Locally: BASE_URL=http://localhost:8765 EXPECT_CONTEXT=local node scripts/monitor.js
const fs = require('fs');
const path = require('path');
const pw = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const PROD = 'https://link.linkmia.com';
const BASE = (process.env.BASE_URL || PROD).replace(/\/$/, '');
const EXPECT_CONTEXT = process.env.EXPECT_CONTEXT || 'production';
const RETRY_WAIT_MS = Number(process.env.RETRY_WAIT_MS || 45000);
const SHOT_DIR = process.env.SHOT_DIR || path.join(process.cwd(), 'monitor-shots');

async function get(path) {
    const res = await fetch(`${BASE}${path}${path.includes('?') ? '&' : '?'}monitor=${Date.now()}`, { headers: { 'cache-control': 'no-cache' } });
    return { status: res.status, text: await res.text() };
}

// The funnel's three quote buttons are on screen and its crash screen is not.
async function expectFunnel(page) {
    await page.locator('.app-cta').nth(2).waitFor({ state: 'visible', timeout: 20000 });
    const crashed = await page.evaluate(() => {
        const e = document.getElementById('error-state');
        return !!e && !e.classList.contains('hidden');
    });
    if (crashed) throw new Error('page shows "Page Not Found"');
}

const CHECKS = {
    'version.json': async () => {
        const r = await get('/version.json');
        if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
        const v = JSON.parse(r.text);
        if (v.context !== EXPECT_CONTEXT) throw new Error(`serving a "${v.context}" build, expected "${EXPECT_CONTEXT}"`);
        return `commit ${String(v.commit).slice(0, 7)}`;
    },
    'pages.json': async () => {
        const r = await get('/data/pages.json');
        if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
        const pages = JSON.parse(r.text).pages;
        if (!Array.isArray(pages) || !pages.some(p => p.slug === 'bnseguros')) throw new Error('bnseguros entry missing');
    },
    '/bnseguros': async page => {
        const res = await page.goto(`${BASE}/bnseguros`, { waitUntil: 'domcontentloaded' });
        if (!res || res.status() !== 200) throw new Error(`HTTP ${res && res.status()}`);
        await expectFunnel(page);
    },
    '/demos/bnseguros.html': async page => {
        const res = await page.goto(`${BASE}/demos/bnseguros.html`, { waitUntil: 'domcontentloaded' });
        if (!res || res.status() !== 200) throw new Error(`HTTP ${res && res.status()}`);
        await expectFunnel(page);
    },
    '/s/bnseg (short link)': async page => {
        await page.goto(`${BASE}/s/bnseg`, { waitUntil: 'domcontentloaded' });
        await page.waitForURL(/\/bnseguros(\?|$)/, { timeout: 20000 });
        await expectFunnel(page);
    },
    '/p/miamiridez': async page => {
        await page.goto(`${BASE}/p/miamiridez`, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => {
            const e = document.getElementById('error-state');
            const name = document.getElementById('restaurant-name') || document.getElementById('card-restaurant-name');
            return (e && !e.classList.contains('hidden')) || (name && name.textContent.trim());
        }, null, { timeout: 20000 });
        const crashed = await page.evaluate(() => !document.getElementById('error-state').classList.contains('hidden'));
        if (crashed) throw new Error('page shows "Page Not Found"');
    },
};

async function runChecks(browser, names) {
    const results = {};
    for (const name of names) {
        const ctx = await browser.newContext({ ...pw.devices['iPhone 13'], serviceWorkers: 'block' });
        // The short link always redirects to the production host; when testing
        // another BASE_URL, answer those requests from BASE_URL instead.
        if (BASE !== PROD) await ctx.route(`${PROD}/**`, async route => route.fulfill({ response: await route.fetch({ url: route.request().url().replace(PROD, BASE) }) }));
        const page = await ctx.newPage();
        try {
            results[name] = { ok: true, note: (await CHECKS[name](page)) || '' };
        } catch (e) {
            // What a phone would see right now: goes into the Telegram alert.
            const shot = page.url() !== 'about:blank' ? await page.screenshot().catch(() => null) : null;
            results[name] = { ok: false, note: String(e.message || e).split('\n')[0].slice(0, 160), shot };
        }
        await ctx.close();
    }
    return results;
}

async function telegramPhoto(png, caption) {
    const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chat || !png) return false;
    const form = new FormData();
    form.append('chat_id', chat);
    form.append('caption', caption.slice(0, 1000));
    form.append('photo', new Blob([png], { type: 'image/png' }), 'screen.png');
    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: 'POST', body: form });
    if (!res.ok) console.log(`Telegram photo answered HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res.ok;
}

async function telegram(text) {
    const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chat) { console.log('(Telegram secrets not set — no message sent)'); return false; }
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
    });
    if (!res.ok) console.log(`Telegram answered HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res.ok;
}

function miamiTime() {
    return new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' });
}

(async () => {
    const browser = await pw.chromium.launch(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {});
    const names = Object.keys(CHECKS);
    let results = await runChecks(browser, names);
    const firstFails = names.filter(n => !results[n].ok);
    if (firstFails.length) {
        console.log(`First pass failed: ${firstFails.join(', ')} — checking again in ${RETRY_WAIT_MS / 1000}s`);
        await new Promise(r => setTimeout(r, RETRY_WAIT_MS));
        Object.assign(results, await runChecks(browser, firstFails));
    }
    await browser.close();

    for (const n of names) console.log(`${results[n].ok ? '✓' : '✗'} ${n}${results[n].note ? ' — ' + results[n].note : ''}`);
    const down = names.filter(n => !results[n].ok);
    const runUrl = process.env.RUN_URL ? `\nDetails: ${process.env.RUN_URL}` : '';

    if (process.env.TEST_ALERT === 'true') {
        await telegram(`🧪 LinkMia monitor test (${miamiTime()} Miami).\n` +
            names.map(n => `${results[n].ok ? '✅' : '❌'} ${n}${results[n].note ? ' — ' + results[n].note : ''}`).join('\n') + runUrl);
    }
    if (down.length) {
        await telegram(`🔴 LinkMia pages DOWN (${miamiTime()} Miami)\n` +
            down.map(n => `❌ ${n} — ${results[n].note}`).join('\n') +
            `\n\nFirst check: ${BASE}/version.json` + `\nStatus page: ${BASE}/status/` + runUrl);
        // A picture of each broken page, as a phone sees it (kept as a run artifact too).
        fs.mkdirSync(SHOT_DIR, { recursive: true });
        for (const n of down.filter(n => results[n].shot)) {
            fs.writeFileSync(path.join(SHOT_DIR, n.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') + '.png'), results[n].shot);
        }
        for (const n of down.filter(n => results[n].shot).slice(0, 3)) await telegramPhoto(results[n].shot, `❌ ${n} — what a phone sees right now`);
        process.exit(1);
    }
    if (process.env.PREV_CONCLUSION === 'failure') {
        await telegram(`✅ LinkMia pages back UP (${miamiTime()} Miami). All ${names.length} checks pass. ${results['version.json'].note}`);
    }
})().catch(async e => {
    console.error('Monitor crashed:', e);
    await telegram(`⚠️ LinkMia monitor itself failed to run: ${String(e.message || e).slice(0, 200)}${process.env.RUN_URL ? '\n' + process.env.RUN_URL : ''}`).catch(() => {});
    process.exit(1);
});
