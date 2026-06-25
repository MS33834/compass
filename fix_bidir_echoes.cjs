#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const allFiles = ['figures.east-literati.ts','figures.east-scientist.ts','figures.east-statesman.ts','figures.west-philosopher.ts','figures.west-scientist.ts'];

// Step 1: Load all echoes
const figMap = {};
for (const fname of allFiles) {
  const src = fs.readFileSync(path.join(__dirname,'src/domain/figures',fname),'utf8');
  for (const m of [...src.matchAll(/id:\s*['"]([^'"]+)['"][\s\S]*?echoes:\s*\[([^\]]*)\]/g)]) {
    figMap[m[1]] = m[2].split(',').map(s=>s.trim().replace(/['"]/g,'')).filter(Boolean);
  }
}

// Step 2: For each one-way pair A→B, add 'A' to B's echoes list
// Key by TARGET (B), value = who needs to be added TO B
const toAdd = {}; // targetId -> list of sourceIds to add TO target's echoes
for (const [sourceId, echoes] of Object.entries(figMap)) {
  for (const targetId of echoes) {
    if (!figMap[targetId]) continue; // target doesn't exist
    if (!figMap[targetId].includes(sourceId)) {
      // Missing: target should also echo sourceId
      if (!toAdd[targetId]) toAdd[targetId] = [];
      if (!toAdd[targetId].includes(sourceId)) toAdd[targetId].push(sourceId);
    }
  }
}

console.log('Missing reciprocals to add:', Object.values(toAdd).reduce((a,b)=>a+b.length,0));

// Step 3: Apply changes per file
for (const fname of allFiles) {
  const filePath = path.join(__dirname,'src/domain/figures',fname);
  const src = fs.readFileSync(filePath,'utf8');
  const changes = []; // {pos, oldLen, newText}

  for (const m of src.matchAll(/id:\s*['"]([^'"]+)['"]/g)) {
    const id = m[1];
    const adds = toAdd[id];
    if (!adds || adds.length === 0) continue;

    const afterId = src.slice(m.index);
    const echoesMatch = afterId.match(/echoes:\s*\[([^\]]*)\]/);
    if (!echoesMatch) continue;

    const echoesStart = m.index + afterId.indexOf(echoesMatch[0]);
    const echoesFull = echoesMatch[0];
    const echoesContent = echoesMatch[1];
    const currentEchoes = echoesContent.split(',').map(s=>s.trim().replace(/['"]/g,'')).filter(Boolean);
    const missing = adds.filter(e=>!currentEchoes.includes(e));
    if (missing.length === 0) continue;

    const newEchoes = [...currentEchoes, ...missing];
    const newEchoesFull = `echoes: [${newEchoes.map(e=>`'${e}'`).join(', ')}]`;
    changes.push({pos: echoesStart, oldLen: echoesFull.length, newText: newEchoesFull});
  }

  if (changes.length > 0) {
    changes.sort((a,b)=>b.pos-a.pos); // back-to-front
    let newSrc = src;
    for (const c of changes) {
      newSrc = newSrc.slice(0, c.pos) + c.newText + newSrc.slice(c.pos + c.oldLen);
    }
    fs.writeFileSync(filePath, newSrc);
    console.log(`✓ Fixed ${changes.length} figures: ${fname}`);
  } else {
    console.log(`  No changes: ${fname}`);
  }
}
console.log('Done!');
