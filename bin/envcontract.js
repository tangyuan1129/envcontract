#!/usr/bin/env node
import { run } from '../src/index.js';
const args = process.argv.slice(2);
const json = args.includes('--json');
const strict = args.includes('--strict');
const help = args.includes('--help') || args.includes('-h');
const root = args.find((arg) => !arg.startsWith('-')) || '.';
if (help) {
  console.log(`envcontract — find environment-variable drift before your users do\n\nUsage:\n  npx envcontract [folder]\n  npx envcontract . --strict       fail CI when a variable is missing\n  npx envcontract . --json         print machine-readable output`);
  process.exit(0);
}
try {
  const report = await run(root);
  if (json) console.log(JSON.stringify(report, null, 2));
  else {
    const icon = { ok: '✓', warn: '!', error: '×' };
    console.log(`\nENVCONTRACT  ${report.root}\n${'─'.repeat(56)}`);
    console.log(`Files scanned: ${report.filesScanned}`);
    console.log(`Variables found: ${report.variables.length}`);
    for (const item of report.findings) console.log(`${icon[item.level]} ${item.message}`);
    console.log(`${'─'.repeat(56)}\n${report.findings.some((x) => x.level === 'error') ? 'Fix the missing contract entries, then run this command again.' : 'Your environment contract is in sync. Ship it.'}\n`);
  }
  if (strict && report.findings.some((x) => x.level === 'error')) process.exitCode = 1;
} catch (error) { console.error(`envcontract: ${error.message}`); process.exitCode = 2; }

