# 网站实习心理测评与管理训练系统 - 功能扩展详细计划

## 一、项目概述

### 1.1 项目名称
网站实习心理测评与管理训练系统 (BadHope)

### 1.2 核心目标
基于现有心理健康测评系统，进行全面功能扩展和架构优化，实现个人数据中心、心理训练模块、插件化架构、数据安全与分享功能的完整实现。

### 1.3 设计原则
- **完整性**: 不能偷工减料，不能简化，不能减少内容
- **加强优化**: 想办法加强与优化各个部分
- **实时修复**: 发现问题要立即修复和修补
- **松耦合**: 插件化模块化架构，便于扩展
- **数据安全**: AES加密存储，操作溯源
- **用户体验**: 差异化界面，多格式导出，分享功能

---

## 二、功能模块详细规划

### 模块一：通用测评数据抽象层

#### 1.1 目标
建立统一的数据抽象层，实现所有测评数据的标准化管理和自动同步。

#### 1.2 实现内容

**1.2.1 创建统一数据结构**
```typescript
// 测评结果统一接口
interface UnifiedAssessmentResult {
  id: string;
  assessmentId: string;
  assessmentType: 'personality' | 'stress' | 'anxiety' | 'future';
  title: string;
  timestamp: number;
  totalScore: number;
  traits: Array<{
    name: string;
    score: number;
    description: string;
    percentile?: number;
  }>;
  rawAnswers: Record<string, number>;
  processedScores: Record<string, number>;
  report: DetailedReport;
  tags: string[];
  metadata: {
    duration: number;
    completed: boolean;
    version: string;
  };
}
```

**1.2.2 开发数据同步服务**
- `DataSyncService`: 自动同步所有历史测评到个人中心
- `DataMigrationService`: 数据格式迁移和版本更新
- `DataValidationService`: 数据完整性验证
- `DataAggregationService`: 数据聚合和分析

**1.2.3 实现个人数据中心存储**
- 整合所有测评结果到统一个人数据中心
- 支持历史数据导入和导出
- 数据版本管理和回滚
- 自动备份机制

#### 1.3 关键文件
- `src/services/dataAbstraction/DataSyncService.ts`
- `src/services/dataAbstraction/DataMigrationService.ts`
- `src/services/dataAbstraction/DataValidationService.ts`
- `src/services/dataAbstraction/DataAggregationService.ts`
- `src/types/dataAbstraction.ts`

---

### 模块二：可视化个人数据看板

#### 2.1 目标
开发直观的可视化界面，展示用户心理健康数据的长期变化趋势和多维度对比。

#### 2.2 实现内容

**2.2.1 折线图展示多次测评得分变化**
- 支持选择特定测评类型和时间范围
- 显示多个测评的时间序列变化
- 标记关键事件和转折点
- 支持缩放和平移交互
- 显示得分趋势线和统计指标

**2.2.2 雷达图对比不同特质得分**
- 大五人格五维雷达图
- 多时间段特质对比
- 突出优势和待提升领域
- 动态加载和更新
- 交互式数据点详情

**2.2.3 个性化标签系统**
```typescript
// 自动标签规则
const AUTO_TAGS = {
  'high_stability': { condition: (score) => score > 70, label: '情绪稳定' },
  'improving': { condition: (history) => calculateTrend(history) > 0.1, label: '持续进步' },
  'stable': { condition: (history) => calculateVariance(history) < 0.05, label: '状态稳定' },
  'attention_needed': { condition: (score) => score > 14, label: '需要关注' },
  'stressed': { condition: (score) => score > 20, label: '压力较高' },
  'anxious': { condition: (score) => score > 10, label: '焦虑倾向' },
  'balanced': { condition: (scores) => checkBalance(scores), label: '人格平衡' },
  'creative': { condition: (score) => score > 75, label: '高开放性' },
};

// 用户自定义标签
interface UserTag {
  id: string;
  name: string;
  color: string;
  icon?: string;
  criteria?: TagCriteria;
  manual: boolean;
}
```

**2.2.4 阶段性心理健康总结**
- 周报生成
- 月报生成
- 季度报告
- 年度总结
- AI辅助洞察分析

**2.2.5 看板UI组件**
```typescript
// 核心看板组件
interface DashboardProps {
  userId: string;
  dateRange: DateRange;
  selectedAssessments: string[];
  viewMode: 'timeline' | 'radar' | 'summary';
}

// 子组件
- TimeSeriesChart: 时间序列折线图
- RadarChart: 雷达图对比
- TagCloud: 标签云展示
- SummaryCard: 总结卡片
- TrendIndicator: 趋势指示器
- ProgressTracker: 进度追踪器
```

#### 2.3 关键文件
- `src/components/dashboard/PersonalDashboard.tsx`
- `src/components/dashboard/TimeSeriesChart.tsx`
- `src/components/dashboard/RadarChart.tsx`
- `src/components/dashboard/TagCloud.tsx`
- `src/components/dashboard/SummaryReport.tsx`
- `src/services/dashboard/DashboardService.ts`
- `src/services/dashboard/TagService.ts`
- `src/services/dashboard/ReportGenerator.ts`

---

### 模块三：可插拔的测评渲染系统

#### 3.1 目标
实现支持不同测评类型使用独立交互布局和主题风格的灵活渲染系统。

#### 3.2 实现内容

**3.2.1 差异化界面布局**
```typescript
// 测评类型配置
interface AssessmentLayoutConfig {
  assessmentId: string;
  layoutType: 'card' | 'timeline' | 'grid' | 'custom';
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  questionDisplay: 'single' | 'batch' | 'all';
  navigationStyle: 'vertical' | 'horizontal' | 'floating';
  progressIndicator: 'bar' | 'dots' | 'steps';
  feedbackStyle: 'immediate' | 'end' | 'adaptive';
}

// 现有测评的布局配置
const LAYOUT_CONFIGS = {
  'big-five': {
    layoutType: 'card',
    theme: { primary: '#4F46E5', secondary: '#818CF8', accent: '#C7D2FE', background: '#EEF2FF' },
    questionDisplay: 'single',
    navigationStyle: 'vertical',
    progressIndicator: 'bar',
    feedbackStyle: 'end',
  },
  'stress-test': {
    layoutType: 'timeline',
    theme: { primary: '#059669', secondary: '#34D399', accent: '#A7F3D0', background: '#ECFDF5' },
    questionDisplay: 'batch',
    navigationStyle: 'floating',
    progressIndicator: 'steps',
    feedbackStyle: 'adaptive',
  },
  'anxiety-gad7': {
    layoutType: 'card',
    theme: { primary: '#0891B2', secondary: '#22D3EE', accent: '#A5F3FC', background: '#ECFEFF' },
    questionDisplay: 'single',
    navigationStyle: 'vertical',
    progressIndicator: 'dots',
    feedbackStyle: 'immediate',
  },
};
```

**3.2.2 主题配色系统**
- 每个测评独立配色方案
- 动态主题切换
- 渐变色和纹理支持
- 深色模式适配
- 无障碍颜色对比

**3.2.3 交互形式多样化**
- 卡片式问答（心理测评）
- 时间线式问答（压力评估）
- 网格布局（快速测试）
- 拖拽交互（偏好排序）
- 滑动条交互（程度评估）

**3.2.4 渲染引擎核心**
```typescript
// 可插拔渲染引擎
class AssessmentRenderer {
  private layouts: Map<string, AssessmentLayout>;
  private themes: Map<string, ThemeConfig>;
  
  registerLayout(assessmentId: string, layout: AssessmentLayout): void;
  registerTheme(themeId: string, theme: ThemeConfig): void;
  render(assessment: Assessment): React.ReactNode;
  updateLayout(assessmentId: string, config: Partial<AssessmentLayoutConfig>): void;
}

// 布局抽象
interface AssessmentLayout {
  renderQuestions(questions: Question[]): React.ReactNode;
  renderProgress(progress: ProgressData): React.ReactNode;
  renderNavigation(nav: NavigationData): React.ReactNode;
  getStyles(): CSSProperties;
}
```

#### 3.3 关键文件
- `src/services/renderer/AssessmentRenderer.ts`
- `src/services/renderer/LayoutManager.ts`
- `src/services/renderer/ThemeEngine.ts`
- `src/configs/assessmentLayouts.ts`
- `src/configs/assessmentThemes.ts`
- `src/components/renderer/QuestionCard.tsx`
- `src/components/renderer/QuestionTimeline.tsx`
- `src/components/renderer/QuestionGrid.tsx`

---

### 模块四：插件化架构系统

#### 4.1 目标
实现独立测评和训练模块的动态加载，采用松耦合的插件化设计。

#### 4.2 实现内容

**4.2.1 插件系统核心架构**
```typescript
// 插件接口定义
interface AssessmentPlugin {
  id: string;
  name: string;
  version: string;
  type: 'assessment' | 'training';
  category: string;
  config: PluginConfig;
  components: PluginComponents;
  services: PluginServices;
  hooks: PluginHooks;
  lifecycle: PluginLifecycle;
}

// 生命周期管理
interface PluginLifecycle {
  onInstall: () => Promise<void>;
  onUninstall: () => Promise<void>;
  onActivate: () => Promise<void>;
  onDeactivate: () => Promise<void>;
  onUpdate: (version: string) => Promise<void>;
}

// 钩子系统
interface PluginHooks {
  beforeRender?: (context: RenderContext) => RenderContext;
  afterRender?: (result: RenderResult) => void;
  onCalculate?: (answers: Answers) => ScoreResult;
  onGenerateReport?: (data: ReportData) => DetailedReport;
  onStore?: (result: AssessmentResult) => Promise<void>;
}
```

**4.2.2 插件注册系统**
```typescript
// 插件注册表
class PluginRegistry {
  private plugins: Map<string, AssessmentPlugin>;
  private dependencies: Map<string, string[]>;
  
  register(plugin: AssessmentPlugin): void;
  unregister(pluginId: string): void;
  get(pluginId: string): AssessmentPlugin | undefined;
  getAll(): AssessmentPlugin[];
  getByType(type: 'assessment' | 'training'): AssessmentPlugin[];
  getDependencies(pluginId: string): AssessmentPlugin[];
  
  // 依赖解析
  resolveDependencies(pluginId: string): AssessmentPlugin[];
  
  // 版本检查
  checkCompatibility(plugin: AssessmentPlugin): boolean;
}
```

**4.2.3 动态加载系统**
- 运行时插件加载
- 按需加载优化
- 插件资源管理
- 错误隔离和恢复
- 热更新支持

**4.2.4 配置文件管理**
```typescript
// 插件配置文件
interface PluginConfigFile {
  version: string;
  plugins: {
    assessment: AssessmentPluginMeta[];
    training: TrainingPluginMeta[];
  };
  settings: GlobalSettings;
  theme: ThemeSettings;
}

// 插件元数据
interface AssessmentPluginMeta {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  entry: string;
  dependencies: string[];
  permissions: string[];
  autoActivate: boolean;
}
```

#### 4.3 关键文件
- `src/core/PluginSystem.ts`
- `src/core/PluginRegistry.ts`
- `src/core/PluginLoader.ts`
- `src/core/PluginLifecycle.ts`
- `src/core/HookSystem.ts`
- `src/configs/pluginRegistry.ts`
- `src/configs/pluginPermissions.ts`

---

### 模块五：个人心理训练模块

#### 5.1 目标
为每个测评绑定针对性的训练内容，根据测评结果自动推送匹配的训练项目。

#### 5.2 实现内容

**5.2.1 训练内容库**
```typescript
// 训练项目接口
interface TrainingModule {
  id: string;
  name: string;
  category: TrainingCategory;
  targetAssessment: string;
  targetTraits: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // 分钟
  frequency: 'daily' | 'weekly' | 'as_needed';
  content: TrainingContent;
  progress: TrainingProgress;
  effectiveness: EffectivenessMetrics;
}

// 训练类别
type TrainingCategory = 
  | 'breathing'      // 呼吸训练
  | 'meditation'     // 冥想训练
  | 'cognitive'      // 认知训练
  | 'mindfulness'    // 正念训练
  | 'relaxation'     // 放松训练
  | 'journaling'     // 日记书写
  | 'exercise'       // 运动训练
  | 'social'         // 社交训练
  | 'sleep'          // 睡眠训练
  | 'nutrition';     // 营养指导

// 训练内容结构
interface TrainingContent {
  intro: {
    title: string;
    description: string;
    duration: string;
    benefits: string[];
  };
  steps: TrainingStep[];
  exercises: TrainingExercise[];
  resources: Resource[];
  tips: string[];
  assessments: SelfCheckQuestion[];
}
```

**5.2.2 训练内容示例**
```typescript
// 大五人格训练内容
const PERSONALITY_TRAINING = {
  // 开放性提升训练
  'openness_enhance': {
    id: 'training_openness_enhance',
    name: '开放性思维训练',
    category: 'cognitive',
    targetTraits: ['openness'],
    exercises: [
      {
        type: 'creativity',
        name: '创意联想练习',
        description: '随机选择一个物品，想出至少10种不同寻常的用途',
        duration: 10,
        repetitions: 3,
      },
      {
        type: 'perspective',
        name: '视角转换练习',
        description: '选择一个观点，用3种完全不同的角度来审视它',
        duration: 15,
        repetitions: 2,
      },
    ],
    exercises: [...],
  },
  
  // 情绪稳定性提升训练
  'stability_enhance': {
    id: 'training_stability_enhance',
    name: '情绪调节训练',
    category: 'relaxation',
    targetTraits: ['emotionalStability'],
    exercises: [
      {
        type: 'breathing',
        name: '4-7-8呼吸法',
        description: '吸气4秒，屏息7秒，呼气8秒',
        duration: 5,
        repetitions: 4,
      },
      {
        type: 'grounding',
        name: '5-4-3-2-1感官练习',
        description: '识别5个看到的、4个触摸的、3个听到的、2个闻到的、1个尝到的事物',
        duration: 5,
        repetitions: 3,
      },
    ],
  },
};

// 压力管理训练内容
const STRESS_TRAINING = {
  'stress_management': {
    id: 'training_stress_mgmt',
    name: '压力管理技巧',
    category: 'relaxation',
    targetAssessment: 'stress-test',
    exercises: [
      {
        type: 'time_management',
        name: '优先级矩阵练习',
        description: '使用爱森豪威尔矩阵分类任务',
        duration: 15,
      },
      {
        type: 'boundary_setting',
        name: '界限设定练习',
        description: '学习说"不"的技巧',
        duration: 10,
      },
    ],
  },
};

// 焦虑管理训练内容
const ANXIETY_TRAINING = {
  'anxiety_reduction': {
    id: 'training_anxiety_reduce',
    name: '焦虑缓解训练',
    category: 'mindfulness',
    targetAssessment: 'anxiety-gad7',
    exercises: [
      {
        type: 'worry_time',
        name: '担忧时间管理',
        description: '设定固定的担忧时间，其他时间将担忧写下并推迟',
        duration: 10,
      },
      {
        type: 'cognitive_restructuring',
        name: '认知重构练习',
        description: '识别并挑战不合理的担忧思维',
        duration: 20,
      },
    ],
  },
};
```

**5.2.3 智能推荐系统**
```typescript
// 推荐引擎
class TrainingRecommendationEngine {
  private trainingLibrary: Map<string, TrainingModule>;
  private userProfiles: Map<string, UserTrainingProfile>;
  
  // 基于测评结果推荐
  recommendBasedOnAssessment(assessmentResult: AssessmentResult): TrainingModule[] {
    const recommendations: TrainingModule[] = [];
    
    // 分析测评结果
    const analysis = this.analyzeAssessment(assessmentResult);
    
    // 获取相关训练
    const relevantTrainings = this.getTrainingsByTrait(analysis.targetTraits);
    
    // 根据严重程度排序
    const sorted = this.rankByUrgency(relevantTraining, analysis.scores);
    
    // 去重和过滤
    const filtered = this.filterDuplicates(sorted);
    
    return filtered;
  }
  
  // 个性化推荐
  getPersonalizedRecommendations(userId: string): TrainingModule[] {
    const history = this.getUserTrainingHistory(userId);
    const assessments = this.getRecentAssessments(userId);
    const progress = this.getTrainingProgress(userId);
    
    // 智能组合推荐
    return this.generateMixedRecommendation(history, assessments, progress);
  }
}
```

**5.2.4 训练进度追踪**
```typescript
// 训练进度
interface TrainingProgress {
  moduleId: string;
  userId: string;
  startedAt: number;
  lastPracticedAt: number;
  totalDuration: number;
  completedExercises: number;
  totalExercises: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  effectivenessScore: number;
  checkpoints: Checkpoint[];
}

// 训练会话
interface TrainingSession {
  id: string;
  moduleId: string;
  startedAt: number;
  endedAt?: number;
  exercises: ExerciseResult[];
  mood: { before: number; after: number };
  notes?: string;
  difficulty: 'too_easy' | 'just_right' | 'too_hard';
}
```

**5.2.5 训练界面UI**
```typescript
// 训练页面组件
interface TrainingPageProps {
  moduleId: string;
  userId: string;
  mode: 'practice' | 'guided' | 'self_paced';
}

// 组件结构
- TrainingDashboard: 训练总览仪表板
- TrainingCard: 训练项目卡片
- ExercisePlayer: 练习播放器
- ProgressRing: 环形进度条
- StreakCalendar: 连续打卡日历
- EffectivenessChart: 效果趋势图
- RecommendationPanel: 推荐面板
```

#### 5.3 关键文件
- `src/data/training/TrainingLibrary.ts`
- `src/data/training/PersonalityTraining.ts`
- `src/data/training/StressTraining.ts`
- `src/data/training/AnxietyTraining.ts`
- `src/services/training/TrainingService.ts`
- `src/services/training/RecommendationEngine.ts`
- `src/services/training/ProgressTracker.ts`
- `src/components/training/TrainingDashboard.tsx`
- `src/components/training/ExercisePlayer.tsx`
- `src/components/training/ProgressTracker.tsx`

---

### 模块六：本地数据AES加密存储

#### 6.1 目标
保护用户隐私，对本地存储的测评数据进行AES加密。

#### 6.2 实现内容

**6.2.1 加密系统架构**
```typescript
// 加密服务
class EncryptionService {
  private algorithm = 'AES-GCM';
  private keyLength = 256;
  private ivLength = 12;
  
  // 密钥生成
  async generateKey(password: string, salt: Uint8Array): Promise<CryptoKey>;
  
  // 加密数据
  async encrypt(data: any, key: CryptoKey): Promise<EncryptedData>;
  
  // 解密数据
  async decrypt(encrypted: EncryptedData, key: CryptoKey): Promise<any>;
  
  // 密钥派生
  async deriveKey(password: string): Promise<CryptoKey>;
  
  // 数据完整性验证
  verifyIntegrity(data: any, hash: string): boolean;
}

// 加密数据结构
interface EncryptedData {
  iv: string;           // 初始向量
  data: string;         // 加密数据
  hash: string;          // 完整性校验
  version: string;       // 加密版本
  timestamp: number;     // 加密时间
}
```

**6.2.2 存储管理层**
```typescript
// 安全存储服务
class SecureStorageService {
  private encryption: EncryptionService;
  private storageKey = 'secure_assessment_data';
  
  // 保存加密数据
  async save(key: string, data: any, password?: string): Promise<void>;
  
  // 读取解密数据
  async load(key: string, password?: string): Promise<any>;
  
  // 删除数据
  async remove(key: string): Promise<void>;
  
  // 列出所有键
  async list(): Promise<string[]>;
  
  // 批量操作
  async batchSave(items: Record<string, any>): Promise<void>;
  async batchLoad(keys: string[]): Promise<Record<string, any>>;
}
```

**6.2.3 密钥管理**
```typescript
// 密钥管理服务
class KeyManagementService {
  private masterKey: CryptoKey | null = null;
  
  // 首次设置密码
  async setupPassword(password: string): Promise<void>;
  
  // 验证密码
  async verifyPassword(password: string): Promise<boolean>;
  
  // 修改密码
  async changePassword(oldPassword: string, newPassword: string): Promise<void>;
  
  // 密码强度检查
  checkPasswordStrength(password: string): PasswordStrength;
  
  // 密码重置（谨慎使用）
  async resetPassword(newPassword: string): Promise<void>;
}

// 密码强度
interface PasswordStrength {
  score: number;           // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  suggestions: string[];
}
```

**6.2.4 数据迁移**
```typescript
// 迁移服务
class DataMigrationService {
  // 从明文迁移到加密
  async migrateToEncrypted(password: string): Promise<MigrationResult>;
  
  // 批量导入加密数据
  async importEncrypted(data: string, password: string): Promise<ImportResult>;
  
  // 导出加密数据
  async exportEncrypted(password: string): Promise<string>;
  
  // 版本升级
  async upgradeVersion(from: string, to: string): Promise<void>;
}
```

#### 6.3 关键文件
- `src/services/security/EncryptionService.ts`
- `src/services/security/SecureStorageService.ts`
- `src/services/security/KeyManagementService.ts`
- `src/services/security/DataMigrationService.ts`
- `src/components/security/PasswordSetup.tsx`
- `src/components/security/PasswordChange.tsx`

---

### 模块七：测评结果溯源面板

#### 7.1 目标
记录用户每道题的作答选择、得分转换和报告生成完整计算过程，提供可追溯查看。

#### 7.2 实现内容

**7.2.1 溯源日志系统**
```typescript
// 溯源日志条目
interface TraceLogEntry {
  id: string;
  timestamp: number;
  action: TraceAction;
  details: TraceDetails;
  metadata: {
    assessmentId: string;
    questionId?: string;
    userId: string;
    sessionId: string;
  };
}

// 操作类型
type TraceAction = 
  | 'answer_selected'      // 答案选择
  | 'answer_changed'       // 答案修改
  | 'question_skipped'     // 题目跳过
  | 'score_calculated'      // 得分计算
  | 'score_transformed'    // 得分转换
  | 'trait_aggregated'     // 特质聚合
  | 'report_generated'     // 报告生成
  | 'tag_applied'          // 标签应用
  | 'result_stored';       // 结果存储

// 详细记录
interface TraceDetails {
  // 答案选择
  answer_selected?: {
    questionId: string;
    selectedOption: number;
    optionLabel: string;
    timestamp: number;
    timeSpent: number;
  };
  
  // 得分转换
  score_transformed?: {
    originalScore: number;
    transformedScore: number;
    formula: string;
    parameters: Record<string, number>;
    explanation: string;
  };
  
  // 报告生成
  report_generated?: {
    sections: string[];
    wordCount: number;
    algorithms: string[];
    confidence: number;
    recommendations: string[];
  };
}
```

**7.2.2 溯源追踪服务**
```typescript
// 溯源追踪服务
class TraceService {
  private logs: TraceLogEntry[] = [];
  
  // 记录操作
  log(action: TraceAction, details: TraceDetails, metadata: any): void;
  
  // 获取评估的完整溯源
  getTraceForAssessment(assessmentId: string): TraceLogEntry[];
  
  // 获取时间线视图
  getTimeline(assessmentId: string): TimelineEntry[];
  
  // 导出溯源报告
  exportTraceReport(assessmentId: string): TraceReport;
  
  // 验证数据完整性
  verifyIntegrity(assessmentId: string): IntegrityCheck;
}
```

**7.2.3 溯源界面UI**
```typescript
// 溯源面板组件
interface TracePanelProps {
  assessmentId: string;
  expanded?: boolean;
}

// 展示内容
- TraceTimeline: 时间线视图
- AnswerHistory: 答题历史
- ScoreCalculation: 得分计算详情
- TransformationSteps: 转换步骤展示
- ReportGeneration: 报告生成过程
- IntegrityBadge: 完整性标识
```

**7.2.4 计算过程展示**
```typescript
// 得分计算详情
interface ScoreCalculationDetail {
  questionId: string;
  rawAnswer: number;
  weight: number;
  rawScore: number;
  transformation: {
    type: 'linear' | 'reverse' | 'scaling' | 'normalization';
    formula: string;
    before: number;
    after: number;
  };
  contribution: number;
  runningTotal: number;
}

// 特质聚合详情
interface TraitAggregationDetail {
  traitName: string;
  questions: Array<{
    questionId: string;
    weight: number;
    transformedScore: number;
    contribution: number;
  }>;
  aggregationMethod: 'sum' | 'average' | 'weighted_average';
  finalScore: number;
  percentile: number;
  tScore: number;
}
```

#### 7.3 关键文件
- `src/services/trace/TraceService.ts`
- `src/services/trace/TraceAnalyzer.ts`
- `src/services/trace/IntegrityChecker.ts`
- `src/components/trace/TracePanel.tsx`
- `src/components/trace/TraceTimeline.tsx`
- `src/components/trace/TraceDetails.tsx`
- `src/components/trace/IntegrityBadge.tsx`

---

### 模块八：多格式导出功能

#### 8.1 目标
支持测评结果导出为PDF、Markdown、纯文本和JSON格式。

#### 8.2 实现内容

**8.2.1 导出服务架构**
```typescript
// 导出服务
class ExportService {
  // 导出为PDF
  async exportToPDF(result: AssessmentResult, options?: PDFOptions): Promise<Blob>;
  
  // 导出为Markdown
  async exportToMarkdown(result: AssessmentResult): Promise<string>;
  
  // 导出为纯文本
  async exportToText(result: AssessmentResult): Promise<string>;
  
  // 导出为JSON
  async exportToJSON(result: AssessmentResult, pretty?: boolean): Promise<string>;
  
  // 批量导出
  async batchExport(assessmentIds: string[], format: ExportFormat): Promise<Blob>;
}

// 导出选项
interface PDFOptions {
  template: 'detailed' | 'summary' | 'compact';
  includeCharts: boolean;
  includeRawData: boolean;
  includeTrace?: boolean;
  logo?: string;
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

type ExportFormat = 'pdf' | 'markdown' | 'text' | 'json';
```

**8.2.2 PDF导出实现**
```typescript
// PDF生成器
class PDFGenerator {
  private pdfMake: any;
  
  async generate(result: AssessmentResult, options: PDFOptions): Promise<Blob> {
    const docDefinition = {
      pageSize: options.pageSize,
      pageOrientation: options.orientation,
      content: [
        this.generateHeader(result),
        this.generateSummary(result),
        this.generateDetailedAnalysis(result),
        this.generateRecommendations(result),
        this.generateCharts(result, options.includeCharts),
        ...this.generateRawData(result, options.includeRawData),
      ],
      styles: this.getStyles(),
      footer: this.generateFooter(),
    };
    
    return this.pdfMake.createPdf(docDefinition);
  }
  
  private generateCharts(result: AssessmentResult, include: boolean): any[] {
    if (!include) return [];
    return [
      { canvas: [this.renderRadarChart(result)] },
      { canvas: [this.renderTrendChart(result)] },
    ];
  }
}
```

**8.2.3 Markdown导出**
```typescript
// Markdown模板
const MARKDOWN_TEMPLATE = `
# {{title}}

## 测评信息
- **测评类型**: {{assessmentType}}
- **测评时间**: {{timestamp}}
- **总分**: {{totalScore}}

## 测评结果摘要
{{summary}}

## 详细分析

### 特质得分
{{#each traits}}
- **{{name}}**: {{score}} ({{percentile}}%)
{{/each}}

### 深度解读
{{detailedAnalysis}}

## 建议
{{recommendations}}

## 原始数据
\`\`\`json
{{rawData}}
\`\`\`

---
*此报告由 BadHope 心理测评系统生成*
`;
```

**8.2.4 UI组件**
```typescript
// 导出面板组件
interface ExportPanelProps {
  assessmentId: string;
  result: AssessmentResult;
}

// 组件功能
- FormatSelector: 格式选择器
- OptionConfigurator: 选项配置
- PreviewPane: 预览窗格
- DownloadButton: 下载按钮
- ShareButton: 分享按钮
```

#### 8.3 关键文件
- `src/services/export/ExportService.ts`
- `src/services/export/PDFGenerator.ts`
- `src/services/export/MarkdownGenerator.ts`
- `src/services/export/TextGenerator.ts`
- `src/services/export/JSONGenerator.ts`
- `src/components/export/ExportPanel.tsx`
- `src/components/export/PreviewPane.tsx`

---

### 模块九：二维码/短链接分享功能

#### 9.1 目标
支持生成可分享的二维码和短链接，所有分享内容基于真实测评数据，添加验签机制。

#### 9.2 实现内容

**9.2.1 分享系统架构**
```typescript
// 分享服务
class ShareService {
  // 生成唯一分享ID
  private generateShareId(): string;
  
  // 创建分享链接
  async createShareLink(result: AssessmentResult, options: ShareOptions): Promise<ShareLink>;
  
  // 生成二维码
  async generateQRCode(shareLink: string, options?: QROptions): Promise<string>;
  
  // 验证分享内容
  async verifyShare(shareId: string): Promise<ShareVerification>;
  
  // 获取分享数据
  async getShareData(shareId: string): Promise<SharedResult>;
  
  // 分享统计
  getShareStats(shareId: string): ShareStats;
}

// 分享选项
interface ShareOptions {
  expiration: number;        // 过期时间（小时）
  viewLimit?: number;         // 查看次数限制
  password?: string;          // 访问密码
  includeFullReport: boolean; // 是否包含完整报告
  includeTrace: boolean;      // 是否包含溯源信息
  shareable: boolean;         // 是否可再次分享
}
```

**9.2.2 验签机制**
```typescript
// 签名服务
class SignatureService {
  private privateKey: CryptoKey;
  
  // 生成签名
  async sign(data: object): Promise<string>;
  
  // 验证签名
  async verify(data: object, signature: string): Promise<boolean>;
  
  // 生成防伪标签
  generateVerificationBadge(data: object): VerificationBadge;
}

// 防伪数据结构
interface VerificationBadge {
  signature: string;
  timestamp: number;
  algorithm: string;
  checksum: string;
  verificationUrl: string;
}

// 分享数据结构
interface SharedResult {
  id: string;
  resultId: string;
  sharedAt: number;
  expiresAt: number;
  views: number;
  viewLimit: number;
  signature: string;
  data: {
    basic: AssessmentBasicInfo;
    summary: AssessmentSummary;
    traits: TraitScore[];
    verification: VerificationBadge;
  };
}
```

**9.2.3 二维码生成**
```typescript
// 二维码选项
interface QROptions {
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  color: {
    dark: string;
    light: string;
  };
  logo?: string;
  style: 'square' | 'rounded' | 'circle';
}

// 二维码UI组件
interface QRCodeDisplayProps {
  url: string;
  options: QROptions;
  showDownload?: boolean;
  showCopy?: boolean;
}
```

**9.2.4 分享验证页面**
```typescript
// 分享查看页面
interface SharedResultViewProps {
  shareId: string;
}

// 功能
- 验证真实性
- 展示分享内容
- 显示防伪标识
- 查看统计信息
- 下载选项
```

#### 9.3 关键文件
- `src/services/share/ShareService.ts`
- `src/services/share/SignatureService.ts`
- `src/services/share/QRCodeGenerator.ts`
- `src/services/share/ShortLinkService.ts`
- `src/components/share/SharePanel.tsx`
- `src/components/share/QRCodeDisplay.tsx`
- `src/pages/SharedResultView.tsx`

---

## 三、实施计划

### 第一阶段：基础架构（模块一、四）
1. 搭建通用测评数据抽象层
2. 实现插件化架构系统

### 第二阶段：个人中心（模块二）
1. 开发可视化个人数据看板
2. 实现个性化标签系统
3. 开发阶段性总结功能

### 第三阶段：渲染系统（模块三）
1. 开发可插拔的测评渲染系统
2. 实现差异化界面布局
3. 主题配色系统

### 第四阶段：训练模块（模块五）
1. 开发心理训练内容库
2. 实现智能推荐系统
3. 训练进度追踪

### 第五阶段：安全功能（模块六、七）
1. 实现AES加密存储
2. 开发测评结果溯源面板

### 第六阶段：导出分享（模块八、九）
1. 实现多格式导出
2. 开发二维码/短链接分享

### 第七阶段：测试优化
1. 全面功能测试
2. 性能优化
3. 修复问题

---

## 四、质量标准

### 4.1 代码质量
- TypeScript严格类型检查通过
- ESLint无错误
- 代码覆盖率 > 80%
- 组件复用性高

### 4.2 功能完整性
- 所有计划功能全部实现
- 不能简化任何功能
- 不能减少任何内容
- 持续加强和优化

### 4.3 用户体验
- 界面美观一致
- 交互流畅自然
- 加载速度快
- 移动端适配良好

### 4.4 数据安全
- 加密存储可靠
- 溯源日志完整
- 防伪机制有效
- 隐私保护到位

---

## 五、注意事项

1. **严格按计划执行**：不偷工减料，不简化内容
2. **实时修复问题**：发现任何问题立即修复
3. **持续优化加强**：想办法加强和优化每个部分
4. **保持代码质量**：遵循项目代码规范
5. **详细文档记录**：重要决策需记录原因
6. **渐进式开发**：小步快跑，持续集成
