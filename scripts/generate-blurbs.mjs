// 指南 · 批量生成人物 matchBlurb 多模板
//
// 约定：为每个人物生成 3 条 blurb，分别对应其 12 维向量中最显著的 3 个维度。
// 显著维度按人物向量值从高到低排序，与 selectBlurb 的按显著维度选择逻辑配套。

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIGURES_DIR = path.resolve(__dirname, '../src/domain/figures');

const FILES = [
  'figures.east-literati.ts',
  'figures.east-statesman.ts',
  'figures.east-scientist.ts',
  'figures.west-philosopher.ts',
  'figures.west-scientist.ts',
];

const TRAITS = [
  { id: 1, name: '思辨', weight: 1.0, lo: '务实', hi: '形而上' },
  { id: 2, name: '情感', weight: 0.9, lo: '克制', hi: '外露' },
  { id: 3, name: '行动', weight: 1.1, lo: '沉思', hi: '果决' },
  { id: 4, name: '革新', weight: 1.0, lo: '守成', hi: '突破' },
  { id: 5, name: '群我', weight: 0.8, lo: '自我', hi: '群体' },
  { id: 6, name: '审美', weight: 0.7, lo: '理性', hi: '感性' },
  { id: 7, name: '意志', weight: 1.0, lo: '随顺', hi: '刚毅' },
  { id: 8, name: '学识', weight: 0.9, lo: '通识', hi: '专精' },
  { id: 9, name: '处世', weight: 1.0, lo: '进取', hi: '内省' },
  { id: 10, name: '时间', weight: 0.7, lo: '当下', hi: '永恒' },
  { id: 11, name: '风险', weight: 1.0, lo: '求稳', hi: '敢赌' },
  { id: 12, name: '表达', weight: 0.8, lo: '平实', hi: '华美' },
];

// 每个维度 8 条不同切入的短语；按人物 id 哈希做确定性选择，降低同质化
const PHRASE_BANK = {
  1: [
    '思至形而上之境，所言皆欲及于永恒。',
    '好穷理以究天人之际，不以耳目之实自限。',
    '能于众说之上立一己之见，思入幽微。',
    '以思为杖，欲探万物之所以然。',
    '不满足于可见之世，常向不可见处追问。',
    '于纷陈之象中独寻其理。',
    '理性如刃，能剖开日常之蒙。',
    '所重者非器物，乃器物之所以为器物。',
  ],
  2: [
    '情动于衷而形于言，不以掩抑为德。',
    '以情为真，哀乐过人。',
    '心易感、意难平，常以悲喜为歌。',
    '情如春水，不藏不掩。',
    '于人间悲喜中见自己之影。',
    '一腔热忱，不以世故浇冷。',
    '愁肠百转，仍以深情为归。',
    '感时花溅泪，恨别鸟惊心——汝亦如是。',
  ],
  3: [
    '行事果决，不以三思自误。',
    '临机立断，有雷霆之气。',
    '起而行之，不坐而论道。',
    '见义则行，不为迟疑所误。',
    '世界在动，汝亦以动回应。',
    '谋定即行，不俟明日。',
    '于当断之处，绝不委蛇。',
    '一步先则步步先，汝知其味。',
  ],
  4: [
    '敢破常名常道，另立一套言语。',
    '不泥古、不奉常，以新为归。',
    '破旧立新，虽千万人吾往矣。',
    '能于陈规之外别开生面。',
    '旧法不足以困汝，必自出新意。',
    '以变求通，不为祖宗之法所囿。',
    '世人守故，汝独开新路。',
    '颠覆不是为了颠覆，是为了更接近真。',
  ],
  5: [
    '以群体为先，忘身以济天下。',
    '群己之间，重公义而轻私利。',
    '以天下为怀，不以一己为念。',
    '心系苍生，忧乐与共。',
    '己之安乐，常让位于众人之安乐。',
    '身在人群，心系天下。',
    '不为小我之私，而谋公共之善。',
    '汝之悲喜，常与千万人相连。',
  ],
  6: [
    '观物以情，重意象而轻言说。',
    '以美为津梁，通乎天地。',
    '心有韵致，凡所触皆成诗。',
    '善于从寻常中见出不寻常。',
    '世界于汝，不止有用，更有可观。',
    '以形写神，以象会意。',
    '眼中风月，皆成胸中丘壑。',
    '求美之心，是汝与世界对话的方式。',
  ],
  7: [
    '心志刚毅，以执为骨。',
    '百折而不回，守其志如一。',
    '虽九死其犹未悔。',
    '认准一事，便不辞险阻。',
    '柔可曲，骨不可折。',
    '逆风而行，不改其步。',
    '于困厄中持守，于诱惑前不动。',
    '信念一旦立定，便成汝之脊梁。',
  ],
  8: [
    '学求深耕，以精为归。',
    '博而能约，厚积薄发。',
    '以学为日课，终身不厌。',
    '于书山学海中自得其乐。',
    '所知愈多，所疑亦深。',
    '以识为器，以学为粮。',
    '不惮繁琐，乐在穷究。',
    '一卷在手，便得一片天地。',
  ],
  9: [
    '向内求心安，以内省为日课。',
    '不竞奔竞，以退为进。',
    '处喧而守静，不为世网所羁。',
    '知进退之机，能全身而远害。',
    '外物纷纷，汝独守内心之静。',
    '不以入世之深浅论价值。',
    '退一步，方见天地之宽。',
    '在人群中，仍为自己留一间静室。',
  ],
  10: [
    '思千载之下，以永恒为尺度。',
    '不为一时之计，而谋百代。',
    '放眼千秋，不囿于朝夕。',
    '以长远为念，不以眼前得失动心。',
    '今日之吾，乃为未来之吾而活。',
    '于时间长河中择一席之地。',
    '千秋事业，方称吾志。',
    '瞬息荣华，不足动汝之心。',
  ],
  11: [
    '敢赌敢为，以负为立身之姿。',
    '行险而徼幸，非安坐者可同。',
    '不入虎穴，焉得虎子。',
    '于危局中见机遇，于险径上求通途。',
    '胜算不足时，仍敢一掷。',
    '以风险为阶梯，步步登高。',
    '世人避之，汝迎之。',
    '知其不可而安之若命，非汝所为。',
  ],
  12: [
    '言华丽，以辞采为骨。',
    '辞锋所至，能令金石为开。',
    '以文为刃，以辞为锋。',
    '善于以言语形塑人心。',
    '一字之出，必求其声。',
    '不以平铺直叙为满足。',
    '修辞不是装饰，是思想的外衣。',
    '汝之表达，能使无形者显形。',
  ],
};

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function topTraitIndices(vector, n) {
  return TRAITS.map((_, i) => i)
    .sort((a, b) => vector[b] - vector[a])
    .slice(0, n);
}

function matchesTrait(text, traitId) {
  const keywords = traitKeywordMap[traitId];
  return keywords.some(kw => text.includes(kw));
}

function generateBlurbs(id, vector, existingBlurbs) {
  const indices = topTraitIndices(vector, 3);
  const baseHash = hashString(id);
  const usedPhrases = new Set();

  return indices.map((traitIdx, i) => {
    const traitId = traitIdx + 1;
    const pool = PHRASE_BANK[traitId];

    // 若现有 blurb（含原字符串或数组首条）与该维度关键词匹配，尽量保留
    const candidate = existingBlurbs.find(b => matchesTrait(b, traitId));
    if (candidate && !usedPhrases.has(candidate)) {
      usedPhrases.add(candidate);
      return candidate;
    }

    // 否则从短语池中取一条未用过的变体
    let variantIndex = (baseHash + i * 13) % pool.length;
    let phrase = pool[variantIndex];
    let guard = 0;
    while (usedPhrases.has(phrase) && guard < pool.length) {
      variantIndex = (variantIndex + 1) % pool.length;
      phrase = pool[variantIndex];
      guard++;
    }
    usedPhrases.add(phrase);

    return `汝与 {{name}} 同，${phrase}`;
  });
}

const traitKeywordMap = {
  1: ['思', '理', '道', '形而上', '永恒', '知', '究', '问', '幽微'],
  2: ['情', '感', '悲', '喜', '哀乐', '心', '愁', '泪', '热忱'],
  3: ['行', '动', '果决', '果断', '雷霆', '断', '机'],
  4: ['新', '变', '破', '革', '立异', '敢', '创', '旧'],
  5: ['天下', '民', '群', '公', '苍生', '众', '济'],
  6: ['美', '诗', '画', '韵', '意象', '声', '色', '境', '观物'],
  7: ['志', '毅', '刚', '执', '守', '回', '悔', '韧', '骨'],
  8: ['学', '识', '博', '精', '书', '读', '究', '卷'],
  9: ['世', '退', '内省', '心安', '静', '喧', '进', '全身'],
  10: ['久', '远', '千载', '永恒', '朝夕', '百代', '岁', '千秋'],
  11: ['险', '赌', '敢', '死', '破', '入', '危', '掷'],
  12: ['言', '辞', '文', '笔', '说', '字', '采', '修辞'],
};

function escapeForSingleQuote(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function processFile(filename) {
  const filePath = path.join(FIGURES_DIR, filename);
  let text = await fs.readFile(filePath, 'utf-8');

  // 同时兼容已转换的数组格式与旧字符串格式
  const figureRegex =
    /\{\s*id:\s*'([^']+)',[\s\S]*?matchBlurb:\s*(?:\[([\s\S]*?)\]|'((?:[^'\\]|\\.)*)'),[\s\S]*?\},?/g;

  const matches = [...text.matchAll(figureRegex)];
  if (matches.length === 0) {
    console.warn(`No figures found in ${filename}`);
    return;
  }

  for (const match of matches) {
    const fullBlock = match[0];
    const id = match[1];
    const arrayBody = match[2];
    const stringBody = match[3];

    let existingBlurbs = [];
    if (arrayBody !== undefined) {
      existingBlurbs = [...arrayBody.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(m =>
        m[1].replace(/\\'/g, "'")
      );
    } else if (stringBody !== undefined) {
      existingBlurbs = [stringBody.replace(/\\'/g, "'")];
    }

    const vectorMatch = fullBlock.match(/vector:\s*\[([\d.,\s]+)\]/);
    if (!vectorMatch) {
      console.warn(`No vector for ${id} in ${filename}`);
      continue;
    }
    const vector = vectorMatch[1].split(',').map(s => Number(s.trim()));
    if (vector.length !== 12) {
      console.warn(`Invalid vector length for ${id}: ${vector.length}`);
      continue;
    }

    const blurbs = generateBlurbs(id, vector, existingBlurbs);
    const formatted = blurbs.map(b => `    '${escapeForSingleQuote(b)}'`).join(',\n');
    const replacement = fullBlock.replace(
      /matchBlurb:\s*(?:\[[\s\S]*?\]|'(?:[^'\\]|\\.)*'),/,
      `matchBlurb: [\n${formatted}\n  ],`
    );

    text = text.replace(fullBlock, replacement);
  }

  await fs.writeFile(filePath, text, 'utf-8');
  console.log(`Updated ${filename}: ${matches.length} figures`);
}

async function main() {
  for (const file of FILES) {
    await processFile(file);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
