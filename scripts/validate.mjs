import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skill = path.join(root, 'skills/plain2dev/SKILL.md');
const content = fs.readFileSync(skill, 'utf8');
if (!/^---\r?\nname: plain2dev\r?\ndescription: .+\r?\n---/m.test(content)) throw new Error('Invalid skill metadata');
let count = 0;
function scan(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'work', 'dist'].includes(item.name)) continue;
    const file = path.join(dir,item.name);
    if (item.isDirectory()) scan(file);
    else if (item.name.endsWith('.md')) {
      count++;
      const body = fs.readFileSync(file, 'utf8');
      for (const match of body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
        const link = match[1];
        if (/^(https?:|#)/.test(link)) continue;
        if (!fs.existsSync(path.resolve(dir,link.split('#')[0]))) throw new Error(`Broken link in ${file}: ${link}`);
      }
    }
  }
}
scan(root);
console.log(`Validated skill metadata and links in ${count} Markdown files.`);
