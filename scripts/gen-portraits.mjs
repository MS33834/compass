#!/usr/bin/env node
/**
 * 镜心 · 批量生成 31 位东方文人墨客 SVG 肖像
 *
 * 设计原则：水墨写意 · 印章 · 折枝意象
 *  - 上方：朝代（楷体小字）
 *  - 中部：人物剪影 + 意象物（树/竹/菊/莲/鹤/琴/书/剑 等）
 *  - 下方：姓名（楷体大字）
 *  - 右下：朱砂小印"镜"
 *
 * 尺寸 240 × 320，viewBox 自适应。
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'portraits', 'east-literati');

/** 物象 — 每位古人配一种意象 */
const ICON = {
  laozi: 'qingtou',     // 青牛
  zhuangzi: 'die',      // 蝴蝶
  mozi: 'mo',           // 墨
  hanfeizi: 'fa',       // 法
  lizhi: 'huo',         // 火
  wanganshi: 'jian',    // 笔/剑
  xunzi: 'li',          // 礼
  quyuan: 'cao',        // 香草
  liuzongyuan: 'xue',   // 雪
  wangyangming: 'xin',  // 心
  zhuxi: 'li2',         // 理
  wangfuzhi: 'shu',     // 船
  tansitong: 'xue2',    // 血
  kongzi: 'yue',        // 琴
  mengzi: 'qi',         // 气
  taoyuanming: 'ju',    // 菊
  wangwei: 'shan',      // 山
  hanyu: 'bi',          // 笔
  ouyangxiu: 'jiu',     // 酒
  simaqian: 'ce',       // 史册
  dufu: 'mao',          // 茅屋
  baijuyi: 'qin2',      // 琴
  sushi: 'yue2',        // 月
  luyou: 'hua',         // 剑/梅
  zhangdai: 'xue3',     // 雪夜
  zengguofan: 'ri',     // 日课
  liyu: 'ju2',          // 菊
  yuanmei: 'shu2',      // 食
  nalanxingde: 'yue3',  // 月
  liushao: 'hua2',      // 花
  gongzizhen: 'feng',   // 风
};

const FIGURES = [
  { id: 'laozi',        name: '老子',     era: '春秋' },
  { id: 'zhuangzi',     name: '庄子',     era: '战国' },
  { id: 'mozi',         name: '墨子',     era: '战国' },
  { id: 'hanfeizi',     name: '韩非子',   era: '战国' },
  { id: 'lizhi',        name: '李贽',     era: '明'   },
  { id: 'wanganshi',    name: '王安石',   era: '宋'   },
  { id: 'xunzi',        name: '荀子',     era: '战国' },
  { id: 'quyuan',       name: '屈原',     era: '战国' },
  { id: 'liuzongyuan',  name: '柳宗元',   era: '唐'   },
  { id: 'wangyangming', name: '王阳明',   era: '明'   },
  { id: 'zhuxi',        name: '朱熹',     era: '宋'   },
  { id: 'wangfuzhi',    name: '王夫之',   era: '明'   },
  { id: 'tansitong',    name: '谭嗣同',   era: '清'   },
  { id: 'kongzi',       name: '孔子',     era: '春秋' },
  { id: 'mengzi',       name: '孟子',     era: '战国' },
  { id: 'taoyuanming',  name: '陶渊明',   era: '东晋' },
  { id: 'wangwei',      name: '王维',     era: '唐'   },
  { id: 'hanyu',        name: '韩愈',     era: '唐'   },
  { id: 'ouyangxiu',    name: '欧阳修',   era: '宋'   },
  { id: 'simaqian',     name: '司马迁',   era: '西汉' },
  { id: 'dufu',         name: '杜甫',     era: '唐'   },
  { id: 'baijuyi',      name: '白居易',   era: '唐'   },
  { id: 'sushi',        name: '苏轼',     era: '宋'   },
  { id: 'luyou',        name: '陆游',     era: '宋'   },
  { id: 'zhangdai',     name: '张岱',     era: '明'   },
  { id: 'zengguofan',   name: '曾国藩',   era: '清'   },
  { id: 'liyu',         name: '李渔',     era: '清'   },
  { id: 'yuanmei',      name: '袁枚',     era: '清'   },
  { id: 'nalanxingde',  name: '纳兰性德', era: '清'   },
  { id: 'liushao',      name: '李清照',   era: '宋'   },
  { id: 'gongzizhen',   name: '龚自珍',   era: '清'   },
];

/**
 * 意象物 SVG 片段（相对 viewBox 240×320）
 * 风格：极简写意
 */
const ICONS = {
  qingtou: '<path d="M30 250 Q90 220 130 240 L160 230 Q190 240 210 230" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round"/><circle cx="160" cy="232" r="8" fill="currentColor"/><path d="M150 225 Q145 215 138 218" stroke="currentColor" fill="none" stroke-width="2"/>', // 青牛
  die: '<path d="M120 200 Q90 180 100 160 Q120 145 140 165 Q155 180 145 200 Q130 215 120 200" fill="currentColor" opacity="0.85"/><path d="M155 195 Q180 175 190 195 Q175 215 155 195" fill="currentColor" opacity="0.7"/>',
  mo: '<circle cx="120" cy="200" r="14" fill="currentColor" opacity="0.7"/><circle cx="120" cy="200" r="6" fill="var(--rice)"/><path d="M138 208 L165 235" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  fa: '<rect x="80" y="180" width="80" height="50" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="100" y1="200" x2="140" y2="200" stroke="currentColor" stroke-width="1.5"/><line x1="100" y1="210" x2="140" y2="210" stroke="currentColor" stroke-width="1.5"/><line x1="100" y1="220" x2="140" y2="220" stroke="currentColor" stroke-width="1.5"/>',
  huo: '<path d="M120 165 Q105 180 115 200 Q120 215 120 225 Q120 215 125 200 Q135 180 120 165" fill="currentColor"/><path d="M120 175 Q112 185 117 200" fill="var(--rice)"/>',
  jian: '<line x1="80" y1="225" x2="160" y2="180" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><rect x="158" y="172" width="14" height="16" fill="currentColor"/><rect x="68" y="223" width="20" height="6" fill="currentColor"/>',
  li: '<path d="M70 200 Q100 190 120 195 Q140 200 170 190" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M70 200 Q70 175 90 170" fill="none" stroke="currentColor" stroke-width="2"/><path d="M170 190 Q170 175 150 170" fill="none" stroke="currentColor" stroke-width="2"/>',
  cao: '<path d="M100 250 Q105 220 110 200 Q115 180 120 160" fill="none" stroke="currentColor" stroke-width="2"/><path d="M105 220 Q90 215 80 220" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M108 205 Q125 200 135 205" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M115 185 Q100 180 90 185" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M118 170 Q135 165 145 170" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  xue: '<circle cx="120" cy="200" r="3" fill="currentColor"/><circle cx="100" cy="220" r="2" fill="currentColor"/><circle cx="140" cy="195" r="2" fill="currentColor"/><circle cx="130" cy="225" r="2.5" fill="currentColor"/><circle cx="155" cy="215" r="2" fill="currentColor"/><path d="M40 250 L200 250" stroke="currentColor" stroke-width="1" opacity="0.3"/>',
  xin: '<path d="M120 200 Q90 175 75 195 Q60 215 120 240 Q180 215 165 195 Q150 175 120 200" fill="none" stroke="currentColor" stroke-width="2.5"/>',
  li2: '<path d="M70 195 L90 215 L110 200 L130 220 L150 200" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="80" cy="200" r="2" fill="currentColor"/><circle cx="120" cy="210" r="2" fill="currentColor"/><circle cx="150" cy="195" r="2" fill="currentColor"/>',
  shu: '<path d="M60 220 L120 180 L180 220 L120 240 Z" fill="currentColor" opacity="0.85"/><line x1="120" y1="180" x2="120" y2="240" stroke="var(--rice)" stroke-width="1.5"/>',
  xue2: '<path d="M120 200 L120 235" stroke="currentColor" stroke-width="3"/><path d="M115 220 Q105 215 100 220" stroke="currentColor" stroke-width="2" fill="none"/><path d="M125 215 Q135 210 140 215" stroke="currentColor" stroke-width="2" fill="none"/>',
  yue: '<path d="M80 230 Q80 195 100 195 Q120 195 120 230 Q120 195 140 195 Q160 195 160 230 Z" fill="currentColor" opacity="0.7"/><circle cx="98" cy="208" r="3" fill="var(--rice)"/><circle cx="142" cy="208" r="3" fill="var(--rice)"/>',
  qi: '<path d="M70 220 Q120 200 170 220" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M70 220 Q90 180 120 165" fill="none" stroke="currentColor" stroke-width="2"/><path d="M170 220 Q150 180 120 165" fill="none" stroke="currentColor" stroke-width="2"/>',
  ju: '<circle cx="120" cy="200" r="14" fill="currentColor"/><path d="M115 200 L113 192 M125 200 L127 192 M115 200 L113 208 M125 200 L127 208 M120 200 L120 188 M120 200 L120 212" stroke="var(--rice)" stroke-width="1"/>',
  shan: '<path d="M40 240 L80 180 L120 215 L160 170 L200 240 Z" fill="currentColor" opacity="0.7"/><path d="M70 195 Q90 188 100 192" fill="none" stroke="var(--rice)" stroke-width="1.5"/>',
  bi: '<path d="M60 175 L60 235 M65 175 L65 235" stroke="currentColor" stroke-width="2"/><path d="M62 175 L150 215 L62 215 Z" fill="currentColor" opacity="0.8"/>',
  jiu: '<path d="M95 220 L145 220 L142 240 L98 240 Z" fill="currentColor" opacity="0.7"/><path d="M118 220 L118 200 Q120 195 124 195" fill="none" stroke="currentColor" stroke-width="2"/>',
  ce: '<rect x="70" y="170" width="100" height="65" fill="currentColor" opacity="0.85"/><line x1="80" y1="190" x2="160" y2="190" stroke="var(--rice)" stroke-width="1.5"/><line x1="80" y1="200" x2="160" y2="200" stroke="var(--rice)" stroke-width="1.5"/><line x1="80" y1="210" x2="160" y2="210" stroke="var(--rice)" stroke-width="1.5"/><line x1="80" y1="220" x2="160" y2="220" stroke="var(--rice)" stroke-width="1.5"/>',
  mao: '<path d="M70 230 L80 200 L100 200 L110 220 L120 195 L140 195 L150 215 L165 200 L175 220 L180 230" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M80 235 L170 235" stroke="currentColor" stroke-width="2"/>',
  qin2: '<path d="M60 215 L60 230 L180 230 L180 215 Q150 200 120 200 Q90 200 60 215" fill="currentColor" opacity="0.8"/><circle cx="60" cy="222" r="4" fill="var(--rice)"/><line x1="80" y1="200" x2="80" y2="220" stroke="currentColor" stroke-width="1"/><line x1="100" y1="195" x2="100" y2="220" stroke="currentColor" stroke-width="1"/><line x1="120" y1="195" x2="120" y2="220" stroke="currentColor" stroke-width="1"/><line x1="140" y1="195" x2="140" y2="220" stroke="currentColor" stroke-width="1"/><line x1="160" y1="200" x2="160" y2="220" stroke="currentColor" stroke-width="1"/>',
  yue2: '<circle cx="120" cy="200" r="22" fill="none" stroke="currentColor" stroke-width="2"/><path d="M138 200 Q120 180 105 200" fill="currentColor" opacity="0.6"/>',
  hua: '<path d="M120 250 L120 175" stroke="currentColor" stroke-width="2"/><circle cx="120" cy="170" r="10" fill="currentColor"/><circle cx="115" cy="167" r="3" fill="var(--rice)"/><circle cx="125" cy="172" r="3" fill="var(--rice)"/><path d="M120 195 Q105 200 95 195 M120 195 Q135 200 145 195 M120 215 Q110 220 100 215 M120 215 Q130 220 140 215" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  xue3: '<path d="M50 240 L80 195 L110 220 L140 190 L170 225 L200 240" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="80" cy="195" r="2" fill="currentColor"/><circle cx="110" cy="220" r="2" fill="currentColor"/><circle cx="140" cy="190" r="2" fill="currentColor"/><circle cx="170" cy="225" r="2" fill="currentColor"/>',
  ri: '<circle cx="120" cy="200" r="22" fill="currentColor"/><line x1="120" y1="170" x2="120" y2="160" stroke="currentColor" stroke-width="2"/><line x1="120" y1="230" x2="120" y2="240" stroke="currentColor" stroke-width="2"/><line x1="90" y1="200" x2="80" y2="200" stroke="currentColor" stroke-width="2"/><line x1="150" y1="200" x2="160" y2="200" stroke="currentColor" stroke-width="2"/>',
  ju2: '<circle cx="120" cy="195" r="8" fill="currentColor"/><circle cx="120" cy="210" r="10" fill="currentColor" opacity="0.85"/><circle cx="120" cy="222" r="13" fill="currentColor" opacity="0.7"/><path d="M120 168 L120 240" stroke="var(--rice)" stroke-width="1"/>',
  shu2: '<path d="M85 195 L155 195 L150 230 L90 230 Z" fill="currentColor" opacity="0.85"/><path d="M120 175 L120 200" stroke="currentColor" stroke-width="2"/>',
  yue3: '<path d="M105 195 Q120 175 135 195 Q135 215 120 220 Q105 215 105 195" fill="currentColor" opacity="0.7"/>',
  hua2: '<circle cx="120" cy="200" r="12" fill="currentColor"/><circle cx="105" cy="195" r="5" fill="currentColor" opacity="0.7"/><circle cx="135" cy="195" r="5" fill="currentColor" opacity="0.7"/><path d="M120 200 L120 240" stroke="currentColor" stroke-width="2"/>',
  feng: '<path d="M70 200 Q90 195 110 200 Q130 205 150 200" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M70 215 Q95 210 120 215 Q145 220 170 215" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.7"/>',
};

function buildSvg({ name, era, iconKey }) {
  const icon = ICONS[iconKey] ?? '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- 镜心 · ${name}（${era}） · 水墨写意 -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 320" width="240" height="320" role="img" aria-label="${name}（${era}）">
  <defs>
    <filter id="rough" x="0" y="0" width="100%" height="100%">
      <feTurbulence baseFrequency="0.04" numOctaves="2" seed="${name.length}" />
      <feDisplacementMap in="SourceGraphic" scale="1.5" />
    </filter>
  </defs>
  <style>
    .ink { color: #1a1a1a; }
    .cinnabar { color: #a8322e; }
    .rice { color: #f5efe0; }
    .faint { color: #5a5a5a; }
    .face-bg { fill: #ebe3cf; }
    .frame { fill: none; stroke: #a8322e; stroke-width: 1.5; }
    text {
      font-family: '霞鹜文楷','LXGW WenKai','STKaiti','KaiTi',serif;
    }
  </style>

  <!-- 米色底 -->
  <rect width="240" height="320" fill="#ebe3cf"/>

  <!-- 朱砂外框（薄） -->
  <rect x="6" y="6" width="228" height="308" class="frame"/>

  <!-- 朝代 -->
  <text x="120" y="32" text-anchor="middle" font-size="14" letter-spacing="6" class="ink" fill="#5a5a5a">${era}</text>

  <!-- 折线分隔 -->
  <line x1="60" y1="46" x2="180" y2="46" stroke="#a8322e" stroke-width="0.5" opacity="0.4"/>

  <!-- 人物剪影（半圆肩+头） -->
  <g class="ink" filter="url(#rough)">
    <ellipse cx="120" cy="120" rx="28" ry="34" fill="#1a1a1a" opacity="0.9"/>
    <path d="M60 220 Q60 170 100 165 L140 165 Q180 170 180 220 L180 260 L60 260 Z" fill="#1a1a1a" opacity="0.92"/>
  </g>

  <!-- 意象物 -->
  <g class="ink" filter="url(#rough)">
    ${icon}
  </g>

  <!-- 姓名 -->
  <text x="120" y="290" text-anchor="middle" font-size="26" letter-spacing="12" class="ink" fill="#1a1a1a">${name}</text>

  <!-- 印章 -->
  <g transform="translate(202,278)">
    <rect x="0" y="0" width="26" height="26" fill="#a8322e" rx="2"/>
    <text x="13" y="20" text-anchor="middle" font-size="18" fill="#f5efe0">镜</text>
  </g>
</svg>
`;
}

let okCount = 0;
for (const f of FIGURES) {
  const iconKey = ICON[f.id];
  if (!iconKey) {
    console.warn(`⚠️  ${f.id} 缺意象，跳过`);
    continue;
  }
  const svg = buildSvg({ name: f.name, era: f.era, iconKey });
  const path = join(OUT, `${f.id}.svg`);
  writeFileSync(path, svg, 'utf8');
  okCount++;
}

console.log(`✅ 已生成 ${okCount} 张 SVG 肖像 → ${OUT}`);
