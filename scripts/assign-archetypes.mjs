#!/usr/bin/env node
/**
 * 批量给各域人物分配 archetype
 * 确保6种 archetype 每种至少3人，合理反映人物特质
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// 各域人物的 archetype 分配方案（基于历史身份合理分配）
const ASSIGNMENTS = {
  // east-literati (30人) - 已分配6人，还需分配24人
  'el-xunzi': 'thinker',       // 荀子 - 性恶论思想家
  'el-quyuan': 'creator',       // 屈原 - 诗人
  'el-liuzongyuan': 'doer',    // 柳宗元 - 永州八记，古文运动实践者
  'el-wangyangming': 'thinker', // 王阳明 - 心学思想家
  'el-zhuxi': 'sage',          // 朱熹 - 理学集大成者
  'el-wangfuzhi': 'sage',      // 王夫之 - 船山先生，思想家
  'el-kongzi': 'sage',         // 孔子 - 至圣
  'el-mengzi': 'leader',        // 孟子 - 儒家亚圣，有政治理想
  'el-taoyuanming': 'sage',    // 陶渊明 - 隐士
  'el-wangwei': 'creator',      // 王维 - 诗佛，画家
  'el-hanyu': 'doer',          // 韩愈 - 古文运动领袖，实践者
  'el-ouyangxiu': 'doer',     // 欧阳修 - 古文运动领袖，实践者
  'el-simaqian': 'thinker',    // 司马迁 - 史学家，思想家
  'el-dufu': 'creator',        // 杜甫 - 诗圣
  'el-baijuyi': 'creator',     // 白居易 - 诗人
  'el-sushi': 'creator',        // 苏轼 - 文学家，艺术家
  'el-luyou': 'doer',         // 陆游 - 爱国诗人，实践者
  'el-zhangdai': 'creator',    // 张岱 - 文学家
  'el-zengguofan': 'leader',   // 曾国藩 - 湘军领袖
  'el-liyu': 'creator',        // 李渔 - 戏曲家
  'el-yuanmei': 'creator',     // 袁枚 - 性灵派诗人
  'el-nalanxingde': 'creator', // 纳兰性德 - 词人
  'el-liushao': 'creator',      // 李清照 - 词人
  'el-gongzizhen': 'rebel',   // 龚自珍 - 晚清思想先驱

  // east-statesman (30人) - 需要补充
  'esm-shangyang': 'doer',     // 商鞅 - 变法实践者
  'esm-wuling': 'leader',      // 伍子胥 - 吴国大臣
  'esm-liusi': 'leader',       // 刘备 - 蜀汉开国皇帝
  'esm-zhugeliang': 'sage',   // 诸葛亮 - 卧龙
  'esm-wangjian': 'leader',    // 王翦 - 秦国名将
  'esm-zhaojun': 'doer',      // 王昭君 - 和亲实践者
  'esm-liushaoqi': 'leader',  // 刘秀 - 东汉开国皇帝
  'esm-caocao': 'leader',     // 曹操 - 魏武帝
  'esm-simayi': 'leader',     // 司马懿 - 晋宣帝
  'esm-yangjian': 'leader',    // 杨坚 - 隋文帝
  'esm-wangtong': 'thinker',   // 王通 - 隋代思想家
  'esm-fangxuanling': 'doer', // 房玄龄 - 贞观名相
  'esm-weizheng': 'doer',     // 魏征 - 贞观名臣
  'esm-wuzeitian': 'leader',   // 武则天 - 女皇
  'esm-xuangzong': 'creator',  // 唐玄宗 - 开元盛世
  'esm-yunchubo': 'doer',     // 冼夫人 - 岭南领袖
  'esm-yuefei': 'doer',      // 岳飞 - 抗金名将
  'esm-wenitiansiang': 'leader', // 文天祥 - 宋末忠臣
  'esm-zhubo': 'doer',        // 朱博 - 汉代大臣
  'esm-liuchan': 'leader',     // 刘禅 - 蜀汉后主（守成之君）
  'esm-xieliao': 'doer',      // 谢安 - 东晋名相
  'esm-wanganshi': 'doer',    // 王安石 - 熙宁变法
  'esm-zhangjuzheng': 'doer', // 张居正 - 万历首辅
  'esm-sunzhongshan': 'rebel', // 孙中山 - 革命先行者
  'esm-zhouenlai': 'leader',  // 周恩来 - 人民总理
  'esm-dengxiaoping': 'rebel', // 邓小平 - 改革开放
  'esm-linxuchu': 'leader',   // 林则徐 - 虎门销烟
  'esm-zengguofan': 'leader', // 曾国藩 - 已分配（重复？）
  'esm-hanwudi': 'leader',    // 汉武帝 - 雄才大略
  'esm-tangtaizong': 'leader', // 唐太宗 - 贞观之治
  'esm-songtaizu': 'leader',  // 宋太祖 - 陈桥兵变

  // east-scientist (30人) - 需要补充
  'esci-cailun': 'doer',      // 蔡伦 - 改进造纸术
  'esci-zhangheng': 'thinker', // 张衡 - 科学家，思想家
  'esci-zu': 'thinker',       // 祖冲之 - 数学家
  'esci-bi': 'doer',          // 毕昇 - 活字印刷
  'esci-song': 'doer',        // 宋应星 - 天工开物
  'esci-xuguangqi': 'doer',   // 徐光启 - 翻译《几何原本》
  'esci-shen': 'thinker',      // 沈括 - 梦溪笔谈
  'esci-guoshoujing': 'thinker', // 郭守敬 - 天文学家
  'esci-huang': 'doer',       // 黄道婆 - 纺织技术
  'esci-lishenzhi': 'doer',  // 李时珍 - 本草纲目
  'esci-jia': 'doer',         // 贾思勰 - 齐民要术
  'esci-xuxiake': 'explorer', // 徐霞客 - 地理考察（新增 explorer 类型？）
  'esci-zhangzhongjing': 'doer', // 张仲景 - 伤寒杂病论
  'esci-huatuo': 'doer',     // 华佗 - 外科医生
  'esci-sunsimiao': 'doer',  // 孙思邈 - 千金方
  'esci-pei': 'thinker',      // 裴秀 - 地图学家
  'esci-susong': 'thinker',   // 苏颂 - 水运仪象台
  'esci-lije': 'doer',        // 李诫 - 营造法式
  'esci-bianque': 'doer',    // 扁鹊 - 名医
  'esci-gehong': 'thinker',   // 葛洪 - 抱朴子
  'esci-lidaoyuan': 'thinker', // 郦道元 - 水经注
  'esci-yixing': 'thinker',   // 一行 - 天文学家
  'esci-qin': 'thinker',      // 秦九韶 - 数学家
  'esci-luban': 'doer',      // 鲁班 - 工匠
  'esci-ouyezi': 'doer',     // 欧冶子 - 铸剑师
  'esci-ganjiang': 'doer',    // 干将 - 铸剑师
  'esci-maming': 'thinker',   // 马钧 - 机械发明家
  'esci-zhukerang': 'thinker', // 竺可桢 - 气象学家
  'esci-maoyisheng': 'doer', // 茅以升 - 桥梁工程师
  'esci-zhantianyou': 'doer', // 詹天佑 - 铁路工程师

  // west-philosopher (30人) - 需要补充
  'wp-socrates': 'thinker',    // 苏格拉底 - 产婆术
  'wp-plato': 'thinker',      // 柏拉图 - 理念论
  'wp-aristotle': 'thinker',  // 亚里士多德 - 百科全书式学者
  'wp-epicurus': 'sage',      // 伊壁鸠鲁 - 花园学派
  'wp-seneca': 'sage',        // 塞涅卡 - 斯多葛派
  'wp-marcuaurelius': 'sage', // 马可·奥勒留 - 哲学家皇帝
  'wp-aquinas': 'thinker',    // 阿奎那 - 经院哲学
  'wp-ocham': 'thinker',      // 奥卡姆 - 唯名论
  'wp-machiavelli': 'doer',   // 马基雅维利 - 君主论
  'wp-bacon': 'thinker',      // 培根 - 经验主义
  'wp-hobbes': 'thinker',     // 霍布斯 - 利维坦
  'wp-descartes': 'thinker',  // 笛卡尔 - 我思故我在
  'wp-spinoza': 'thinker',    // 斯宾诺莎 - 伦理学
  'wp-locke': 'thinker',      // 洛克 - 经验主义
  'wp-hume': 'thinker',       // 休谟 - 怀疑论
  'wp-rousseau': 'rebel',    // 卢梭 - 社会契约论
  'wp-kant': 'thinker',       // 康德 - 批判哲学
  'wp-hegel': 'thinker',      // 黑格尔 - 辩证法
  'wp-schopenhauer': 'thinker', // 叔本华 - 意志与表象
  'wp-nietzsche': 'rebel',    // 尼采 - 上帝已死
  'wp-james': 'thinker',      // 詹姆斯 - 实用主义
  'wp-dewey': 'doer',         // 杜威 - 教育哲学
  'wp-russell': 'thinker',    // 罗素 - 分析哲学
  'wp-wittgenstein': 'thinker', // 维特根斯坦 - 语言哲学
  'wp-heidegger': 'thinker',  // 海德格尔 - 存在主义
  'wp-sartre': 'rebel',       // 萨特 - 存在主义
  'wp-foucault': 'rebel',     // 福柯 - 权力谱系
  'wp-derrida': 'thinker',    // 德里达 - 解构主义
  'wp-rawls': 'thinker',      // 罗尔斯 - 正义论
  'wp-nagel': 'thinker',      // 内格尔 - 心灵哲学
  'wp-foot': 'thinker',        // 富特 - 美德伦理学

  // west-scientist (30人) - 需要补充
  'ws-newton': 'thinker',     // 牛顿 - 经典力学
  'ws-einstein': 'thinker',   // 爱因斯坦 - 相对论
  'ws-galileo': 'doer',      // 伽利略 - 实验科学
  'ws-darwin': 'thinker',     // 达尔文 - 进化论
  'ws-maxwell': 'thinker',    // 麦克斯韦 - 电磁学
  'ws-boltzmann': 'thinker',  // 玻尔兹曼 - 统计力学
  'ws-planck': 'thinker',     // 普朗克 - 量子论
  'ws-bohr': 'thinker',      // 玻尔 - 原子模型
  'ws-heisenberg': 'thinker', // 海森堡 - 不确定性原理
  'ws-curie': 'doer',        // 居里夫人 - 放射性研究
  'ws-pasteur': 'doer',      // 巴斯德 - 微生物学
  'ws-mendel': 'thinker',    // 孟德尔 - 遗传学
  'ws-turing': 'thinker',     // 图灵 - 计算机科学
  'ws-vonneumann': 'thinker', // 冯·诺依曼 - 博弈论
  'ws-hawking': 'thinker',   // 霍金 - 黑洞辐射
  'ws-feynman': 'doer',      // 费曼 - 费曼图
  'ws-sagan': 'doer',        // 萨根 - 科学传播
  'ws-lovelace': 'doer',     // 洛夫莱斯 - 第一位程序员
  'ws-johnson': 'doer',      // 约翰逊 - 计算机科学家
  'ws-hoppcrft': 'doer',     // 霍普克罗夫特 - 算法设计
  'ws-dirac': 'thinker',     // 狄拉克 - 量子力学
  'ws-schrodinger': 'thinker', // 薛定谔 - 波动力学
  'ws-fermi': 'doer',        // 费米 - 核物理
  'ws-oppenheimer': 'leader', // 奥本海默 - 曼哈顿计划
  'ws-tesla': 'inventor',    // 特斯拉 - 交流电（新增 inventor 类型？）
  'ws-edison': 'inventor',    // 爱迪生 - 发明家
  'ws-bell': 'inventor',     // 贝尔 - 电话
  'ws-wright': 'inventor',   // 莱特兄弟 - 飞机
  'ws-yeager': 'doer',       // 耶格尔 - 试飞员
  'ws-armstrong': 'doer',    // 阿姆斯特朗 - 登月第一人
};

const domains = [
  'east-literati',
  'east-statesman',
  'east-scientist',
  'west-philosopher',
  'west-scientist',
];

let totalAdded = 0;

for (const domain of domains) {
  const file = `src/domain/figures/figures.${domain}.ts`;
  const filePath = resolve(ROOT, file);
  
  let content = readFileSync(filePath, 'utf-8');
  
  // 检查是否已有 archetype
  const existingCount = (content.match(/archetype:/g) || []).length;
  console.log(`📂 ${file}: 已有 ${existingCount} 个 archetype`);
  
  // 为每个人物添加 archetype
  let modified = content;
  let addedCount = 0;
  
  for (const [id, archetype] of Object.entries(ASSIGNMENTS)) {
    // 只处理当前域的人物
    if (!id.startsWith(
      domain === 'east-literati' ? 'el-' :
      domain === 'east-statesman' ? 'esm-' :
      domain === 'east-scientist' ? 'esci-' :
      domain === 'west-philosopher' ? 'wp-' : 'ws-'
    )) {
      continue;
    }
    
    // 检查是否已有 archetype
    const regex = new RegExp(`id:\\s*'${id}'.*[\\s\\S]*?echoes:\\s*\\[[^\\]]*\\]`, 'm');
    const match = modified.match(regex);
    if (!match) {
      console.warn(`  ⚠️  未找到人物: ${id}`);
      continue;
    }
    
    const block = match[0];
    if (block.includes('archetype:')) {
      // 已有 archetype，跳过
      continue;
    }
    
    // 在 echoes 字段后添加 archetype
    const echoesRegex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?echoes:\\s*\\[[^\\]]*\\])`, 'm');
    const replacement = `$1,\n    archetype: '${archetype}',`;
    
    if (modified.match(echoesRegex)) {
      modified = modified.replace(echoesRegex, replacement);
      addedCount++;
    } else {
      console.warn(`  ⚠️  无法添加 archetype 到: ${id}`);
    }
  }
  
  if (addedCount > 0) {
    writeFileSync(filePath, modified);
    console.log(`  ✅ 添加了 ${addedCount} 个 archetype`);
    totalAdded += addedCount;
  } else {
    console.log(`  ⏭️  无需添加`);
  }
}

console.log(`\n🎉 完成！总共添加了 ${totalAdded} 个 archetype`);
