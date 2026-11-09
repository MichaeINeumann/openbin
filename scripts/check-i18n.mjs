import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../src/locales');
function flatten(value, prefix = '') {
  return Object.fromEntries(Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'string' ? [[prefix + key, child]] : Object.entries(flatten(child, `${prefix}${key}.`))));
}
let count = 0;
const errors = [];
for (const file of readdirSync(`${root}/en`).filter(name => name.endsWith('.json'))) {
  const english = flatten(JSON.parse(readFileSync(`${root}/en/${file}`, 'utf8')));
  let german;
  try { german = flatten(JSON.parse(readFileSync(`${root}/de-DE/${file}`, 'utf8'))); }
  catch { errors.push(`${file}: missing German catalog`); continue; }
  for (const [key, value] of Object.entries(english)) {
    count++;
    if (!german[key]?.trim()) { errors.push(`${file}:${key}: missing German text`); continue; }
    const variables = text => [...text.matchAll(/{{\s*([^},]+)(?:,[^}]+)?\s*}}/g)].map(match => match[1].trim()).sort();
    if (JSON.stringify(variables(value)) !== JSON.stringify(variables(german[key]))) {
      errors.push(`${file}:${key}: mismatched interpolation variables`);
    }
  }
  for (const key of Object.keys(german)) if (!(key in english)) errors.push(`${file}:${key}: missing English fallback`);
}
if (errors.length) { process.stderr.write(`${errors.join('\n')}\n`); process.exitCode = 1; }
else process.stdout.write(`Checked ${count} English/German translation keys and interpolation variables.\n`);
