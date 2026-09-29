const { chromium, devices, ok, settle, decode, summary, shotPath, DEMO_URL, DEMO_FILE_URL } = require('./lib.js');
async function lastMsg(b, qs, full) {
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const wa = []; await ctx.route(/wa\.me/, r => { wa.push(r.request().url()); r.fulfill({ status: 200, body: 'wa' }); });
  const p = await ctx.newPage();
  await p.goto(DEMO_URL + qs, { waitUntil: 'networkidle' });
  await p.tap('.app-cta[data-form="auto"]'); await settle(p);
  if (full) { await p.tap('.q-foot .q-primary'); await settle(p); await p.reload({ waitUntil: 'networkidle' }); await settle(p); await p.tap('.q-alt'); }
  else await p.tap('.q-alt');
  await settle(p); await p.waitForTimeout(300);
  const m = decode(wa[wa.length - 1]); await ctx.close(); return m;
}
(async () => {
  const b = await chromium.launch();
  let m = await lastMsg(b, '?utm_source=instagram&utm_medium=story&utm_campaign=tip-auto');
  console.log('    ' + m.split('\n').join('\n    '));
  ok(m.trim().endsWith('Vía: Instagram (historia) · tip-auto'), 'story link → source line');
  m = await lastMsg(b, '?utm_source=instagram&utm_medium=highlight');
  ok(m.trim().endsWith('Vía: Instagram (destacada)'), 'highlight link', m.split('\n').pop());
  m = await lastMsg(b, '');
  ok(!m.includes('Vía:'), 'plain visit adds nothing');
  m = await lastMsg(b, '?utm_source=instagram&utm_medium=story&utm_campaign=tip-casa', true);
  ok(m.trim().endsWith('Vía: Instagram (historia) · tip-casa'), 'source survives a reload mid-quote');
  m = await lastMsg(b, '?utm_source=ig%0A*Gratis*&utm_campaign=' + 'x'.repeat(80));
  const last = m.split('\n').pop();
  ok(!/\*/.test(last) && last.length < 70, 'odd characters stripped, length capped', last);
  await b.close();
  process.exit(summary() ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
