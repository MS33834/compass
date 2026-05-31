import { Question } from '../../types';
import { ProgressData, NavigationData } from '../../services/renderer/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: number;
  onAnswer: (answer: number) => void;
  progress: ProgressData;
  navigation: NavigationData;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  primaryColor?: string;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  progress,
  navigation,
  onPrevious,
  onNext,
  onSubmit,
  primaryColor = '#3B82F6'
}: QuestionCardProps) {
  const isLastQuestion = questionNumber === totalQuestions;
  const canProceed = selectedAnswer !== undefined;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div
          className="px-6 py-4 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium opacity-90">
              题目 {questionNumber} / {totalQuestions}
            </span>
            <span className="text-sm font-medium opacity-90">
              {progress.percentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2 mt-3">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            {question.text}
          </h2>

          <div className="space-y-3">
            {question.options && question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const optionLabel = String.fromCharCode(65 + index);
              
              return (
                <button
                  key={index}
                  onClick={() => onAnswer(index)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {optionLabel}
                    </span>
                    <span className="flex-1 text-slate-700">{option}</span>
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
              className={`px-6 py-2 rounded-lg font-medium transition ${
                navigation.canGoBack
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              ← 上一题
            </button>

            <div className="flex space-x-2">
              {Array.from({ length: totalQuestions }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === questionNumber - 1
                      ? 'bg-blue-500'
                      : index < questionNumber - 1
                      ? 'bg-green-500'
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            {isLastQuestion ? (
              <button
                onClick={onSubmit}
                disabled={!canProceed}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  canProceed
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                提交测评
              </button>
            ) : (
              <button
                onClick={onNext}
                disabled={!canProceed}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  canProceed
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                下一题 →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
