import { Question } from '../../types';
import { ProgressData, NavigationData } from '../../services/renderer/types';

interface QuestionTimelineProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, number>;
  onAnswer: (questionId: string, answer: number) => void;
  progress: ProgressData;
  navigation: NavigationData;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  primaryColor?: string;
}

export function QuestionTimeline({
  questions,
  currentIndex,
  answers,
  onAnswer,
  progress,
  navigation,
  onPrevious,
  onNext,
  onSubmit,
  primaryColor = '#059669'
}: QuestionTimelineProps) {
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div
          className="px-6 py-4 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold">压力水平测试</span>
            <span className="text-sm opacity-90">
              步骤 {progress.current} / {progress.total}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {questions.map((q, index) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = index === currentIndex;
              const isPast = index < currentIndex;
              
              return (
                <div
                  key={q.id}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-white'
                      : isPast || isAnswered
                      ? 'bg-green-400'
                      : 'bg-white/30'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {currentIndex + 1}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                {currentQuestion.text}
              </h2>
              <p className="text-sm text-slate-500">
                请选择最符合您情况的选项
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {currentQuestion.options && currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === index;
              
              return (
                <button
                  key={index}
                  onClick={() => onAnswer(currentQuestion.id, index)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">{option}</span>
                    {isSelected && (
                      <span className="text-green-600 text-2xl">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onPrevious}
              disabled={!navigation.canGoBack}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition ${
                navigation.canGoBack
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>←</span>
              <span>上一步</span>
            </button>

            <div className="text-center">
              <div className="text-sm text-slate-600 mb-1">
                已完成 {Object.keys(answers).length} / {questions.length} 题
              </div>
              <div className="w-48 bg-slate-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                    backgroundColor: primaryColor
                  }}
                />
              </div>
            </div>

            {isLastQuestion ? (
              <button
                onClick={onSubmit}
                disabled={Object.keys(answers).length < questions.length}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition ${
                  Object.keys(answers).length === questions.length
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>提交</span>
                <span>✓</span>
              </button>
            ) : (
              <button
                onClick={onNext}
                className="flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition bg-green-500 text-white hover:bg-green-600"
              >
                <span>下一步</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl p-4 shadow-md">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">答题进度</h3>
        <div className="grid grid-cols-7 gap-2">
          {questions.map((q, index) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = index === currentIndex;
            
            return (
              <button
                key={q.id}
                onClick={() => {
                  const diff = index - currentIndex;
                  if (diff < 0) onPrevious();
                  else if (diff > 0) onNext();
                }}
                className={`p-3 rounded-lg text-center transition-all ${
                  isCurrent
                    ? 'ring-2 ring-green-500'
                    : ''
                } ${
                  isAnswered
                    ? 'bg-green-100 text-green-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <div className="text-xs font-medium">{index + 1}</div>
                {isAnswered && <div className="text-xs">✓</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
