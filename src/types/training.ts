export type TrainingCategory =
  | 'breathing'
  | 'meditation'
  | 'mindfulness'
  | 'cognitive'
  | 'relaxation'
  | 'journaling'
  | 'exercise'
  | 'sleep'
  | 'nutrition';

export interface Training {
  id: string;
  title: string;
  description: string;
  category: TrainingCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  estimatedTime: string;
  targetTraits: string[];
  suitableFor: {
    stressLevel?: number;
    anxietyLevel?: number;
    personalityTypes?: string[];
  };
  steps: TrainingStep[];
  tips: string[];
  benefits: string[];
  prerequisites?: string[];
  resources?: Resource[];
  effectivenessScore?: number;
}

export interface TrainingStep {
  id: string;
  title: string;
  description: string;
  duration?: number;
  type?: 'instruction' | 'exercise' | 'meditation' | 'reflection' | 'cognitive' | 'mindfulness';
  media?: MediaContent;
  instructions?: string[];
}

export interface Resource {
  type: 'video' | 'audio' | 'image' | 'text' | 'link';
  url: string;
  title: string;
  description?: string;
}

export interface MediaContent {
  type: 'image' | 'audio' | 'video';
  url: string;
  alt?: string;
}

export interface TrainingSession {
  id: string;
  trainingId: string;
  userId: string;
  startedAt: number;
  completedAt?: number;
  duration?: number;
  currentStep?: number;
  stepsCompleted: number[];
  notes?: string;
  rating?: number;
  feedback?: string;
  moodBefore?: number;
  moodAfter?: number;
}

export interface TrainingProgress {
  trainingId: string;
  userId: string;
  totalSessions: number;
  completedSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticedAt?: number;
  averageRating?: number;
  totalTime: number;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  type: 'sessions' | 'streak' | 'duration' | 'achievement';
  value: number;
  achievedAt: number;
  name: string;
  description: string;
  icon: string;
}

export interface TrainingRecommendation {
  trainingId: string;
  reason: string;
  score: number;
  source: 'assessment' | 'history' | 'user_preference' | 'popular';
}

export interface TrainingSchedule {
  id: string;
  trainingId: string;
  userId: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'custom';
  time: string;
  days?: number[];
  reminder?: boolean;
  active: boolean;
  nextReminder?: number;
}

export interface TrainingCategoryInfo {
  category: TrainingCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const TRAINING_CATEGORIES: TrainingCategoryInfo[] = [
  {
    category: 'breathing',
    name: '呼吸训练',
    description: '通过呼吸调节来放松身心',
    icon: '🌬️',
    color: '#3B82F6',
  },
  {
    category: 'meditation',
    name: '冥想训练',
    description: '专注冥想和正念练习',
    icon: '🧘',
    color: '#8B5CF6',
  },
  {
    category: 'mindfulness',
    name: '正念训练',
    description: '培养当下的觉察力',
    icon: '🌸',
    color: '#06B6D4',
  },
  {
    category: 'cognitive',
    name: '认知训练',
    description: '重塑思维模式和信念',
    icon: '🧠',
    color: '#F59E0B',
  },
  {
    category: 'relaxation',
    name: '放松训练',
    description: '放松肌肉和舒缓紧张',
    icon: '😌',
    color: '#10B981',
  },
  {
    category: 'journaling',
    name: '日记书写',
    description: '通过书写整理思绪',
    icon: '📔',
    color: '#EC4899',
  },
  {
    category: 'exercise',
    name: '运动训练',
    description: '通过身体活动改善情绪',
    icon: '🏃',
    color: '#EF4444',
  },
  {
    category: 'sleep',
    name: '睡眠改善',
    description: '提升睡眠质量',
    icon: '🌙',
    color: '#6366F1',
  },
  {
    category: 'nutrition',
    name: '营养指导',
    description: '通过饮食改善心理健康',
    icon: '🥗',
    color: '#84CC16',
  },
];

export const DEFAULT_TRAININGS: Training[] = [
  {
    id: 'breathing-478',
    title: '4-7-8 呼吸法',
    description: '简单有效的放松呼吸练习，有助于缓解焦虑和促进睡眠',
    category: 'breathing',
    difficulty: 'beginner',
    duration: 5,
    estimatedTime: '5分钟',
    targetTraits: ['情绪稳定性', '焦虑倾向'],
    suitableFor: {
      anxietyLevel: 1,
    },
    steps: [
      {
        id: 'step-1',
        title: '准备姿势',
        description: '找一个舒适的地方坐下或躺下，保持背部挺直',
        duration: 30,
        type: 'instruction',
      },
      {
        id: 'step-2',
        title: '吸气 4 秒',
        description: '用鼻子慢慢吸气，数 4 秒',
        duration: 4,
        type: 'exercise',
      },
      {
        id: 'step-3',
        title: '屏息 7 秒',
        description: '屏住呼吸，数 7 秒',
        duration: 7,
        type: 'exercise',
      },
      {
        id: 'step-4',
        title: '呼气 8 秒',
        description: '用嘴慢慢呼气，数 8 秒',
        duration: 8,
        type: 'exercise',
      },
      {
        id: 'step-5',
        title: '重复练习',
        description: '重复这个循环 4-7 次',
        duration: 60,
        type: 'exercise',
      },
    ],
    tips: ['刚开始可以放慢节奏，逐渐适应', '练习时闭上眼睛效果更好', '每天坚持 2-3 次效果最佳'],
    benefits: ['快速缓解焦虑情绪', '促进睡眠质量', '降低应激激素水平', '提升专注力'],
  },
  {
    id: 'body-scan',
    title: '身体扫描冥想',
    description: '系统地觉察身体各部位的感受，释放紧张和压力',
    category: 'meditation',
    difficulty: 'beginner',
    duration: 10,
    estimatedTime: '10分钟',
    targetTraits: ['情绪稳定性', '压力管理'],
    suitableFor: {
      stressLevel: 1,
    },
    steps: [
      {
        id: 'step-1',
        title: '准备',
        description: '舒适地躺下或坐下，闭上眼睛',
        duration: 60,
        type: 'instruction',
      },
      {
        id: 'step-2',
        title: '关注脚部',
        description: '将注意力带到双脚，感受脚底的感觉',
        duration: 60,
        type: 'meditation',
      },
      {
        id: 'step-3',
        title: '移动到双腿',
        description: '慢慢将注意力向上移动到小腿、膝盖、大腿',
        duration: 90,
        type: 'meditation',
      },
      {
        id: 'step-4',
        title: '躯干和手臂',
        description: '继续向上到腹部、胸部、背部、手臂',
        duration: 90,
        type: 'meditation',
      },
      {
        id: 'step-5',
        title: '头部和面部',
        description: '最后到颈部、头部和面部',
        duration: 60,
        type: 'meditation',
      },
      {
        id: 'step-6',
        title: '整体觉察',
        description: '感受整个身体的存在',
        duration: 60,
        type: 'meditation',
      },
    ],
    tips: ['不需要特别做什么，只是观察', '如果走神了，温柔地拉回来', '不要评判任何感受'],
    benefits: ['缓解身体紧张', '培养觉察力', '减轻压力', '改善身体意识'],
  },
  {
    id: 'stress-manage',
    title: '压力管理练习',
    description: '学习识别和管理压力源的实用技巧',
    category: 'cognitive',
    difficulty: 'intermediate',
    duration: 15,
    estimatedTime: '15分钟',
    targetTraits: ['压力管理', '情绪调节'],
    suitableFor: {
      stressLevel: 2,
    },
    steps: [
      {
        id: 'step-1',
        title: '识别压力源',
        description: '写下当前让你感到压力的事情',
        duration: 180,
        type: 'reflection',
      },
      {
        id: 'step-2',
        title: '评估可控性',
        description: '区分哪些是你能控制的，哪些不能',
        duration: 120,
        type: 'exercise',
      },
      {
        id: 'step-3',
        title: '制定行动计划',
        description: '为可控的事情制定具体行动步骤',
        duration: 180,
        type: 'exercise',
      },
      {
        id: 'step-4',
        title: '接受不可控',
        description: '练习接受那些无法改变的事情',
        duration: 120,
        type: 'reflection',
      },
    ],
    tips: ['定期回顾和更新你的压力源列表', '每次只处理 1-2 个问题', '庆祝小的成功'],
    benefits: ['提升掌控感', '减少无力感', '改善情绪状态', '增强应对能力'],
  },
  {
    id: 'gratitude-journal',
    title: '感恩日记',
    description: '培养感恩心态，提升生活满意度',
    category: 'journaling',
    difficulty: 'beginner',
    duration: 5,
    estimatedTime: '5分钟',
    targetTraits: ['宜人性', '情绪稳定性'],
    suitableFor: {},
    steps: [
      {
        id: 'step-1',
        title: '准备',
        description: '准备好笔记本和笔',
        duration: 30,
        type: 'instruction',
      },
      {
        id: 'step-2',
        title: '写下三件事',
        description: '写下今天让你感恩的三件事',
        duration: 180,
        type: 'exercise',
      },
      {
        id: 'step-3',
        title: '反思感受',
        description: '感受这些事情带给你的积极情绪',
        duration: 60,
        type: 'reflection',
      },
    ],
    tips: ['晚上睡觉前练习效果最佳', '从小事开始', '保持真诚，不要应付'],
    benefits: ['提升幸福感', '改善睡眠', '增强积极情绪', '培养乐观心态'],
  },
  {
    id: 'muscle-relaxation',
    title: '渐进式肌肉放松',
    description: '通过紧张和放松肌肉来释放身体紧张',
    category: 'relaxation',
    difficulty: 'beginner',
    duration: 12,
    estimatedTime: '12分钟',
    targetTraits: ['情绪稳定性', '压力管理'],
    suitableFor: {
      stressLevel: 1,
    },
    steps: [
      {
        id: 'step-1',
        title: '准备姿势',
        description: '舒适地躺下，手臂放在身体两侧',
        duration: 60,
        type: 'instruction',
      },
      {
        id: 'step-2',
        title: '手部',
        description: '紧握拳头 5 秒，然后放松 10 秒',
        duration: 45,
        type: 'exercise',
      },
      {
        id: 'step-3',
        title: '手臂',
        description: '绷紧二头肌 5 秒，然后放松 10 秒',
        duration: 45,
        type: 'exercise',
      },
      {
        id: 'step-4',
        title: '肩膀',
        description: '耸肩向耳朵 5 秒，然后放松 10 秒',
        duration: 45,
        type: 'exercise',
      },
      {
        id: 'step-5',
        title: '脸部',
        description: '皱紧面部肌肉 5 秒，然后放松 10 秒',
        duration: 45,
        type: 'exercise',
      },
      {
        id: 'step-6',
        title: '腹部',
        description: '绷紧腹部 5 秒，然后放松 10 秒',
        duration: 45,
        type: 'exercise',
      },
      {
        id: 'step-7',
        title: '腿部',
        description: '伸直腿，绷紧 5 秒，然后放松 10 秒',
        duration: 45,
        type: 'exercise',
      },
      {
        id: 'step-8',
        title: '脚部',
        description: '弯脚趾 5 秒，然后放松 10 秒',
        duration: 45,
        type: 'exercise',
      },
      {
        id: 'step-9',
        title: '全身放松',
        description: '感受整个身体完全放松的状态',
        duration: 90,
        type: 'meditation',
      },
    ],
    tips: ['紧张时不要过度用力', '关注放松时的温暖和沉重感', '每天练习效果更好'],
    benefits: ['缓解肌肉紧张', '降低焦虑水平', '改善睡眠', '促进身体放松'],
  },
  {
    id: 'anxiety-coping',
    title: '焦虑应对技巧',
    description: '应对焦虑发作和过度担忧的实用方法',
    category: 'mindfulness',
    difficulty: 'intermediate',
    duration: 10,
    estimatedTime: '10分钟',
    targetTraits: ['情绪稳定性', '焦虑倾向'],
    suitableFor: {
      anxietyLevel: 2,
    },
    steps: [
      {
        id: 'step-1',
        title: '5-4-3-2-1 接地技术',
        description:
          '说出你能看到的 5 件事，4 件能触摸的，3 件能听到的，2 件能闻到的，1 件能尝到的',
        duration: 120,
        type: 'exercise',
      },
      {
        id: 'step-2',
        title: '识别想法',
        description: '注意你在想什么，不要评判',
        duration: 90,
        type: 'reflection',
      },
      {
        id: 'step-3',
        title: '挑战想法',
        description: '问自己：这是真的吗？有什么证据？',
        duration: 120,
        type: 'cognitive',
      },
      {
        id: 'step-4',
        title: '现实检查',
        description: '最坏的情况是什么？最好的情况是什么？最可能的情况是什么？',
        duration: 120,
        type: 'cognitive',
      },
      {
        id: 'step-5',
        title: '回到当下',
        description: '将注意力重新带回呼吸和身体',
        duration: 60,
        type: 'mindfulness',
      },
    ],
    tips: [
      '在焦虑刚出现时就开始练习',
      '把这些步骤写在手机里，方便随时查看',
      '多次练习，直到能熟练应用',
    ],
    benefits: ['快速缓解焦虑', '增强应对能力', '减少灾难性思维', '提升情绪调节能力'],
  },
];
