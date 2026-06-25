#!/usr/bin/env node
/**
 * 批量给人物添加 archetype 字段
 * 用法: node scripts/add-archetypes.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// 定义各域人物的 archetype 分配
const ARCHETYPE_MAP = {
  // east-literati (30人)
  'el-laozi': 'sage',
  'el-zhuangzi': 'thinker',
  'el-mozi': 'doer',
  'el-hanfeizi': 'leader',
  'el-lizhi': 'rebel',
  'el-wanganshi': 'doer',
  'el-xunzi': 'thinker',
  'el-quyuan': 'creator',
  'el-liuzongyuan': 'doer',
  'el-wangyangming': 'thinker',
  'el-zhuxi': 'sage',
  'el-wangfuzhi': 'sage',
  'el-kongzi': 'sage',
  'el-mengzi': 'leader',
  'el-taoyuanming': 'sage',
  'el-wangwei': 'creator',
  'el-hanyu': 'doer',
  'el-ouyangxiu': 'doer',
  'el-simaqian': 'thinker',
  'el-dufu': 'creator',
  'el-baijuyi': 'creator',
  'el-sushi': 'creator',
  'el-luyou': 'doer',
  'el-zhangdai': 'creator',
  'el-zengguofan': 'leader',
  'el-liyu': 'creator',
  'el-yuanmei': 'creator',
  'el-nalanxingde': 'creator',
  'el-liushao': 'creator',
  'el-gongzizhen': 'rebel',
  
  // east-statesman (需要补充)
  // east-scientist (需要补充)
  // west-philosopher (需要补充)
  // west-scientist (需要补充)
};

const domains = [
  'east-literati',
  'east-statesman',
  'east-scientist',
  'west-philosopher',
  'west-scientist',
];

for (const domain of domains) {
  const file = `src/domain/figures/figures.${domain}.ts`;
  const filePath = resolve(ROOT, file);
  let content = readFileSync(filePath, 'utf-8');
  
  // 检查是否已有 archetype
  if (content.includes('archetype:')) {
    console.log(`⏭️  ${file} 已有 archetype，跳过`);
    continue;
  }
  
  // 为每个人物添加 archetype
  let modified = content;
  let count = 0;
  
  for (const [id, archetype] of Object.entries(ARCHETYPE_MAP)) {
    if (!id.startsWith(domain === 'east-literati' ? 'el-' : 
                     domain === 'east-statesman' ? 'esm-' :
                     domain === 'east-scientist' ? 'esci-' :
                     domain === 'west-philosopher' ? 'wp-' : 'wsci-')) {
      continue;
    }
    
    // 在 echoes 字段后添加 archetype
    const echoesPattern = new RegExp(`(echoes:\\s*\\[[^\\]]*\\],?)\\s*\\n  \\},`, 'g');
    const replacement = `$1\n    archetype: '${archetype}',\n  },`;
    
    if (modified.match(echoesPattern)) {
      modified = modified.replace(echoesPattern, replacement);
      count++;
    }
  }
  
  if (count > 0) {
    writeFileSync(filePath, modified);
    console.log(`✅ ${file}: 添加了 ${count} 个 archetype`);
  } else {
    console.log(`⚠️  ${file}: 未找到匹配的人物ID`);
  }
}

console.log('\n完成！');
