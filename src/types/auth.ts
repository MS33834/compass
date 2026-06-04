export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  provider?: 'email' | 'google' | 'github' | 'guest';
  metadata?: Record<string, unknown>;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  /**
   * How the auth was actually performed.
   *  - `online`  — backend issued a real JWT
   *  - `offline` — local-only fallback (no backend)
   *  - `redirect`— OAuth: the SPA is about to bounce the browser
   *               away to a provider's consent screen. The caller
   *               should NOT render a "logged in" success state.
   */
  mode?: 'online' | 'offline' | 'redirect';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}
