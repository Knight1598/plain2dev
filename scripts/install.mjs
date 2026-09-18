import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const locations = { codex: '.agents/skills/plain2dev', claude: '.claude/skills/plain2dev', generic: '.plain2dev/engine' };
const memories = {
  '.plain2dev/project/MAP.md': 'PROJECT_MAP.md',
  '.plain2dev/requirements/INDEX.md': 'REQUIREMENTS.md',
  '.plain2dev/history/CHANGES.md': 'CHANGE.md',
};
const manifestPath = '.plain2dev/install.json';
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
function exists(p) { try { fs.lstatSync(p); return true; } catch (e) { if (e.code === 'ENOENT') return false; throw e; } }
function filesIn(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name)).flatMap(e => {
    if (e.isSymbolicLink()) throw new Error(`Source symlink refused: ${e.name}`);
    const rel = prefix + e.name;
    if (e.isDirectory()) return filesIn(path.join(dir, e.name), rel + '/');
    if (!e.isFile()) throw new Error(`Unsupported source file: ${rel}`);
    return [rel];
  });
}
function safePath(root, rel) {
  if (!rel || rel.includes('\\') || path.isAbsolute(rel) || rel.split('/').some(x => !x || x === '.' || x === '..' || x.includes(':'))) throw new Error(`Unsafe path: ${rel}`);
  let current = root;
  const parts = rel.split('/');
  for (let i = 0; i < parts.length; i++) {
    current = path.join(current, parts[i]);
    if (exists(current)) {
      const st = fs.lstatSync(current);
      if (st.isSymbolicLink()) throw new Error(`Symlink refused: ${rel}`);
      if (i < parts.length - 1 && !st.isDirectory()) throw new Error(`Not a directory: ${current}`);
      if (i === parts.length - 1 && !st.isFile()) throw new Error(`Not a regular file: ${rel}`);
    }
  }
  return current;
}
export function install({ target, agent = 'codex', check = false, dryRun = false, source = packageRoot }) {
  if (!target) throw new Error('--target is required');
  if (!['codex', 'claude', 'both', 'generic'].includes(agent)) throw new Error('Unknown agent');
  if (check && dryRun) throw new Error('--check and --dry-run cannot be combined');
  const input = path.resolve(target);
  if (!exists(input) || !fs.statSync(input).isDirectory()) throw new Error('Target must be an existing project directory');
  if (fs.lstatSync(input).isSymbolicLink()) throw new Error('Target symlink refused');
  const root = fs.realpathSync(input);
  const skill = path.join(source, 'skills/plain2dev');
  const sourceFiles = filesIn(skill);
  const allowed = new Set(Object.values(locations).flatMap(p => sourceFiles.map(f => `${p}/${f}`)));
  const manifestFile = safePath(root, manifestPath);
  let previous = null;
  if (exists(manifestFile)) {
    previous = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    if (previous.schema !== 1 || !Array.isArray(previous.agents) || !previous.agents.length || new Set(previous.agents).size !== previous.agents.length || previous.agents.some(a => !Object.hasOwn(locations,a)) || !previous.files || typeof previous.files !== 'object' || Array.isArray(previous.files)) throw new Error('Invalid installation manifest');
    const expected = new Set(previous.agents.flatMap(a => sourceFiles.map(f => `${locations[a]}/${f}`)));
    if (Object.keys(previous.files).length !== expected.size) throw new Error('Manifest file set differs; migration required');
    for (const [rel, digest] of Object.entries(previous.files)) {
      if (!allowed.has(rel) || !expected.has(rel) || !/^[a-f0-9]{64}$/.test(digest)) throw new Error(`Invalid manifest entry: ${rel}`);
      safePath(root, rel);
    }
  }
  if (check) {
    if (!previous) throw new Error('No installer manifest; install or reconcile manual installation first');
    for (const [rel, digest] of Object.entries(previous.files)) {
      const p = safePath(root, rel);
      if (!exists(p) || hash(fs.readFileSync(p)) !== digest) throw new Error(`Missing or modified engine file: ${rel}`);
    }
    for (const rel of Object.keys(memories)) if (!exists(safePath(root, rel))) throw new Error(`Missing memory file: ${rel}`);
    return { status: 'FILES_OK', version: previous.version, agents: previous.agents, behavioralTest: 'not performed' };
  }
  const selected = agent === 'both' ? ['codex', 'claude'] : [agent];
  const agents = [...new Set([...(previous?.agents ?? []), ...selected])].sort();
  const plan = [];
  const managed = {};
  for (const a of agents) for (const file of sourceFiles) {
    const rel = `${locations[a]}/${file}`;
    const dest = safePath(root, rel);
    const data = fs.readFileSync(path.join(skill, file));
    managed[rel] = hash(data);
    if (exists(dest)) {
      const actual = hash(fs.readFileSync(dest));
      const old = previous?.files[rel];
      if (old ? actual !== old : actual !== managed[rel]) throw new Error(`Local file conflict: ${rel}`);
      if (actual === managed[rel]) continue;
    }
    plan.push({ rel, dest, data });
  }
  for (const [rel, template] of Object.entries(memories)) {
    const dest = safePath(root, rel);
    if (!exists(dest)) plan.push({ rel, dest, data: fs.readFileSync(path.join(skill, 'templates', template)) });
  }
  const version = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8')).version;
  const next = Buffer.from(JSON.stringify({ schema: 1, version, agents, files: managed }, null, 2) + '\n');
  if (!exists(manifestFile) || !fs.readFileSync(manifestFile).equals(next)) plan.push({ rel: manifestPath, dest: manifestFile, data: next });
  if (!dryRun) for (const entry of plan) {
    fs.mkdirSync(path.dirname(entry.dest), { recursive: true });
    // Recheck immediately before writing, including newly-created parents.
    safePath(root, entry.rel);
    fs.writeFileSync(entry.dest, entry.data);
  }
  return { status: dryRun ? 'DRY_RUN' : 'INSTALLED', version, agents, changed: plan.map(p => p.rel), behavioralTest: 'not performed' };
}
function cli(args) {
  const opts = {};
  for (let i=0; i<args.length; i++) {
    if (args[i] === '--target' || args[i] === '--agent') {
      const key = args[i].slice(2);
      if (!args[i+1] || args[i+1].startsWith('--')) throw new Error(`Missing value for ${args[i]}`);
      opts[key] = args[++i];
    } else if (args[i] === '--check') opts.check = true;
    else if (args[i] === '--dry-run') opts.dryRun = true;
    else if (args[i] === '--help') return { usage: 'node scripts/install.mjs --target PROJECT [--agent codex|claude|both|generic] [--dry-run|--check]' };
    else throw new Error(`Unknown option: ${args[i]}`);
  }
  return install(opts);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(cli(process.argv.slice(2)), null, 2)); }
  catch (e) { console.error(`Plain2Dev: ${e.message}`); process.exitCode = 1; }
}
