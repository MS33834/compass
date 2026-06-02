import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { authService } from '../services/auth';
import { getTranslation } from '../i18n';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, locale } = useAppStore();
  const i18n = getTranslation(locale);
  const [error, setError] = useState<string | null>(null);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      try {
        const response = await authService.handleOAuthCallback();
        if (response.success && response.user) {
          navigate('/', { replace: true });
        } else {
          setError(response.error || (locale === 'zh' ? '第三方登录失败' : 'OAuth login failed'));
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      } catch {
        setError(locale === 'zh' ? '完成第三方登录失败' : 'Failed to complete OAuth login');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [navigate, locale]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {error ? (
          <div role="alert" aria-live="assertive">
            <div className="text-4xl mb-4" aria-hidden="true">❌</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{i18n.auth.loginFailed}</h1>
            <p className="text-slate-600 mb-4 break-words">{error}</p>
            <p className="text-sm text-slate-500">{i18n.auth.redirectingToLogin}</p>
          </div>
        ) : (
          <div role="status" aria-live="polite">
            <div
              className="w-16 h-16 mx-auto mb-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{i18n.auth.completingLogin}</h1>
            <p className="text-slate-600">{i18n.auth.pleaseWait}</p>
          </div>
        )}
      </div>
    </div>
  );
};