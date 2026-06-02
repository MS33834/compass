import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { getTranslation } from '../i18n';

export const NotFound = () => {
  const { locale } = useAppStore();
  const i18n = getTranslation(locale);
  const location = useLocation();

  useEffect(() => {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`404 - Route not found: ${location.pathname}`);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <motion.div
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-7xl sm:text-8xl mb-4 sm:mb-6"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          aria-hidden="true"
        >
          🔍
        </motion.div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 sm:mb-4">
          404
        </h1>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4">
          {i18n.common.notFoundTitle}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 leading-relaxed">
          {i18n.common.notFoundDesc}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            🏠 {i18n.common.goHome}
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            ← {i18n.common.back}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
