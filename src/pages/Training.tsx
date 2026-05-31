import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trainingService } from '../services/training';
import { Training as TrainingType, TRAINING_CATEGORIES, TrainingCategory } from '../types/training';

const DIFFICULTY_LABELS = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级'
};

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700'
};

export function Training() {
  const [trainings, setTrainings] = useState<TrainingType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | 'all'>('all');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const allTrainings = trainingService.getAllTrainings();
    setTrainings(allTrainings);
    setRecommendations(trainingService.getRecommendedTrainings());
    setStats(trainingService.getStatistics());
  }, []);

  const filteredTrainings = selectedCategory === 'all'
    ? trainings
    : trainings.filter(t => t.category === selectedCategory);

  const recommendedTrainings = recommendations
    .map(rec => trainings.find(t => t.id === rec.trainingId))
    .filter(Boolean) as TrainingType[];

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">心理训练</h1>
        <p className="text-slate-600 text-lg">根据您的测评结果，为您推荐个性化的训练方案</p>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
            <div className="text-sm text-slate-500">总练习次数</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-green-600">{stats.completedSessions}</div>
            <div className="text-sm text-slate-500">完成次数</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-purple-600">{stats.streak}</div>
            <div className="text-sm text-slate-500">连续天数</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-orange-600">
              {stats.averageRating ? stats.averageRating.toFixed(1) : '-'}
            </div>
            <div className="text-sm text-slate-500">平均评分</div>
          </div>
        </div>
      )}

      {/* 推荐训练 */}
      {recommendedTrainings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">为您推荐</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedTrainings.map((training) => {
              const categoryInfo = TRAINING_CATEGORIES.find(c => c.category === training.category);
              return (
                <Link
                  key={training.id}
                  to={`/training/${training.id}`}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{categoryInfo?.icon || '🧘'}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[training.difficulty]}`}>
                      {DIFFICULTY_LABELS[training.difficulty]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {training.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{training.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>⏱️ {training.estimatedTime}</span>
                    <span>•</span>
                    <span>{categoryInfo?.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 分类筛选 */}
      <div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            全部
          </button>
          {TRAINING_CATEGORIES.map((category) => (
            <button
              key={category.category}
              onClick={() => setSelectedCategory(category.category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.category
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* 训练列表 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrainings.map((training) => {
            const categoryInfo = TRAINING_CATEGORIES.find(c => c.category === training.category);
            return (
              <Link
                key={training.id}
                to={`/training/${training.id}`}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-lg group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{categoryInfo?.icon || '🧘'}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[training.difficulty]}`}>
                    {DIFFICULTY_LABELS[training.difficulty]}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {training.title}
                </h3>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{training.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {training.benefits.slice(0, 2).map((benefit, idx) => (
                    <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {benefit}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>⏱️ {training.estimatedTime}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredTrainings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-slate-500">暂无该分类的训练内容</p>
          </div>
        )}
      </div>
    </div>
  );
}
