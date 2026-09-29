// Runs every *.test.js suite in order against a local server.
// Usage: node tests/run.js            (all suites)
//        node tests/run.js auto utm   (only these)
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { start } = require('./serve.js');

(async () => {
  const only = process.argv.slice(2);
  const suites = fs.readdirSync(__dirname)
    .filter(f => f.endsWith('.test.js'))
    .filter(f => !only.length || only.includes(f.replace('.test.js', '')))
    .sort();
  const server = await start();
  let failed = 0;
  for (const f of suites) {
    console.log(`\n=== ${f}`);
    // Async on purpose: the server runs in this process and must keep answering.
    const code = await new Promise(resolve =>
      spawn(process.execPath, [path.join(__dirname, f)], { stdio: 'inherit' }).on('exit', resolve));
    if (code !== 0) failed++;
  }
  server.close();
  console.log(`\n${suites.length - failed}/${suites.length} suites passed`);
  process.exit(failed ? 1 : 0);
})();
