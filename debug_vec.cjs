const fs = require('fs');
const src = fs.readFileSync('src/domain/figures/figures.east-scientist.ts', 'utf8');
const id = 'esci-cailun';

const re1 = new RegExp(`(\\'${id}\\'[^}]*?vector:\\s*\\[)[^\\]]+(\\])`, 's');
const re2 = new RegExp(`(\\'${id}\\'[^}]*?vector:\\s*\\[)[^\\]]+(\\])[^}]*?echoes:`, 's');

const m1 = src.match(re1);
const m2 = src.match(re2);
console.log('re1 match:', m1 ? m1[0].slice(0,80) : 'none');
console.log('re2 match:', m2 ? m2[0].slice(0,80) : 'none');
console.log('re2 last 30:', m2 ? m2[0].slice(-30) : 'none');
// Find position of echoes: near cailun
const idPos = src.indexOf("'" + id + "'");
const echoesPos = src.indexOf('echoes:', idPos);
console.log('From id to echoes dist:', echoesPos - idPos);
// Check if there are } chars between id and echoes
const between = src.slice(idPos, echoesPos);
console.log('Contains } ?', between.includes('}'));
