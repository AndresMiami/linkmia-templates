const { chromium, ok, newPhone, settle, txt, state, decode, summary, shotPath, DEMO_URL, DEMO_FILE_URL } = require('./lib.js');
(async () => {
  const b = await chromium.launch();
  const { p, wa, errs } = await newPhone(b);
  const primary = '.q-foot .q-primary';
  const title = () => txt(p, '#q-title');
  await p.tap('.app-cta[data-form="auto"]'); await settle(p);
  await p.fill('#q-intro-zip', '33125');
  await p.tap(primary); await settle(p);
  await p.tap('#q-anio'); await settle(p);
  await p.tap('.sheet-row:has-text("2019")'); await settle(p);
  await p.fill('.sheet-search input', 'toy'); await settle(p);
  ok((await p.$$eval('.sheet-list .sheet-row', r => r.map(x => x.textContent))).join() === 'Toyota,Otra marca', 'search filters makes');
  await p.tap('.sheet-row:has-text("Toyota")'); await settle(p);
  await p.tap('.sheet-row:has-text("Otro modelo")'); await settle(p);
  await p.fill('#sheet-other-modelo', 'GR86'); await p.tap('.sheet-other .q-primary'); await settle(p);
  ok((await txt(p, '#q-vehiculo')).startsWith('GR86'), '"Otro modelo" typed model accepted', await txt(p, '#q-vehiculo'));
  await p.tap(primary); await settle(p);
  await p.tap('label:has-text("Personal")'); await p.tap(primary); await settle(p);
  ok(await title() === '¿El auto es tuyo, financiado o en leasing?', 'at step 3');

  console.log('RELOAD mid-quote');
  await p.reload({ waitUntil: 'networkidle' }); await settle(p);
  ok(await p.isVisible('.q-flow') && await title() === '¿El auto es tuyo, financiado o en leasing?', 'reload reopens the same question');
  ok(await txt(p, '.q-context') === '2019 Toyota GR86', 'answers survived the reload', await txt(p, '.q-context'));
  await p.goBack(); await settle(p);
  ok(await title() === '¿Cómo usas el auto?' && await p.isChecked('#q-uso-0'), 'Back after reload → previous question with its answer');
  await p.goForward(); await settle(p);

  console.log('CLOSE + RESUME');
  await p.tap('.q-bar .sheet-btn[aria-label="Cerrar"]'); await settle(p); await p.waitForTimeout(300);
  ok(!(await p.$('.q-flow')) && (await state(p)) === null, 'closed back to the page');
  await p.tap('.app-cta[data-form="auto"]'); await settle(p);
  ok(await txt(p, primary) === 'Continuar donde lo dejaste' && await p.isVisible('.q-secondary'), 'intro offers to resume');
  await p.tap(primary); await settle(p);
  ok(await title() === '¿El auto es tuyo, financiado o en leasing?', 'resume lands on the first unanswered question');
  ok(await txt(p, '.q-count') === 'Paso 3 de 9', 'progress right after resume');
  await p.goBack(); await settle(p);
  ok(await title() === '¿Cómo usas el auto?', 'Back walks through resumed answers (uso)');
  await p.goBack(); await settle(p);
  ok(await title() === '¿Qué auto quieres asegurar?', 'Back again (vehículo)');
  await p.goBack(); await settle(p);
  ok(await title() === 'Cotiza tu seguro de auto', 'Back again (intro)');
  await p.goBack(); await settle(p); await p.waitForTimeout(300);
  ok(!(await p.$('.q-flow')) && (await state(p)) === null, 'Back from intro closes; history is clean');

  console.log('PARTIAL SEND');
  await p.tap('.app-cta[data-form="auto"]'); await settle(p);
  await p.tap(primary); await settle(p);                       // resume → step 3
  await p.tap('.q-alt'); await settle(p); await p.waitForTimeout(300);
  const m = decode(wa[wa.length - 1]);
  console.log('    ' + m.split('\n').join('\n    '));
  ok(m.includes('• Auto: 2019 Toyota GR86') && m.includes('• Uso: Personal') && !m.includes('Inicio') && m.trim().endsWith('No terminé el formulario; prefiero continuar por aquí.'), 'partial message carries what was answered');
  ok(await title() === '¡Listo! Te estamos conectando por WhatsApp…', 'partial send shows the confirmation');
  await p.tap('.q-done .q-alt'); await settle(p); await p.waitForTimeout(300);
  ok(!(await p.$('.q-flow')), '"Volver al inicio" closes');
  await p.tap('.app-cta[data-form="auto"]'); await settle(p);
  ok(await txt(p, primary) === 'Empezar', 'after sending, the draft is cleared');

  console.log('START OVER');
  await p.fill('#q-intro-zip', '33125');
  await p.tap(primary); await settle(p);
  await p.tap('#q-anio'); await settle(p); await p.tap('.sheet-row:has-text("2020")'); await settle(p);
  await p.tap('.make-tile:has-text("Kia")'); await settle(p); await p.tap('.sheet-row:has-text("Soul")'); await settle(p);
  await p.tap('.q-bar .sheet-btn[aria-label="Cerrar"]'); await settle(p); await p.waitForTimeout(300);
  await p.tap('.app-cta[data-form="auto"]'); await settle(p);
  await p.tap('.q-secondary'); await settle(p);
  ok(await title() === '¿Qué auto quieres asegurar?' && (await txt(p, '#q-anio')) === 'Elige el año', '"Empezar de nuevo" clears the answers');

  console.log('INTRO WHATSAPP SHORTCUT');
  await p.goBack(); await settle(p);
  const n = wa.length;
  await p.tap('.q-alt'); await settle(p); await p.waitForTimeout(300);
  ok(wa.length === n + 1 && decode(wa[wa.length - 1]).endsWith('Prefiero hacer la cotización por aquí.'), 'intro "Prefiero escribir por WhatsApp"', decode(wa[wa.length - 1]));
  ok(errs.length === 0, 'no console errors', errs);
  await b.close();
  process.exit(summary() ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
