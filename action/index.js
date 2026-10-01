import fs from 'node:fs/promises';
import { run } from '../src/index.js';

// GitHub passes action inputs as INPUT_<UPPERCASE_NAME> environment variables.
const root = process.env['INPUT_PATH'] || '.';
const strict = (process.env['INPUT_STRICT'] ?? 'true').toLowerCase() !== 'false';

const ICON = { ok: '✓', warn: '!', error: '×' };

try {
  const report = await run(root);

  console.log(`ENVCONTRACT  ${report.root}`);
  console.log(`Files scanned: ${report.filesScanned}`);
  console.log(`Variables found: ${report.variables.length}`);

  const errors = report.findings.filter((item) => item.level === 'error');
  const warnings = report.findings.filter((item) => item.level === 'warn');

  for (const item of report.findings) {
    console.log(`${ICON[item.level]} ${item.message}`);
    // Surface findings as native GitHub annotations on the job summary.
    if (item.level === 'error') console.log(`::error::${item.message}`);
    else if (item.level === 'warn') console.log(`::warning::${item.message}`);
  }

  const outputFile = process.env['GITHUB_OUTPUT'];
  if (outputFile) {
    await fs.appendFile(outputFile, `errors=${errors.length}\nwarnings=${warnings.length}\n`);
  }

  if (errors.length) {
    console.log(`\n${errors.length} missing contract ${errors.length === 1 ? 'entry' : 'entries'}.`);
    if (strict) process.exitCode = 1;
  } else {
    console.log('\nYour environment contract is in sync. Ship it.');
  }
} catch (error) {
  console.error(`envcontract: ${error.message}`);
  process.exitCode = 2;
}
