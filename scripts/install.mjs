#!/usr/bin/env node
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
const SCHEMA = 2;

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
function resolveRoot(target) {
  if (!target) throw new Error('--target is required');
  const input = path.resolve(target);
  if (!exists(input) || !fs.statSync(input).isDirectory()) throw new Error('Target must be an existing project directory');
  if (fs.lstatSync(input).isSymbolicLink()) throw new Error('Target symlink refused');
  return fs.realpathSync(input);
}
function ownerOf(rel, agents) { return agents.find(a => rel.startsWith(locations[a] + '/')); }

// Accepts schema 1 and 2. Unlike v0.1 it does not require the recorded file set to
// match the current package: that is what made every upgrade adding or removing a
// file impossible. Entries are still constrained to the installed agents' folders.
function readManifest(root) {
  const file = safePath(root, manifestPath);
  if (!exists(file)) return null;
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { throw new Error('Unreadable installation manifest'); }
  const shaped = data && typeof data === 'object' && !Array.isArray(data)
    && (data.schema === 1 || data.schema === SCHEMA)
    && Array.isArray(data.agents) && data.agents.length
    && new Set(data.agents).size === data.agents.length
    && data.agents.every(a => Object.hasOwn(locations, a))
    && data.files && typeof data.files === 'object' && !Array.isArray(data.files);
  if (!shaped) throw new Error('Invalid installation manifest');
  for (const [rel, digest] of Object.entries(data.files)) {
    if (typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest) || !ownerOf(rel, data.agents)) throw new Error(`Invalid manifest entry: ${rel}`);
    safePath(root, rel);
  }
  return data;
}
function manifestBuffer(version, agents, files) {
  const ordered = {};
  for (const rel of Object.keys(files).sort()) ordered[rel] = files[rel];
  return Buffer.from(JSON.stringify({ schema: SCHEMA, version, agents: [...agents].sort(), files: ordered }, null, 2) + '\n');
}
function prune(root, dir) {
  let current = dir;
  while (current !== root && current.startsWith(root + path.sep)) {
    let entries;
    try { entries = fs.readdirSync(current); } catch { return; }
    if (entries.length) return;
    try { fs.rmdirSync(current); } catch { return; }
    current = path.dirname(current);
  }
}
function conflictError(rels, hint) {
  return new Error(`Local file conflict: ${rels.join(', ')}. ${hint}`);
}

export function install({ target, agent = 'codex', check = false, dryRun = false, reconcile = false, source = packageRoot } = {}) {
  if (!['codex', 'claude', 'both', 'generic'].includes(agent)) throw new Error('Unknown agent');
  if (check && dryRun) throw new Error('--check and --dry-run cannot be combined');
  const root = resolveRoot(target);
  const previous = readManifest(root);

  if (check) {
    if (!previous) throw new Error('No installer manifest; install or reconcile manual installation first');
    const problems = [];
    for (const [rel, digest] of Object.entries(previous.files)) {
      const p = safePath(root, rel);
      if (!exists(p) || hash(fs.readFileSync(p)) !== digest) problems.push(`Missing or modified engine file: ${rel}`);
    }
    for (const rel of Object.keys(memories)) if (!exists(safePath(root, rel))) problems.push(`Missing memory file: ${rel}`);
    if (problems.length) throw new Error(problems.join('; '));
    return { status: 'FILES_OK', target: root, version: previous.version, schema: previous.schema, agents: previous.agents, behavioralTest: 'not performed' };
  }

  const skill = path.join(source, 'skills/plain2dev');
  const sourceFiles = filesIn(skill);
  const version = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8')).version;
  const selected = agent === 'both' ? ['codex', 'claude'] : [agent];
  const agents = [...new Set([...(previous?.agents ?? []), ...selected])].sort();

  const writes = [], removals = [], conflicts = [], reconciled = [];
  const managed = {};
  for (const a of agents) for (const file of sourceFiles) {
    const rel = `${locations[a]}/${file}`;
    const dest = safePath(root, rel);
    const data = fs.readFileSync(path.join(skill, file));
    const digest = hash(data);
    managed[rel] = digest;
    if (exists(dest)) {
      const actual = hash(fs.readFileSync(dest));
      if (actual === digest) continue;
      if (previous?.files[rel] !== actual) {
        if (!reconcile) { conflicts.push(rel); continue; }
        reconciled.push(rel);
      }
    }
    writes.push({ rel, dest, data });
  }
  // Files this project installed from an older package version that the current
  // one no longer ships. Leaving them behind would keep stale guidance loadable.
  for (const [rel, recorded] of Object.entries(previous?.files ?? {})) {
    if (Object.hasOwn(managed, rel)) continue;
    const dest = safePath(root, rel);
    if (!exists(dest)) continue;
    if (hash(fs.readFileSync(dest)) !== recorded) {
      if (!reconcile) { conflicts.push(rel); continue; }
      reconciled.push(rel);
    }
    removals.push({ rel, dest });
  }
  if (conflicts.length) throw conflictError(conflicts, 'Reconcile your edits, or re-run with --reconcile to replace them with the packaged version.');

  for (const [rel, template] of Object.entries(memories)) {
    const dest = safePath(root, rel);
    if (!exists(dest)) writes.push({ rel, dest, data: fs.readFileSync(path.join(skill, 'templates', template)) });
  }
  const manifestFile = safePath(root, manifestPath);
  const next = manifestBuffer(version, agents, managed);
  if (!exists(manifestFile) || !fs.readFileSync(manifestFile).equals(next)) writes.push({ rel: manifestPath, dest: manifestFile, data: next });

  if (!dryRun) {
    for (const entry of removals) { fs.rmSync(entry.dest); prune(root, path.dirname(entry.dest)); }
    for (const entry of writes) {
      fs.mkdirSync(path.dirname(entry.dest), { recursive: true });
      // Recheck immediately before writing, including newly-created parents.
      safePath(root, entry.rel);
      fs.writeFileSync(entry.dest, entry.data);
    }
  }
  return {
    status: dryRun ? 'DRY_RUN' : 'INSTALLED',
    target: root,
    version,
    previousVersion: previous?.version ?? null,
    agents,
    changed: writes.map(w => w.rel),
    removed: removals.map(r => r.rel),
    reconciled,
    behavioralTest: 'not performed',
  };
}

export function remove({ target, agent, purgeMemory = false, reconcile = false, dryRun = false } = {}) {
  const root = resolveRoot(target);
  const previous = readManifest(root);
  if (!previous) throw new Error('No installer manifest; nothing to uninstall');
  let selected = previous.agents;
  if (agent) {
    const wanted = agent === 'both' ? ['codex', 'claude'] : [agent];
    if (wanted.some(a => !Object.hasOwn(locations, a))) throw new Error('Unknown agent');
    const missing = wanted.filter(a => !previous.agents.includes(a));
    if (missing.length) throw new Error(`Agent not installed: ${missing.join(', ')}`);
    selected = wanted;
  }
  const removing = new Set(selected);
  const remainingAgents = previous.agents.filter(a => !removing.has(a));
  if (purgeMemory && remainingAgents.length) throw new Error('--purge-memory requires removing every installed adapter');

  const removals = [], conflicts = [], reconciled = [], remainingFiles = {};
  for (const [rel, recorded] of Object.entries(previous.files)) {
    if (!removing.has(ownerOf(rel, previous.agents))) { remainingFiles[rel] = recorded; continue; }
    const dest = safePath(root, rel);
    if (!exists(dest)) continue;
    if (hash(fs.readFileSync(dest)) !== recorded) {
      if (!reconcile) { conflicts.push(rel); continue; }
      reconciled.push(rel);
    }
    removals.push({ rel, dest });
  }
  if (conflicts.length) throw conflictError(conflicts, 'Back them up, or re-run with --reconcile to delete them anyway.');

  const memoryRemovals = [];
  if (purgeMemory) for (const rel of Object.keys(memories)) {
    const dest = safePath(root, rel);
    if (exists(dest)) memoryRemovals.push({ rel, dest });
  }
  const manifestFile = safePath(root, manifestPath);
  const rewrite = remainingAgents.length ? manifestBuffer(previous.version, remainingAgents, remainingFiles) : null;

  if (!dryRun) {
    for (const entry of [...removals, ...memoryRemovals]) { fs.rmSync(entry.dest); prune(root, path.dirname(entry.dest)); }
    if (rewrite) fs.writeFileSync(manifestFile, rewrite);
    else if (exists(manifestFile)) { fs.rmSync(manifestFile); prune(root, path.dirname(manifestFile)); }
  }
  return {
    status: dryRun ? 'DRY_RUN' : 'UNINSTALLED',
    target: root,
    version: previous.version,
    removedAgents: [...removing].sort(),
    remainingAgents,
    removed: [...removals, ...memoryRemovals].map(r => r.rel),
    reconciled,
    memoryRemoved: purgeMemory,
    memoryKept: !purgeMemory,
  };
}

const usage = `Plain2Dev installer

  node scripts/install.mjs --target PROJECT [--agent codex|claude|both|generic]
  node scripts/install.mjs --target PROJECT --check
  node scripts/install.mjs --target PROJECT --uninstall [--agent NAME] [--purge-memory]

  --target PATH     Project to install into (required)
  --agent NAME      codex (default), claude, both, generic
  --check           Verify installed files against the manifest
  --dry-run         Report the plan without touching the project
  --uninstall       Remove the engine; project memory is kept
  --purge-memory    With --uninstall, also delete .plain2dev memory (destructive)
  --reconcile       Replace or delete locally modified managed files (destructive)
  --version         Print the package version
  --help            Show this message`;

function cli(args) {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--target' || args[i] === '--agent') {
      const key = args[i].slice(2);
      if (!args[i+1] || args[i+1].startsWith('--')) throw new Error(`Missing value for ${args[i]}`);
      opts[key] = args[++i];
    }
    else if (args[i] === '--check') opts.check = true;
    else if (args[i] === '--dry-run') opts.dryRun = true;
    else if (args[i] === '--uninstall') opts.uninstall = true;
    else if (args[i] === '--purge-memory') opts.purgeMemory = true;
    else if (args[i] === '--reconcile') opts.reconcile = true;
    else if (args[i] === '--version') return { version: JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8')).version };
    else if (args[i] === '--help') return { usage };
    else throw new Error(`Unknown option: ${args[i]}`);
  }
  if (opts.uninstall) {
    if (opts.check) throw new Error('--uninstall and --check cannot be combined');
    const { target, agent, purgeMemory, reconcile, dryRun } = opts;
    return remove({ target, agent, purgeMemory, reconcile, dryRun });
  }
  if (opts.purgeMemory) throw new Error('--purge-memory requires --uninstall');
  const { target, agent, check, dryRun, reconcile } = opts;
  return install({ target, ...(agent ? { agent } : {}), check, dryRun, reconcile });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = cli(process.argv.slice(2));
    console.log(result.usage ?? JSON.stringify(result, null, 2));
  } catch (e) { console.error(`Plain2Dev: ${e.message}`); process.exitCode = 1; }
}
