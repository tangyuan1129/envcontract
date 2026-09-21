import fs from 'node:fs/promises';
import path from 'node:path';
const IGNORED = new Set(['.git', 'node_modules', 'vendor', 'dist', 'build', 'coverage', '.next', '.venv']);
const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.py', '.go', '.rb', '.php', '.java', '.rs', '.swift', '.sh', '.yml', '.yaml', '.toml']);
const SECRET_NAMES = /(KEY|TOKEN|SECRET|PASSWORD|PASSWD|PRIVATE|CREDENTIAL)/i;
async function filesUnder(root) {
  const found = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !IGNORED.has(entry.name)) await walk(path.join(dir, entry.name));
      else if (entry.isFile()) found.push(path.join(dir, entry.name));
    }
  }
  await walk(root); return found;
}
function add(map, name, source) {
  if (!name || !/^[A-Z][A-Z0-9_]*$/.test(name)) return;
  const current = map.get(name) || new Set(); current.add(source); map.set(name, current);
}
function parseEnvExample(text, source, declarations) {
  for (const line of text.split(/\r?\n/)) { const match = line.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*(?:=|:)/); if (match) add(declarations, match[1], source); }
}
function parseReferences(text, source, references) {
  const patterns = [/process\.env\.([A-Z][A-Z0-9_]*)/g, /import\.meta\.env\.([A-Z][A-Z0-9_]*)/g, /(?:os\.getenv|os\.environ\.get)\(\s*["']([A-Z][A-Z0-9_]*)/g, /os\.environ\[\s*["']([A-Z][A-Z0-9_]*)/g, /os\.Getenv\(\s*["']([A-Z][A-Z0-9_]*)/g, /ENV\[\s*["']([A-Z][A-Z0-9_]*)/g, /\$\{([A-Z][A-Z0-9_]*)\}/g];
  for (const pattern of patterns) for (const match of text.matchAll(pattern)) add(references, match[1], source);
}
function parseContainers(text, source, declarations, references) {
  for (const match of text.matchAll(/^\s*(?:ARG|ENV)\s+([A-Z][A-Z0-9_]*)/gm)) add(declarations, match[1], source);
  for (const match of text.matchAll(/\$\{([A-Z][A-Z0-9_]*)\}/g)) add(references, match[1], source);
}
export async function run(input = '.') {
  const root = path.resolve(input); const allFiles = await filesUnder(root); const declarations = new Map(); const references = new Map(); let readme = false;
  for (const file of allFiles) {
    const relative = path.relative(root, file) || path.basename(file); const base = path.basename(file).toLowerCase();
    if (base.startsWith('.env') && !base.includes('.local') && !base.endsWith('.production')) parseEnvExample(await fs.readFile(file, 'utf8'), relative, declarations);
    if (CODE_EXTENSIONS.has(path.extname(file).toLowerCase()) || ['dockerfile', 'compose.yaml', 'compose.yml'].includes(base)) { const text = await fs.readFile(file, 'utf8'); if (base === 'dockerfile' || base.includes('compose')) parseContainers(text, relative, declarations, references); parseReferences(text, relative, references); }
    if (/^readme(?:\.|$)/i.test(base)) readme = true;
  }
  const names = new Set([...declarations.keys(), ...references.keys()]); const variables = [...names].sort().map((name) => ({ name, declaredIn: [...(declarations.get(name) || [])], usedIn: [...(references.get(name) || [])] })); const findings = [];
  for (const item of variables) {
    if (item.usedIn.length && !item.declaredIn.length) findings.push({ level: 'error', code: 'missing-example', variable: item.name, message: `${item.name} is used in ${item.usedIn[0]} but is missing from .env.example` });
    if (item.declaredIn.some((file) => file.startsWith('.env')) && SECRET_NAMES.test(item.name)) { const source = item.declaredIn.find((file) => file.startsWith('.env')); const content = await fs.readFile(path.join(root, source), 'utf8'); const line = content.split(/\r?\n/).find((x) => x.trim().startsWith(item.name)); if (line && line.split('=')[1]?.trim() && !line.includes('your-') && !line.includes('changeme')) findings.push({ level: 'warn', code: 'possible-secret', variable: item.name, message: `${source} appears to contain a real-looking value for ${item.name}; keep secrets out of git` }); }
  }
  if (references.size && !declarations.size) findings.unshift({ level: 'error', code: 'no-example', message: 'Code reads environment variables, but no .env.example (or .env.sample) was found' });
  if (!readme) findings.push({ level: 'warn', code: 'no-readme', message: 'No README found; add one command a new user can copy' });
  if (!findings.length) findings.push({ level: 'ok', code: 'in-sync', message: 'Code references and environment examples are in sync' });
  return { root, filesScanned: allFiles.length, variables, findings };
}
export { parseReferences, parseEnvExample };

