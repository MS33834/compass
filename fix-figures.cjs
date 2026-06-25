#!/usr/bin/env node
// Compass Figures Patch Script
// 1. Add archetype field to type (manual)
// 2. Rebalance vectors in east-scientist & east-statesman
// 3. Add archetype labels
// 4. Improve generic blurbs
// 5. Fix bidirectional echoes

const fs = require('fs');
const path = require('path');

// ============================================================
// 1. Patch figure.types.ts — add archetype field
// ============================================================
const typesPath = path.join(__dirname, 'src/domain/figures/figure.types.ts');
let typesSrc = fs.readFileSync(typesPath, 'utf8');
const archetypeTypeDef = `
export type FigureArchetype = 'thinker' | 'doer' | 'creator' | 'leader' | 'rebel' | 'sage';`;
if (!typesSrc.includes('FigureArchetype')) {
  typesSrc = typesSrc.replace(
    'export type Figure = {',
    `${archetypeTypeDef.trim()}\n\nexport type Figure = {`
  );
  typesSrc = typesSrc.replace(
    '  echoes: string[];',
    `  echoes: string[];\n  /** 人物原型分类，用于多样性采样 */\n  archetype?: FigureArchetype;`
  );
  fs.writeFileSync(typesPath, typesSrc);
  console.log('✓ Patched figure.types.ts');
}

// ============================================================
// 2. Rebalanced vectors (new values)
// ============================================================

// --- EAST-SCIENTIST vectors ---
const ESCI_VECTORS = {
  'esci-cailun':    [0.70, 0.42, 0.90, 0.97, 0.50, 0.35, 0.87, 0.97, 0.40, 0.60, 0.88, 0.40],
  'esci-zhangheng': [0.73, 0.47, 0.88, 0.92, 0.45, 0.57, 0.82, 1.00, 0.40, 0.65, 0.82, 0.67],
  'esci-zu':        [0.73, 0.42, 0.82, 0.92, 0.40, 0.52, 0.87, 1.00, 0.35, 0.70, 0.82, 0.57],
  'esci-bi':        [0.70, 0.42, 0.87, 0.97, 0.50, 0.40, 0.82, 0.97, 0.40, 0.55, 0.82, 0.47],
  'esci-song':      [0.72, 0.42, 0.87, 0.94, 0.50, 0.40, 0.87, 1.00, 0.40, 0.70, 0.82, 0.57],
  'esci-xu':        [0.72, 0.42, 0.87, 0.92, 0.50, 0.45, 0.87, 1.00, 0.40, 0.70, 0.82, 0.62],
  'esci-shen':      [0.68, 0.52, 0.77, 0.82, 0.50, 0.50, 0.82, 1.00, 0.45, 0.70, 0.72, 0.67],
  'esci-guo':       [0.68, 0.42, 0.82, 0.87, 0.40, 0.50, 0.87, 1.00, 0.40, 0.70, 0.82, 0.57],
  'esci-huang':     [0.68, 0.52, 0.87, 0.87, 0.55, 0.40, 0.87, 0.87, 0.45, 0.55, 0.77, 0.42],
  'esci-li':        [0.68, 0.52, 0.77, 0.87, 0.50, 0.50, 0.92, 1.00, 0.45, 0.80, 0.77, 0.62],
  'esci-jia':       [0.68, 0.52, 0.72, 0.82, 0.50, 0.40, 0.82, 0.97, 0.40, 0.70, 0.72, 0.52],
  'esci-xuxiake':   [0.68, 0.62, 0.72, 0.72, 0.40, 0.70, 0.87, 0.97, 0.40, 0.85, 0.87, 0.87],
  'esci-zhang':     [0.68, 0.50, 0.62, 0.62, 0.60, 0.40, 0.82, 0.97, 0.50, 0.70, 0.62, 0.57],
  'esci-huatuo':    [0.68, 0.50, 0.72, 0.82, 0.50, 0.50, 0.82, 0.97, 0.50, 0.65, 0.77, 0.57],
  'esci-sun':       [0.68, 0.50, 0.62, 0.67, 0.70, 0.50, 0.82, 1.00, 0.60, 0.85, 0.62, 0.62],
  'esci-pei':       [0.68, 0.50, 0.62, 0.72, 0.40, 0.50, 0.77, 0.97, 0.45, 0.70, 0.62, 0.57],
  'esci-su':        [0.68, 0.50, 0.62, 0.72, 0.40, 0.55, 0.77, 1.00, 0.40, 0.70, 0.62, 0.57],
  'esci-lijie':     [0.68, 0.55, 0.67, 0.62, 0.50, 0.70, 0.77, 0.97, 0.50, 0.70, 0.57, 0.57],
  // D/E group: reduce a few more to bring avg below 0.68
  'esci-qin':       [0.70, 0.50, 0.55, 0.60, 0.40, 0.50, 0.70, 0.98, 0.50, 0.70, 0.55, 0.55],
  'esci-zhu':       [0.78, 0.50, 0.55, 0.60, 0.50, 0.50, 0.80, 0.98, 0.60, 0.80, 0.55, 0.60],
  'esci-mao':       [0.75, 0.55, 0.65, 0.70, 0.55, 0.50, 0.85, 0.98, 0.50, 0.70, 0.70, 0.55],
  'esci-zhan':      [0.75, 0.55, 0.70, 0.75, 0.50, 0.50, 0.85, 0.95, 0.50, 0.70, 0.75, 0.55],
};

// --- EAST-STATESMAN vectors ---
const EST_VECTORS = {
  'es-shangyang':  [0.67, 0.37, 0.97, 1.00, 0.70, 0.30, 0.97, 0.87, 0.30, 0.60, 0.92, 0.40],
  'es-fanju':      [0.67, 0.42, 0.92, 0.92, 0.55, 0.35, 0.90, 0.87, 0.35, 0.55, 0.87, 0.52],
  'es-lisi':       [0.67, 0.32, 0.94, 0.92, 0.50, 0.40, 0.87, 0.97, 0.25, 0.60, 0.90, 0.72],
  'es-zhangqiu':   [0.66, 0.42, 0.97, 0.94, 0.65, 0.30, 0.94, 0.90, 0.30, 0.65, 0.87, 0.47],
  'es-kangyouwei': [0.68, 0.62, 0.87, 0.97, 0.60, 0.40, 0.80, 0.92, 0.40, 0.55, 0.92, 0.72],
  'es-wangmeng':   [0.70, 0.52, 0.92, 0.87, 0.50, 0.35, 0.92, 0.87, 0.40, 0.60, 0.82, 0.47],
  'es-guanzhong':  [0.70, 0.42, 0.82, 0.87, 0.70, 0.40, 0.72, 0.82, 0.45, 0.50, 0.72, 0.42],
  'es-yanying':    [0.70, 0.52, 0.72, 0.72, 0.75, 0.40, 0.82, 0.87, 0.50, 0.55, 0.62, 0.77],
  'es-zhuge':      [0.70, 0.52, 0.77, 0.72, 0.70, 0.50, 0.92, 0.97, 0.50, 0.70, 0.67, 0.67],
  'es-fanzhongyan':[0.70, 0.52, 0.77, 0.80, 0.80, 0.50, 0.87, 0.90, 0.40, 0.65, 0.72, 0.62],
  'es-yuefei':     [0.68, 0.70, 0.95, 0.60, 0.85, 0.50, 0.95, 0.60, 0.30, 0.70, 0.85, 0.40],
  'es-linze':      [0.68, 0.57, 0.87, 0.77, 0.80, 0.45, 0.94, 0.77, 0.40, 0.55, 0.80, 0.52],
  'es-weizheng':   [0.68, 0.57, 0.67, 0.67, 0.70, 0.45, 0.87, 0.87, 0.40, 0.60, 0.62, 0.67],
  'es-wentianxiang':[0.68,0.67, 0.67, 0.62, 0.85, 0.50, 0.97, 0.82, 0.40, 0.75, 0.72, 0.72],
  'es-haigui':     [0.68, 0.40, 0.72, 0.72, 0.70, 0.40, 0.97, 0.67, 0.40, 0.60, 0.67, 0.47],
  'es-liangqichao':[0.68, 0.62, 0.67, 0.77, 0.70, 0.50, 0.72, 0.97, 0.50, 0.55, 0.62, 0.82],
};

// ============================================================
// 3. Archetypes distribution (30 figures, each archetype ≥3)
// ============================================================
const ARCHETYPES = {
  // east-literati (6)
  'el-laozi':      'thinker',
  'el-zhuangzi':   'thinker',
  'el-hanfeizi':   'thinker',
  'el-wangyangming':'thinker',
  'el-xunzi':      'sage',
  'el-zhuxi':      'sage',
  'el-wangfuzhi':  'sage',
  'el-mozi':       'leader',
  'el-kongzi':     'leader',
  'el-lizhi':      'rebel',
  'el-wanganshi':  'rebel',
  'el-quyuan':     'creator',
  'el-taoyuanming':'creator',
  'el-liushao':    'creator',
  'el-sushi':      'doer',
  'el-dufu':       'doer',
  'el-baijuyi':    'doer',
  // east-scientist (6)
  'esci-zhangheng':'thinker',
  'esci-li':       'thinker',
  'esci-shen':     'thinker',
  'esci-cailun':   'doer',
  'esci-bi':       'doer',
  'esci-luban':    'doer',
  'esci-song':     'creator',
  'esci-xuxiake':  'creator',
  'esci-lijie':   'creator',
  'esci-sun':      'sage',
  'esci-guo':      'sage',
  'esci-ouye':     'leader',
  // east-statesman (6)
  'es-shangyang':  'leader',
  'es-zhuge':      'leader',
  'es-kangyouwei': 'rebel',
  'es-lisi':       'rebel',
  'es-wentianxiang':'rebel',
  'es-yuefei':     'doer',
  'es-zuo':        'doer',
  'es-direnjie':   'thinker',
  'es-weizheng':   'thinker',
  'es-jiang':      'sage',
  'es-zhou':       'sage',
  // west-philosopher (6)
  'wp-socrates':   'thinker',
  'wp-plato':      'thinker',
  'wp-kant':       'thinker',
  'wp-nietzsche':  'rebel',
  'wp-sartre':     'rebel',
  'wp-voltaire':   'creator',
  'wp-aristotle':  'leader',
  'wp-marx':       'leader',
  'wp-seneca':     'sage',
  'wp-augustine':  'sage',
  'wp-machiavelli':'doer',
  // west-scientist (6)
  'ws-einstein':   'thinker',
  'ws-newton':     'thinker',
  'ws-curie':      'doer',
  'ws-edison':     'doer',
  'ws-feynman':    'creator',
  'ws-archimedes': 'creator',
  'ws-euler':      'sage',
  'ws-halley':     'leader',
  'ws-cavendish':  'leader',
  'ws-copernicus': 'thinker',
};

// ============================================================
// 4. Improved blurbs (for generic ones)
// ============================================================
const BLURB_UPDATES = {
  // east-scientist
  'esci-cailun': [
    '汝与 {{name}} 同，革一物而利天下千年，不求名而名自至。',
    '汝与 {{name}} 同，以学为日课，终身不厌。',
    '汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。',
  ],
  'esci-zhangheng': [
    '汝与 {{name}} 同，器象合一，以精密之器穷造化之理。',
    '汝与 {{name}} 同，能于众说之上立一己之见，思入幽微。',
    '汝与 {{name}} 同，不泥古、不奉常，以新为归。',
  ],
  'esci-zu': [
    '汝与 {{name}} 同，能于毫厘之间求至理，致广大而尽精微。',
    '汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。',
    '汝与 {{name}} 同，破旧立新，虽千万人吾往矣。',
  ],
  'esci-bi': [
    '汝与 {{name}} 同，以一技改千年文化之舟，不求显达于当世。',
    '汝与 {{name}} 同，能于众说之上立一己之见，思入幽微。',
    '汝与 {{name}} 同，不泥古、不奉常，以新为归。',
  ],
  'esci-song': [
    '汝与 {{name}} 同，以技术为经纬，记万物于笔端，传于后世。',
    '汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。',
    '汝与 {{name}} 同，敢破常名常道，另立一套言语。',
  ],
  'esci-xu': [
    '汝与 {{name}} 同，融中西之学为己用，知行合一。',
    '汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。',
    '汝与 {{name}} 同，敢破常名常道，另立一套言语。',
  ],
  'esci-shen': [
    '汝与 {{name}} 同，能格物致知，博而能精，于笔记间见大千。',
    '汝与 {{name}} 同，不满足于可见之世，常向不可见处追问。',
    '汝与 {{name}} 同，不泥古、不奉常，以新为归。',
  ],
  'esci-guo': [
    '汝与 {{name}} 同，以精密仪器观天象，为历法立基。',
    '汝与 {{name}} 同，以思为杖，欲探万物之所以然。',
    '汝与 {{name}} 同，破旧立新，虽千万人吾往矣。',
  ],
  'esci-huang': [
    '汝与 {{name}} 同，行事果决，不以三思自误。',
    '汝与 {{name}} 同，不泥古、不奉常，以新为归。',
    '汝与 {{name}} 同，虽九死其犹未悔。',
  ],
  'esci-li': [
    '汝与 {{name}} 同，以学为日课，历二十七年而成一书，为后世立医之准。',
    '汝与 {{name}} 同，百折而不回，守其志如一。',
    '汝与 {{name}} 同，思至形而上之境，所言皆欲及于永恒。',
  ],
  'esci-jia': [
    '汝与 {{name}} 同，博而能约，厚积薄发，以书卷济苍生。',
    '汝与 {{name}} 同，敢破常名常道，另立一套言语。',
    '汝与 {{name}} 同，认准一事，便不辞险阻。',
  ],
  'esci-xuxiake': [
    '汝与 {{name}} 同，以双脚丈量大好河山，于行走间得真知。',
    '汝与 {{name}} 同，以思为杖，欲探万物之所以然。',
    '汝与 {{name}} 同，虽九死其犹未悔。',
  ],
  'esci-zhang': [
    '汝与 {{name}} 同，以辨证论治为宗，立中医千古之法。',
    '汝与 {{name}} 同，虽九死其犹未悔。',
    '汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。',
  ],
  'esci-huatuo': [
    '汝与 {{name}} 同，破旧立新，虽千万人吾往矣。',
    '汝与 {{name}} 同，以医术济世，不拘古方。',
    '汝与 {{name}} 同，百折而不回，守其志如一。',
  ],
  'esci-sun': [
    '汝与 {{name}} 同，以药王之名，济世活人，德术双馨。',
    '汝与 {{name}} 同，放眼千秋，不囿于朝夕。',
    '汝与 {{name}} 同，百折而不回，守其志如一。',
  ],
  'esci-pei': [
    '汝与 {{name}} 同，以制图六体，为山川立准绳。',
    '汝与 {{name}} 同，能于众说之上立一己之见，思入幽微。',
    '汝与 {{name}} 同，百折而不回，守其志如一。',
  ],
  'esci-su': [
    '汝与 {{name}} 同，以水为力，集天象演示于一体。',
    '汝与 {{name}} 同，思至形而上之境，所言皆欲及于永恒。',
    '汝与 {{name}} 同，信念一旦立定，便成汝之脊梁。',
  ],
  'esci-lijie': [
    '汝与 {{name}} 同，以规矩为本，为建筑立万世之则。',
    '汝与 {{name}} 同，以思为杖，欲探万物之所以然。',
    '汝与 {{name}} 同，虽九死其犹未悔。',
  ],
  'esci-ouye': [
    '汝与 {{name}} 同，以铸剑之艺名世，十年磨一剑。',
    '汝与 {{name}} 同，处喧而守静，不为世网所羁。',
    '汝与 {{name}} 同，不为一时之计，而谋百代。',
  ],
  'esci-ganjiang': [
    '汝与 {{name}} 同，以身殉艺，铸名剑于春秋。',
    '汝与 {{name}} 同，知进退之机，能全身而远害。',
    '汝与 {{name}} 同，放眼千秋，不囿于朝夕。',
  ],
  'esci-ma': [
    '汝与 {{name}} 同，以机械之巧补造化之缺。',
    '汝与 {{name}} 同，破旧立新，虽千万人吾往矣。',
    '汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。',
  ],
  'esci-zhu': [
    '汝与 {{name}} 同，以数为绳，记三十八年之风霜雨露。',
    '汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。',
    '汝与 {{name}} 同，心志刚毅，以执为骨。',
  ],
  'esci-mao': [
    '汝与 {{name}} 同，以一桥连两岸，工程师之志不移。',
    '汝与 {{name}} 同，百折而不回，守其志如一。',
    '汝与 {{name}} 同，思至形而上之境，所言皆欲及于永恒。',
  ],
  'esci-zhan': [
    '汝与 {{name}} 同，以工程师之智，移山填海，建铁路之基。',
    '汝与 {{name}} 同，百折而不回，守其志如一。',
    '汝与 {{name}} 同，能于众说之上立一己之见，思入幽微。',
  ],
  // east-statesman
  'es-shangyang': [
    '汝与 {{name}} 同，以法为骨，以变为道，敢为天下先。',
    '汝与 {{name}} 同，起而行之，不坐而论道。',
    '汝与 {{name}} 同，百折而不回，守其志如一。',
  ],
  'es-fanju': [
    '汝与 {{name}} 同，能忍辱而后发，知机而善断。',
    '汝与 {{name}} 同，世界在动，汝亦以动回应。',
    '汝与 {{name}} 同，不泥古、不奉常，以新为归。',
  ],
  'es-lisi': [
    '汝与 {{name}} 同，善书亦善政，能以尺牍定天下。',
    '汝与 {{name}} 同，临机立断，有雷霆之气。',
    '汝与 {{name}} 同，敢破常名常道，另立一套言语。',
  ],
  'es-zhangqiu': [
    '汝与 {{name}} 同，行事果决，不以三思自误。',
    '汝与 {{name}} 同，以变求通，不为祖宗之法所囿。',
    '汝与 {{name}} 同，虽九死其犹未悔。',
  ],
  'es-kangyouwei': [
    '汝与 {{name}} 同，思以制度变天下，敢为天下先。',
    '汝与 {{name}} 同，博而能约，厚积薄发。',
    '汝与 {{name}} 同，敢赌敢为，以负为立身之姿。',
  ],
  'es-wangmeng': [
    '汝与 {{name}} 同，临机立断，有雷霆之气。',
    '汝与 {{name}} 同，心志刚毅，以执为骨。',
    '汝与 {{name}} 同，以思为杖，欲探万物之所以然。',
  ],
  'es-guanzhong': [
    '汝与 {{name}} 同，敢破常名常道，另立一套言语。',
    '汝与 {{name}} 同，于纷陈之象中独寻其理。',
    '汝与 {{name}} 同，起而行之，不坐而论道。',
  ],
  'es-yanying': [
    '汝与 {{name}} 同，以辞令折冲樽俎，于谈笑间定国安邦。',
    '汝与 {{name}} 同，以思为杖，欲探万物之所以然。',
    '汝与 {{name}} 同，虽九死其犹未悔。',
  ],
  'es-zhuge': [
    '汝与 {{name}} 同，不惮繁琐，乐在穷究。',
    '汝与 {{name}} 同，百折而不回，守其志如一。',
    '汝与 {{name}} 同，能以一隅敌天下，知其不可而为之。',
  ],
  'es-fanzhongyan': [
    '汝与 {{name}} 同，先天下之忧而忧，此心此志，千年不磨。',
    '汝与 {{name}} 同，逆风而行，不改其步。',
    '汝与 {{name}} 同，能于众说之上立一己之见，思入幽微。',
  ],
  'es-yuefei': [
    '汝与 {{name}} 同，以忠义为骨，以军旅为家。',
    '汝与 {{name}} 同，行事果决，不以三思自误。',
    '汝与 {{name}} 同，以天下为怀，不以一己为念。',
  ],
  'es-linze': [
    '汝与 {{name}} 同，苟利国家生死以，此言此行，千年犹新。',
    '汝与 {{name}} 同，行事果决，不以三思自误。',
    '汝与 {{name}} 同，心系苍生，忧乐与共。',
  ],
  'es-xiaohe': [
    '汝与 {{name}} 同，能识人用人，幕后安定。',
    '汝与 {{name}} 同，以天下为怀，不以一己为念。',
    '汝与 {{name}} 同，百折而不回，守其志如一。',
  ],
  'es-fangxuanling': [
    '汝与 {{name}} 同，孜孜为国二十载，善谋而定天下。',
    '汝与 {{name}} 同，以天下为怀，不以一己为念。',
    '汝与 {{name}} 同，百折而不回，守其志如一。',
  ],
  'es-weizheng': [
    '汝与 {{name}} 同，以谏为职，守正不阿，直声满天下。',
    '汝与 {{name}} 同，能于众说之上立一己之见，思入幽微。',
    '汝与 {{name}} 同，心志刚毅，以执为骨。',
  ],
  'es-wentianxiang': [
    '汝与 {{name}} 同，知其不可而守其节，不以死生易志。',
    '汝与 {{name}} 同，群己之间，重公义而轻私利。',
    '汝与 {{name}} 同，正气浩然，天地有光。',
  ],
  'es-haigui': [
    '汝与 {{name}} 同，虽九死其犹未悔。',
    '汝与 {{name}} 同，以清廉直道名世，不惧权贵。',
    '汝与 {{name}} 同，行事果决，不以三思自误。',
  ],
  'es-liangqichao': [
    '汝与 {{name}} 同，以言为刃，变法维新，笔力千钧。',
    '汝与 {{name}} 同，言华丽，以辞采为骨。',
    '汝与 {{name}} 同，以思为杖，欲探万物之所以然。',
  ],
  'es-zhangliang': [
    '汝与 {{name}} 同，能于乱世全身而退，知止而后有定。',
    '汝与 {{name}} 同，处喧而守静，不为世网所羁。',
    '汝与 {{name}} 同，谋定而后动，功成身退。',
  ],
  'es-direnjie': [
    '汝与 {{name}} 同，于纷乱之中明辨是非，断案如神。',
    '汝与 {{name}} 同，思至形而上之境，所言皆欲及于永恒。',
    '汝与 {{name}} 同，认准一事，便不辞险阻。',
  ],
  'es-xujie': [
    '汝与 {{name}} 同，能屈能伸，以隐忍而待时机。',
    '汝与 {{name}} 同，百折而不回，守其志如一。',
    '汝与 {{name}} 同，以退为进，后发先至。',
  ],
  'es-zhangzhidong': [
    '汝与 {{name}} 同，以中学为体、西学为用，务实以兴国。',
    '汝与 {{name}} 同，好穷理以究天人之际，不以耳目之实自限。',
    '汝与 {{name}} 同，以群体为先，忘身以济天下。',
  ],
  'es-lihongzhang': [
    '汝与 {{name}} 同，以洋务开风气，一代人办一代事。',
    '汝与 {{name}} 同，以思为杖，欲探万物之所以然。',
    '汝与 {{name}} 同，虽九死其犹未悔。',
  ],
  'es-zhou': [
    '汝与 {{name}} 同，以礼乐文明为基，制天下于有序。',
    '汝与 {{name}} 同，心志刚毅，以执为骨。',
    '汝与 {{name}} 同，心系苍生，忧乐与共。',
  ],
  'es-yi': [
    '汝与 {{name}} 同，以调和鼎鼐之功，致王者之治。',
    '汝与 {{name}} 同，处喧而守静，不为世网所羁。',
    '汝与 {{name}} 同，不为一时之计，而谋百代。',
  ],
  'es-fanli': [
    '汝与 {{name}} 同，知进退之机，功成身退，经商亦成大家。',
    '汝与 {{name}} 同，向内求心安，以内省为日课。',
    '汝与 {{name}} 同，认准一事，便不辞险阻。',
  ],
  'es-zuo': [
    '汝与 {{name}} 同，抬棺出关，收复新疆，以一身为天下先。',
    '汝与 {{name}} 同，以学为日课，终身不厌。',
    '汝与 {{name}} 同，临机立断，有雷霆之气。',
  ],
  'es-sunyatsen': [
    '汝与 {{name}} 同，破旧立新，虽千万人吾往矣。',
    '汝与 {{name}} 同，博而能约，厚积薄发。',
    '汝与 {{name}} 同，天下为公，此心不渝。',
  ],
  'es-liubow': [
    '汝与 {{name}} 同，以谋略佐天下，事成而身退。',
    '汝与 {{name}} 同，心志刚毅，以执为骨。',
    '汝与 {{name}} 同，知进退之机，能全身而远害。',
  ],
  'es-jiang': [
    '汝与 {{name}} 同，以静待动，八十年磨一剑，终得明主。',
    '汝与 {{name}} 同，知进退之机，能全身而远害。',
    '汝与 {{name}} 同，千秋事业，方称吾志。',
  ],
};

// ============================================================
// 5. Bidirectional echo fixes — add missing reciprocals
// ============================================================
// Computed from the analysis above
const ECHO_RECIPROCALS = {
  // east-literati
  'el-laozi':       ['el-zhuangzi', 'el-lizhi',    'el-zhuangzi'],
  'el-zhuangzi':    ['el-laozi',    'el-taoyuanming','el-liushao','el-taoyuanming'],
  'el-mozi':        ['el-kongzi',   'el-xunzi',     'el-wanganshi','el-kongzi','el-xunzi'],
  'el-lizhi':       ['el-hanfeizi', 'el-zhuangzi',  'el-hanfeizi'],
  'el-wanganshi':   ['el-zhuangzi', 'el-hanfeizi',  'el-lizhi', 'el-zhuangzi','el-hanfeizi'],
  'el-xunzi':       ['el-kongzi',   'el-mengzi',    'el-hanfeizi','el-kongzi','el-mengzi'],
  'el-quyuan':      ['el-taoyuanming','el-sushi',   'el-liuzongyuan','el-taoyuanming','el-sushi'],
  'el-liuzongyuan': ['el-hanyu',    'el-ouyangxiu', 'el-taoyuanming','el-taoyuanming','el-hanyu','el-ouyangxiu'],
  'el-zhuxi':       ['el-kongzi',   'el-mengzi',    'el-wangyangming','el-kongzi','el-mengzi'],
  'el-wangfuzhi':   ['el-wangyangming','el-zhuxi',  'el-zhuxi','el-wangyangming'],
  'el-kongzi':      ['el-mengzi',   'el-xunzi',     'el-zengguofan','el-mengzi','el-xunzi'],
  'el-wangwei':     ['el-taoyuanming','el-zhuangzi', 'el-liushao','el-taoyuanming','el-zhuangzi'],
  'el-hanyu':       ['el-liuzongyuan','el-ouyangxiu','el-dufu','el-liuzongyuan','el-ouyangxiu'],
  'el-ouyangxiu':   ['el-hanyu',    'el-sushi',     'el-simaqian','el-hanyu','el-sushi'],
  'el-simaqian':    ['el-liuzongyuan','el-hanyu',    'el-ouyangxiu','el-liuzongyuan','el-hanyu','el-ouyangxiu'],
  'el-dufu':        ['el-sushi',    'el-luyou',     'el-baijuyi','el-sushi','el-luyou'],
  'el-baijuyi':     ['el-dufu',     'el-sushi',     'el-luyou','el-yuanmei','el-dufu','el-sushi','el-luyou'],
  'el-sushi':       ['el-taoyuanming','el-wanganshi','el-nalanxingde','el-taoyuanming','el-wanganshi'],
  'el-luyou':       ['el-sushi',    'el-zhangdai',  'el-dufu','el-sushi','el-zhangdai'],
  'el-zhangdai':    ['el-liushao',  'el-wangwei',   'el-taoyuanming','el-liushao','el-wangwei','el-taoyuanming'],
  'el-zengguofan':  ['el-zhuxi',    'el-ouyangxiu', 'el-dufu','el-kongzi','el-zhuxi','el-ouyangxiu','el-dufu'],
  'el-liyu':        ['el-zhangdai', 'el-yuanmei',   'el-zhangdai','el-gongzizhen'],
  'el-yuanmei':     ['el-liushao',  'el-baijuyi',   'el-gongzizhen','el-liushao','el-baijuyi'],
  'el-nalanxingde': ['el-sushi',    'el-dufu',      'el-liushao','el-sushi','el-dufu'],
  'el-liushao':     ['el-nalanxingde','el-liyu',    'el-dufu','el-nalanxingde','el-liyu'],
  'el-gongzizhen':  ['el-yuanmei',  'el-liyu',      'el-yuanmei','el-liyu'],
  // east-scientist
  'esci-cailun':    ['esci-bi',     'esci-huang',   'esci-song','esci-bi','esci-huang'],
  'esci-zhangheng': ['esci-cailun', 'esci-zu',      'esci-guo','esci-cailun','esci-shen','esci-guo'],
  'esci-zu':        ['esci-zhangheng','esci-qin',   'esci-shen','esci-zhangheng','esci-qin'],
  'esci-bi':        ['esci-cailun', 'esci-song',    'esci-li','esci-cailun','esci-song','esci-li'],
  'esci-song':      ['esci-xu',     'esci-jia',     'esci-li','esci-lijie','esci-xu','esci-jia'],
  'esci-xu':        ['esci-song',   'esci-bi',      'esci-zhan','esci-song','esci-bi','esci-lijie','esci-zhan'],
  'esci-shen':      ['esci-bi',     'esci-song',    'esci-guo','esci-bi','esci-song','esci-guo','esci-yi','esci-zhu','esci-mao','esci-zhan'],
  'esci-guo':       ['esci-zhangheng','esci-yi',   'esci-shen','esci-zhangheng','esci-yi','esci-shen','esci-su','esci-qin'],
  'esci-huang':     ['esci-cailun', 'esci-bi',     'esci-jia','esci-cailun','esci-bi','esci-jia'],
  'esci-li':        ['esci-jia',    'esci-xu',     'esci-shen','esci-jia','esci-xu','esci-xuxiake'],
  'esci-jia':       ['esci-xu',     'esci-li',     'esci-song','esci-xu','esci-li','esci-huang'],
  'esci-xuxiake':   ['esci-pei',   'esci-li',     'esci-lidaoyu','esci-pei','esci-li'],
  'esci-zhang':     ['esci-sun',    'esci-bianque', 'esci-huatuo','esci-sun','esci-bianque','esci-ge'],
  'esci-huatuo':    ['esci-zhang',  'esci-sun',    'esci-bianque','esci-zhang','esci-sun'],
  'esci-sun':       ['esci-zhang',  'esci-bianque', 'esci-li','esci-zhang','esci-bianque','esci-li'],
  'esci-pei':       ['esci-guo',    'esci-xuxiake', 'esci-li','esci-guo','esci-xuxiake','esci-lidaoyu'],
  'esci-su':        ['esci-zhangheng','esci-guo',  'esci-ma','esci-zhangheng','esci-guo','esci-ma'],
  'esci-lijie':     ['esci-luban',  'esci-song',   'esci-xu','esci-luban','esci-song','esci-xu'],
  'esci-ge':        ['esci-bianque','esci-yi',     'esci-zhang','esci-bianque','esci-yi','esci-zhang','esci-ganjiang'],
  'esci-lidaoyu':   ['esci-xuxiake','esci-pei',    'esci-li','esci-xuxiake','esci-pei'],
  'esci-yi':        ['esci-guo',    'esci-zhangheng','esci-shen','esci-guo','esci-zhangheng','esci-shen'],
  'esci-qin':       ['esci-zu',     'esci-shen',   'esci-guo','esci-zu','esci-shen','esci-guo'],
  'esci-luban':     ['esci-cailun', 'esci-huang',  'esci-ouye','esci-cailun','esci-huang','esci-ouye','esci-ma','esci-lijie'],
  'esci-ouye':      ['esci-ganjiang','esci-luban', 'esci-cailun','esci-ganjiang','esci-luban','esci-cailun','esci-ma'],
  'esci-ganjiang':  ['esci-ouye',   'esci-luban',  'esci-ge','esci-ouye','esci-luban','esci-ge'],
  'esci-ma':        ['esci-su',     'esci-luban',  'esci-ouye','esci-su','esci-luban','esci-ouye'],
  'esci-zhu':       ['esci-shen',   'esci-guo',    'esci-xu','esci-shen','esci-guo','esci-xu'],
  'esci-mao':       ['esci-zhan',   'esci-shen',   'esci-xu','esci-zhan','esci-shen','esci-xu'],
  'esci-zhan':      ['esci-mao',    'esci-shen',   'esci-xu','esci-mao','esci-shen','esci-xu'],
  // east-statesman
  'es-fanju':       ['es-shangyang','es-lisi',     'es-zhangqiu','es-shangyang','es-lisi'],
  'es-lisi':        ['es-shangyang','es-fanju',    'es-zhangqiu','es-shangyang','es-fanju','es-zhangqiu'],
  'es-zhangqiu':    ['es-shangyang','es-fanju',   'es-wangmeng','es-shangyang','es-fanju','es-lisi','es-kangyouwei'],
  'es-kangyouwei':  ['es-shangyang','es-zhangqiu','es-liangqichao','es-shangyang','es-zhangqiu','es-liangqichao','es-sunyatsen'],
  'es-wangmeng':   ['es-zhuge',    'es-zhangqiu', 'es-shangyang','es-zhuge','es-zhangqiu','es-shangyang'],
  'es-guanzhong':  ['es-shangyang','es-fanju',   'es-zhuge','es-shangyang','es-fanju','es-zhuge','es-yanying'],
  'es-yanying':    ['es-guanzhong','es-zhuge',    'es-weizheng','es-guanzhong','es-zhuge','es-weizheng'],
  'es-zhuge':      ['es-wangmeng', 'es-fanju',    'es-weizheng','es-wangmeng','es-fanju','es-weizheng','es-yanying','es-fanzhongyan','es-yuefei','es-xiaohe','es-fangxuanling','es-zhou'],
  'es-fanzhongyan':['es-zhuge',    'es-weizheng', 'es-haigui','es-zhuge','es-weizheng','es-haigui'],
  'es-yuefei':     ['es-wentianxiang','es-haigui', 'es-zhuge','es-wentianxiang','es-haigui','es-zhuge','es-zuo'],
  'es-linze':      ['es-haigui',   'es-wentianxiang','es-zuo','es-haigui','es-wentianxiang','es-zuo'],
  'es-xiaohe':     ['es-fangxuanling','es-zhuge', 'es-zhangliang','es-fangxuanling','es-zhuge'],
  'es-fangxuanling':['es-xiaohe','es-weizheng', 'es-zhuge','es-xiaohe','es-weizheng','es-zhuge','es-direnjie'],
  'es-wentianxiang':['es-yuefei', 'es-haigui',   'es-zhuge','es-yuefei','es-haigui','es-zhuge','es-linze'],
  'es-liangqichao':['es-kangyouwei','es-zhangqiu','es-sunyatsen','es-kangyouwei','es-zhangqiu','es-sunyatsen','es-zhangzhidong'],
  'es-zhangliang': ['es-xiaohe',  'es-fanli',   'es-zhou','es-xiaohe','es-fanli','es-zhou','es-liubow','es-jiang'],
  'es-direnjie':   ['es-fangxuanling','es-weizheng','es-xujie','es-fangxuanling','es-weizheng'],
  'es-xujie':      ['es-zhangqiu', 'es-direnjie', 'es-zhangqiu','es-direnjie'],
  'es-zhangzhidong':['es-zhangqiu','es-liangqichao','es-lihongzhang','es-zhangqiu','es-liangqichao','es-lihongzhang'],
  'es-lihongzhang':['es-zhangzhidong','es-zuo','es-lihongzhang','es-zhangzhidong','es-zuo'],
  'es-zhou':       ['es-yi',      'es-zhuge',   'es-zhangliang','es-yi','es-zhuge','es-jiang'],
  'es-fanli':      ['es-zhangliang','es-yi',    'es-zuo','es-zhangliang','es-yi','es-zuo'],
  'es-zuo':        ['es-linze',   'es-haigui',  'es-yuefei','es-linze','es-haigui','es-yuefei','es-lihongzhang','es-fanli'],
  'es-sunyatsen':  ['es-kangyouwei','es-zhangqiu','es-haigui','es-kangyouwei','es-zhangqiu','es-haigui','es-liangqichao'],
  'es-liubow':     ['es-zhuge',   'es-zhangliang','es-fanju','es-zhuge','es-zhangliang','es-fanju'],
  'es-jiang':      ['es-yi',      'es-zhou',    'es-zhangliang','es-yi','es-zhou','es-zhangliang'],
  // west-philosopher
  'wp-socrates':   ['wp-plato',   'wp-aristotle','wp-voltaire','wp-plato','wp-aristotle','wp-nietzsche','wp-wittgenstein','wp-heidegger'],
  'wp-plato':      ['wp-socrates','wp-aristotle','wp-kant','wp-socrates','wp-aristotle','wp-kant','wp-descartes'],
  'wp-aristotle':  ['wp-plato',   'wp-bacon',   'wp-kant','wp-plato','wp-bacon','wp-kant','wp-habermas','wp-rawls'],
  'wp-voltaire':   ['wp-marx',    'wp-nietzsche','wp-sartre','wp-marx','wp-nietzsche','wp-sartre','wp-socrates'],
  'wp-nietzsche':  ['wp-socrates','wp-sartre',  'wp-foucault','wp-socrates','wp-sartre','wp-foucault','wp-voltaire','wp-camus','wp-schopenhauer'],
  'wp-sartre':     ['wp-nietzsche','wp-camus',  'wp-marx','wp-nietzsche','wp-camus','wp-marx','wp-voltaire','wp-heidegger','wp-kierkegaard'],
  'wp-descartes':  ['wp-kant',    'wp-hume',    'wp-plato','wp-kant','wp-hume','wp-plato','wp-bacon'],
  'wp-kant':       ['wp-hegel',   'wp-hume',    'wp-aristotle','wp-hegel','wp-hume','wp-aristotle','wp-plato','wp-wittgenstein'],
  'wp-hegel':      ['wp-kant',    'wp-marx',    'wp-heidegger','wp-kant','wp-marx','wp-heidegger'],
  'wp-wittgenstein':['wp-socrates','wp-kant',   'wp-foucault','wp-socrates','wp-kant','wp-foucault'],
  'wp-camus':      ['wp-sartre',  'wp-nietzsche','wp-seneca','wp-sartre','wp-nietzsche','wp-seneca'],
  'wp-bacon':      ['wp-locke',   'wp-hume',    'wp-descartes','wp-locke','wp-hume','wp-descartes'],
  'wp-locke':      ['wp-hume',    'wp-bacon',   'wp-hobbes','wp-hume','wp-bacon','wp-hobbes','wp-rawls'],
  'wp-heidegger':  ['wp-levinas', 'wp-socrates', 'wp-sartre','wp-levinas','wp-socrates','wp-sartre','wp-hegel','wp-bergson'],
  'wp-habermas':   ['wp-marx',    'wp-rawls',   'wp-aristotle','wp-marx','wp-rawls','wp-aristotle'],
  'wp-rawls':      ['wp-locke',   'wp-habermas', 'wp-aristotle','wp-locke','wp-habermas','wp-aristotle'],
  'wp-pascal':     ['wp-seneca',  'wp-kierkegaard','wp-levinas','wp-seneca','wp-kierkegaard','wp-levinas','wp-augustine'],
  'wp-kierkegaard':['wp-pascal',  'wp-augustine','wp-sartre','wp-pascal','wp-augustine','wp-sartre'],
  'wp-bergson':    ['wp-augustine','wp-heidegger','wp-seneca','wp-augustine','wp-heidegger','wp-seneca'],
  'wp-levinas':    ['wp-augustine','wp-pascal',  'wp-augustine','wp-pascal','wp-heidegger'],
  'wp-epicurus':   ['wp-seneca',  'wp-augustine','wp-seneca','wp-augustine','wp-marx'],
  'wp-machiavelli':['wp-hobbes',  'wp-marx',    'wp-hobbes','wp-marx'],
  'wp-schopenhauer':['wp-nietzsche','wp-seneca', 'wp-nietzsche','wp-seneca'],
  // west-scientist
  'ws-copernicus': ['ws-galileo', 'ws-kepler',  'ws-newton','ws-galileo','ws-kepler','ws-newton','ws-halley'],
  'ws-galileo':    ['ws-copernicus','ws-newton', 'ws-feynman','ws-copernicus','ws-newton','ws-feynman','ws-kepler'],
  'ws-einstein':   ['ws-newton',  'ws-planck',  'ws-bohr','ws-newton','ws-planck','ws-bohr','ws-curie','ws-feynman'],
  'ws-curie':      ['ws-faraday', 'ws-einstein', 'ws-feynman','ws-faraday','ws-einstein','ws-feynman','ws-nobel'],
  'ws-feynman':    ['ws-einstein','ws-heisenberg','ws-bohr','ws-einstein','ws-heisenberg','ws-bohr','ws-galileo','ws-curie','ws-schrodinger'],
  'ws-kepler':     ['ws-copernicus','ws-newton','ws-galileo','ws-copernicus','ws-newton','ws-galileo','ws-halley'],
  'ws-leibniz':    ['ws-newton',  'ws-euler',   'ws-gauss','ws-newton','ws-euler','ws-gauss'],
  'ws-darwin':     ['ws-mendel',  'ws-faraday', 'ws-newton','ws-mendel','ws-faraday','ws-newton'],
  'ws-faraday':    ['ws-maxwell', 'ws-curie',   'ws-hertz','ws-maxwell','ws-curie','ws-hertz','ws-darwin','ws-mendel','ws-lavoisier','ws-franklin'],
  'ws-planck':     ['ws-einstein','ws-bohr',    'ws-heisenberg','ws-einstein','ws-bohr','ws-heisenberg'],
  'ws-lavoisier':  ['ws-faraday', 'ws-newton',  'ws-maxwell','ws-faraday','ws-newton','ws-maxwell'],
  'ws-maxwell':    ['ws-faraday', 'ws-hertz',   'ws-newton','ws-faraday','ws-hertz','ws-newton','ws-lavoisier'],
  'ws-mendel':     ['ws-darwin',  'ws-newton',  'ws-faraday','ws-darwin','ws-newton','ws-faraday'],
  'ws-hertz':      ['ws-maxwell', 'ws-shannon', 'ws-maxwell','ws-shannon','ws-faraday'],
  'ws-wiener':     ['ws-shannon', 'ws-turing',  'ws-vonneumann','ws-shannon','ws-turing','ws-vonneumann'],
  'ws-franklin':   ['ws-edison',  'ws-faraday', 'ws-nobel','ws-edison','ws-faraday','ws-nobel'],
  'ws-edison':     ['ws-franklin','ws-nobel',   'ws-turing','ws-franklin','ws-nobel','ws-turing'],
  'ws-nobel':      ['ws-edison',  'ws-curie',   'ws-franklin','ws-edison','ws-curie','ws-franklin'],
  'ws-vonneumann': ['ws-turing',  'ws-shannon', 'ws-gauss','ws-turing','ws-shannon','ws-gauss','ws-wiener'],
  'ws-archimedes': ['ws-euler',   'ws-gauss',   'ws-newton','ws-euler','ws-gauss','ws-newton','ws-cavendish'],
  'ws-euler':      ['ws-gauss',   'ws-leibniz', 'ws-newton','ws-gauss','ws-leibniz','ws-newton','ws-archimedes'],
  'ws-halley':     ['ws-newton',  'ws-kepler',  'ws-copernicus','ws-newton','ws-kepler','ws-copernicus','ws-cavendish'],
  'ws-cavendish':  ['ws-newton',  'ws-halley',  'ws-archimedes','ws-newton','ws-halley','ws-archimedes'],
  'ws-schrodinger':['ws-heisenberg','ws-bohr',   'ws-feynman','ws-heisenberg','ws-bohr','ws-feynman'],
};

// ============================================================
// Apply vector updates to files
// ============================================================
function applyVectorUpdates(filePath, vectorMap) {
  let src = fs.readFileSync(filePath, 'utf8');
  for (const [id, newVec] of Object.entries(vectorMap)) {
    const vecStr = newVec.map(v => v.toFixed(2)).join(', ');
    // Match the figure with this id and its vector line
    const re = new RegExp(`(\\'${id}\\'[^}]*?vector:\\s*\\[)[^\\]]+(\\][^}]*?echoes:)`, 's');
    src = src.replace(re, `$1[${vecStr}]$2`);
  }
  fs.writeFileSync(filePath, src);
  console.log(`✓ Vectors updated: ${filePath}`);
}

// ============================================================
// Apply archetype + blurb + echo updates
// ============================================================
function patchFigureFile(filePath, archetypeMap, blurbMap, echoReciprocalMap) {
  let src = fs.readFileSync(filePath, 'utf8');
  
  // Process each figure block
  const blockRe = /(\\{\s*\n)([\s\S]*?)(\\},\s*\n  \{|\n\\];)/g;
  
  let match;
  let result = src;
  let changed = false;
  
  while ((match = blockRe.exec(src)) !== null) {
    const blockStart = match[1];
    let block = match[2];
    const blockEnd = match[3];
    const fullMatch = match[0];
    
    // Extract id
    const idMatch = block.match(/id:\\s*['"]([^'"]+)['"]/);
    if (!idMatch) continue;
    const id = idMatch[1];
    
    let modified = false;
    
    // 1. Add archetype
    if (archetypeMap[id]) {
      const archetype = archetypeMap[id];
      if (!block.includes('archetype?:')) {
        // Add archetype before echoes
        block = block.replace(
          /(echoes:\\s*\\[[^\\]]*\\]\s*,?\s*)(\n\s*\\})/,
          `archetype: '${archetype}',$1$2`
        );
        modified = true;
      }
    }
    
    // 2. Update blurbs
    if (blurbMap[id]) {
      const newBlurbs = blurbMap[id];
      const blurbLines = newBlurbs.map(b => `      '${b}',`).join('\n');
      block = block.replace(
        /matchBlurb:\s*\[[\s\S]*?\]\s*,/,
        `matchBlurb: [\n${blurbLines}\n    ],`
      );
      modified = true;
    }
    
    // 3. Update echoes (deduplicated)
    if (echoReciprocalMap[id]) {
      const uniqueEchoes = [...new Set(echoReciprocalMap[id])];
      const echoStr = uniqueEchoes.map(e => `'${e}'`).join(', ');
      block = block.replace(
        /echoes:\s*\[[^\]]*\]/,
        `echoes: [${echoStr}]`
      );
      modified = true;
    }
    
    if (modified) {
      changed = true;
      result = result.replace(fullMatch, blockStart + block + blockEnd);
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, result);
    console.log(`✓ Patched: ${filePath}`);
  } else {
    console.log(`  No changes: ${filePath}`);
  }
}

// ============================================================
// Run
// ============================================================
const base = __dirname;

// Vector files
applyVectorUpdates(path.join(base, 'src/domain/figures/figures.east-scientist.ts'), ESCI_VECTORS);
applyVectorUpdates(path.join(base, 'src/domain/figures/figures.east-statesman.ts'), EST_VECTORS);

// Figure file patches (archetype + blurb + echo)
const allArchetypes = ARCHETYPES;
const allBlurbs = BLURB_UPDATES;
const allEchoes = ECHO_RECIPROCALS;

patchFigureFile(path.join(base, 'src/domain/figures/figures.east-literati.ts'), allArchetypes, allBlurbs, allEchoes);
patchFigureFile(path.join(base, 'src/domain/figures/figures.east-scientist.ts'), allArchetypes, allBlurbs, allEchoes);
patchFigureFile(path.join(base, 'src/domain/figures/figures.east-statesman.ts'), allArchetypes, allBlurbs, allEchoes);
patchFigureFile(path.join(base, 'src/domain/figures/figures.west-philosopher.ts'), allArchetypes, allBlurbs, allEchoes);
patchFigureFile(path.join(base, 'src/domain/figures/figures.west-scientist.ts'), allArchetypes, allBlurbs, allEchoes);

console.log('\nDone!');
