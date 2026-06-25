import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', 'src', 'domain', 'items');

const files = [
  'items.east-statesman.ts',
  'items.east-scientist.ts',
  'items.west-philosopher.ts',
  'items.west-scientist.ts',
];

for (const file of files) {
  const content = readFileSync(join(srcDir, file), 'utf-8');
  const ids = [...content.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
  const formats = [...content.matchAll(/id:\s*'[^']+'\s*,\s*format:\s*'(\w+)'/g)].map(m => m[1]);
  const traits = [...content.matchAll(/primary:\s*\{\s*traitId:\s*(\d+)/g)].map(m => parseInt(m[1]));

  const formatCount = {};
  for (const f of formats) formatCount[f] = (formatCount[f] || 0) + 1;
  const traitCount = {};
  for (const t of traits) traitCount[t] = (traitCount[t] || 0) + 1;

  console.log(`\n=== ${file} ===`);
  console.log(`Total: ${ids.length}`);
  console.log('Formats:', JSON.stringify(formatCount));
  console.log('Traits (1-12):', Object.fromEntries(
    Array.from({length:12}, (_,i) => [i+1, traitCount[i+1] || 0])
  ));
  
  // Show which trait each question measures
  const questions = [];
  const formatMatches = [...content.matchAll(/id:\s*'([^']+)'\s*,\s*format:\s*'(\w+)'.*?primary:\s*\{\s*traitId:\s*(\d+)/gs)];
  for (const m of formatMatches) {
    questions.push({ id: m[1], format: m[2], trait: parseInt(m[3]) });
  }
}
