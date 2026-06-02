import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { getTranslation } from '../i18n';
import { shareService } from '../services/share/ExportShareService';

export const SharedView = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { locale } = useAppStore();
  const i18n = getTranslation(locale);

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    if (!id) {
      setError(locale === 'zh' ? '链接无效' : 'Invalid link');
      setLoading(false);
      return;
    }
    loadResult();
  }, [id, locale]);

  const loadResult = async (password?: string) => {
    try {
      setLoading(true);
      const result = await shareService.getSharedResult(id, password);
      if (!result) {
        const verify = shareService.verifyShare(id);
        setNeedsPassword(verify);
        setError(
          verify
            ? locale === 'zh'
              ? '密码错误'
              : 'Wrong password'
            : locale === 'zh'
              ? '链接已失效或不存在'
              : 'Link expired or not found'
        );
        return;
      }
      setData(result.data);
      setError(null);
      setNeedsPassword(false);
    } catch (err) {
      console.error('Failed to load shared result:', err);
      setError(locale === 'zh' ? '加载失败' : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResult(passwordInput);
  };

  if (loading) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
            aria-hidden="true"
          />
          <p className="text-sm text-slate-500">{i18n.common.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          className="text-center max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-4" aria-hidden="true">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">
            {locale === 'zh' ? '链接无法访问' : 'Link Unavailable'}
          </h1>
          <p className="text-slate-600 mb-4 break-words">{error}</p>

          {needsPassword && (
            <form onSubmit={handlePasswordSubmit} className="mb-6 max-w-sm mx-auto">
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder={locale === 'zh' ? '请输入访问密码' : 'Enter access password'}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={locale === 'zh' ? '访问密码' : 'Access password'}
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                {locale === 'zh' ? '查看报告' : 'View Report'}
              </button>
            </form>
          )}

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
          >
            ← {i18n.common.goHome}
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl" aria-hidden="true">
              📊
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {data.title || (locale === 'zh' ? '心理测评报告' : 'Assessment Report')}
            </h1>
          </div>
          <p className="text-blue-100 text-sm">
            {locale === 'zh' ? '通过分享链接查看' : 'Viewed via shared link'}
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {data.totalScore !== undefined && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-500 mb-1">
                  {locale === 'zh' ? '总分' : 'Total Score'}
                </div>
                <div className="text-3xl font-bold text-blue-600">{data.totalScore}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-500 mb-1">
                  {locale === 'zh' ? '测评类型' : 'Assessment'}
                </div>
                <div className="text-base font-semibold text-slate-800 break-words">
                  {data.assessmentId || '—'}
                </div>
              </div>
            </div>
          )}

          {data.traits && data.traits.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-3">
                {locale === 'zh' ? '特质得分' : 'Trait Scores'}
              </h2>
              <div className="space-y-3">
                {data.traits.map(
                  (trait: { name: string; score: number; description?: string }, idx: number) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-slate-800">{trait.name}</span>
                        <span className="text-blue-600 font-bold">{trait.score}</span>
                      </div>
                      {trait.description && (
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {trait.description}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {data.summary && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4">
              <h2 className="text-base font-bold text-slate-800 mb-2">
                {locale === 'zh' ? '报告摘要' : 'Report Summary'}
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {data.summary}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
            <span>{locale === 'zh' ? '由 MindMirror 分享' : 'Shared via MindMirror'}</span>
            <Link to="/assessments" className="text-blue-600 font-medium hover:text-blue-700">
              {locale === 'zh' ? '查看更多测评 →' : 'Explore more assessments →'}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
