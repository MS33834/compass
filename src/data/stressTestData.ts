import { Assessment, Question } from '../types';

/**
 * 压力水平测试 - 扩展版 (基于PSS - Perceived Stress Scale)
 * 
 * 理论基础：
 * - 知觉压力量表 (PSS-10/PSS-14) 扩展到PSS-30
 * - 测量个体在过去一个月内对生活情境的主观压力感受
 * - 包含负向和正向题目，全面评估压力感受和应对能力
 * 
 * 扩展维度：
 * - 压力源（工作、家庭、社交、健康、财务）
 * - 情绪反应（焦虑、愤怒、抑郁、疲劳）
 * - 认知功能（注意力、决策、记忆）
 * - 生理反应（睡眠、食欲、健康）
 * - 应对资源（社会支持、自我效能、应对方式）
 * 
 * 评分系统：
 * - 0-30分：低压力水平
 * - 31-60分：中等压力水平
 * - 61-90分：高压力水平
 * - 91-120分：极高压力水平
 */

export const STRESS_TEST_ASSESSMENT: Assessment = {
  id: 'stress-test',
  title: '全面压力水平测试',
  description: '基于PSS量表的扩展版压力测评，深入分析压力源和应对能力，获得专业的分析和建议。',
  category: '健康',
  totalQuestions: 30,
  icon: '😌',
  difficulty: '中等',
  estimatedTime: '10分钟'
};

export const STRESS_TEST_QUESTIONS: Question[] = [
  // ========== 维度1: 知觉压力感受 (负向题目) ==========
  { 
    id: 's1', 
    text: '在过去一个月里，你有多少时间感到生活中重要的事情正脱离你的掌控，而你对此无能为力？', 
    trait: 'perceivedStress',
    reverse: false
  },
  { 
    id: 's2', 
    text: '在过去一个月里，你有多少时间感到一种持续的紧绷感，好像随时有一根弦绷在脑子里？', 
    trait: 'perceivedStress',
    reverse: false
  },
  { 
    id: 's3', 
    text: '在过去一个月里，你有多少时间感到神经像被拉满的弓弦，一点小小的刺激就会弹起来？', 
    trait: 'perceivedStress',
    reverse: false
  },
  { 
    id: 's4', 
    text: '在过去一个月里，你有多少时间感到事情正朝着你无法预料的方向发展，而你只能被动承受？', 
    trait: 'perceivedStress',
    reverse: false
  },
  { 
    id: 's5', 
    text: '在过去一个月里，你有多少时间面对待办事项清单感到窒息，觉得即使不睡觉也做不完？', 
    trait: 'perceivedStress',
    reverse: false
  },
  { 
    id: 's6', 
    text: '在过去一个月里，你有多少时间感到问题像滚雪球一样越滚越大，每解决一个又冒出两个新的？', 
    trait: 'perceivedStress',
    reverse: false
  },

  // ========== 维度2: 应对能力 (正向题目，反向计分) ==========
  { 
    id: 's7', 
    text: '在过去一个月里，你有多少时间感到面对生活的重大变化时，你有足够的资源和能力去适应？', 
    trait: 'coping',
    reverse: true
  },
  { 
    id: 's8', 
    text: '在过去一个月里，你有多少时间感到遇到问题时，你相信自己能找到解决的办法？', 
    trait: 'coping',
    reverse: true
  },
  { 
    id: 's9', 
    text: '在过去一个月里，你有多少时间感到生活的节奏在你的掌控之中，而不是被推着走？', 
    trait: 'coping',
    reverse: true
  },
  { 
    id: 's10', 
    text: '在过去一个月里，你有多少时间感到即使遇到挫折，你也能在合理时间内让自己的情绪平复下来？', 
    trait: 'coping',
    reverse: true
  },
  { 
    id: 's11', 
    text: '在过去一个月里，你有多少时间感到即使出现意外，你也有余力去调整和应对？', 
    trait: 'coping',
    reverse: true
  },
  { 
    id: 's12', 
    text: '在过去一个月里，你有多少时间感到面对困难时，你能够冷静分析并采取行动，而不是陷入无助？', 
    trait: 'coping',
    reverse: true
  },

  // ========== 维度3: 工作压力 ==========
  { 
    id: 'ext_work_1', 
    text: '我经常在下班后仍无法停止思考工作中的问题，即使那并不是紧急事务', 
    trait: 'workStress',
    reverse: false
  },
  { 
    id: 'ext_work_2', 
    text: '截止日期临近时，我会感到一种窒息般的紧迫感，即使提前开始了也觉得来不及', 
    trait: 'workStress',
    reverse: false
  },
  { 
    id: 'ext_work_3', 
    text: '工作中某些人的态度或行为让我消耗大量精力去应对，以至于正事反而做不好', 
    trait: 'workStress',
    reverse: false
  },
  { 
    id: 'ext_work_4', 
    text: '看到同龄人的职业进展，我会陷入自我怀疑，不确定自己是否走在了正确的路上', 
    trait: 'workStress',
    reverse: false
  },
  { 
    id: 'ext_work_5', 
    text: '我发现自己已经很久没有纯粹地享受一个没有工作打扰的周末了', 
    trait: 'workStress',
    reverse: false
  },

  // ========== 维度4: 关系/家庭压力 ==========
  { 
    id: 'ext_relationship_1', 
    text: '与家人或伴侣的某些对话总是以争吵或冷战收场，让我在开口之前就开始紧张', 
    trait: 'relationshipStress',
    reverse: false
  },
  { 
    id: 'ext_relationship_2', 
    text: '我承担的家庭责任让我几乎没有属于自己的时间，有时候会感到喘不过气', 
    trait: 'relationshipStress',
    reverse: false
  },
  { 
    id: 'ext_relationship_3', 
    text: '维护社交关系让我感到疲惫，有时候宁愿独处也不愿赴约，但独处时又觉得孤独', 
    trait: 'relationshipStress',
    reverse: false
  },
  { 
    id: 'ext_relationship_4', 
    text: '遇到困难时，我翻遍通讯录却找不到一个可以毫无顾虑倾诉的人', 
    trait: 'relationshipStress',
    reverse: false
  },

  // ========== 维度5: 健康压力 ==========
  { 
    id: 'ext_health_1', 
    text: '每当身体出现一点小症状，我就会忍不住往最坏的方向想，即使理智告诉我可能没什么', 
    trait: 'healthStress',
    reverse: false
  },
  { 
    id: 'ext_health_2', 
    text: '躺在床上脑子里还在不停转，好不容易睡着了又容易醒来，第二天像没睡一样', 
    trait: 'healthStress',
    reverse: false
  },
  { 
    id: 'ext_health_3', 
    text: '即使没有做太多事情，我也经常感到一种深入骨髓的疲惫，休息似乎也无法恢复精力', 
    trait: 'healthStress',
    reverse: false
  },

  // ========== 维度6: 财务压力 ==========
  { 
    id: 'ext_finance_1', 
    text: '即使目前的财务状况尚可，我仍会为未来可能的经济风险而辗转难眠', 
    trait: 'financeStress',
    reverse: false
  },
  { 
    id: 'ext_finance_2', 
    text: '每次看到物价上涨或经济新闻，我都会重新计算自己的存款还能撑多久', 
    trait: 'financeStress',
    reverse: false
  },
  { 
    id: 'ext_finance_3', 
    text: '每到还款日前后，我都会感到一阵焦虑，有时候不得不拆东墙补西墙', 
    trait: 'financeStress',
    reverse: false
  },

  // ========== 维度7: 生理反应 ==========
  { 
    id: 'ext_physiological_1', 
    text: '我经常在傍晚发现肩膀僵硬得像石头，或者太阳穴隐隐作痛，才意识到自己又紧张了一整天', 
    trait: 'physiological',
    reverse: false
  },
  { 
    id: 'ext_physiological_2', 
    text: '压力大的时候，我要么完全吃不下东西，要么不自觉地暴吃零食，很难保持正常的饮食习惯', 
    trait: 'physiological',
    reverse: false
  },
  { 
    id: 'ext_physiological_3', 
    text: '在压力特别大的时期，我的肠胃就像有了自己的情绪，稍微吃点东西就不舒服', 
    trait: 'physiological',
    reverse: false
  },

  // ========== 维度8: 情绪反应 ==========
  { 
    id: 'ext_emotional_1', 
    text: '一些以前能轻松应对的小事，现在却会让我瞬间火冒三丈，事后又觉得自己反应过度', 
    trait: 'emotional',
    reverse: false
  },
  { 
    id: 'ext_emotional_2', 
    text: '有时候并没有发生什么特别的事，但我就是感到一阵莫名的低落，对什么都提不起兴趣', 
    trait: 'emotional',
    reverse: false
  },
  { 
    id: 'ext_emotional_3', 
    text: '我的情绪像坐过山车，早上还觉得一切还好，下午就突然陷入低谷，自己也说不清为什么', 
    trait: 'emotional',
    reverse: false
  }
];

export const STRESS_RESPONSE_OPTIONS = [
  { value: 0, label: '从未' },
  { value: 1, label: '偶尔' },
  { value: 2, label: '有时' },
  { value: 3, label: '经常' },
  { value: 4, label: '总是' }
];

// 压力来源分析
export const STRESS_SOURCES = [
  { type: 'work', name: '工作压力', examples: ['工作量过大', '时间压力', '工作冲突', '职业发展'] },
  { type: 'relationship', name: '关系压力', examples: ['家庭矛盾', '朋友关系', '亲密关系', '社交压力'] },
  { type: 'health', name: '健康压力', examples: ['自身健康', '家人健康', '睡眠问题', '疲劳'] },
  { type: 'financial', name: '财务压力', examples: ['经济压力', '债务问题', '未来担忧'] },
  { type: 'lifeChange', name: '生活变化', examples: ['搬家', '工作变动', '失去亲友', '重大决策'] }
];

// 扩展版压力应对策略
export const COPING_STRATEGIES = {
  problemFocused: [
    { name: '制定计划', description: '将大问题分解成小步骤，制定具体行动计划' },
    { name: '时间管理', description: '学习优先级管理，使用时间管理工具' },
    { name: '寻求支持', description: '向朋友、家人或专业人士寻求帮助' },
    { name: '问题解决', description: '直接面对问题，寻找解决方案' },
    { name: '边界设定', description: '学会说不，保护自己的时间和能量' }
  ],
  emotionFocused: [
    { name: '冥想放松', description: '正念冥想、深呼吸、渐进式肌肉放松' },
    { name: '运动锻炼', description: '有氧运动、瑜伽、跑步等，释放压力激素' },
    { name: '艺术创作', description: '绘画、音乐、写作等表达性艺术' },
    { name: '自然接触', description: '接触自然、散步、户外活动' },
    { name: '情绪日记', description: '记录和分析自己的情绪反应' }
  ],
  avoidance: [
    { name: '健康回避', description: '暂时分散注意力，但不过度逃避' },
    { name: '设定边界', description: '学会说不，保护自己的时间和能量' },
    { name: '休息恢复', description: '给自己时间充电和恢复' }
  ]
};

// 扩展版压力水平解释
export const STRESS_LEVELS = {
  low: {
    name: '低压力水平',
    range: [0, 30],
    description: '你目前处于良好的压力管理状态，能够很好地应对生活中的各种挑战。保持现在的生活方式，继续关注自己的身心健康。',
    color: 'green',
    detailed: {
      physicalSigns: ['精力充沛', '睡眠良好', '食欲正常', '身体放松'],
      emotionalSigns: ['情绪稳定', '乐观积极', '平静自信', '能享受生活'],
      cognitiveSigns: ['思维清晰', '决策力强', '专注力好', '解决问题能力强'],
      socialSigns: ['社交活跃', '享受人际交往', '有支持网络', '善于沟通']
    }
  },
  medium: {
    name: '中等压力水平',
    range: [31, 60],
    description: '你正经历一定程度的压力，但还在可控范围内。适当调整生活节奏，采取一些压力管理措施会对你有帮助。',
    color: 'yellow',
    detailed: {
      physicalSigns: ['偶尔疲劳', '肌肉紧张', '睡眠质量波动', '食欲变化'],
      emotionalSigns: ['有时烦躁', '情绪波动', '担心未来', '偶尔感到不堪重负'],
      cognitiveSigns: ['注意力有时分散', '决策困难', '思虑过多', '记忆力轻微下降'],
      socialSigns: ['社交减少', '有时感到孤独', '沟通困难', '容易不耐烦']
    }
  },
  high: {
    name: '高压力水平',
    range: [61, 90],
    description: '你目前正经历较高的压力水平，这可能会影响你的身心健康。建议采取积极的应对措施，必要时寻求专业帮助。',
    color: 'orange',
    detailed: {
      physicalSigns: ['持续疲劳', '睡眠问题明显', '头痛/肌肉紧张', '消化问题', '免疫系统下降'],
      emotionalSigns: ['持续焦虑', '情绪低落', '易怒', '感到绝望', '失去兴趣'],
      cognitiveSigns: ['难以集中注意力', '决策困难', '消极思维', '记忆力下降', '感到不知所措'],
      socialSigns: ['社交回避', '孤立自己', '关系冲突', '缺乏支持感']
    }
  },
  extreme: {
    name: '极高压力水平',
    range: [91, 120],
    description: '你目前正经历严重的压力危机，这可能严重影响你的身心健康。请立即寻求专业帮助，不要独自面对。',
    color: 'red',
    detailed: {
      physicalSigns: ['严重身体不适', '几乎无法入睡', '明显的身体症状', '可能需要医疗关注'],
      emotionalSigns: ['极度痛苦', '感到崩溃', '可能有抑郁或焦虑发作', '情绪麻木或失控'],
      cognitiveSigns: ['基本无法正常思考', '判断力受损', '可能有灾难化思维', '考虑极端情况'],
      socialSigns: ['完全孤立', '关系可能破裂', '无法工作或学习', '基本功能受损']
    }
  }
};

// 压力维度详细分析
export const STRESS_DIMENSIONS = {
  perceivedStress: {
    name: '知觉压力感受',
    description: '主观感受到的压力程度和控制感',
    tips: ['练习正念觉察', '写压力日记', '认知重构']
  },
  coping: {
    name: '应对能力',
    description: '你应对压力的有效程度',
    tips: ['建立应对工具箱', '寻求社会支持', '培养心理弹性']
  },
  workStress: {
    name: '工作压力',
    description: '来自职业/学业的压力程度',
    tips: ['更好的时间管理', '工作边界设定', '职业发展规划']
  },
  relationshipStress: {
    name: '关系压力',
    description: '人际关系带来的压力',
    tips: ['沟通技巧提升', '建立健康边界', '寻求关系辅导']
  },
  healthStress: {
    name: '健康压力',
    description: '健康相关的压力',
    tips: ['健康管理', '改善睡眠', '建立医疗支持系统']
  },
  financeStress: {
    name: '财务压力',
    description: '财务相关的压力',
    tips: ['财务规划', '预算管理', '寻求专业财务建议']
  },
  physiological: {
    name: '生理反应',
    description: '压力在身体上的表现',
    tips: ['放松训练', '规律运动', '关注身体信号']
  },
  emotional: {
    name: '情绪反应',
    description: '压力在情绪上的表现',
    tips: ['情绪调节', '表达情绪', '心理辅导']
  }
};

// 压力阶段模型
export const STRESS_STAGES = {
  alarm: {
    name: '警报阶段',
    description: '身体识别压力源，启动"战或逃"反应',
    signs: ['心跳加速', '血压升高', '肌肉紧张', '警觉性提高'],
    coping: '这是正常的保护反应，给你能量应对挑战'
  },
  resistance: {
    name: '抵抗阶段',
    description: '身体持续应对压力，试图恢复平衡',
    signs: ['持续紧张', '疲劳感', '易怒', '睡眠困扰'],
    coping: '需要积极管理压力，避免进入衰竭阶段'
  },
  exhaustion: {
    name: '衰竭阶段',
    description: '长期压力导致身心资源耗尽',
    signs: ['严重疲劳', '免疫力下降', '情绪枯竭', '功能受损'],
    coping: '需要专业干预，严重时请寻求医疗帮助'
  }
};

// 压力-表现曲线
export const PERFORMANCE_CURVE = {
  tooLow: {
    state: '低压力-低表现',
    description: '压力太低，缺乏动力和刺激，表现不佳',
    tips: ['设定有挑战性的目标', '增加一些变化和刺激', '寻找新的挑战']
  },
  optimal: {
    state: '最佳压力-最佳表现',
    description: '压力适中，动机和表现达到最佳平衡点',
    tips: ['保持这种状态', '继续目前的节奏', '享受高效的状态']
  },
  tooHigh: {
    state: '高压力-低表现',
    description: '压力过大，超过负荷，表现下降',
    tips: ['减压措施', '重新评估任务', '寻求支持']
  }
};

// 压力自我评估清单
export const STRESS_CHECKLIST = {
  warningSigns: [
    '睡眠质量下降',
    '感到疲惫不堪',
    '情绪波动大',
    '注意力难以集中',
    '逃避社交活动',
    '饮食习惯改变',
    '过度使用手机/娱乐',
    '身体不适（头痛、胃痛等）',
    '对事物失去兴趣',
    '易怒或不耐烦'
  ],
  protectiveFactors: [
    '有可信赖的朋友/家人',
    '规律的运动习惯',
    '充足的睡眠',
    '放松爱好（阅读、音乐等）',
    '信仰或精神实践',
    '明确的生活目标',
    '健康的边界',
    '积极的自我对话'
  ]
};

// 健康生活方式指南
export const HEALTHY_HABITS = {
  sleep: [
    '保持规律的睡眠时间',
    '创造良好的睡眠环境',
    '睡前1小时避免屏幕',
    '7-9小时睡眠时间'
  ],
  nutrition: [
    '均衡饮食，减少咖啡因和糖',
    '多喝水，保持水分',
    '规律进食，不要跳餐',
    '增加 Omega-3 摄入'
  ],
  movement: [
    '每天30分钟中等强度运动',
    '寻找你喜欢的运动方式',
    '散步、跑步、瑜伽、游泳',
    '每周至少5天'
  ],
  social: [
    '保持社交联系',
    '与支持你的人相处',
    '学会倾诉和倾听',
    '建立健康边界'
  ]
};

// 专业资源
export const PROFESSIONAL_RESOURCES = {
  whenToSeekHelp: [
    '压力持续超过2周',
    '影响日常功能（工作、学习、关系）',
    '出现焦虑或抑郁症状',
    '使用不健康的应对方式（酗酒、滥用药物等）',
    '有自残或自杀想法（立即寻求紧急帮助）'
  ],
  professionals: [
    '心理咨询师/心理治疗师',
    '精神科医生（如需要药物治疗）',
    '压力管理教练',
    '健康教练',
    '全科医生（家庭医生）'
  ],
  therapyTypes: [
    '认知行为疗法(CBT) - 压力管理首选',
    '正念减压疗法(MBSR)',
    '接纳与承诺疗法(ACT)',
    '心理动力学治疗',
    '团体治疗'
  ]
};
