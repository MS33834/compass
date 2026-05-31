import { TraitResult } from '../types';
import {
  ANXIETY_LEVELS,
  GAD7_COPING_STRATEGIES,
  GAD7_RELAXATION_TECHNIQUES,
  GAD7_HEALTHY_HABITS
} from '../data/anxietyGad7Data';
import { Question } from '../types';

// GAD-7 评分计算
export function calculateGAD7Score(answers: Record<string, number>): number {
  return Object.values(answers).reduce((sum, value) => sum + value, 0);
}

// 计算GAD-7的trait结果（用于store）
export function calculateGAD7Traits(answers: Record<string, number>, questions: Question[]): TraitResult[] {
  const totalScore = calculateGAD7Score(answers);
  const anxietyLevel = getAnxietyLevelInfo(totalScore);
  
  // 计算各个维度分数
  const physicalScore = (
    (answers['gad7_q1'] || 0) * 14 + 
    (answers['gad7_q4'] || 0) * 17 + 
    (answers['gad7_q5'] || 0) * 17
  );
  
  const worryScore = (
    (answers['gad7_q2'] || 0) * 15 + 
    (answers['gad7_q3'] || 0) * 15
  );
  
  const irritabilityScore = (answers['gad7_q6'] || 0) * 25;
  const fearScore = (answers['gad7_q7'] || 0) * 25;
  
  return [
    {
      name: '焦虑水平',
      score: totalScore,
      description: anxietyLevel.description
    },
    {
      name: '身体焦虑',
      score: Math.min(Math.round(physicalScore / 48 * 100), 100),
      description: '身体层面的紧张、不安和生理反应'
    },
    {
      name: '过度担忧',
      score: Math.min(Math.round(worryScore / 6 * 100), 100),
      description: '对各种事情的过度担心和灾难化思维'
    },
    {
      name: '烦躁易怒',
      score: Math.min(irritabilityScore, 100),
      description: '感到容易烦躁、不耐烦或情绪激动'
    },
    {
      name: '恐惧害怕',
      score: Math.min(fearScore, 100),
      description: '感到害怕、紧张或有大祸临头的感觉'
    }
  ];
}

// 获取焦虑水平信息
export function getAnxietyLevelInfo(score: number) {
  if (score <= 4) return ANXIETY_LEVELS.minimal;
  if (score <= 9) return ANXIETY_LEVELS.mild;
  if (score <= 14) return ANXIETY_LEVELS.moderate;
  return ANXIETY_LEVELS.severe;
}

// 计算焦虑水平进度
export function calculateAnxietyProgress(currentQuestion: number, totalQuestions: number): number {
  return Math.round((currentQuestion / totalQuestions) * 100);
}

// 生成详细的GAD-7报告
export function generateDetailedGAD7Report(
  answers: Record<string, number>,
  questions: Question[]
) {
  const totalScore = calculateGAD7Score(answers);
  const anxietyLevel = getAnxietyLevelInfo(totalScore);

  // 分析每个题目的回答模式
  const questionAnalysis = questions.map((question, index) => {
    const answer = answers[question.id];
    return {
      question: question.text,
      score: answer,
      severity: answer === 0 ? '无' : answer === 1 ? '轻度' : answer === 2 ? '中度' : '重度'
    };
  });

  // 找出最严重的症状
  const mostSevere = questionAnalysis.reduce((max, q) => 
    (q.score > max.score ? q : max),
    questionAnalysis[0]
  );

  // 根据得分提供个性化建议
  const personalizedTips = [];
  if (totalScore >= 10) {
    personalizedTips.push('建议尽快安排时间咨询专业心理师');
    personalizedTips.push('可以考虑让信任的人陪同就医');
  }
  if (totalScore >= 5) {
    personalizedTips.push('开始每天的放松练习，特别是4-7-8呼吸法');
    personalizedTips.push('记录焦虑日记，找出触发因素');
  }
  personalizedTips.push('保持规律的作息和健康的生活习惯');
  personalizedTips.push('增加与家人朋友的交流，不要孤立自己');

  // 症状模式分析
  const symptomPattern = {
    physicalSymptoms: [answers['gad7_q1'] || 0, answers['gad7_q4'] || 0, answers['gad7_q5'] || 0].reduce((a, b) => a + b, 0),
    worrySymptoms: [answers['gad7_q2'] || 0, answers['gad7_q3'] || 0].reduce((a, b) => a + b, 0),
    irritabilitySymptoms: answers['gad7_q6'] || 0,
    fearSymptoms: answers['gad7_q7'] || 0
  };

  // 确定主要症状类型
  let primarySymptom = '总体焦虑';
  const maxSymptom = Math.max(symptomPattern.physicalSymptoms, symptomPattern.worrySymptoms, symptomPattern.irritabilitySymptoms * 2, symptomPattern.fearSymptoms * 2);
  if (maxSymptom === symptomPattern.physicalSymptoms && maxSymptom > 2) {
    primarySymptom = '身体焦虑症状';
  } else if (maxSymptom === symptomPattern.worrySymptoms && maxSymptom > 2) {
    primarySymptom = '过度担忧';
  } else if (maxSymptom === symptomPattern.irritabilitySymptoms * 2 && maxSymptom > 2) {
    primarySymptom = '烦躁易怒';
  } else if (maxSymptom === symptomPattern.fearSymptoms * 2 && maxSymptom > 2) {
    primarySymptom = '恐惧/灾难化思维';
  }

  // 使用类型断言来简化类型问题
  const recs = anxietyLevel.recommendations as any;
  
  return {
    summary: {
      title: anxietyLevel.name,
      score: totalScore,
      description: anxietyLevel.description,
      color: anxietyLevel.color
    },
    detailedAnalysis: {
      signs: anxietyLevel.detailed,
      primarySymptom: primarySymptom,
      mostSevereSymptom: mostSevere,
      symptomPattern: symptomPattern,
      questionAnalysis: questionAnalysis
    },
    recommendations: {
      immediate: GAD7_COPING_STRATEGIES.immediate,
      cognitive: GAD7_COPING_STRATEGIES.cognitive,
      lifestyle: GAD7_COPING_STRATEGIES.lifestyle,
      social: GAD7_COPING_STRATEGIES.social,
      professional: GAD7_COPING_STRATEGIES.professional,
      strategies: [
        ...GAD7_COPING_STRATEGIES.immediate,
        ...GAD7_COPING_STRATEGIES.cognitive,
        ...GAD7_COPING_STRATEGIES.lifestyle
      ],
      relaxation: GAD7_RELAXATION_TECHNIQUES,
      healthyHabits: GAD7_HEALTHY_HABITS
    },
    personalizedTips: personalizedTips,
    dailyPractices: anxietyLevel.dailyPractices,
    resources: {
      available: recs.continue || recs.immediate,
      professional: [
        '全国心理援助热线：400-161-9995',
        '北京心理危机研究与干预中心：010-82951332'
      ]
    }
  };
}
