const fs = require('fs');
let src = fs.readFileSync('src/domain/figures/figures.east-scientist.ts', 'utf8');
const newVec = [0.70, 0.42, 0.90, 0.97, 0.50, 0.35, 0.87, 0.97, 0.40, 0.60, 0.88, 0.40];
const vecStr = newVec.map(v => v.toFixed(2)).join(', ');
const id = 'esci-cailun';

const re = new RegExp(`(\\'${id}\\'[^}]*?vector:\\s*\\[)[^\\]]+(\\])`, 's');
const m = src.match(re);
if (m) {
  console.log('Matched OK:', m[0].slice(0,100));
  const replacement = '$1[' + vecStr + ']$2';
  const before = src.match(re)?.[0];
  src = src.replace(re, replacement);
  const after = src.match(new RegExp(`(\\'${id}\\'[^}]{0,200}vector:\\s*\\[)[^\\]]+(\\])`, 's'))?.[0];
  console.log('After:', after?.slice(0,100));
  if (!after || after.includes('0.92')) {
    console.log('FAIL: vector not updated');
  } else {
    console.log('SUCCESS');
    fs.writeFileSync('src/domain/figures/figures.east-scientist.ts', src);
  }
} else {
  console.log('NO MATCH');
}
