#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ARCHETYPES = {
  'el-laozi':'thinker','el-zhuangzi':'thinker','el-hanfeizi':'thinker',
  'el-wangyangming':'thinker','el-zhuxi':'sage','el-wangfuzhi':'sage',
  'el-mozi':'leader','el-kongzi':'leader','el-lizhi':'rebel','el-wanganshi':'rebel',
  'el-quyuan':'creator','el-taoyuanming':'creator','el-liushao':'creator',
  'el-sushi':'doer','el-dufu':'doer','el-baijuyi':'doer',
  'esci-zhangheng':'thinker','esci-li':'thinker','esci-shen':'thinker',
  'esci-cailun':'doer','esci-bi':'doer','esci-luban':'doer',
  'esci-song':'creator','esci-xuxiake':'creator','esci-lijie':'creator',
  'esci-sun':'sage','esci-guo':'sage','esci-ouye':'leader',
  'es-shangyang':'leader','es-zhuge':'leader','es-kangyouwei':'rebel',
  'es-lisi':'rebel','es-wentianxiang':'rebel','es-yuefei':'doer','es-zuo':'doer',
  'es-direnjie':'thinker','es-weizheng':'thinker','es-jiang':'sage','es-zhou':'sage',
  'wp-socrates':'thinker','wp-plato':'thinker','wp-kant':'thinker',
  'wp-nietzsche':'rebel','wp-sartre':'rebel',
  'wp-voltaire':'creator','wp-aristotle':'leader','wp-marx':'leader',
  'wp-seneca':'sage','wp-augustine':'sage',
  'wp-machiavelli':'doer',
  'ws-einstein':'thinker','ws-newton':'thinker','ws-copernicus':'thinker',
  'ws-curie':'doer','ws-edison':'doer',
  'ws-feynman':'creator','ws-archimedes':'creator',
  'ws-euler':'sage','ws-halley':'leader','ws-cavendish':'leader',
};

const BLURB_UPDATES = {
  'esci-cailun':['汝与 {{name}} 同，革一物而利天下千年，不求名而名自至。','汝与 {{name}} 同，以学为日课，终身不厌。','汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。'],
  'esci-zhangheng':['汝与 {{name}} 同，器象合一，以精密之器穷造化之理。','汝与 {{name}} 同，能于众说之上立一己之见，思入幽微。','汝与 {{name}} 同，不泥古、不奉常，以新为归。'],
  'esci-zu':['汝与 {{name}} 同，能于毫厘之间求至理，致广大而尽精微。','汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。','汝与 {{name}} 同，破旧立新，虽千万人吾往矣。'],
  'esci-bi':['汝与 {{name}} 同，以一技改千年文化之舟，不求显达于当世。','汝与 {{name}} 同，能于众说之上立一己之见，思入幽微。','汝与 {{name}} 同，不泥古、不奉常，以新为归。'],
  'esci-song':['汝与 {{name}} 同，以技术为经纬，记万物于笔端，传于后世。','汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。','汝与 {{name}} 同，敢破常名常道，另立一套言语。'],
  'esci-xu':['汝与 {{name}} 同，融中西之学为己用，知行合一。','汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。','汝与 {{name}} 同，敢破常名常道，另立一套言语。'],
  'esci-shen':['汝与 {{name}} 同，能格物致知，博而能精，于笔记间见大千。','汝与 {{name}} 同，不满足于可见之世，常向不可见处追问。','汝与 {{name}} 同，不泥古、不奉常，以新为归。'],
  'esci-guo':['汝与 {{name}} 同，以精密仪器观天象，为历法立基。','汝与 {{name}} 同，以思为杖，欲探万物之所以然。','汝与 {{name}} 同，破旧立新，虽千万人吾往矣。'],
  'esci-huang':['汝与 {{name}} 同，行事果决，不以三思自误。','汝与 {{name}} 同，不泥古、不奉常，以新为归。','汝与 {{name}} 同，虽九死其犹未悔。'],
  'esci-li':['汝与 {{name}} 同，以学为日课，历二十七年而成一书，为后世立医之准。','汝与 {{name}} 同，百折而不回，守其志如一。','汝与 {{name}} 同，思至形而上之境，所言皆欲及于永恒。'],
  'esci-jia':['汝与 {{name}} 同，博而能约，厚积薄发，以书卷济苍生。','汝与 {{name}} 同，敢破常名常道，另立一套言语。','汝与 {{name}} 同，认准一事，便不辞险阻。'],
  'esci-xuxiake':['汝与 {{name}} 同，以双脚丈量大好河山，于行走间得真知。','汝与 {{name}} 同，以思为杖，欲探万物之所以然。','汝与 {{name}} 同，虽九死其犹未悔。'],
  'esci-zhang':['汝与 {{name}} 同，以辨证论治为宗，立中医千古之法。','汝与 {{name}} 同，虽九死其犹未悔。','汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。'],
  'esci-huatuo':['汝与 {{name}} 同，破旧立新，虽千万人吾往矣。','汝与 {{name}} 同，以医术济世，不拘古方。','汝与 {{name}} 同，百折而不回，守其志如一。'],
  'esci-sun':['汝与 {{name}} 同，以药王之名，济世活人，德术双馨。','汝与 {{name}} 同，放眼千秋，不囿于朝夕。','汝与 {{name}} 同，百折而不回，守其志如一。'],
  'esci-pei':['汝与 {{name}} 同，以制图六体，为山川立准绳。','汝与 {{name}} 同，能于众说之上立一己之见，思入幽微。','汝与 {{name}} 同，百折而不回，守其志如一。'],
  'esci-su':['汝与 {{name}} 同，以水为力，集天象演示于一体。','汝与 {{name}} 同，思至形而上之境，所言皆欲及于永恒。','汝与 {{name}} 同，信念一旦立定，便成汝之脊梁。'],
  'esci-lijie':['汝与 {{name}} 同，以规矩为本，为建筑立万世之则。','汝与 {{name}} 同，以思为杖，欲探万物之所以然。','汝与 {{name}} 同，虽九死其犹未悔。'],
  'esci-ouye':['汝与 {{name}} 同，以铸剑之艺名世，十年磨一剑。','汝与 {{name}} 同，处喧而守静，不为世网所羁。','汝与 {{name}} 同，不为一时之计，而谋百代。'],
  'esci-ganjiang':['汝与 {{name}} 同，以身殉艺，铸名剑于春秋。','汝与 {{name}} 同，知进退之机，能全身而远害。','汝与 {{name}} 同，放眼千秋，不囿于朝夕。'],
  'esci-ma':['汝与 {{name}} 同，以机械之巧补造化之缺。','汝与 {{name}} 同，破旧立新，虽千万人吾往矣。','汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。'],
  'esci-zhu':['汝与 {{name}} 同，以数为绳，记三十八年之风霜雨露。','汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。','汝与 {{name}} 同，心志刚毅，以执为骨。'],
  'esci-mao':['汝与 {{name}} 同，以一桥连两岸，工程师之志不移。','汝与 {{name}} 同，百折而不回，守其志如一。','汝与 {{name}} 同，思至形而上之境，所言皆欲及于永恒。'],
  'esci-zhan':['汝与 {{name}} 同，以工程师之智，移山填海，建铁路之基。','汝与 {{name}} 同，百折而不回，守其志如一。','汝与 {{name}} 同，能于众说之上立一己之见，思入幽微。'],
  'es-shangyang':['汝与 {{name}} 同，以法为骨，以变为道，敢为天下先。','汝与 {{name}} 同，起而行之，不坐而论道。','汝与 {{name}} 同，百折而不回，守其志如一。'],
  'es-fanju':['汝与 {{name}} 同，能忍辱而后发，知机而善断。','汝与 {{name}} 同，世界在动，汝亦以动回应。','汝与 {{name}} 同，不泥古、不奉常，以新为归。'],
  'es-lisi':['汝与 {{name}} 同，善书亦善政，能以尺牍定天下。','汝与 {{name}} 同，临机立断，有雷霆之气。','汝与 {{name}} 同，敢破常名常道，另立一套言语。'],
  'es-zhangqiu':['汝与 {{name}} 同，行事果决，不以三思自误。','汝与 {{name}} 同，以变求通，不为祖宗之法所囿。','汝与 {{name}} 同，虽九死其犹未悔。'],
  'es-kangyouwei':['汝与 {{name}} 同，思以制度变天下，敢为天下先。','汝与 {{name}} 同，博而能约，厚积薄发。','汝与 {{name}} 同，敢赌敢为，以负为立身之姿。'],
  'es-wangmeng':['汝与 {{name}} 同，临机立断，有雷霆之气。','汝与 {{name}} 同，心志刚毅，以执为骨。','汝与 {{name}} 同，以思为杖，欲探万物之所以然。'],
  'es-guanzhong':['汝与 {{name}} 同，敢破常名常道，另立一套言语。','汝与 {{name}} 同，于纷陈之象中独寻其理。','汝与 {{name}} 同，起而行之，不坐而论道。'],
  'es-yanying':['汝与 {{name}} 同，以辞令折冲樽俎，于谈笑间定国安邦。','汝与 {{name}} 同，以思为杖，欲探万物之所以然。','汝与 {{name}} 同，虽九死其犹未悔。'],
  'es-zhuge':['汝与 {{name}} 同，不惮繁琐，乐在穷究。','汝与 {{name}} 同，百折而不回，守其志如一。','汝与 {{name}} 同，能以一隅敌天下，知其不可而为之。'],
  'es-fanzhongyan':['汝与 {{name}} 同，先天下之忧而忧，此心此志，千年不磨。','汝与 {{name}} 同，逆风而行，不改其步。','汝与 {{name}} 同，能于众说之上立一己之见，思入幽微。'],
  'es-yuefei':['汝与 {{name}} 同，以忠义为骨，以军旅为家。','汝与 {{name}} 同，行事果决，不以三思自误。','汝与 {{name}} 同，以天下为怀，不以一己为念。'],
  'es-linze':['汝与 {{name}} 同，苟利国家生死以，此言此行，千年犹新。','汝与 {{name}} 同，行事果决，不以三思自误。','汝与 {{name}} 同，心系苍生，忧乐与共。'],
  'es-xiaohe':['汝与 {{name}} 同，能识人用人，幕后安定。','汝与 {{name}} 同，以天下为怀，不以一己为念。','汝与 {{name}} 同，百折而不回，守其志如一。'],
  'es-fangxuanling':['汝与 {{name}} 同，孜孜为国二十载，善谋而定天下。','汝与 {{name}} 同，以天下为怀，不以一己为念。','汝与 {{name}} 同，百折而不回，守其志如一。'],
  'es-weizheng':['汝与 {{name}} 同，以谏为职，守正不阿，直声满天下。','汝与 {{name}} 同，能于众说之上立一己之见，思入幽微。','汝与 {{name}} 同，心志刚毅，以执为骨。'],
  'es-wentianxiang':['汝与 {{name}} 同，知其不可而守其节，不以死生易志。','汝与 {{name}} 同，群己之间，重公义而轻私利。','汝与 {{name}} 同，正气浩然，天地有光。'],
  'es-haigui':['汝与 {{name}} 同，虽九死其犹未悔。','汝与 {{name}} 同，以清廉直道名世，不惧权贵。','汝与 {{name}} 同，行事果决，不以三思自误。'],
  'es-liangqichao':['汝与 {{name}} 同，以言为刃，变法维新，笔力千钧。','汝与 {{name}} 同，言华丽，以辞采为骨。','汝与 {{name}} 同，以思为杖，欲探万物之所以然。'],
  'es-zhangliang':['汝与 {{name}} 同，能于乱世全身而退，知止而后有定。','汝与 {{name}} 同，处喧而守静，不为世网所羁。','汝与 {{name}} 同，谋定而后动，功成身退。'],
  'es-direnjie':['汝与 {{name}} 同，于纷乱之中明辨是非，断案如神。','汝与 {{name}} 同，思至形而上之境，所言皆欲及于永恒。','汝与 {{name}} 同，认准一事，便不辞险阻。'],
  'es-xujie':['汝与 {{name}} 同，能屈能伸，以隐忍而待时机。','汝与 {{name}} 同，百折而不回，守其志如一。','汝与 {{name}} 同，以退为进，后发先至。'],
  'es-zhangzhidong':['汝与 {{name}} 同，以中学为体、西学为用，务实以兴国。','汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。','汝与 {{name}} 同，以群体为先，忘身以济天下。'],
  'es-lihongzhang':['汝与 {{name}} 同，以洋务开风气，一代人办一代事。','汝与 {{name}} 同，以思为杖，欲探万物之所以然。','汝与 {{name}} 同，虽九死其犹未悔。'],
  'es-zhou':['汝与 {{name}} 同，以礼乐文明为基，制天下于有序。','汝与 {{name}} 同，心志刚毅，以执为骨。','汝与 {{name}} 同，心系苍生，忧乐与共。'],
  'es-yi':['汝与 {{name}} 同，以调和鼎鼐之功，致王者之治。','汝与 {{name}} 同，处喧而守静，不为世网所羁。','汝与 {{name}} 同，不为一时之计，而谋百代。'],
  'es-fanli':['汝与 {{name}} 同，知进退之机，功成身退，经商亦成大家。','汝与 {{name}} 同，向内求心安，以内省为日课。','汝与 {{name}} 同，认准一事，便不辞险阻。'],
  'es-zuo':['汝与 {{name}} 同，抬棺出关，收复新疆，以一身为天下先。','汝与 {{name}} 同，以学为日课，终身不厌。','汝与 {{name}} 同，临机立断，有雷霆之气。'],
  'es-sunyatsen':['汝与 {{name}} 同，破旧立新，虽千万人吾往矣。','汝与 {{name}} 同，博而能约，厚积薄发。','汝与 {{name}} 同，天下为公，此心不渝。'],
  'es-liubow':['汝与 {{name}} 同，以谋略佐天下，事成而身退。','汝与 {{name}} 同，心志刚毅，以执为骨。','汝与 {{name}} 同，知进退之机，能全身而远害。'],
  'es-jiang':['汝与 {{name}} 同，以静待动，八十年磨一剑，终得明主。','汝与 {{name}} 同，知进退之机，能全身而远害。','汝与 {{name}} 同，千秋事业，方称吾志。'],
};

function patchFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Strategy: for each figure, find the 'echoes: [...]' line and the 'id:' line,
  // then process from id to end of echoes
  // Pattern: figure content is from id: 'xxx', to the closing }, of echoes block

  // Find all figure id positions
  const idPositions = [...src.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => ({
    id: m[1],
    index: m.index,
  }));

  for (const { id, index: idIdx } of idPositions) {
    const hasArchetype = ARCHETYPES[id] !== undefined;
    const hasBlurb = BLURB_UPDATES[id] !== undefined;

    if (!hasArchetype && !hasBlurb) continue;

    // Find the 'echoes:' field position for this figure
    // Search from idIdx forward
    const afterId = src.slice(idIdx);
    const echoesMatch = afterId.match(/echoes:\s*\[([^\]]*)\]/);

    if (!echoesMatch) continue;
    const echoesFull = echoesMatch[0];
    const echoesStart = idIdx + afterId.indexOf(echoesFull);

    // Find the end of the echoes array (the closing ])
    const arrayEnd = echoesStart + echoesFull.lastIndexOf(']') + 1;

    // Check if archetype already exists
    const betweenIdAndEchoes = src.slice(idIdx, echoesStart);
    const hasArchAlready = betweenIdAndEchoes.includes('archetype?:') || betweenIdAndEchoes.includes('archetype:');

    let newChunk = src.slice(idIdx, arrayEnd);

    // 1. Add archetype
    if (hasArchetype && !hasArchAlready) {
      const arch = ARCHETYPES[id];
      // Insert archetype before echoes field
      newChunk = newChunk.replace(
        /(echoes:\s*\[[^\]]*\])/,
        `archetype: '${arch}',\n    $1`
      );
    }

    // 2. Update blurbs
    if (hasBlurb) {
      const blurbLines = BLURB_UPDATES[id].map(b => `      '${b}',`).join('\n');
      newChunk = newChunk.replace(
        /matchBlurb:\s*\[[\s\S]*?\]\s*,/,
        `matchBlurb: [\n${blurbLines}\n    ],`
      );
    }

    if (newChunk !== src.slice(idIdx, arrayEnd)) {
      src = src.slice(0, idIdx) + newChunk + src.slice(arrayEnd);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, src);
    console.log(`✓ Patched: ${path.basename(filePath)}`);
  } else {
    console.log(`  No changes: ${path.basename(filePath)}`);
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
  patchFile(path.join(base, f));
}
console.log('Done!');
