#!/usr/bin/env node
// Fix bidirectional echoes: for each A->B, ensure B->A also exists
const fs = require('fs');
const path = require('path');

// Build the reverse echo map (computed from the earlier analysis)
const RECIPROCALS = {
  'el-laozi': ['el-zhuangzi', 'el-lizhi'],
  'el-zhuangzi': ['el-laozi', 'el-taoyuanming', 'el-liushao'],
  'el-mozi': ['el-kongzi', 'el-xunzi', 'el-wanganshi'],
  'el-lizhi': ['el-hanfeizi', 'el-zhuangzi'],
  'el-wanganshi': ['el-zhuangzi', 'el-hanfeizi', 'el-lizhi'],
  'el-xunzi': ['el-kongzi', 'el-mengzi', 'el-hanfeizi'],
  'el-quyuan': ['el-taoyuanming', 'el-sushi', 'el-liuzongyuan'],
  'el-liuzongyuan': ['el-taoyuanming', 'el-taoyuanming', 'el-hanyu', 'el-ouyangxiu', 'el-simaqian'],
  'el-zhuxi': ['el-kongzi', 'el-mengzi', 'el-wangyangming'],
  'el-wangfuzhi': ['el-wangyangming', 'el-zhuxi'],
  'el-kongzi': ['el-mengzi', 'el-xunzi', 'el-zengguofan'],
  'el-wangwei': ['el-taoyuanming', 'el-zhuangzi', 'el-liushao'],
  'el-hanyu': ['el-liuzongyuan', 'el-ouyangxiu', 'el-dufu'],
  'el-ouyangxiu': ['el-hanyu', 'el-sushi', 'el-simaqian'],
  'el-simaqian': ['el-liuzongyuan', 'el-hanyu', 'el-ouyangxiu'],
  'el-dufu': ['el-sushi', 'el-luyou', 'el-baijuyi'],
  'el-baijuyi': ['el-dufu', 'el-sushi', 'el-luyou', 'el-yuanmei'],
  'el-sushi': ['el-taoyuanming', 'el-wanganshi', 'el-nalanxingde'],
  'el-luyou': ['el-sushi', 'el-zhangdai', 'el-dufu'],
  'el-zhangdai': ['el-liushao', 'el-wangwei', 'el-taoyuanming', 'el-liyu'],
  'el-zengguofan': ['el-kongzi', 'el-zhuxi', 'el-ouyangxiu', 'el-dufu'],
  'el-liyu': ['el-zhangdai', 'el-yuanmei'],
  'el-yuanmei': ['el-liushao', 'el-baijuyi', 'el-gongzizhen'],
  'el-nalanxingde': ['el-sushi', 'el-dufu', 'el-liushao'],
  'el-liushao': ['el-taoyuanming', 'el-liyu', 'el-dufu', 'el-nalanxingde'],
  'el-gongzizhen': ['el-yuanmei', 'el-liyu'],
  'esci-cailun': ['esci-bi', 'esci-huang', 'esci-song'],
  'esci-zhangheng': ['esci-cailun', 'esci-zu', 'esci-shen', 'esci-guo'],
  'esci-zu': ['esci-zhangheng', 'esci-qin', 'esci-shen'],
  'esci-bi': ['esci-cailun', 'esci-song', 'esci-li'],
  'esci-song': ['esci-cailun', 'esci-li', 'esci-lijie', 'esci-xu'],
  'esci-xu': ['esci-song', 'esci-bi', 'esci-lijie', 'esci-zhan'],
  'esci-shen': ['esci-bi', 'esci-song', 'esci-guo', 'esci-yi', 'esci-zhu', 'esci-mao', 'esci-zhan'],
  'esci-guo': ['esci-zhangheng', 'esci-yi', 'esci-shen', 'esci-su', 'esci-qin'],
  'esci-huang': ['esci-cailun', 'esci-bi', 'esci-jia'],
  'esci-li': ['esci-jia', 'esci-xu', 'esci-xuxiake'],
  'esci-jia': ['esci-xu', 'esci-li', 'esci-huang'],
  'esci-xuxiake': ['esci-pei', 'esci-li', 'esci-lidaoyu'],
  'esci-zhang': ['esci-sun', 'esci-bianque', 'esci-huatuo', 'esci-ge'],
  'esci-huatuo': ['esci-zhang', 'esci-sun', 'esci-bianque'],
  'esci-sun': ['esci-zhang', 'esci-bianque', 'esci-li'],
  'esci-pei': ['esci-guo', 'esci-xuxiake', 'esci-li', 'esci-lidaoyu'],
  'esci-su': ['esci-zhangheng', 'esci-guo', 'esci-ma'],
  'esci-lijie': ['esci-luban', 'esci-song', 'esci-xu'],
  'esci-ge': ['esci-bianque', 'esci-yi', 'esci-zhang', 'esci-ganjiang'],
  'esci-lidaoyu': ['esci-xuxiake', 'esci-pei'],
  'esci-yi': ['esci-guo', 'esci-zhangheng', 'esci-shen'],
  'esci-qin': ['esci-zu', 'esci-shen', 'esci-guo'],
  'esci-luban': ['esci-cailun', 'esci-huang', 'esci-ouye', 'esci-ma', 'esci-lijie'],
  'esci-ouye': ['esci-ganjiang', 'esci-luban', 'esci-ma'],
  'esci-ganjiang': ['esci-ouye', 'esci-luban', 'esci-ge'],
  'esci-ma': ['esci-su', 'esci-luban', 'esci-ouye'],
  'esci-zhu': ['esci-shen', 'esci-guo', 'esci-xu'],
  'esci-mao': ['esci-zhan', 'esci-shen', 'esci-xu'],
  'esci-zhan': ['esci-mao', 'esci-shen', 'esci-xu'],
  'es-fanju': ['es-shangyang', 'es-lisi', 'es-zhangqiu'],
  'es-lisi': ['es-shangyang', 'es-fanju', 'es-zhangqiu'],
  'es-zhangqiu': ['es-shangyang', 'es-fanju', 'es-kangyouwei', 'es-liangqichao', 'es-xujie', 'es-zhangzhidong', 'es-sunyatsen'],
  'es-kangyouwei': ['es-shangyang', 'es-zhangqiu', 'es-liangqichao', 'es-sunyatsen'],
  'es-wangmeng': ['es-zhuge', 'es-zhangqiu', 'es-shangyang'],
  'es-guanzhong': ['es-shangyang', 'es-fanju', 'es-zhuge', 'es-yanying'],
  'es-yanying': ['es-guanzhong', 'es-zhuge', 'es-weizheng'],
  'es-zhuge': ['es-wangmeng', 'es-fanju', 'es-weizheng', 'es-yanying', 'es-fanzhongyan', 'es-yuefei', 'es-xiaohe', 'es-fangxuanling', 'es-zhou', 'es-liubow'],
  'es-fanzhongyan': ['es-zhuge', 'es-weizheng', 'es-haigui'],
  'es-yuefei': ['es-wentianxiang', 'es-haigui', 'es-zhuge', 'es-zuo'],
  'es-linze': ['es-haigui', 'es-wentianxiang', 'es-zuo'],
  'es-xiaohe': ['es-fangxuanling', 'es-zhuge', 'es-zhangliang'],
  'es-fangxuanling': ['es-xiaohe', 'es-weizheng', 'es-zhuge', 'es-direnjie'],
  'es-wentianxiang': ['es-yuefei', 'es-haigui', 'es-zhuge', 'es-linze'],
  'es-liangqichao': ['es-kangyouwei', 'es-zhangqiu', 'es-sunyatsen', 'es-zhangzhidong'],
  'es-zhangliang': ['es-xiaohe', 'es-fanli', 'es-zhou', 'es-liubow', 'es-jiang'],
  'es-direnjie': ['es-fangxuanling', 'es-weizheng', 'es-xujie'],
  'es-xujie': ['es-zhangqiu', 'es-direnjie'],
  'es-zhangzhidong': ['es-zhangqiu', 'es-liangqichao', 'es-lihongzhang'],
  'es-lihongzhang': ['es-zhangzhidong', 'es-zuo'],
  'es-zhou': ['es-yi', 'es-zhuge', 'es-zhangliang', 'es-jiang'],
  'es-fanli': ['es-zhangliang', 'es-yi', 'es-zuo'],
  'es-zuo': ['es-linze', 'es-haigui', 'es-yuefei', 'es-lihongzhang', 'es-fanli'],
  'es-sunyatsen': ['es-kangyouwei', 'es-zhangqiu', 'es-haigui', 'es-liangqichao'],
  'es-liubow': ['es-zhuge', 'es-zhangliang', 'es-fanju'],
  'es-jiang': ['es-yi', 'es-zhou', 'es-zhangliang'],
  'wp-socrates': ['wp-plato', 'wp-aristotle', 'wp-voltaire', 'wp-nietzsche', 'wp-wittgenstein', 'wp-heidegger'],
  'wp-plato': ['wp-socrates', 'wp-aristotle', 'wp-kant', 'wp-descartes'],
  'wp-aristotle': ['wp-plato', 'wp-bacon', 'wp-kant', 'wp-habermas', 'wp-rawls'],
  'wp-voltaire': ['wp-marx', 'wp-nietzsche', 'wp-sartre', 'wp-socrates'],
  'wp-nietzsche': ['wp-socrates', 'wp-sartre', 'wp-foucault', 'wp-voltaire', 'wp-camus', 'wp-schopenhauer'],
  'wp-sartre': ['wp-nietzsche', 'wp-camus', 'wp-marx', 'wp-voltaire', 'wp-heidegger', 'wp-kierkegaard'],
  'wp-descartes': ['wp-kant', 'wp-hume', 'wp-plato', 'wp-bacon'],
  'wp-kant': ['wp-hegel', 'wp-hume', 'wp-aristotle', 'wp-plato', 'wp-wittgenstein'],
  'wp-hegel': ['wp-kant', 'wp-marx', 'wp-heidegger'],
  'wp-wittgenstein': ['wp-socrates', 'wp-kant', 'wp-foucault'],
  'wp-camus': ['wp-sartre', 'wp-nietzsche', 'wp-seneca'],
  'wp-bacon': ['wp-locke', 'wp-hume', 'wp-descartes'],
  'wp-locke': ['wp-hume', 'wp-bacon', 'wp-hobbes', 'wp-rawls'],
  'wp-heidegger': ['wp-levinas', 'wp-socrates', 'wp-sartre', 'wp-hegel', 'wp-bergson'],
  'wp-habermas': ['wp-marx', 'wp-rawls', 'wp-aristotle'],
  'wp-rawls': ['wp-locke', 'wp-habermas', 'wp-aristotle'],
  'wp-pascal': ['wp-seneca', 'wp-kierkegaard', 'wp-levinas', 'wp-augustine'],
  'wp-kierkegaard': ['wp-pascal', 'wp-augustine', 'wp-sartre'],
  'wp-bergson': ['wp-augustine', 'wp-heidegger', 'wp-seneca'],
  'wp-levinas': ['wp-augustine', 'wp-pascal', 'wp-heidegger'],
  'wp-epicurus': ['wp-seneca', 'wp-augustine', 'wp-marx'],
  'wp-machiavelli': ['wp-hobbes', 'wp-marx'],
  'wp-schopenhauer': ['wp-nietzsche', 'wp-seneca'],
  'ws-copernicus': ['ws-galileo', 'ws-kepler', 'ws-newton', 'ws-halley'],
  'ws-galileo': ['ws-copernicus', 'ws-newton', 'ws-feynman', 'ws-kepler'],
  'ws-einstein': ['ws-newton', 'ws-planck', 'ws-bohr', 'ws-curie', 'ws-feynman'],
  'ws-curie': ['ws-faraday', 'ws-einstein', 'ws-feynman', 'ws-nobel'],
  'ws-feynman': ['ws-einstein', 'ws-heisenberg', 'ws-bohr', 'ws-galileo', 'ws-curie', 'ws-schrodinger'],
  'ws-kepler': ['ws-copernicus', 'ws-newton', 'ws-galileo', 'ws-halley'],
  'ws-leibniz': ['ws-newton', 'ws-euler', 'ws-gauss'],
  'ws-darwin': ['ws-mendel', 'ws-faraday', 'ws-newton'],
  'ws-faraday': ['ws-maxwell', 'ws-curie', 'ws-hertz', 'ws-darwin', 'ws-mendel', 'ws-lavoisier', 'ws-franklin'],
  'ws-planck': ['ws-einstein', 'ws-bohr', 'ws-heisenberg'],
  'ws-lavoisier': ['ws-faraday', 'ws-newton', 'ws-maxwell'],
  'ws-maxwell': ['ws-faraday', 'ws-hertz', 'ws-newton', 'ws-lavoisier'],
  'ws-mendel': ['ws-darwin', 'ws-newton', 'ws-faraday'],
  'ws-hertz': ['ws-maxwell', 'ws-shannon', 'ws-faraday'],
  'ws-wiener': ['ws-shannon', 'ws-turing', 'ws-vonneumann'],
  'ws-franklin': ['ws-edison', 'ws-faraday', 'ws-nobel'],
  'ws-edison': ['ws-franklin', 'ws-nobel', 'ws-turing'],
  'ws-nobel': ['ws-edison', 'ws-curie', 'ws-franklin'],
  'ws-vonneumann': ['ws-turing', 'ws-shannon', 'ws-gauss', 'ws-wiener'],
  'ws-archimedes': ['ws-euler', 'ws-gauss', 'ws-newton', 'ws-cavendish'],
  'ws-euler': ['ws-gauss', 'ws-leibniz', 'ws-newton', 'ws-archimedes'],
  'ws-halley': ['ws-newton', 'ws-kepler', 'ws-copernicus', 'ws-cavendish'],
  'ws-cavendish': ['ws-newton', 'ws-halley', 'ws-archimedes'],
  'ws-schrodinger': ['ws-heisenberg', 'ws-bohr', 'ws-feynman'],
};

function patchEchoes(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const idPositions = [...src.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => ({
    id: m[1],
    index: m.index,
  }));

  for (const { id, index: idIdx } of idPositions) {
    const adds = RECIPROCALS[id];
    if (!adds) continue;

    const afterId = src.slice(idIdx);
    const echoesMatch = afterId.match(/echoes:\s*\[([^\]]*)\]/);
    if (!echoesMatch) continue;

    const echoesFull = echoesMatch[0];
    const echoesContent = echoesMatch[1];

    // Get current echoes
    const currentEchoes = echoesContent.split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
    const neededEchoes = [...new Set(adds)];

    // Check what's missing
    const missing = neededEchoes.filter(e => !currentEchoes.includes(e));
    if (missing.length === 0) continue;

    const newContent = [...currentEchoes, ...missing];
    const newEchoesFull = `echoes: [${newContent.map(e => `'${e}'`).join(', ')}]`;
    const newSrc = src.slice(0, idIdx) + afterId.replace(echoesFull, newEchoesFull) + src.slice(idIdx + afterId.length);

    if (newSrc !== src) {
      src = newSrc;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, src);
    console.log(`✓ Echoes fixed: ${path.basename(filePath)}`);
  } else {
    console.log(`  No echo changes: ${path.basename(filePath)}`);
  }
}

const base = __dirname;
for (const f of [
  'src/domain/figures/figures.east-literati.ts',
  'src/domain/figures/figures.east-scientist.ts',
  'src/domain/figures/figures.east-statesman.ts',
  'src/domain/figures/figures.west-philosopher.ts',
  'src/domain/figures/figures.west-scientist.ts',
]) {
  patchEchoes(path.join(base, f));
}
console.log('Done!');
