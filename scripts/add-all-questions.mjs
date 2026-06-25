/**
 * Add 10 new questions per domain (58 total).
 * Uses the same question structures as east-statesman but with
 * domain-specific naming.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', 'src', 'domain', 'items');

const Q = {};

// East-scientist
Q['east-scientist'] = [
  `  {
    id: 'esci-049',
    format: 'situational',
    prompt: '异才自荐于门庭',
    promptGloss: '一位自称有奇才的年轻人前来投靠，你欲如何考验他？',
    options: [
      { text: '命其制器', gloss: '令制新器以观其技', primary: { traitId: 3, delta: 1.2 }, secondary: [{ traitId: 8, delta: 0.2 }] },
      { text: '与之论道', gloss: '与谈格致以探其知', primary: { traitId: 1, delta: 0.4 } },
      { text: '授书考校', gloss: '授以前人之书命其研习', primary: { traitId: 7, delta: -0.6 } },
      { text: '令述所长', gloss: '请其自述所擅', primary: { traitId: 8, delta: 0.0 } },
      { text: '婉言谢绝', gloss: '闭关自守，不纳外人', primary: { traitId: 9, delta: -1.0 } },
      { text: '观其行事', gloss: '置之不理，暗中观察', primary: { traitId: 11, delta: -0.4 } },
    ],
  },`,
  `  {
    id: 'esci-050',
    format: 'imagery',
    prompt: '霜夜观天象',
    promptGloss: '寒霜之夜独自观天，但见北辰与北斗交相辉映，你心中作何想？',
    options: [
      { text: '天机玄妙', gloss: '宇宙之秘无穷尽', primary: { traitId: 1, delta: 1.2 }, secondary: [{ traitId: 9, delta: 0.2 }] },
      { text: '寒夜孤寂', gloss: '天地之阔，一人之微', primary: { traitId: 2, delta: -0.6 } },
      { text: '穷理致知', gloss: '星象之中有大道', primary: { traitId: 8, delta: 0.8 } },
      { text: '推衍历法', gloss: '欲以数理测天道', primary: { traitId: 12, delta: 0.6 } },
      { text: '美哉星空', gloss: '但觉其美，不究其理', primary: { traitId: 6, delta: 0.4 } },
      { text: '天人合一', gloss: '星象如人心，皆有定数', primary: { traitId: 6, delta: 0.0 }, secondary: [{ traitId: 9, delta: 0.3 }] },
    ],
  },`,
  `  {
    id: 'esci-r13',
    format: 'ranking',
    prompt: '格物四法',
    promptGloss: '「观、思、验、录」── 格物四法，何者为要？',
    options: [
      { text: '观象为本', gloss: '以观察为先', primary: { traitId: 8, delta: -0.8 } },
      { text: '思理为上', gloss: '推演物理', primary: { traitId: 8, delta: 0.4 } },
      { text: '实验为证', gloss: '以试验为据', primary: { traitId: 8, delta: 1.0 } },
      { text: '记录为要', gloss: '记录备查', primary: { traitId: 8, delta: -0.2 } },
      { text: '四法并重', gloss: '相辅相成', primary: { traitId: 8, delta: 0.0 } },
      { text: '因物而异', gloss: '视物而定', primary: { traitId: 8, delta: 0.6 } },
    ],
  },`,
  `  {
    id: 'esci-a14',
    format: 'aesthetic',
    prompt: '焚香观器与枕石听泉',
    promptGloss: '焚香观器之雅与枕石听泉之逸，两种治学之境，何者更契汝心？',
    options: [
      { text: '前者', gloss: '前者更合心意', primary: { traitId: 5, delta: 1.2 } },
      { text: '偏前者', gloss: '略偏前者之境', primary: { traitId: 5, delta: 0.6 }, secondary: [{ traitId: 6, delta: 0.2 }] },
      { text: '兼爱之', gloss: '两种意境皆有可取', primary: { traitId: 5, delta: 0.0 }, secondary: [{ traitId: 6, delta: 0.3 }] },
      { text: '偏后者', gloss: '略偏后者之境', primary: { traitId: 5, delta: -0.6 }, secondary: [{ traitId: 6, delta: -0.2 }] },
      { text: '后者', gloss: '后者更入君心', primary: { traitId: 5, delta: -1.2 } },
      { text: '皆不取', gloss: '超乎二者之外', primary: { traitId: 5, delta: -1.4 }, secondary: [{ traitId: 1, delta: 0.2 }] },
    ],
  },`,
  `  {
    id: 'esci-053',
    format: 'situational',
    prompt: '工匠献新器于前',
    promptGloss: '有工匠献上一件前所未见的器械，据说能一日织帛百匹，你如何应对？',
    options: [
      { text: '详加验证', gloss: '亲验其器再作定夺', primary: { traitId: 3, delta: 1.0 }, secondary: [{ traitId: 7, delta: 0.3 }] },
      { text: '问其原理', gloss: '先究其理而后用', primary: { traitId: 1, delta: 0.6 } },
      { text: '推广天下', gloss: '大利民生，当速推广', primary: { traitId: 10, delta: 0.8 } },
      { text: '藏于府库', gloss: '先藏之以观其变', primary: { traitId: 5, delta: -0.4 } },
      { text: '敬而远之', gloss: '奇技淫巧，不足取也', primary: { traitId: 9, delta: -1.2 } },
      { text: '着录图纸', gloss: '先录图纸而后处置', primary: { traitId: 8, delta: 0.2 } },
    ],
  },`,
  `  {
    id: 'esci-054',
    format: 'imagery',
    prompt: '瀑布望水',
    promptGloss: '立于千尺瀑布之下，水花飞溅，声如雷震，你心中所感为何？',
    options: [
      { text: '水有万钧力', gloss: '以水力为念，思其用', primary: { traitId: 3, delta: 1.2 }, secondary: [{ traitId: 9, delta: 0.2 }] },
      { text: '逝者如斯夫', gloss: '叹光阴之流逝', primary: { traitId: 10, delta: 0.4 } },
      { text: '源头活水', gloss: '思其源而究其理', primary: { traitId: 7, delta: 0.8 } },
      { text: '壮观不已', gloss: '但觉气象万千', primary: { traitId: 6, delta: 0.0 } },
      { text: '人生渺小', gloss: '觉己身之微渺', primary: { traitId: 2, delta: -0.6 } },
      { text: '心随流去', gloss: '水去无痕，心亦如是', primary: { traitId: 9, delta: 0.6 } },
    ],
  },`,
  `  {
    id: 'esci-r14',
    format: 'ranking',
    prompt: '释疑四径',
    promptGloss: '遇有未解之惑，以何者为先？',
    options: [
      { text: '博览群书', gloss: '以典籍为据', primary: { traitId: 10, delta: -0.6 } },
      { text: '验之以器', gloss: '以实验为法', primary: { traitId: 10, delta: 0.6 } },
      { text: '访师问友', gloss: '以切磋为径', primary: { traitId: 10, delta: -0.2 } },
      { text: '静思冥想', gloss: '以静思为归', primary: { traitId: 10, delta: 0.8 } },
      { text: '四者并用', gloss: '并行不悖', primary: { traitId: 10, delta: 0.0 } },
      { text: '先验后思', gloss: '先试验而后思', primary: { traitId: 10, delta: 0.4 } },
    ],
  },`,
  `  {
    id: 'esci-a13',
    format: 'aesthetic',
    prompt: '静室焚香与登高望远',
    promptGloss: '静室焚香之专注与登高望远之开阔，求学之境，何者更美？',
    options: [
      { text: '前者', gloss: '前者更合心意', primary: { traitId: 3, delta: 1.2 } },
      { text: '偏前者', gloss: '略偏前者之境', primary: { traitId: 3, delta: 0.6 }, secondary: [{ traitId: 6, delta: 0.2 }] },
      { text: '兼爱之', gloss: '两种意境皆有可取', primary: { traitId: 3, delta: 0.0 }, secondary: [{ traitId: 6, delta: 0.3 }] },
      { text: '偏后者', gloss: '略偏后者之境', primary: { traitId: 3, delta: -0.6 }, secondary: [{ traitId: 6, delta: -0.2 }] },
      { text: '后者', gloss: '后者更入君心', primary: { traitId: 3, delta: -1.2 } },
      { text: '皆不取', gloss: '超乎二者之外', primary: { traitId: 3, delta: -1.4 }, secondary: [{ traitId: 1, delta: 0.2 }] },
    ],
  },`,
  `  {
    id: 'esci-r15',
    format: 'ranking',
    prompt: '验物五序',
    promptGloss: '「形、质、用、数、理」── 验物五序，何者为先？',
    options: [
      { text: '观其形', gloss: '先察其形貌', primary: { traitId: 1, delta: -0.6 } },
      { text: '究其质', gloss: '再究其质料', primary: { traitId: 1, delta: -0.2 } },
      { text: '考其用', gloss: '考察功用', primary: { traitId: 1, delta: 0.4 } },
      { text: '度其数', gloss: '以数衡之', primary: { traitId: 1, delta: 0.8 } },
      { text: '达其理', gloss: '通达其理', primary: { traitId: 1, delta: 1.2 } },
      { text: '五者并进', gloss: '兼而用之', primary: { traitId: 1, delta: 0.0 } },
    ],
  },`,
  `  {
    id: 'esci-a14',
    format: 'aesthetic',
    prompt: '晨钟暮鼓与午夜孤灯',
    promptGloss: '晨钟暮鼓之规律与午夜孤灯之专注，求知之景，何者更动人？',
    options: [
      { text: '前者', gloss: '前者更合心意', primary: { traitId: 8, delta: 1.2 } },
      { text: '偏前者', gloss: '略偏前者之境', primary: { traitId: 8, delta: 0.6 }, secondary: [{ traitId: 6, delta: 0.2 }] },
      { text: '兼爱之', gloss: '两种意境皆有可取', primary: { traitId: 8, delta: 0.0 }, secondary: [{ traitId: 6, delta: 0.3 }] },
      { text: '偏后者', gloss: '略偏后者之境', primary: { traitId: 8, delta: -0.6 }, secondary: [{ traitId: 6, delta: -0.2 }] },
      { text: '后者', gloss: '后者更入君心', primary: { traitId: 8, delta: -1.2 } },
      { text: '皆不取', gloss: '超乎二者之外', primary: { traitId: 8, delta: -1.4 }, secondary: [{ traitId: 1, delta: 0.2 }] },
    ],
  },`,
];

// West-philosopher
Q['west-philosopher'] = [
  `  {
    id: 'wp-049',
    format: 'situational',
    prompt: '黄昏对话于广场',
    promptGloss: '黄昏时分在广场上与众人辩论，有人质疑你的观点一无是处，你如何回应？',
    options: [
      { text: '循循善诱', gloss: '以问为答，引导思考', primary: { traitId: 12, delta: 0.8 }, secondary: [{ traitId: 4, delta: 0.2 }] },
      { text: '据理力争', gloss: '以逻辑明辨是非', primary: { traitId: 1, delta: 0.4 } },
      { text: '一笑置之', gloss: '不与之争，超然物外', primary: { traitId: 9, delta: -0.6 } },
      { text: '勃然而怒', gloss: '拍案而起，怒斥其妄', primary: { traitId: 5, delta: 1.2 } },
      { text: '沉默不语', gloss: '以沉默为辩', primary: { traitId: 6, delta: 0.6 } },
      { text: '自省反思', gloss: '反思己论是否有误', primary: { traitId: 11, delta: -0.4 } },
    ],
  },`,
  `  {
    id: 'wp-050',
    format: 'imagery',
    prompt: '烛下阅旧稿',
    promptGloss: '烛光下翻阅自己早年写下的文字，看着那些曾经深信不疑的观点，你作何想？',
    options: [
      { text: '少年意气', gloss: '当年之我何其勇也', primary: { traitId: 4, delta: 0.8 } },
      { text: '今是昨非', gloss: '今日之我嘲昨日之我', primary: { traitId: 10, delta: 0.6 } },
      { text: '一以贯之', gloss: '初心未改，始终如一', primary: { traitId: 7, delta: 1.0 } },
      { text: '恍如隔世', gloss: '此心已非彼心', primary: { traitId: 9, delta: -0.4 } },
      { text: '付之一炬', gloss: '烧掉旧稿，从头开始', primary: { traitId: 11, delta: 1.2 } },
      { text: '誊录成册', gloss: '整理保存以为镜鉴', primary: { traitId: 8, delta: 0.0 } },
    ],
  },`,
  `  {
    id: 'wp-r13',
    format: 'ranking',
    prompt: '求真四道',
    promptGloss: '「逻辑、经验、直觉、启示」── 求真之道，何者最可信？',
    options: [
      { text: '逻辑为上', gloss: '以推理为基', primary: { traitId: 8, delta: 0.6 } },
      { text: '经验为基', gloss: '以经验为本', primary: { traitId: 8, delta: -0.4 } },
      { text: '直觉为重', gloss: '以悟性为归', primary: { traitId: 8, delta: 0.8 } },
      { text: '启示为归', gloss: '以上示为信', primary: { traitId: 8, delta: -0.8 } },
      { text: '四者皆用', gloss: '兼收并蓄', primary: { traitId: 8, delta: 0.0 } },
      { text: '择善而从', gloss: '因事而择', primary: { traitId: 8, delta: 0.4 } },
    ],
  },`,
  `  {
    id: 'wp-a14',
    format: 'aesthetic',
    prompt: '斜阳古堡与晨曦海岸',
    promptGloss: '斜阳古堡之沧桑与晨曦海岸之新生，两种哲思之境，何者更契汝心？',
    options: [
      { text: '前者', gloss: '前者更合心意', primary: { traitId: 2, delta: 1.2 } },
      { text: '偏前者', gloss: '略偏前者之境', primary: { traitId: 2, delta: 0.6 }, secondary: [{ traitId: 6, delta: 0.2 }] },
      { text: '兼爱之', gloss: '两种意境皆有可取', primary: { traitId: 2, delta: 0.0 }, secondary: [{ traitId: 6, delta: 0.3 }] },
      { text: '偏后者', gloss: '略偏后者之境', primary: { traitId: 2, delta: -0.6 }, secondary: [{ traitId: 6, delta: -0.2 }] },
      { text: '后者', gloss: '后者更入君心', primary: { traitId: 2, delta: -1.2 } },
      { text: '皆不取', gloss: '超乎二者之外', primary: { traitId: 2, delta: -1.4 }, secondary: [{ traitId: 1, delta: 0.2 }] },
    ],
  },`,
  `  {
    id: 'wp-053',
    format: 'situational',
    prompt: '学生质疑师道',
    promptGloss: '你的学生对你说"老师，你的哲学已经过时了"，你如何应对？',
    options: [
      { text: '虚心请教', gloss: '请学生说明为何过时', primary: { traitId: 4, delta: 0.6 } },
      { text: '捍卫尊严', gloss: '以更精深之理驳斥之', primary: { traitId: 7, delta: 1.0 } },
      { text: '欣然接纳', gloss: '闻过则喜，与学生共论', primary: { traitId: 11, delta: 0.4 } },
      { text: '不屑一顾', gloss: '孺子之见，何足挂齿', primary: { traitId: 3, delta: -1.0 } },
      { text: '以问代答', gloss: '反问其何为不过时', primary: { traitId: 12, delta: 0.8 } },
      { text: '赠书自明', gloss: '赠以旧著，令其自读', primary: { traitId: 8, delta: -0.4 } },
    ],
  },`,
  `  {
    id: 'wp-054',
    format: 'imagery',
    prompt: '荒原独行',
    promptGloss: '独自穿过一片荒原，天地之间唯你一人，你心中所感为何？',
    options: [
      { text: '自由无羁', gloss: '人的灵魂在此刻解放', primary: { traitId: 7, delta: 1.2 }, secondary: [{ traitId: 3, delta: 0.3 }] },
      { text: '荒诞虚无', gloss: '世界本无意义', primary: { traitId: 11, delta: 1.4 } },
      { text: '敬畏自然', gloss: '天地不仁以万物为刍狗', primary: { traitId: 6, delta: 0.2 } },
      { text: '孤独之痛', gloss: '他人即地狱', primary: { traitId: 5, delta: -0.6 } },
      { text: '寻求归途', gloss: '此身何处是归程', primary: { traitId: 2, delta: 0.8 } },
      { text: '坚定前行', gloss: '走自己的路', primary: { traitId: 3, delta: 0.4 } },
    ],
  },`,
  `  {
    id: 'wp-r14',
    format: 'ranking',
    prompt: '立言之要',
    promptGloss: '「真、新、深、美」── 立言之要，何者最重？',
    options: [
      { text: '真为先', gloss: '以真实为本', primary: { traitId: 7, delta: 0.4 } },
      { text: '新为上', gloss: '以创新为上', primary: { traitId: 4, delta: 0.8 } },
      { text: '深为归', gloss: '以深刻为归', primary: { traitId: 7, delta: 1.2 } },
      { text: '美为度', gloss: '以审美为度', primary: { traitId: 7, delta: -0.4 } },
      { text: '四者相济', gloss: '兼而用之', primary: { traitId: 7, delta: 0.0 } },
      { text: '以说为要', gloss: '以说服为归', primary: { traitId: 7, delta: 0.6 } },
    ],
  },`,
  `  {
    id: 'wp-a13',
    format: 'aesthetic',
    prompt: '月色朦胧与烈阳高照',
    promptGloss: '月色朦胧之迷离与烈阳高照之明澈，两种认知之境，何者更见真实？',
    options: [
      { text: '前者', gloss: '前者更合心意', primary: { traitId: 10, delta: 1.2 } },
      { text: '偏前者', gloss: '略偏前者之境', primary: { traitId: 10, delta: 0.6 }, secondary: [{ traitId: 6, delta: 0.2 }] },
      { text: '兼爱之', gloss: '两种意境皆有可取', primary: { traitId: 10, delta: 0.0 }, secondary: [{ traitId: 6, delta: 0.3 }] },
      { text: '偏后者', gloss: '略偏后者之境', primary: { traitId: 10, delta: -0.6 }, secondary: [{ traitId: 6, delta: -0.2 }] },
      { text: '后者', gloss: '后者更入君心', primary: { traitId: 10, delta: -1.2 } },
      { text: '皆不取', gloss: '超乎二者之外', primary: { traitId: 10, delta: -1.4 }, secondary: [{ traitId: 1, delta: 0.2 }] },
    ],
  },`,
  `  {
    id: 'wp-r15',
    format: 'ranking',
    prompt: '评价四维',
    promptGloss: '「对错、好坏、美丑、有用无用」── 评价事物，何者最重？',
    options: [
      { text: '是非对错', gloss: '以真伪为度', primary: { traitId: 5, delta: 0.8 } },
      { text: '善恶好坏', gloss: '以道德为度', primary: { traitId: 5, delta: 0.4 } },
      { text: '美丑雅俗', gloss: '以审美为度', primary: { traitId: 5, delta: -0.4 } },
      { text: '有用无用', gloss: '以实用为度', primary: { traitId: 5, delta: -0.8 } },
      { text: '因事而异', gloss: '视情境而定', primary: { traitId: 5, delta: 0.0 } },
      { text: '皆不执着', gloss: '超越二元对立', primary: { traitId: 5, delta: 1.2 } },
    ],
  },`,
  `  {
    id: 'wp-a14',
    format: 'aesthetic',
    prompt: '象牙塔顶与熙攘街头',
    promptGloss: '象牙塔顶之思辩与熙攘街头之烟火，哲学家身处，何者更动汝心？',
    options: [
      { text: '前者', gloss: '前者更合心意', primary: { traitId: 10, delta: 1.2 } },
      { text: '偏前者', gloss: '略偏前者之境', primary: { traitId: 10, delta: 0.6 }, secondary: [{ traitId: 6, delta: 0.2 }] },
      { text: '兼爱之', gloss: '两种意境皆有可取', primary: { traitId: 10, delta: 0.0 }, secondary: [{ traitId: 6, delta: 0.3 }] },
      { text: '偏后者', gloss: '略偏后者之境', primary: { traitId: 10, delta: -0.6 }, secondary: [{ traitId: 6, delta: -0.2 }] },
      { text: '后者', gloss: '后者更入君心', primary: { traitId: 10, delta: -1.2 } },
      { text: '皆不取', gloss: '超乎二者之外', primary: { traitId: 10, delta: -1.4 }, secondary: [{ traitId: 1, delta: 0.2 }] },
    ],
  },`,
];

// West-scientist
Q['west-scientist'] = [
  `  {
    id: 'ws-049',
    format: 'situational',
    prompt: '同行质疑假说',
    promptGloss: '你发表了一项震惊学界的新假说，但同行们纷纷表示质疑，你如何应对？',
    options: [
      { text: '设计实验', gloss: '以实验数据证明之', primary: { traitId: 3, delta: 1.2 }, secondary: [{ traitId: 1, delta: 0.2 }] },
      { text: '据理答辩', gloss: '以理论推理说服之', primary: { traitId: 8, delta: 0.6 } },
      { text: '欢迎批判', gloss: '欢迎质疑以完善己论', primary: { traitId: 4, delta: 0.4 } },
      { text: '不为所动', gloss: '真理不因质疑而变', primary: { traitId: 7, delta: 0.8 } },
      { text: '心灰意冷', gloss: '无人理解，不如放弃', primary: { traitId: 2, delta: -1.2 } },
      { text: '寻求合作', gloss: '邀请质疑者共同验证', primary: { traitId: 11, delta: -0.4 } },
    ],
  },`,
  `  {
    id: 'ws-050',
    format: 'imagery',
    prompt: '实验室晨光',
    promptGloss: '清晨第一个走进实验室，晨曦透过窗户照在仪器上，你心中所感为何？',
    options: [
      { text: '新的开始', gloss: '新的一天，新的发现', primary: { traitId: 3, delta: 1.0 } },
      { text: '仪器之美', gloss: '精密的仪器如艺术品', primary: { traitId: 6, delta: 0.4 } },
      { text: '数据待查', gloss: '昨夜数据尚待分析', primary: { traitId: 7, delta: 0.8 } },
      { text: '前人足迹', gloss: '这些仪器凝结先贤智慧', primary: { traitId: 10, delta: 0.6 } },
      { text: '孤寂之路', gloss: '科研之路常伴孤独', primary: { traitId: 2, delta: -0.6 } },
      { text: '宁静致远', gloss: '此处静好，与世无争', primary: { traitId: 9, delta: 0.2 } },
    ],
  },`,
  `  {
    id: 'ws-r13',
    format: 'ranking',
    prompt: '模型四则',
    promptGloss: '「简洁、准确、普适、可证」── 科学模型，何者最贵？',
    options: [
      { text: '简洁为上', gloss: '奥卡姆剃刀', primary: { traitId: 3, delta: -0.6 } },
      { text: '准确为要', gloss: '与观测高度吻合', primary: { traitId: 3, delta: 0.8 } },
      { text: '普适为先', gloss: '适用范围广泛', primary: { traitId: 3, delta: 0.4 } },
      { text: '可证为基', gloss: '能够被证伪', primary: { traitId: 3, delta: 1.2 } },
      { text: '四者并重', gloss: '均衡为上', primary: { traitId: 3, delta: 0.0 } },
      { text: '以用为归', gloss: '实用最为要紧', primary: { traitId: 3, delta: 0.2 } },
    ],
  },`,
  `  {
    id: 'ws-a14',
    format: 'aesthetic',
    prompt: '精密齿轮与自然混沌',
    promptGloss: '精密齿轮之秩序与自然混沌之随机，两种宇宙图景，何者更美？',
    options: [
      { text: '前者', gloss: '前者更合心意', primary: { traitId: 1, delta: 1.2 } },
      { text: '偏前者', gloss: '略偏前者之境', primary: { traitId: 1, delta: 0.6 }, secondary: [{ traitId: 6, delta: 0.2 }] },
      { text: '兼爱之', gloss: '两种意境皆有可取', primary: { traitId: 1, delta: 0.0 }, secondary: [{ traitId: 6, delta: 0.3 }] },
      { text: '偏后者', gloss: '略偏后者之境', primary: { traitId: 1, delta: -0.6 }, secondary: [{ traitId: 6, delta: -0.2 }] },
      { text: '后者', gloss: '后者更入君心', primary: { traitId: 1, delta: -1.2 } },
      { text: '皆不取', gloss: '超乎二者之外', primary: { traitId: 1, delta: -1.4 }, secondary: [{ traitId: 1, delta: 0.2 }] },
    ],
  },`,
  `  {
    id: 'ws-053',
    format: 'situational',
    prompt: '经费告罄与成果在望',
    promptGloss: '研究到了最关键的时刻，但经费已经耗尽，眼看即将突破的成果就要中止，你如何选择？',
    options: [
      { text: '倾尽积蓄', gloss: '自掏腰包继续研究', primary: { traitId: 7, delta: 1.4 }, secondary: [{ traitId: 11, delta: 0.3 }] },
      { text: '寻求资助', gloss: '积极申请新经费', primary: { traitId: 3, delta: 0.6 } },
      { text: '缩减范围', gloss: '缩小目标先出成果', primary: { traitId: 1, delta: 0.2 } },
      { text: '公布初步', gloss: '先公布已有发现', primary: { traitId: 5, delta: -0.4 } },
      { text: '放弃研究', gloss: '无奈放弃，另起炉灶', primary: { traitId: 2, delta: -1.4 } },
      { text: '寻求合作', gloss: '找机构与个人合作', primary: { traitId: 5, delta: 0.4 } },
    ],
  },`,
  `  {
    id: 'ws-054',
    format: 'imagery',
    prompt: '显微镜下',
    promptGloss: '透过显微镜，看见了一个肉眼从未见过的微观世界，你心中最深的感触是什么？',
    options: [
      { text: '别有洞天', gloss: '一沙一世界', primary: { traitId: 1, delta: 0.8 } },
      { text: '万物同源', gloss: '微观之中有宏观之理', primary: { traitId: 8, delta: 0.6 } },
      { text: '精巧绝伦', gloss: '造物之巧令人叹服', primary: { traitId: 6, delta: 0.4 } },
      { text: '未知无限', gloss: '可知者愈多，未知者愈多', primary: { traitId: 2, delta: 0.8 } },
      { text: '实用之思', gloss: '此发现何日能为世用', primary: { traitId: 10, delta: -0.4 } },
      { text: '习以为常', gloss: '不过日常所见景像', primary: { traitId: 3, delta: -0.6 } },
    ],
  },`,
  `  {
    id: 'ws-r14',
    format: 'ranking',
    prompt: '科研四德',
    promptGloss: '「严谨、创新、坚韧、合作」── 科研之德，何者最重？',
    options: [
      { text: '严谨为本', gloss: '求真是第一原则', primary: { traitId: 12, delta: 0.6 } },
      { text: '创新为上', gloss: '突破陈规为要', primary: { traitId: 12, delta: 1.0 } },
      { text: '坚韧为重', gloss: '不达目的不罢休', primary: { traitId: 12, delta: 0.8 } },
      { text: '合作为基', gloss: '独木难成林', primary: { traitId: 12, delta: -0.4 } },
      { text: '四德兼备', gloss: '缺一不可', primary: { traitId: 12, delta: 0.0 } },
      { text: '因时取舍', gloss: '视阶段而择', primary: { traitId: 12, delta: 0.4 } },
    ],
  },`,
  `  {
    id: 'ws-a13',
    format: 'aesthetic',
    prompt: '公式对称与自然界图腾',
    gloss: '公式对称之优雅与自然界图腾之神秘，两种秩序之美，何者更动人？',
    options: [
      { text: '前者', gloss: '前者更合心意', primary: { traitId: 8, delta: 1.2 } },
      { text: '偏前者', gloss: '略偏前者之境', primary: { traitId: 8, delta: 0.6 }, secondary: [{ traitId: 6, delta: 0.2 }] },
      { text: '兼爱之', gloss: '两种意境皆有可取', primary: { traitId: 8, delta: 0.0 }, secondary: [{ traitId: 6, delta: 0.3 }] },
      { text: '偏后者', gloss: '略偏后者之境', primary: { traitId: 8, delta: -0.6 }, secondary: [{ traitId: 6, delta: -0.2 }] },
      { text: '后者', gloss: '后者更入君心', primary: { traitId: 8, delta: -1.2 } },
      { text: '皆不取', gloss: '超乎二者之外', primary: { traitId: 8, delta: -1.4 }, secondary: [{ traitId: 1, delta: 0.2 }] },
    ],
  },`,
  `  {
    id: 'ws-r15',
    format: 'ranking',
    prompt: '发现之途',
    promptGloss: '「灵感、推演、偶然、坚持」── 发现之途，何者最关键？',
    options: [
      { text: '灵感为火', gloss: '灵光一现为始', primary: { traitId: 1, delta: 0.2 } },
      { text: '推演为路', gloss: '逻辑推演为本', primary: { traitId: 1, delta: 0.8 } },
      { text: '偶然为门', gloss: '幸运眷顾有准备的人', primary: { traitId: 1, delta: -0.4 } },
      { text: '坚持为归', gloss: '不放弃是最后的钥匙', primary: { traitId: 1, delta: 1.2 } },
      { text: '四者兼备', gloss: '缺一不可', primary: { traitId: 1, delta: 0.0 } },
      { text: '以勤补拙', gloss: '勤能补拙', primary: { traitId: 1, delta: -0.8 } },
    ],
  },`,
  `  {
    id: 'ws-a14',
    format: 'aesthetic',
    prompt: '万有引力与量子涨落',
    promptGloss: '万有引力之宏阔与量子涨落之玄微，两种科学图景，何者更令你心折？',
    options: [
      { text: '前者', gloss: '前者更合心意', primary: { traitId: 4, delta: 1.2 } },
      { text: '偏前者', gloss: '略偏前者之境', primary: { traitId: 4, delta: 0.6 }, secondary: [{ traitId: 6, delta: 0.2 }] },
      { text: '兼爱之', gloss: '两种意境皆有可取', primary: { traitId: 4, delta: 0.0 }, secondary: [{ traitId: 6, delta: 0.3 }] },
      { text: '偏后者', gloss: '略偏后者之境', primary: { traitId: 4, delta: -0.6 }, secondary: [{ traitId: 6, delta: -0.2 }] },
      { text: '后者', gloss: '后者更入君心', primary: { traitId: 4, delta: -1.2 } },
      { text: '皆不取', gloss: '超乎二者之外', primary: { traitId: 4, delta: -1.4 }, secondary: [{ traitId: 1, delta: 0.2 }] },
    ],
  },`,
];

// Apply all
const DOMAINS = ['east-scientist', 'west-philosopher', 'west-scientist'];

for (const domain of DOMAINS) {
  const filePath = join(srcDir, `items.${domain}.ts`);
  let content = readFileSync(filePath, 'utf-8');
  
  const lastIdx = content.lastIndexOf('];');
  const newQuestions = Q[domain].join('\n');
  
  content = content.substring(0, lastIdx) + newQuestions + '\n' + content.substring(lastIdx);
  writeFileSync(filePath, content);
  console.log(`✅ Added 10 questions to ${domain}`);
}
