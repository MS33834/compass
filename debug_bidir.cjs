const fs = require('fs');
const src = fs.readFileSync('src/domain/figures/figures.east-literati.ts','utf8');
const idPositions = [...src.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m=>({id:m[1],index:m.index}));
console.log('Total figures found:', idPositions.length);

const laozi = idPositions.find(x=>x.id==='el-laozi');
console.log('el-laozi pos:', laozi?.index);
const afterId = src.slice(laozi.index);
const echoesMatch = afterId.match(/echoes:\s*\[([^\]]*)\]/);
console.log('echoesMatch:', echoesMatch ? echoesMatch[0] : 'NO MATCH');
console.log('echoesContent:', echoesMatch ? echoesMatch[1].trim() : 'N/A');

// Simulate the full loop
const toAdd = {};
toAdd['el-laozi'] = ['el-lizhi'];
toAdd['el-lizhi'] = ['el-zhuangzi'];

const changes = [];
for (const {id, index} of idPositions) {
  const adds = toAdd[id];
  if (!adds || adds.length === 0) continue;
  const after = src.slice(index);
  const em = after.match(/echoes:\s*\[([^\]]*)\]/);
  if (!em) { console.log('NO MATCH for', id); continue; }
  const echoesStart = index + after.indexOf(em[0]);
  const echoesFull = em[0];
  const echoesContent = em[1];
  const currentEchoes = echoesContent.split(',').map(s=>s.trim().replace(/['"]/g,'')).filter(Boolean);
  const missing = adds.filter(e=>!currentEchoes.includes(e));
  console.log(id, 'current:', currentEchoes, 'missing:', missing);
  if (missing.length === 0) continue;
  const newEchoes = [...currentEchoes, ...missing];
  const newEchoesFull = 'echoes: [' + newEchoes.map(e=>"'".concat(e,"'")).join(', ') + ']';
  changes.push({pos: echoesStart, oldLen: echoesFull.length, newText: newEchoesFull});
}
console.log('Changes:', changes.length);
changes.sort((a,b)=>b.pos-a.pos);
let newSrc = src;
for (const c of changes) {
  newSrc = newSrc.slice(0, c.pos) + c.newText + newSrc.slice(c.pos + c.oldLen);
}
console.log('Modified:', newSrc !== src ? 'YES' : 'NO');
