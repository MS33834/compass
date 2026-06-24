import { FIGURES_EAST_LITERATI } from '../src/domain/figures/figures.east-literati.ts';
import { FIGURES_EAST_STATESMAN } from '../src/domain/figures/figures.east-statesman.ts';
import { FIGURES_EAST_SCIENTIST } from '../src/domain/figures/figures.east-scientist.ts';
import { FIGURES_WEST_PHILOSOPHER } from '../src/domain/figures/figures.west-philosopher.ts';
import { FIGURES_WEST_SCIENTIST } from '../src/domain/figures/figures.west-scientist.ts';
import { ITEMS_EAST_LITERATI } from '../src/domain/items/items.east-literati.ts';
import { ITEMS_EAST_STATESMAN } from '../src/domain/items/items.east-statesman.ts';
import { ITEMS_EAST_SCIENTIST } from '../src/domain/items/items.east-scientist.ts';
import { ITEMS_WEST_PHILOSOPHER } from '../src/domain/items/items.west-philosopher.ts';
import { ITEMS_WEST_SCIENTIST } from '../src/domain/items/items.west-scientist.ts';

const pools = {
  'east-literati': { figures: FIGURES_EAST_LITERATI, items: ITEMS_EAST_LITERATI },
  'east-statesman': { figures: FIGURES_EAST_STATESMAN, items: ITEMS_EAST_STATESMAN },
  'east-scientist': { figures: FIGURES_EAST_SCIENTIST, items: ITEMS_EAST_SCIENTIST },
  'west-philosopher': { figures: FIGURES_WEST_PHILOSOPHER, items: ITEMS_WEST_PHILOSOPHER },
  'west-scientist': { figures: FIGURES_WEST_SCIENTIST, items: ITEMS_WEST_SCIENTIST },
};

// 1. 重复题干
const promptMap = new Map();
for (const [domain, { items }] of Object.entries(pools)) {
  for (const item of items) {
    const arr = promptMap.get(item.prompt) || [];
    arr.push(`${domain}:${item.id}`);
    promptMap.set(item.prompt, arr);
  }
}
const duplicates = [...promptMap.entries()]
  .filter(([_, ids]) => ids.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log('=== 跨域重复题干 ===');
for (const [prompt, ids] of duplicates) {
  console.log(`\n"${prompt}" 出现在 ${ids.length} 处：`);
  console.log('  ' + ids.join(', '));
}

// 2. 最短 bio
const allFigures = [];
for (const [domain, { figures }] of Object.entries(pools)) {
  for (const f of figures) {
    allFigures.push({ id: f.id, name: f.name, domain, era: f.era, bio: f.bio, len: f.bio.length });
  }
}
allFigures.sort((a, b) => a.len - b.len);
console.log('\n=== bio 最短的前 15 个人物 ===');
for (const f of allFigures.slice(0, 15)) {
  console.log(`${f.len}\t${f.id}\t${f.name}\t[${f.domain}]\t${f.bio}`);
}

// 3. era 值统计
const eraMap = new Map();
for (const f of allFigures) {
  eraMap.set(f.era, (eraMap.get(f.era) || 0) + 1);
}
console.log('\n=== era 值统计 ===');
for (const [era, count] of [...eraMap.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`${count}\t${era}`);
}

// 4. 零 delta primary 统计
let zeroCount = 0;
let zeroByTrait = new Array(13).fill(0);
for (const [domain, { items }] of Object.entries(pools)) {
  for (const item of items) {
    for (const opt of item.options) {
      if (opt.primary.delta === 0) {
        zeroCount++;
        zeroByTrait[opt.primary.traitId]++;
      }
    }
  }
}
console.log('\n=== primary delta = 0 统计 ===');
console.log(`总数：${zeroCount}`);
console.log('按维度：' + zeroByTrait.slice(1).join(', '));
