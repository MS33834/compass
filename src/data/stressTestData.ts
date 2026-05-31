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
    text: '在过去一个月里，你有多少时间感到无法控制生活中的重要事情？', 
    trait: 'perceivedStress',
    reverse: false
  },
  { 
    id: 's2', 
    text: '在过去一个月里，你有多少时间感到紧张和有压力？', 
    trait: 'perceivedStress',
    reverse: false
  },
  { 
    id: 's3', 
    text: '在过去一个月里，你有多少时间感到神经紧张或焦虑？', 
    trait: 'perceivedStress',
    reverse: false
  },
  { 
    id: 's4', 
    text: '在过去一个月里，你有多少时间感到事情的发展超出了你的控制？', 
    trait: 'perceivedStress',
    reverse: false
  },
  { 
    id: 's5', 
    text: '在过去一个月里，你有多少时间感到你无法应付所有必须做的事情？', 
    trait: 'perceivedStress',
    reverse: false
  },
  { 
    id: 's6', 
    text: '在过去一个月里，你有多少时间感到困难堆积如山，无法克服？', 
    trait: 'perceivedStress',
    reverse: false
  },

  // ========== 维度2: 应对能力 (正向题目，反向计分) ==========
  { 
    id: 's7', 
    text: '在过去一个月里，你有多少时间感到能够成功应对生活中的重要变化？', 
    trait: 'coping',
    reverse: true
  },
  { 
    id: 's8', 
    text: '在过去一个月里，你有多少时间感到有信心处理好自己的问题？', 
    trait: 'coping',
    reverse: true
  },
  { 
    id: 's9', 
    text: '在过去一个月里，你有多少时间感到事情进展顺利？', 
    trait: 'coping',
    reverse: true
  },
  { 
    id: 's10', 
    text: '在过去一个月里，你有多少时间感到能够控制自己的情绪？', 
    trait: 'coping',
    reverse: true
  },
  { 
    id: 's11', 
    text: '在过去一个月里，你有多少时间感到生活中的事情都在掌控之中？', 
    trait: 'coping',
    reverse: true
  },
  { 
    id: 's12', 
    text: '在过去一个月里，你有多少时间感到能够有效应对困难？', 
    trait: 'coping',
    reverse: true
  },

  // ========== 维度3: 工作压力 ==========
  { 
    id: 'ext_work_1', 
    text: '工作负担过重让你感到压力大？', 
    trait: 'workStress',
    reverse: false
  },
  { 
    id: 'ext_work_2', 
    text: '工作/学习的时间压力让你难以承受？', 
    trait: 'workStress',
    reverse: false
  },
  { 
    id: 'ext_work_3', 
    text: '工作中的人际冲突让你感到困扰？', 
    trait: 'workStress',
    reverse: false
  },
  { 
    id: 'ext_work_4', 
    text: '对职业发展和未来的担忧让你感到压力？', 
    trait: 'workStress',
    reverse: false
  },
  { 
    id: 'ext_work_5', 
    text: '工作生活不平衡让你感到疲惫？', 
    trait: 'workStress',
    reverse: false
  },

  // ========== 维度4: 关系/家庭压力 ==========
  { 
    id: 'ext_relationship_1', 
    text: '与家人/伴侣的关系让你感到压力？', 
    trait: 'relationshipStress',
    reverse: false
  },
  { 
    id: 'ext_relationship_2', 
    text: '家庭责任让你感到不堪重负？', 
    trait: 'relationshipStress',
    reverse: false
  },
  { 
    id: 'ext_relationship_3', 
    text: '与朋友/社交关系的问题让你困扰？', 
    trait: 'relationshipStress',
    reverse: false
  },
  { 
    id: 'ext_relationship_4', 
    text: '缺乏社交支持让你感到孤独？', 
    trait: 'relationshipStress',
    reverse: false
  },

  // ========== 维度5: 健康压力 ==========
  { 
    id: 'ext_health_1', 
    text: '自己或家人的健康问题让你感到担忧？', 
    trait: 'healthStress',
    reverse: false
  },
  { 
    id: 'ext_health_2', 
    text: '睡眠质量问题让你感到压力？', 
    trait: 'healthStress',
    reverse: false
  },
  { 
    id: 'ext_health_3', 
    text: '长期感到疲劳或精力不足？', 
    trait: 'healthStress',
    reverse: false
  },

  // ========== 维度6: 财务压力 ==========
  { 
    id: 'ext_finance_1', 
    text: '经济压力让你感到焦虑？', 
    trait: 'financeStress',
    reverse: false
  },
  { 
    id: 'ext_finance_2', 
    text: '对未来经济状况的担忧让你不安？', 
    trait: 'financeStress',
    reverse: false
  },
  { 
    id: 'ext_finance_3', 
    text: '债务或财务问题让你感到压力？', 
    trait: 'financeStress',
    reverse: false
  },

  // ========== 维度7: 生理反应 ==========
  { 
    id: 'ext_physiological_1', 
    text: '经常感到头痛或身体紧张？', 
    trait: 'physiological',
    reverse: false
  },
  { 
    id: 'ext_physiological_2', 
    text: '食欲发生明显变化（吃太多或太少）？', 
    trait: 'physiological',
    reverse: false
  },
  { 
    id: 'ext_physiological_3', 
    text: '心率加快、呼吸急促或肠胃不适？', 
    trait: 'physiological',
    reverse: false
  },

  // ========== 维度8: 情绪反应 ==========
  { 
    id: 'ext_emotional_1', 
    text: '容易感到愤怒或烦躁？', 
    trait: 'emotional',
    reverse: false
  },
  { 
    id: 'ext_emotional_2', 
    text: '容易感到悲伤或情绪低落？', 
    trait: 'emotional',
    reverse: false
  },
  { 
    id: 'ext_emotional_3', 
    text: '情绪波动较大，难以控制？', 
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
