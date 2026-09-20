import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { install, remove } from '../scripts/install.mjs';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'plain2dev-test-'));
  t.after(() => fs.rmSync(dir, {recursive:true,force:true}));
  return dir;
}
function read(root, file) { return fs.readFileSync(path.join(root,file),'utf8'); }
for (const agent of ['codex','claude','both','generic']) test(`fresh ${agent}, check, idempotent reinstall`, t => {
  const target = fixture(t);
  fs.writeFileSync(path.join(target,'AGENTS.md'),'Keep original\r\n');
  fs.writeFileSync(path.join(target,'CLAUDE.md'),'Also keep\n');
  assert.equal(install({target,agent}).status,'INSTALLED');
  assert.equal(install({target,check:true}).status,'FILES_OK');
  assert.deepEqual(install({target,agent}).changed,[]);
  assert.equal(read(target,'AGENTS.md'),'Keep original\r\n');
  assert.equal(read(target,'CLAUDE.md'),'Also keep\n');
});
test('dry run changes nothing', t => {
  const target=fixture(t);
  assert.ok(install({target,dryRun:true}).changed.length > 0);
  assert.deepEqual(fs.readdirSync(target),[]);
});
test('upgrade preserves all memory and updates engine', t => {
  const target=fixture(t), source=fixture(t);
  install({target});
  const memory=['project/MAP.md','requirements/INDEX.md','history/CHANGES.md'];
  for (const p of memory) fs.writeFileSync(path.join(target,'.plain2dev',p),'ข้อมูลลูกค้า\r\n'+p);
  fs.cpSync(path.join(repo,'skills'),path.join(source,'skills'),{recursive:true});
  fs.writeFileSync(path.join(source,'package.json'),JSON.stringify({version:'0.1.1'}));
  fs.appendFileSync(path.join(source,'skills/plain2dev/SKILL.md'),'\nUpgrade fixture.\n');
  install({target,source});
  assert.equal(install({target,check:true}).version,'0.1.1');
  assert.match(read(target,'.agents/skills/plain2dev/SKILL.md'),/Upgrade fixture/);
  for (const p of memory) assert.equal(read(target,'.plain2dev/'+p),'ข้อมูลลูกค้า\r\n'+p);
});
test('modified engine stops before writing a new adapter', t => {
  const target=fixture(t); install({target});
  fs.appendFileSync(path.join(target,'.agents/skills/plain2dev/SKILL.md'),'custom');
  const before=read(target,'.plain2dev/install.json');
  assert.throws(()=>install({target,agent:'both'}),/conflict/);
  assert.ok(!fs.existsSync(path.join(target,'.claude')));
  assert.equal(read(target,'.plain2dev/install.json'),before);
  assert.throws(()=>install({target,check:true}),/modified/);
});
test('adapter switch keeps prior adapter and memory',t=>{
  const target=fixture(t); install({target});
  install({target,agent:'claude'});
  assert.deepEqual(install({target,check:true}).agents,['claude','codex']);
});
test('missing installed file detected and repaired',t=>{
  const target=fixture(t); install({target});
  fs.unlinkSync(path.join(target,'.agents/skills/plain2dev/SKILL.md'));
  assert.throws(()=>install({target,check:true}),/Missing/);
  install({target}); assert.equal(install({target,check:true}).status,'FILES_OK');
});
test('preexisting conflicting skill is never overwritten',t=>{
  const target=fixture(t), dir=path.join(target,'.agents/skills/plain2dev');
  fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(path.join(dir,'SKILL.md'),'my skill');
  assert.throws(()=>install({target}),/conflict/);
  assert.equal(read(target,'.agents/skills/plain2dev/SKILL.md'),'my skill');
  assert.ok(!fs.existsSync(path.join(target,'.plain2dev')));
});
test('tampered manifest path is rejected',t=>{
  const target=fixture(t); install({target});
  const manifest=JSON.parse(read(target,'.plain2dev/install.json'));
  const first=Object.keys(manifest.files)[0];
  manifest.files['../escape.md']=manifest.files[first]; delete manifest.files[first];
  fs.writeFileSync(path.join(target,'.plain2dev/install.json'),JSON.stringify(manifest));
  assert.throws(()=>install({target}),/Invalid manifest entry/);
});
test('symlinked destination cannot redirect writes',t=>{
  const target=fixture(t), outside=fixture(t);
  fs.symlinkSync(outside,path.join(target,'.plain2dev'),process.platform==='win32'?'junction':'dir');
  assert.throws(()=>install({target}),/Symlink/);
  assert.deepEqual(fs.readdirSync(outside),[]);
});
test('CLI with spaces, invalid options and missing target',t=>{
  const dir=fixture(t), target=path.join(dir,'customer project'); fs.mkdirSync(target);
  const run=(...args)=>spawnSync(process.execPath,[path.join(repo,'scripts/install.mjs'),...args],{encoding:'utf8'});
  assert.equal(run('--target',target,'--agent','generic').status,0);
  assert.equal(run('--target',target,'--check').status,0);
  assert.equal(run('--wat').status,1);
  assert.equal(run('--target').status,1);
  assert.equal(run().status,1);
});

// --- v0.2.0: migration, removal and reconciliation -------------------------

function packageFixture(t, mutate) {
  const source = fixture(t);
  fs.cpSync(path.join(repo,'skills'),path.join(source,'skills'),{recursive:true});
  fs.writeFileSync(path.join(source,'package.json'),JSON.stringify({version:'0.3.0'}));
  mutate?.(path.join(source,'skills/plain2dev'));
  return source;
}

test('upgrade that adds a file installs it instead of failing',t=>{
  const target=fixture(t);
  install({target,agent:'both'});
  const source=packageFixture(t,skill=>fs.writeFileSync(path.join(skill,'references/NEW_ENGINE.md'),'# New reference\n'));
  const result=install({target,source});
  assert.ok(result.changed.includes('.agents/skills/plain2dev/references/NEW_ENGINE.md'));
  assert.ok(result.changed.includes('.claude/skills/plain2dev/references/NEW_ENGINE.md'));
  assert.equal(read(target,'.agents/skills/plain2dev/references/NEW_ENGINE.md'),'# New reference\n');
  assert.equal(install({target,check:true}).version,'0.3.0');
});

test('upgrade that drops a file removes the stale copy',t=>{
  const target=fixture(t);
  install({target});
  const stale='.agents/skills/plain2dev/references/TOKEN_ENGINE.md';
  assert.ok(fs.existsSync(path.join(target,stale)));
  const source=packageFixture(t,skill=>fs.rmSync(path.join(skill,'references/TOKEN_ENGINE.md')));
  const result=install({target,source});
  assert.deepEqual(result.removed,[stale]);
  assert.ok(!fs.existsSync(path.join(target,stale)));
  assert.equal(install({target,check:true}).status,'FILES_OK');
  assert.ok(!Object.keys(JSON.parse(read(target,'.plain2dev/install.json')).files).includes(stale));
});

test('emptied directories are pruned but memory is never touched',t=>{
  const target=fixture(t);
  install({target});
  fs.writeFileSync(path.join(target,'.plain2dev/project/MAP.md'),'kept');
  const source=packageFixture(t,skill=>fs.rmSync(path.join(skill,'templates'),{recursive:true}));
  install({target,source});
  assert.ok(!fs.existsSync(path.join(target,'.agents/skills/plain2dev/templates')));
  assert.ok(fs.existsSync(path.join(target,'.agents/skills/plain2dev/SKILL.md')));
  assert.equal(read(target,'.plain2dev/project/MAP.md'),'kept');
});

test('a schema 1 manifest still upgrades',t=>{
  const target=fixture(t);
  install({target});
  const manifest=JSON.parse(read(target,'.plain2dev/install.json'));
  manifest.schema=1;
  fs.writeFileSync(path.join(target,'.plain2dev/install.json'),JSON.stringify(manifest,null,2));
  const source=packageFixture(t,skill=>fs.writeFileSync(path.join(skill,'references/NEW_ENGINE.md'),'# New\n'));
  assert.equal(install({target,source}).status,'INSTALLED');
  assert.equal(JSON.parse(read(target,'.plain2dev/install.json')).schema,2);
});

test('--reconcile replaces a locally modified engine file',t=>{
  const target=fixture(t);
  install({target});
  const file=path.join(target,'.agents/skills/plain2dev/SKILL.md');
  fs.appendFileSync(file,'custom');
  assert.throws(()=>install({target}),/conflict/);
  const result=install({target,reconcile:true});
  assert.deepEqual(result.reconciled,['.agents/skills/plain2dev/SKILL.md']);
  assert.ok(!read(target,'.agents/skills/plain2dev/SKILL.md').includes('custom'));
  assert.equal(install({target,check:true}).status,'FILES_OK');
});

test('uninstall removes the engine and keeps memory',t=>{
  const target=fixture(t);
  install({target});
  fs.writeFileSync(path.join(target,'.plain2dev/project/MAP.md'),'ข้อมูลลูกค้า');
  const result=remove({target});
  assert.equal(result.status,'UNINSTALLED');
  assert.equal(result.memoryKept,true);
  assert.ok(!fs.existsSync(path.join(target,'.agents')));
  assert.ok(!fs.existsSync(path.join(target,'.plain2dev/install.json')));
  assert.equal(read(target,'.plain2dev/project/MAP.md'),'ข้อมูลลูกค้า');
  assert.throws(()=>remove({target}),/nothing to uninstall/);
});

test('uninstalling one adapter keeps the other installed and checkable',t=>{
  const target=fixture(t);
  install({target,agent:'both'});
  const result=remove({target,agent:'codex'});
  assert.deepEqual(result.remainingAgents,['claude']);
  assert.ok(!fs.existsSync(path.join(target,'.agents')));
  assert.ok(fs.existsSync(path.join(target,'.claude/skills/plain2dev/SKILL.md')));
  assert.deepEqual(install({target,check:true}).agents,['claude']);
});

test('uninstall --purge-memory deletes memory only when nothing remains',t=>{
  const target=fixture(t);
  install({target,agent:'both'});
  assert.throws(()=>remove({target,agent:'codex',purgeMemory:true}),/every installed adapter/);
  assert.ok(fs.existsSync(path.join(target,'.plain2dev/project/MAP.md')));
  const result=remove({target,purgeMemory:true});
  assert.equal(result.memoryRemoved,true);
  assert.ok(!fs.existsSync(path.join(target,'.plain2dev')));
  assert.deepEqual(fs.readdirSync(target),[]);
});

test('uninstall refuses a modified file unless reconciled',t=>{
  const target=fixture(t);
  install({target});
  fs.appendFileSync(path.join(target,'.agents/skills/plain2dev/SKILL.md'),'mine');
  assert.throws(()=>remove({target}),/conflict/);
  assert.ok(fs.existsSync(path.join(target,'.agents/skills/plain2dev/SKILL.md')));
  assert.equal(remove({target,reconcile:true}).status,'UNINSTALLED');
  assert.ok(!fs.existsSync(path.join(target,'.agents')));
});

test('uninstall --dry-run reports without deleting',t=>{
  const target=fixture(t);
  install({target});
  const result=remove({target,dryRun:true});
  assert.equal(result.status,'DRY_RUN');
  assert.ok(result.removed.length>0);
  assert.equal(install({target,check:true}).status,'FILES_OK');
});

test('check reports every problem at once',t=>{
  const target=fixture(t);
  install({target});
  fs.unlinkSync(path.join(target,'.agents/skills/plain2dev/SKILL.md'));
  fs.unlinkSync(path.join(target,'.plain2dev/project/MAP.md'));
  assert.throws(()=>install({target,check:true}),e=>/SKILL\.md/.test(e.message)&&/MAP\.md/.test(e.message));
});

test('uninstall CLI, version and help',t=>{
  const dir=fixture(t), target=path.join(dir,'customer project'); fs.mkdirSync(target);
  const run=(...args)=>spawnSync(process.execPath,[path.join(repo,'scripts/install.mjs'),...args],{encoding:'utf8'});
  assert.equal(run('--target',target,'--agent','claude').status,0);
  assert.equal(run('--target',target,'--purge-memory').status,1);
  assert.equal(run('--target',target,'--uninstall','--check').status,1);
  assert.equal(run('--version').status,0);
  assert.match(run('--help').stdout,/--uninstall/);
  assert.equal(run('--target',target,'--uninstall').status,0);
  assert.ok(!fs.existsSync(path.join(target,'.claude')));
  assert.ok(fs.existsSync(path.join(target,'.plain2dev/project/MAP.md')));
});
