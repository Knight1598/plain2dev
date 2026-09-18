import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { install } from '../scripts/install.mjs';
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
