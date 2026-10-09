// What the page says when JavaScript doesn't run (link previews, curl, AI
// fetchers) and what a visitor sees if the page fails to draw. Neither may
// ever read as "Page Not Found": both must name Best National and offer
// WhatsApp + phone.
const { chromium, devices, ok, newPhone, settle, summary, shotPath, DEMO_URL } = require('./lib.js');
const SHOT = n => shotPath('fallback', n);

// Text a reader that skips JavaScript extracts: everything outside script/style/svg.
const readerText = html => html
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z]+;|&#\d+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const meta = (html, attr, name) => ((html.match(new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`)) || [])[1]);

// The real page, made to fail while drawing.
async function crashedPhone(b, query = '') {
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  await ctx.route(u => u.pathname === '/demos/bnseguros.html', async route => {
    const res = await route.fetch();
    const body = (await res.text()).replace('renderPage(DEMO_PAGE);', 'renderPage(DEMO_PAGE); throw new Error("simulated render failure");');
    await route.fulfill({ response: res, body });
  });
  const p = await ctx.newPage();
  await p.goto(DEMO_URL + query, { waitUntil: 'networkidle' });
  await settle(p);
  return { ctx, p };
}

(async () => {
  const b = await chromium.launch();

  console.log('Without JavaScript: what link previews and fetch tools read');
  {
    const html = await (await fetch(DEMO_URL)).text();
    const text = readerText(html);
    ok(text.includes('Best National Insurance'), 'names the business', text.slice(0, 120));
    ok(!/page not found|doesn.t exist|has been removed|Loading\.\.\./i.test(text), 'never reads as "Page Not Found" or "Loading..."', text.slice(0, 160));
    ok(!/not found/i.test(html), 'the raw HTML never contains "not found", even in comments or scripts (grep-based checks)');
    ok(/^Best National Insurance/.test((html.match(/<title[^>]*>([^<]*)</) || [])[1] || ''), '<title> names the business');
    ok(meta(html, 'property', 'og:title') === 'Best National Insurance', 'link preview title');
    ok(/^https:\/\/link\.linkmia\.com\/.+\.(webp|png|jpg)$/.test(meta(html, 'property', 'og:image') || ''), 'link preview image is an absolute URL');
    ok(/cotiza/i.test(meta(html, 'name', 'description') || ''), 'description says what the page is for');
  }

  console.log('Normal load');
  {
    const { ctx, p, errs } = await newPhone(b);
    ok(!(await p.isVisible('#loading')) && !(await p.isVisible('#error-state')), 'loading screen gone, no error card');
    ok(await p.evaluate(() => document.getElementById('error-state').childElementCount === 0), 'error card stays empty');
    ok((await p.locator('.app-cta').count()) === 3 && await p.isVisible('.app-cta >> nth=2'), 'quote buttons on screen');
    ok(!errs.length, 'no page errors', errs);
    // The fallback numbers must be the ones the page itself uses.
    const sync = await p.evaluate(() => {
      const urls = (DEMO_PAGE.buttons || []).map(x => x.url);
      const ns = [...document.querySelectorAll('noscript')].map(n => n.textContent).join(' ');
      return {
        tel: urls.includes('tel:' + FALLBACK_CONTACT.phone),
        wa: urls.some(u => u.startsWith('https://wa.me/' + FALLBACK_CONTACT.whatsapp + '?')),
        label: FALLBACK_CONTACT.phoneLabel === '(' + FALLBACK_CONTACT.phone.slice(2, 5) + ') ' + FALLBACK_CONTACT.phone.slice(5, 8) + '-' + FALLBACK_CONTACT.phone.slice(8),
        noscript: ns.includes('tel:' + FALLBACK_CONTACT.phone) && ns.includes('wa.me/' + FALLBACK_CONTACT.whatsapp) && ns.includes(FALLBACK_CONTACT.phoneLabel),
      };
    });
    ok(sync.tel && sync.wa && sync.label, 'fallback phone and WhatsApp match the Llámanos/WhatsApp buttons', sync);
    ok(sync.noscript, 'no-JavaScript card uses the same numbers', sync);
    await ctx.close();
  }

  console.log('If the page fails to draw (Spanish)');
  {
    const { ctx, p } = await crashedPhone(b);
    ok(await p.isVisible('#error-state'), 'contact card shows');
    const body = await p.evaluate(() => document.body.innerText);
    ok(!/page not found|doesn.t exist/i.test(body), 'no "Page Not Found" anywhere on screen');
    ok((await p.textContent('#error-state h1')) === 'Best National Insurance', 'names the business');
    const wa = await p.getAttribute('#error-state .is-wa', 'href');
    ok(/^https:\/\/wa\.me\/13054070139\?text=/.test(wa) && (await p.textContent('#error-state .is-wa')) === 'Escribir por WhatsApp', 'WhatsApp button', wa);
    ok((await p.getAttribute('#error-state .is-call', 'href')) === 'tel:+13054070139' && (await p.textContent('#error-state .is-call')) === 'Llamar (305) 407-0139', 'call button with the number');
    ok(await p.evaluate(() => { const r = document.querySelector('#error-state .is-call').getBoundingClientRect(); const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return !!hit && !!hit.closest('#error-state'); }), 'card is on top of anything half-drawn');
    const btn = await p.evaluate(() => { const r = document.querySelector('#error-state .is-wa').getBoundingClientRect(); return { h: r.height, w: r.width }; });
    ok(btn.h >= 48 && btn.w <= 390 - 32, 'buttons are tap-sized and fit the phone', btn);
    await p.screenshot({ path: SHOT('crash-es') });
    await Promise.all([p.waitForNavigation(), p.tap('#error-state .fallback-retry')]);
    ok(new URL(p.url()).pathname === '/demos/bnseguros.html' && await p.evaluate(() => history.state === null || !history.state.bnq), '"Volver a intentar" reloads without the saved quote position');
    await ctx.close();
  }

  console.log('If the page fails to draw (English)');
  {
    const { ctx, p } = await crashedPhone(b, '?lang=en');
    ok((await p.textContent('#error-state .is-wa')) === 'Message on WhatsApp' && (await p.textContent('#error-state .is-call')) === 'Call (305) 407-0139' && (await p.textContent('#error-state .fallback-retry')) === 'Try again', 'English labels');
    ok(decodeURIComponent((await p.getAttribute('#error-state .is-wa', 'href')).split('text=')[1]).startsWith('Hi Best National'), 'English WhatsApp greeting');
    await ctx.close();
  }

  console.log('JavaScript turned off');
  {
    const ctx = await b.newContext({ ...devices['iPhone 13'], javaScriptEnabled: false });
    const p = await ctx.newPage();
    await p.goto(DEMO_URL, { waitUntil: 'load' });
    ok(!(await p.isVisible('#loading')), 'no endless loading screen');
    ok(await p.isVisible('.noscript-card .is-wa') && await p.isVisible('.noscript-card .is-call'), 'WhatsApp and call buttons visible');
    await p.screenshot({ path: SHOT('no-js') });
    await ctx.close();
  }

  await b.close();
  process.exit(summary() ? 1 : 0);
})();
