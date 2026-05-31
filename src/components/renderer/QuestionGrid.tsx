import { Question } from '../../types';
import { ProgressData } from '../../services/renderer/types';

interface QuestionGridProps {
  questions: Question[];
  answers: Record<string, number>;
  onAnswer: (questionId: string, answer: number) => void;
  onSubmit: () => void;
  primaryColor?: string;
}

export function QuestionGrid({
  questions,
  answers,
  onAnswer,
  onSubmit,
  primaryColor = '#0891B2'
}: QuestionGridProps) {
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div
          className="px-6 py-4 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">快速测评</h2>
            <span className="text-sm opacity-90">
              {answeredCount} / {questions.length} 已完成
            </span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questions.map((question, qIndex) => (
              <div
                key={question.id}
                className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start space-x-3 mb-4">
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {qIndex + 1}
                  </span>
                  <p className="text-slate-800 font-medium flex-1">
                    {question.text}
                  </p>
                </div>

                <div className="space-y-2">
                  {question.options && question.options.map((option, oIndex) => {
                    const isSelected = answers[question.id] === oIndex;
                    
                    return (
                      <button
                        key={oIndex}
                        onClick={() => onAnswer(question.id, oIndex)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left text-sm ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                            : 'border-slate-200 hover:border-cyan-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {isSelected && (
                            <span className="text-cyan-600 font-bold">✓</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {allAnswered ? (
                <span className="text-green-600 font-medium">
                  ✓ 所有题目已完成
                </span>
              ) : (
                <span>
                  还有 <span className="font-semibold text-slate-800">{questions.length - answeredCount}</span> 题未完成
                </span>
              )}
            </div>

            <button
              onClick={onSubmit}
              disabled={!allAnswered}
              className={`px-8 py-3 rounded-lg font-semibold text-lg transition ${
                allAnswered
                  ? 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {allAnswered ? '提交测评' : '请完成所有题目'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">答题状态概览</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-3xl font-bold text-slate-800 mb-1">
              {questions.length}
            </div>
            <div className="text-sm text-slate-600">总题数</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {answeredCount}
            </div>
            <div className="text-sm text-slate-600">已答</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {questions.length - answeredCount}
            </div>
            <div className="text-sm text-slate-600">未答</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {progress.toFixed(0)}%
            </div>
            <div className="text-sm text-slate-600">进度</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {allAnswered ? '✓' : '○'}
            </div>
            <div className="text-sm text-slate-600">
              {allAnswered ? '可提交' : '待完成'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
