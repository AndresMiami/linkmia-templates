const { chromium, ok, newPhone, settle, txt, state, decode, summary, shotPath, DEMO_URL, DEMO_FILE_URL } = require('./lib.js');
const SHOT = n => shotPath('casa', n);
(async () => {
  const b = await chromium.launch();
  const { p, wa, errs } = await newPhone(b);
  const primary = '.q-foot .q-primary';
  const title = () => txt(p, '#q-title');
  const count = () => txt(p, '.q-count');
  const checked = () => p.$$eval('input[id^="q-huracan-"]', n => n.filter(x => x.checked).map(x => x.value).join());

  await p.tap('.app-cta[data-form="casa"]'); await settle(p);
  ok(await title() === 'Cotiza tu seguro de casa', 'home intro');
  await p.screenshot({ path: SHOT('0-intro') });
  await p.tap(primary); await settle(p);

  console.log('dirección');
  ok(await count() === 'Paso 1 de 9', 'Paso 1 de 9 (owner path)', await count());
  await p.tap(primary); await settle(p);
  ok(await txt(p, '#q-direccion-err') === 'Escribe la dirección o el ZIP.', 'address required');
  await p.fill('#q-direccion', '3313'); await p.tap(primary); await settle(p);
  ok(await txt(p, '#q-direccion-err') === 'Escribe un ZIP de 5 dígitos.', 'short ZIP refused');
  await p.fill('#q-direccion', '1250 SW 8th St, Miami, FL 33135'); await settle(p);
  await p.screenshot({ path: SHOT('1-direccion') });
  await p.tap(primary); await settle(p);

  console.log('tipo');
  ok(await txt(p, '.q-context') === '1250 SW 8th St, Miami, FL 33135', 'address chip');
  await p.tap('label:has-text("Condo o apartamento")'); await settle(p);
  ok(await count() === 'Paso 2 de 8', 'count updates live: condo drops the roof question', await count());
  await p.screenshot({ path: SHOT('2-tipo') });
  await p.tap(primary); await settle(p);

  console.log('ocupación');
  await p.tap('label:has-text("Vivo ahí")'); await p.tap(primary); await settle(p);

  console.log('año de construcción');
  ok(await title() === '¿En qué año se construyó?' && await count() === 'Paso 4 de 8', 'year built 4/8');
  await p.tap('#q-construccion'); await settle(p);
  ok(await txt(p, '#sheet-title') === 'Año de construcción', 'year sheet');
  ok((await p.$$eval('.sheet-row', r => r.slice(0, 2).map(x => x.textContent))).join() === 'No estoy seguro,2026', '"No estoy seguro" offered first');
  await p.tap('.sheet-row:has-text("No estoy seguro")'); await settle(p);
  ok(await txt(p, '#q-construccion') === 'No estoy seguro', 'unknown accepted', await txt(p, '#q-construccion'));
  await p.tap(primary); await settle(p);

  console.log('huracanes (condo skips the roof)');
  ok(await title() === '¿Tiene protección contra huracanes?' && await count() === 'Paso 5 de 8', 'hurricane 5/8');
  await p.tap('label[for="q-huracan-0"]'); await p.tap('label[for="q-huracan-1"]'); await settle(p);
  ok(await checked() === 'impacto,shutters', 'multi-select', await checked());
  await p.tap('label[for="q-huracan-2"]'); await settle(p);
  ok(await checked() === 'ninguna', '"No tiene" clears the others', await checked());
  await p.tap('label[for="q-huracan-0"]'); await settle(p);
  ok(await checked() === 'impacto', 'a real answer clears "No tiene"', await checked());
  await p.screenshot({ path: SHOT('5-huracan') });
  await p.tap(primary); await settle(p);

  console.log('seguro actual');
  ok(await title() === '¿Tienes seguro para esta propiedad ahora?', 'owner wording');
  await p.tap('label[for="q-seguroActual-0"]'); await settle(p);
  ok(await p.isVisible('#q-aseguradora') && await p.isVisible('#q-renovacion'), 'company + renewal month appear after Sí');
  await p.fill('#q-aseguradora', 'Citizens'); await p.selectOption('#q-renovacion', '3');
  await p.screenshot({ path: SHOT('6-seguro') });
  await p.tap(primary); await settle(p);

  console.log('contacto → revisión');
  await p.fill('#q-nombre', 'José Díaz'); await p.tap(primary); await settle(p);
  ok(await title() === 'Revisa tu información' && await count() === 'Paso 8 de 8', 'review 8/8');
  const rows = async () => p.$$eval('.q-row', n => n.map(r => r.querySelector('.q-row-label').textContent + ': ' + r.querySelector('.q-row-value').textContent));
  let r = await rows();
  console.log('    ' + r.join('\n    '));
  ok(r.includes('Tipo: Condo / apartamento') && r.includes('Año de construcción: No estoy seguro') && r.includes('Protección contra huracanes: Ventanas y puertas de impacto') && r.includes('Seguro actual: Sí, con Citizens') && r.includes('Renovación: Marzo'), 'review rows');
  const iSummary = (await state(p)).i;

  console.log('branch: renter');
  await p.tap('.q-row:has-text("Vivo ahí")'); await settle(p);
  await p.tap('label:has-text("Soy inquilino")'); await p.tap(primary); await settle(p);
  ok(await title() === 'Revisa tu información' && await count() === 'Paso 6 de 6', 'renter: building questions drop out (6 steps)', await count());
  r = await rows();
  ok(!r.some(x => x.startsWith('Año de construcción') || x.startsWith('Protección')), 'renter review hides building answers');

  console.log('branch: back to owner of a house → only the roof is asked');
  await p.tap('.q-row:has-text("Condo")'); await settle(p);
  await p.tap('label:has-text("Casa independiente")'); await p.tap(primary); await settle(p);
  ok(await title() === 'Revisa tu información', 'tipo edit returns (renter needs no roof)');
  await p.tap('.q-row:has-text("Soy inquilino")'); await settle(p);
  await p.tap('label:has-text("Vivo ahí")'); await p.tap(primary); await settle(p);
  ok(await title() === '¿Qué edad tiene el techo?', 'newly required roof question comes next');
  ok(await txt(p, primary) === 'Guardar y volver', 'still in edit mode');
  await p.tap(primary); await settle(p);
  ok(await txt(p, '#q-techo-err') === 'Elige una opción.', 'roof required');
  await p.tap('label:has-text("Más de 15 años")'); await settle(p);
  await p.screenshot({ path: SHOT('4-techo') });
  await p.tap(primary); await settle(p);
  ok(await title() === 'Revisa tu información' && (await state(p)).i === iSummary, 'lands on the original review entry', await state(p));
  r = await rows();
  ok(r.includes('Edad del techo: Más de 15 años') && r.includes('Tipo: Casa') && await count() === 'Paso 9 de 9', 'review complete again (9 steps)', await count());
  await p.tap('label[for="q-bundle"]');
  await p.setViewportSize({ width: 390, height: 1650 }); await settle(p);
  await p.screenshot({ path: SHOT('8-resumen') });
  await p.setViewportSize({ width: 390, height: 664 }); await settle(p);

  console.log('send');
  await p.tap(primary); await settle(p); await p.waitForTimeout(300);
  const m = decode(wa[wa.length - 1]);
  console.log('    ' + m.split('\n').join('\n    '));
  ok(wa.length === 1, 'opened once');
  ok(m.startsWith('Hola Best National, soy José Díaz. Quiero una cotización de *seguro de casa*.'), 'greeting');
  ok(m.includes('*Propiedad*\n• Dirección: 1250 SW 8th St, Miami, FL 33135\n• Tipo: Casa\n• Uso de la propiedad: Vivo ahí\n• Año de construcción: No estoy seguro\n• Edad del techo: Más de 15 años\n• Protección contra huracanes: Ventanas y puertas de impacto'), 'property section');
  ok(m.includes('*Seguro*\n• Seguro actual: Sí, con Citizens\n• Renovación: Marzo') && m.trim().endsWith('También me interesa cotizar el seguro de mi auto.'), 'insurance section + bundle');

  console.log('renter message wording');
  await p.goBack(); await settle(p);
  await p.tap('.q-row:has-text("Vivo ahí")'); await settle(p);
  await p.tap('label:has-text("Soy inquilino")'); await p.tap(primary); await settle(p);
  await p.tap(primary); await settle(p); await p.waitForTimeout(300);
  const m2 = decode(wa[wa.length - 1]);
  ok(m2.includes('*seguro de inquilino (renters)*') && !m2.includes('Edad del techo'), 'renter quote says renters and skips the building', m2.split('\n')[0]);

  console.log('a11y');
  await p.goBack(); await settle(p);
  ok(await p.getAttribute('.q-flow', 'role') === 'dialog' && await p.getAttribute('.q-flow', 'aria-modal') === 'true', 'dialog semantics');
  let inside = true;
  for (let k = 0; k < 40; k++) { await p.keyboard.press('Tab'); inside = inside && await p.evaluate(() => !!document.activeElement.closest('.q-flow')); }
  ok(inside, 'Tab stays inside the flow (40 presses)');
  await p.tap('.q-row:has-text("Casa")'); await settle(p);
  await p.tap('.q-help').catch(() => {});
  ok(errs.length === 0, 'no console errors', errs);
  await b.close();
  process.exit(summary() ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
