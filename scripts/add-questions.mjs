/**
 * Add 10 new questions per domain (2 per trait, 5 traits per pass = 10 total).
 * 2 situational, 2 imagery, 3 ranking, 3 aesthetic.
 * Total: 48 + 10 = 58 per domain.
 * 
 * IDs: es-nn+1 → es-nn+10, etc.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', 'src', 'domain', 'items');

// =============================================================
// NEW QUESTIONS per domain (10 each, targeting underrepresented traits)
// =============================================================

const NEW = {};

// --- east-statesman (es) ---
// Current: r01-r12 (ranking), a01-a09 (aesthetic), existing situational/imagery
// New: es-049 to es-058
NEW['east-statesman'] = [
  // 049: situational (trait 8 - 处世, underrepresented in new)
  `  {
    id: 'es-049',
    format: 'situational',
    prompt: '臣子谏言于殿前',
    promptGloss: '你作为臣子要向君王进谏，你会选择何种方式？',
    options: [
      { text: '直言不讳', gloss: '犯颜直谏，不畏君威', primary: { traitId: 7, delta: 1.2 }, secondary: [{ traitId: 11, delta: 0.3 }] },
      { text: '委婉规劝', gloss: '以喻为谏，婉转陈词', primary: { traitId: 8, delta: 0.4 } },
      { text: '上书陈情', gloss: '具文而奏，请君自裁', primary: { traitId: 6, delta: -0.2 } },
      { text: '借古讽今', gloss: '以史为鉴，引而不发', primary: { traitId: 4, delta: 0.6 } },
      { text: '缄默不言', gloss: '知而不言，明哲保身', primary: { traitId: 1, delta: -1.0 } },
      { text: '随声附和', gloss: '主上圣明，臣无异言', primary: { traitId: 9, delta: -1.2 }, secondary: [{ traitId: 3, delta: -0.3 }] },
    ],
  },`,
  // 050: imagery (trait 11 - 风骨)
  `  {
    id: 'es-050',
    format: 'imagery',
    prompt: '镜湖垂纶',
    promptGloss: '朝堂之外，于镜湖之畔垂钓，心中作何想？',
    options: [
      { text: '待时而动', gloss: '竿线虽垂，志在庙堂', primary: { traitId: 3, delta: 0.8 }, secondary: [{ traitId: 1, delta: 0.2 }] },
      { text: '悠然自得', gloss: '一竿一壶，乐在其中', primary: { traitId: 11, delta: -0.6 } },
      { text: '思虑国事', gloss: '身在江湖，心存魏阙', primary: { traitId: 10, delta: 1.0 } },
      { text: '进退两难', gloss: '欲归不得，欲进不能', primary: { traitId: 9, delta: 0.4 } },
      { text: '天地逍遥', gloss: '忘机于此，不复他念', primary: { traitId: 2, delta: 0.6 } },
      { text: '笑看风云', gloss: '得失之间，皆付一笑', primary: { traitId: 11, delta: 0.0 }, secondary: [{ traitId: 8, delta: 0.3 }] },
    ],
  },`,
  // 051: ranking (trait 1)
  `  {
    id: 'es-r13',
    format: 'ranking',
    prompt: '用人四要',
    promptGloss: '「德、才、忠、勤」── 用人之道，何者为先？',
    options: [
      { text: '以德为先', gloss: '德者本也', primary: { traitId: 1, delta: -0.8 }, secondary: [{ traitId: 8, delta: 0.2 }] },
      { text: '以才为重', gloss: '才者用也', primary: { traitId: 1, delta: 0.6 }, secondary: [{ traitId: 5, delta: 0.3 }] },
      { text: '以忠为本', gloss: '忠者信也', primary: { traitId: 1, delta: 0.2 } },
      { text: '以勤为要', gloss: '勤者功也', primary: { traitId: 1, delta: -0.2 } },
      { text: '四者兼察', gloss: '兼而用之', primary: { traitId: 1, delta: 0.0 } },
      { text: '因位而异', gloss: '视其位而择', primary: { traitId: 1, delta: 0.8 } },
    ],
  },`,
  // 052: aesthetic (trait 2)
  `  {
    id: 'es-a14',
    format: 'aesthetic',
    prompt: '玉阶微霜与金戈夕照',
    promptGloss: '玉阶微霜之静与金戈夕照之烈，两种为政之境，何者更入汝心？',
    options: [
      { text: '前者', gloss: '前者更合心意', primary: { traitId: 2, delta: 1.2 } },
      { text: '偏前者', gloss: '略偏前者之境', primary: { traitId: 2, delta: 0.6 }, secondary: [{ traitId: 6, delta: 0.2 }] },
      { text: '兼爱之', gloss: '两种意境皆有可取', primary: { traitId: 2, delta: 0.0 }, secondary: [{ traitId: 6, delta: 0.3 }] },
      { text: '偏后者', gloss: '略偏后者之境', primary: { traitId: 2, delta: -0.6 }, secondary: [{ traitId: 6, delta: -0.2 }] },
      { text: '后者', gloss: '后者更入君心', primary: { traitId: 2, delta: -1.2 } },
      { text: '皆不取', gloss: '超乎二者之外', primary: { traitId: 2, delta: -1.4 }, secondary: [{ traitId: 1, delta: 0.2 }] },
    ],
  },`,
  // 053: situational (trait 3)
  `  {
    id: 'es-053',
    format: 'situational',
    prompt: '灾祸骤降于州府',
    promptGloss: '你所辖之地突发灾祸，百姓流离，你当如何应对？',
    options: [
      { text: '开仓放粮', gloss: '先安民而后治', primary: { traitId: 5, delta: 0.8 }, secondary: [{ traitId: 4, delta: 0.2 }] },
      { text: '奏报朝廷', gloss: '按制而行，请旨定夺', primary: { traitId: 7, delta: -0.4 } },
      { text: '募捐自救', gloss: '发动乡绅共渡难关', primary: { traitId: 3, delta: 0.6 } },
      { text: '亲临督赈', gloss: '身先士卒以安民心', primary: { traitId: 7, delta: 1.2 } },
      { text: '调兵维稳', gloss: '先防民变为上', primary: { traitId: 10, delta: -0.6 } },
      { text: '上报下抚', gloss: '上下沟通以全大局', primary: { traitId: 4, delta: 0.0 } },
    ],
  },`,
  // 054: imagery (trait 12 - 品藻)
  `  {
    id: 'es-054',
    format: 'imagery',
    prompt: '夜观天象',
    promptGloss: '深夜独登观星台，但见紫微星明灭不定，心中所思为何？',
    options: [
      { text: '天下兴亡', gloss: '星象示警，天下将变', primary: { traitId: 4, delta: -0.4 }, secondary: [{ traitId: 10, delta: 0.3 }] },
      { text: '民生疾苦', gloss: '天象有变，苍生何辜', primary: { traitId: 5, delta: 1.2 } },
      { text: '天命在我', gloss: '星应其象，莫非吾运', primary: { traitId: 3, delta: 0.8 } },
      { text: '渺渺宇宙', gloss: '宇宙浩渺，人事何足道', primary: { traitId: 12, delta: 0.0 }, secondary: [{ traitId: 1, delta: 0.2 }] },
      { text: '顺应天道', gloss: '天道有常，不为尧存', primary: { traitId: 9, delta: -0.6 } },
      { text: '观象知变', gloss: '天变不足畏，人谋为本', primary: { traitId: 11, delta: 1.0 } },
    ],
  },`,
  // 055: ranking (trait 4)
  `  {
    id: 'es-r14',
    format: 'ranking',
    prompt: '救灾四策',
    promptGloss: '「赈、贷、蠲、调」── 救灾四策，何者最要？',
    options: [
      { text: '赈济为先', gloss: '急赈为要', primary: { traitId: 4, delta: -0.8 } },
      { text: '贷种为上', gloss: '借与种子', primary: { traitId: 4, delta: -0.2 } },
      { text: '蠲免为重', gloss: '免除赋税', primary: { traitId: 4, delta: 0.2 } },
      { text: '调粟为本', gloss: '调粮平籴', primary: { traitId: 4, delta: 0.6 } },
      { text: '四策并施', gloss: '并行不悖', primary: { traitId: 4, delta: 0.0 } },
      { text: '因地制宜', gloss: '因势利导', primary: { traitId: 4, delta: 0.8 } },
    ],
  },`,
  // 056: aesthetic (trait 3)
  `  {
    id: 'es-a13',
    format: 'aesthetic',
    prompt: '雕梁画栋与枯木寒林',
    promptGloss: '雕梁画栋之华美与枯木寒林之萧瑟，审美之境，何者更契汝心？',
    options: [
      { text: '前者', gloss: '前者更合心意', primary: { traitId: 3, delta: 1.2 } },
      { text: '偏前者', gloss: '略偏前者之境', primary: { traitId: 3, delta: 0.6 }, secondary: [{ traitId: 6, delta: 0.2 }] },
      { text: '兼爱之', gloss: '两种意境皆有可取', primary: { traitId: 3, delta: 0.0 }, secondary: [{ traitId: 6, delta: 0.3 }] },
      { text: '偏后者', gloss: '略偏后者之境', primary: { traitId: 3, delta: -0.6 }, secondary: [{ traitId: 6, delta: -0.2 }] },
      { text: '后者', gloss: '后者更入君心', primary: { traitId: 3, delta: -1.2 } },
      { text: '皆不取', gloss: '超乎二者之外', primary: { traitId: 3, delta: -1.4 }, secondary: [{ traitId: 1, delta: 0.2 }] },
    ],
  },`,
  // 057: ranking (trait 5)
  `  {
    id: 'es-r15',
    format: 'ranking',
    prompt: '兴学四端',
    promptGloss: '「设庠序、刊经籍、选贤才、崇实学」── 兴学四端，何者最要？',
    options: [
      { text: '设庠序', gloss: '兴建学校为上', primary: { traitId: 5, delta: -0.6 } },
      { text: '刊经籍', gloss: '刊印经典为基', primary: { traitId: 5, delta: -0.2 } },
      { text: '选贤才', gloss: '选拔人材为要', primary: { traitId: 5, delta: 0.4 } },
      { text: '崇实学', gloss: '崇尚实用之学', primary: { traitId: 5, delta: 0.8 } },
      { text: '四者并举', gloss: '并行不悖', primary: { traitId: 5, delta: 0.0 } },
      { text: '因时而异', gloss: '审时度势', primary: { traitId: 5, delta: 0.6 } },
    ],
  },`,
  // 058: aesthetic (trait 7)
  `  {
    id: 'es-a14',
    format: 'aesthetic',
    prompt: '龙跃云津与凤栖梧桐',
    promptGloss: '龙跃云津之雄健与凤栖梧桐之清雅，两种为臣之道，何者更美？',
    options: [
      { text: '前者', gloss: '前者更合心意', primary: { traitId: 7, delta: 1.2 } },
      { text: '偏前者', gloss: '略偏前者之境', primary: { traitId: 7, delta: 0.6 }, secondary: [{ traitId: 6, delta: 0.2 }] },
      { text: '兼爱之', gloss: '两种意境皆有可取', primary: { traitId: 7, delta: 0.0 }, secondary: [{ traitId: 6, delta: 0.3 }] },
      { text: '偏后者', gloss: '略偏后者之境', primary: { traitId: 7, delta: -0.6 }, secondary: [{ traitId: 6, delta: -0.2 }] },
      { text: '后者', gloss: '后者更入君心', primary: { traitId: 7, delta: -1.2 } },
      { text: '皆不取', gloss: '超乎二者之外', primary: { traitId: 7, delta: -1.4 }, secondary: [{ traitId: 1, delta: 0.2 }] },
    ],
  },`,
];

// =============================================================
// Apply to all 4 domains
// =============================================================

const DOMAINS = ['east-statesman', 'east-scientist', 'west-philosopher', 'west-scientist'];
const PREFIXES = {
  'east-statesman': ['es-049', 'es-050', 'es-r13', 'es-a10', 'es-053', 'es-054', 'es-r14', 'es-a11', 'es-r15', 'es-a12'],
  'east-scientist': ['esci-049', 'esci-050', 'esci-r13', 'esci-a10', 'esci-053', 'esci-054', 'esci-r14', 'esci-a11', 'esci-r15', 'esci-a12'],
  'west-philosopher': ['wp-049', 'wp-050', 'wp-r13', 'wp-a10', 'wp-053', 'wp-054', 'wp-r14', 'wp-a11', 'wp-r15', 'wp-a12'],
  'west-scientist': ['ws-049', 'ws-050', 'ws-r13', 'ws-a10', 'ws-053', 'ws-054', 'ws-r14', 'ws-a11', 'ws-r15', 'ws-a12'],
};

for (const domain of ['east-statesman']) {
  const filePath = join(srcDir, `items.${domain}.ts`);
  let content = readFileSync(filePath, 'utf-8');
  
  // Find the last question and insert before the closing ]; 
  const lastIdx = content.lastIndexOf('];');
  const newQuestions = NEW[domain].join('\n');
  
  content = content.substring(0, lastIdx) + newQuestions + '\n' + content.substring(lastIdx);
  writeFileSync(filePath, content);
  console.log(`✅ Added 10 questions to ${domain}`);
}
