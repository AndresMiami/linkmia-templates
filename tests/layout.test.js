const { chromium, devices, ok, settle, txt, summary, shotPath, DEMO_URL, DEMO_FILE_URL } = require('./lib.js');
const SHOT = n => shotPath('layout', n);
async function answerAuto(p) {
  const t = await txt(p, '#q-title');
  if (t.startsWith('¿Qué auto')) { await p.tap('#q-anio'); await settle(p); await p.tap('.sheet-row:has-text("2022")'); await settle(p); await p.tap('.make-tile:has-text("Toyota")'); await settle(p); await p.tap('.sheet-row:has-text("Corolla Cross")'); await settle(p); }
  else if (t.startsWith('¿Cómo usas')) await p.tap('label:has-text("Personal")');
  else if (t.startsWith('¿El auto es tuyo')) await p.tap('label:has-text("Es mío")');
  else if (t.startsWith('¿Qué cobertura')) await p.tap('label:has-text("Cobertura completa")');
  else if (t.startsWith('¿Tienes seguro')) await p.tap('label[for="q-seguroActual-1"]');
  else if (t.startsWith('Cuéntanos')) { await p.selectOption('#q-dob-dobD', '9'); await p.selectOption('#q-dob-dobM', '11'); await p.selectOption('#q-dob-dobY', '1995'); await p.fill('#q-zip', '33012'); await p.tap('label[for="q-accidentes-1"]'); }
  else if (t.startsWith('Último paso')) await p.fill('#q-nombre', 'Ana María Rodríguez-Fernández');
  return t;
}
(async () => {
  const b = await chromium.launch();

  console.log('320 × 568 (smallest common phone)');
  {
    const ctx = await b.newContext({ ...devices['iPhone SE'], viewport: { width: 320, height: 568 } });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(DEMO_URL, { waitUntil: 'networkidle' });
    await p.tap('.app-cta[data-form="auto"]'); await settle(p);
    await p.screenshot({ path: SHOT('320-intro') });
    await p.tap('.q-foot .q-primary'); await settle(p);
    for (let k = 0; k < 9; k++) {
      const t = await answerAuto(p); await settle(p);
      const m = await p.evaluate(() => {
        const btn = document.querySelector('.q-foot .q-primary').getBoundingClientRect();
        const sc = document.querySelector('.q-scroll');
        return { pageOverflow: document.documentElement.scrollWidth > innerWidth, viewOverflow: sc.scrollWidth > sc.clientWidth, btnVisible: btn.bottom <= innerHeight && btn.top >= 0, count: document.querySelector('.q-count').textContent };
      });
      ok(!m.pageOverflow && !m.viewOverflow && m.btnVisible, `${m.count || 'review'}: no sideways scroll, Continuar on screen`, m);
      if (k === 0) await p.screenshot({ path: SHOT('320-vehiculo') });
      if (t.startsWith('Cuéntanos')) await p.screenshot({ path: SHOT('320-conductor') });
      if (t.startsWith('Revisa')) { await p.screenshot({ path: SHOT('320-resumen') }); break; }
      await p.tap('.q-foot .q-primary'); await settle(p);
    }
    await p.tap('.q-foot .q-primary').catch(() => {});
    ok(errs.length === 0, 'no errors at 320', errs);
    await ctx.close();
  }

  console.log('desktop 1280 × 800');
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
    const p = await ctx.newPage();
    await p.goto(DEMO_URL, { waitUntil: 'networkidle' });
    await p.click('.app-cta[data-form="casa"]'); await settle(p);
    await p.click('.q-foot .q-primary'); await settle(p);
    await p.fill('#q-direccion', '33130'); await p.keyboard.press('Enter'); await settle(p);
    const w = await p.evaluate(() => document.querySelector('.q-view').getBoundingClientRect().width);
    ok(w <= 576, 'content column capped at 576px on desktop', w);
    await p.screenshot({ path: SHOT('desktop-tipo') });
    await p.keyboard.press('Escape'); await settle(p); await p.waitForTimeout(300);
    ok(!(await p.$('.q-flow')), 'Escape closes on desktop');
    await ctx.close();
  }

  console.log('reduced motion');
  {
    const ctx = await b.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(DEMO_URL, { waitUntil: 'networkidle' });
    await p.tap('.app-cta[data-form="auto"]'); await settle(p);
    await p.tap('.q-foot .q-primary'); await settle(p);
    const an = await p.evaluate(() => [getComputedStyle(document.querySelector('.q-flow')).animationName, getComputedStyle(document.querySelector('.q-view')).animationName]);
    ok(an.every(x => x === 'none'), 'no slide/fade animations', an);
    await ctx.close();
  }

  console.log('opened as a file (no server)');
  {
    const ctx = await b.newContext({ ...devices['iPhone 13'] });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(DEMO_FILE_URL);
    await p.tap('.app-cta[data-form="auto"]'); await settle(p);
    await p.tap('.q-foot .q-primary'); await settle(p);
    ok(await txt(p, '#q-title') === '¿Qué auto quieres asegurar?', 'flow works from file://');
    await p.tap('.q-bar .sheet-btn[aria-label="Atrás"]'); await settle(p);
    ok(await txt(p, '#q-title') === 'Cotiza tu seguro de auto', 'in-app Back works from file://');
    await p.tap('.q-bar .sheet-btn[aria-label="Cerrar"]'); await settle(p); await p.waitForTimeout(800);
    ok(!(await p.$('.q-flow')), 'closes from file://');
    ok(errs.length === 0, 'no errors from file://', errs);
    await ctx.close();
  }
  await b.close();
  process.exit(summary() ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
