import {
  Training,
  TrainingSession,
  TrainingProgress,
  TrainingRecommendation,
  TrainingSchedule,
  DEFAULT_TRAININGS
} from '../../types/training';
import { storage } from '../../lib/utils';

const TRAINING_HISTORY_KEY = 'training_history';
const TRAINING_PROGRESS_KEY = 'training_progress';
const TRAINING_SCHEDULES_KEY = 'training_schedules';

export class TrainingService {
  private trainings: Training[] = DEFAULT_TRAININGS;

  getAllTrainings(): Training[] {
    return this.trainings;
  }

  getTrainingById(id: string): Training | undefined {
    return this.trainings.find(t => t.id === id);
  }

  getTrainingsByCategory(category: string): Training[] {
    return this.trainings.filter(t => t.category === category);
  }

  getRecommendedTrainings(_assessmentResults?: any[]): TrainingRecommendation[] {
    const recommendations: TrainingRecommendation[] = [];
    
    this.trainings.forEach(training => {
      let score = 0;
      const reasons: string[] = [];

      if (training.difficulty === 'beginner') {
        score += 10;
        reasons.push('适合入门');
      }
      
      if (training.category === 'breathing' || training.category === 'relaxation') {
        score += 15;
        reasons.push('普遍适用');
      }
      
      if (training.duration <= 10) {
        score += 10;
        reasons.push('短时间完成');
      }
      
      if (score > 0) {
        recommendations.push({
          trainingId: training.id,
          reason: reasons.join(', '),
          score,
          source: 'popular'
        });
      }
    });
    
    return recommendations.sort((a, b) => b.score - a.score);
  }

  startTraining(trainingId: string, userId: string = 'default'): TrainingSession {
    const session: TrainingSession = {
      id: `session_${Date.now()}_${Math.random()}`,
      trainingId,
      userId,
      startedAt: Date.now(),
      stepsCompleted: []
    };
    
    this.saveSession(session);
    return session;
  }

  updateSession(session: Partial<TrainingSession>): void {
    const history = this.getSessionHistory();
    const index = history.findIndex(s => s.id === session.id);
    
    if (index !== -1) {
      history[index] = { ...history[index], ...session };
      this.saveHistory(history);
    }
  }

  completeSession(sessionId: string, rating?: number, feedback?: string): void {
    const history = this.getSessionHistory();
    const index = history.findIndex(s => s.id === sessionId);
    
    if (index !== -1) {
      const session = history[index];
      session.completedAt = Date.now();
      session.duration = Date.now() - session.startedAt;
      if (rating !== undefined) session.rating = rating;
      if (feedback) session.feedback = feedback;
      
      this.saveHistory(history);
      this.updateProgress(session.trainingId, session.userId);
    }
  }

  getSessionHistory(userId: string = 'default'): TrainingSession[] {
    const allHistory = storage.get<TrainingSession[]>(TRAINING_HISTORY_KEY, []);
    return allHistory.filter(s => s.userId === userId);
  }

  getProgress(trainingId: string, userId: string = 'default'): TrainingProgress {
    const allProgress = storage.get<Record<string, TrainingProgress>>(TRAINING_PROGRESS_KEY, {});
    return allProgress[`${userId}_${trainingId}`] || this.createEmptyProgress(trainingId, userId);
  }

  getAllProgress(userId: string = 'default'): TrainingProgress[] {
    const allProgress = storage.get<Record<string, TrainingProgress>>(TRAINING_PROGRESS_KEY, {});
    return Object.values(allProgress).filter(p => p.userId === userId);
  }

  getSchedules(userId: string = 'default'): TrainingSchedule[] {
    const allSchedules = storage.get<TrainingSchedule[]>(TRAINING_SCHEDULES_KEY, []);
    return allSchedules.filter(s => s.userId === userId);
  }

  saveSchedule(schedule: TrainingSchedule): void {
    const schedules = storage.get<TrainingSchedule[]>(TRAINING_SCHEDULES_KEY, []);
    const index = schedules.findIndex(s => s.id === schedule.id);
    
    if (index !== -1) {
      schedules[index] = schedule;
    } else {
      schedules.push(schedule);
    }
    
    storage.set(TRAINING_SCHEDULES_KEY, schedules);
  }

  deleteSchedule(scheduleId: string): void {
    const schedules = storage.get<TrainingSchedule[]>(TRAINING_SCHEDULES_KEY, []);
    const filtered = schedules.filter(s => s.id !== scheduleId);
    storage.set(TRAINING_SCHEDULES_KEY, filtered);
  }

  getStatistics(userId: string = 'default') {
    const sessions = this.getSessionHistory(userId);
    const progress = this.getAllProgress(userId);
    void progress;

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.completedAt).length;
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageRating = sessions.filter(s => s.rating).length > 0
      ? sessions.filter(s => s.rating).reduce((sum, s) => sum + (s.rating || 0), 0) / sessions.filter(s => s.rating).length
      : 0;
    
    const streak = this.calculateStreak(sessions);
    
    return {
      totalSessions,
      completedSessions,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      totalTime,
      averageRating: Math.round(averageRating * 10) / 10,
      streak,
      favoriteCategory: this.getFavoriteCategory(sessions)
    };
  }

  private createEmptyProgress(trainingId: string, userId: string): TrainingProgress {
    return {
      trainingId,
      userId,
      totalSessions: 0,
      completedSessions: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalTime: 0,
      milestones: []
    };
  }

  private updateProgress(trainingId: string, userId: string): void {
    const allProgress = storage.get<Record<string, TrainingProgress>>(TRAINING_PROGRESS_KEY, {});
    const key = `${userId}_${trainingId}`;
    const progress = allProgress[key] || this.createEmptyProgress(trainingId, userId);
    
    const sessions = this.getSessionHistory(userId).filter(s => s.trainingId === trainingId && s.completedAt);
    
    progress.totalSessions = sessions.length;
    progress.completedSessions = sessions.length;
    progress.totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    progress.lastPracticedAt = Math.max(...sessions.map(s => s.completedAt || 0));
    
    if (sessions.length > 0) {
      const ratings = sessions.filter(s => s.rating).map(s => s.rating || 0);
      if (ratings.length > 0) {
        progress.averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      }
    }
    
    allProgress[key] = progress;
    storage.set(TRAINING_PROGRESS_KEY, allProgress);
  }

  private calculateStreak(sessions: TrainingSession[]): number {
    const completedDates = sessions
      .filter(s => s.completedAt)
      .map(s => new Date(s.completedAt).toDateString());
    
    const uniqueDates = [...new Set(completedDates)].sort().reverse();
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
      const checkDate = new Date();
      if (!uniqueDates.includes(today)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      while (uniqueDates.includes(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    
    return streak;
  }

  private getFavoriteCategory(sessions: TrainingSession[]): string {
    const categoryCount: Record<string, number> = {};
    
    sessions.forEach(session => {
      const training = this.getTrainingById(session.trainingId);
      if (training) {
        categoryCount[training.category] = (categoryCount[training.category] || 0) + 1;
      }
    });
    
    return Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '无';
  }

  private saveSession(session: TrainingSession): void {
    const history = this.getSessionHistory(session.userId);
    const allHistory = storage.get<TrainingSession[]>(TRAINING_HISTORY_KEY, []);
    const otherSessions = allHistory.filter(s => s.userId !== session.userId);
    
    storage.set(TRAINING_HISTORY_KEY, [...otherSessions, ...history, session]);
  }

  private saveHistory(history: TrainingSession[]): void {
    const userId = history[0]?.userId || 'default';
    const allHistory = storage.get<TrainingSession[]>(TRAINING_HISTORY_KEY, []);
    const otherSessions = allHistory.filter(s => s.userId !== userId);
    
    storage.set(TRAINING_HISTORY_KEY, [...otherSessions, ...history]);
  }
}

export const trainingService = new TrainingService();
