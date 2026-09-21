import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { run } from '../src/index.js';
test('finds a variable missing from the example', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'envcontract-')); await fs.mkdir(path.join(dir, 'src'));
  await fs.writeFile(path.join(dir, 'src', 'app.js'), 'console.log(process.env.API_URL)'); await fs.writeFile(path.join(dir, '.env.example'), 'PORT=3000\n');
  const report = await run(dir); assert.equal(report.findings[0].code, 'missing-example'); assert.equal(report.findings[0].variable, 'API_URL');
});
test('accepts Python and Docker references', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'envcontract-')); await fs.writeFile(path.join(dir, 'app.py'), 'import os\nos.getenv("DB_URL")'); await fs.writeFile(path.join(dir, 'Dockerfile'), 'ARG DB_URL\nRUN echo ${DB_URL}'); await fs.writeFile(path.join(dir, 'README.md'), '# app');
  const report = await run(dir); assert.equal(report.findings.some((x) => x.level === 'error'), false);
});

