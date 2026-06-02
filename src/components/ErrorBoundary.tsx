import { Component, type ReactNode } from 'react';
import { getTranslation, type Locale } from '../i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function getStoredLocale(): Locale {
  try {
    const value = localStorage.getItem('locale');
    return value === 'en' ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const t = getTranslation(getStoredLocale());
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md mx-auto text-center">
            <div className="text-5xl mb-4" aria-hidden="true">⚠️</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{t.common.errorTitle}</h2>
            <p className="text-sm text-slate-500 mb-4">
              {t.common.errorDesc}
            </p>
            {this.state.error?.message && (
              <pre className="text-xs text-left text-red-600 bg-red-50 rounded-lg p-3 mb-4 overflow-auto max-h-32 whitespace-pre-wrap break-words">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t.common.reload}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
