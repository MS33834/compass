import { Question, TraitResult } from '../types';
import { 
  STRESS_LEVELS,
  COPING_STRATEGIES,
  STRESS_STAGES,
  PERFORMANCE_CURVE,
  HEALTHY_HABITS,
  PROFESSIONAL_RESOURCES,
  STRESS_DIMENSIONS
} from '../data/stressTestData';

/**
 * 压力测试评分算法 - 扩展版
 * 
 * 基于PSS (Perceived Stress Scale) 扩展版：
 * - 负向题目：直接计分 (0-4)
 * - 正向题目：反向计分 (4 - response)
 * - 总分范围：0-120
 * 
 * 评分解释：
 * - 0-30分：低压力
 * - 31-60分：中等压力
 * - 61-90分：高压力
 * - 91-120分：极高压力
 */

/**
 * 计算单个题目的得分（考虑反向计分）
 */
function calculateQuestionScore(response: number, isReverse: boolean): number {
  if (isReverse) {
    return 4 - response; // 反向计分
  }
  return response; // 直接计分
}

/**
 * 计算压力测试总分和详细分析 - 扩展版
 */
export function calculateStressTestScore(
  answers: Record<string, number>,
  questions: Question[]
) {
  let totalScore = 0;
  const dimensionScores: Record<string, number> = {};
  const questionDetails = [];

  // 初始化各维度得分
  for (const question of questions) {
    if (question.trait && !dimensionScores[question.trait]) {
      dimensionScores[question.trait] = 0;
    }
  }

  // 计算各维度得分
  for (const question of questions) {
    const response = answers[question.id];
    if (response !== undefined) {
      const score = calculateQuestionScore(response, !!question.reverse);
      totalScore += score;
      
      if (question.trait) {
        dimensionScores[question.trait] = (dimensionScores[question.trait] || 0) + score;
      }
      
      const detail = {
        id: question.id,
        text: question.text,
        trait: question.trait,
        response: response,
        score: score
      };
      
      questionDetails.push(detail);
    }
  }

  // 确定压力水平（扩展版范围）
  let level: keyof typeof STRESS_LEVELS;
  if (totalScore <= 30) {
    level = 'low';
  } else if (totalScore <= 60) {
    level = 'medium';
  } else if (totalScore <= 90) {
    level = 'high';
  } else {
    level = 'extreme';
  }

  const levelInfo = STRESS_LEVELS[level];

  // 分析压力阶段（基于GAS理论）
  let stage;
  if (totalScore <= 30) {
    stage = STRESS_STAGES.alarm;
  } else if (totalScore <= 60) {
    stage = STRESS_STAGES.resistance;
  } else {
    stage = STRESS_STAGES.exhaustion;
  }

  // 分析表现曲线位置
  let performancePoint;
  if (totalScore <= 25) {
    performancePoint = PERFORMANCE_CURVE.tooLow;
  } else if (totalScore <= 60) {
    performancePoint = PERFORMANCE_CURVE.optimal;
  } else {
    performancePoint = PERFORMANCE_CURVE.tooHigh;
  }

  // 推荐个性化的应对策略
  const recommendedStrategies = {
    problemFocused: COPING_STRATEGIES.problemFocused.slice(0, 3),
    emotionFocused: COPING_STRATEGIES.emotionFocused.slice(0, 3),
    avoidance: COPING_STRATEGIES.avoidance.slice(0, 2)
  };

  // 分析最突出的压力维度
  const sortedDimensions = Object.entries(dimensionScores)
    .map(([key, score]) => ({ 
      dimension: key, 
      score,
      info: (STRESS_DIMENSIONS as any)[key] 
    }))
    .sort((a, b) => b.score - a.score);

  return {
    totalScore,
    level,
    levelInfo,
    stage,
    performancePoint,
    dimensionScores,
    topDimensions: sortedDimensions.slice(0, 3),
    details: {
      dimensionScores,
      questionDetails
    },
    recommendations: {
      strategies: recommendedStrategies,
      healthyHabits: HEALTHY_HABITS,
      professionalResources: (level === 'high' || level === 'extreme') ? PROFESSIONAL_RESOURCES : null
    }
  };
}

/**
 * 生成压力测试特质结果（用于展示）
 */
export function calculateStressTestTraits(
  answers: Record<string, number>,
  questions: Question[]
): TraitResult[] {
  const result = calculateStressTestScore(answers, questions);
  
  // 计算各维度百分比
  const maxScorePerQuestion = 4;
  const traits: TraitResult[] = [
    {
      name: '总体压力水平',
      score: result.totalScore,
      description: `${result.levelInfo.name} (0-120分量表)`
    }
  ];

  // 添加各维度得分
  for (const [key, score] of Object.entries(result.dimensionScores)) {
    const dimensionInfo = (STRESS_DIMENSIONS as any)[key];
    if (dimensionInfo) {
      traits.push({
        name: dimensionInfo.name,
        score: score,
        description: dimensionInfo.description
      });
    }
  }
  
  return traits;
}

/**
 * 获取压力水平信息（简单版）
 */
export function getStressLevelInfo(totalScore: number) {
  let level: keyof typeof STRESS_LEVELS;
  if (totalScore <= 30) {
    level = 'low';
  } else if (totalScore <= 60) {
    level = 'medium';
  } else if (totalScore <= 90) {
    level = 'high';
  } else {
    level = 'extreme';
  }
  return STRESS_LEVELS[level];
}

/**
 * 生成详细分析报告
 */
export function generateDetailedStressReport(
  answers: Record<string, number>,
  questions: Question[]
) {
  const result = calculateStressTestScore(answers, questions);
  
  // 为每个维度生成建议
  const dimensionRecommendations = result.topDimensions.map(({ dimension, info }) => ({
    dimension,
    name: info?.name || dimension,
    tips: info?.tips || []
  }));
  
  return {
    summary: {
      title: `${result.levelInfo.name}`,
      score: result.totalScore,
      description: result.levelInfo.description,
      color: result.levelInfo.color
    },
    detailedAnalysis: {
      signs: result.levelInfo.detailed,
      stage: result.stage,
      performance: result.performancePoint,
      topDimensions: result.topDimensions
    },
    recommendations: {
      dimensionTips: dimensionRecommendations,
      strategies: result.recommendations.strategies,
      healthyHabits: result.recommendations.healthyHabits,
      professional: result.recommendations.professionalResources
    }
  };
}
