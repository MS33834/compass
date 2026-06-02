import type {
  User,
  AuthCredentials,
  RegisterData,
  AuthResponse,
  ValidationError,
} from '../types/auth';
import { apiRequest, configureApi, ApiError, API_BASE_URL } from '../lib/apiClient';

const STORAGE_KEY_USER = 'mindmirror_user';
const STORAGE_KEY_TOKEN = 'mindmirror_token';
const STORAGE_KEY_LOCAL_USERS = 'mindmirror_local_users';

let configured = false;
let backendAvailable: boolean | null = null;
let backendCheckedAt = 0;
const BACKEND_CHECK_TTL_MS = 30_000;

function ensureConfigured() {
  if (configured) return;
  configured = true;
  configureApi({
    getToken: () => localStorage.getItem(STORAGE_KEY_TOKEN),
    onUnauthorized: () => {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    },
  });
}

interface ApiUser {
  id: string;
  email: string;
  username: string;
  avatar_url?: string | null;
  is_guest?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiTokenResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

function mapApiUser(u: ApiUser): User {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    avatar: u.avatar_url || undefined,
    createdAt: new Date(u.created_at),
    lastLoginAt: new Date(u.updated_at),
    provider: 'email',
  };
}

function persistSession(token: string, user: User) {
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}

// -------- Local-only fallback (offline / demo) --------

interface LocalUserRecord {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isGuest?: boolean;
}

function getLocalUsers(): LocalUserRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_LOCAL_USERS) || '[]') as LocalUserRecord[];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUserRecord[]) {
  localStorage.setItem(STORAGE_KEY_LOCAL_USERS, JSON.stringify(users));
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback (older browsers) - not cryptographically strong but OK for local demo
  let h1 = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h1 ^= text.charCodeAt(i);
    h1 = (h1 * 0x01000193) >>> 0;
  }
  return h1.toString(16);
}

async function hashPassword(password: string, salt: string): Promise<string> {
  return sha256(`${salt}::${password}`);
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function mapLocalUser(u: LocalUserRecord): User {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    avatar: u.avatar,
    createdAt: new Date(u.createdAt),
    lastLoginAt: new Date(u.updatedAt),
    provider: u.isGuest ? 'guest' : 'email',
  };
}

function localToken(userId: string): string {
  // Local token is just the user id; not used for any real verification.
  return `local.${userId}`;
}

function isLocalToken(token: string | null): boolean {
  return !!token && token.startsWith('local.');
}

async function pingBackend(): Promise<boolean> {
  const now = Date.now();
  if (backendAvailable !== null && now - backendCheckedAt < BACKEND_CHECK_TTL_MS) {
    return backendAvailable;
  }
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 2500);
    const res = await fetch(API_BASE_URL + '/health', { signal: controller.signal });
    window.clearTimeout(timer);
    backendAvailable = res.ok;
  } catch {
    backendAvailable = false;
  }
  backendCheckedAt = now;
  return backendAvailable;
}

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  }

  validateUsername(username: string): string | null {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  }

  validatePassword(password: string): string | null {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password.length > 50) return 'Password must be less than 50 characters';
    return null;
  }

  validateRegisterData(data: RegisterData): ValidationError[] {
    const errors: ValidationError[] = [];
    const emailError = this.validateEmail(data.email);
    if (emailError) errors.push({ field: 'email', message: emailError });
    const usernameError = this.validateUsername(data.username);
    if (usernameError) errors.push({ field: 'username', message: usernameError });
    const passwordError = this.validatePassword(data.password);
    if (passwordError) errors.push({ field: 'password', message: passwordError });
    if (data.password !== data.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }
    return errors;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    ensureConfigured();
    const errors = this.validateRegisterData(data);
    if (errors.length > 0) return { success: false, error: errors[0].message };

    const useBackend = await pingBackend();
    if (!useBackend) return this.registerLocal(data);

    try {
      const res = await apiRequest<ApiTokenResponse>('/auth/register', {
        method: 'POST',
        body: { email: data.email, username: data.username, password: data.password },
        skipAuth: true,
      });
      const user = mapApiUser(res.user);
      persistSession(res.access_token, user);
      return { success: true, user, token: res.access_token };
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        return this.registerLocal(data);
      }
      return { success: false, error: this.toMessage(err, 'Registration failed') };
    }
  }

  private async registerLocal(data: RegisterData): Promise<AuthResponse> {
    const users = getLocalUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists' };
    }
    if (users.find(u => u.username.toLowerCase() === data.username.toLowerCase())) {
      return { success: false, error: 'This username is already taken' };
    }
    const id = uuid();
    const salt = uuid();
    const passwordHash = await hashPassword(data.password, salt);
    const now = new Date().toISOString();
    const record: LocalUserRecord = {
      id,
      email: data.email,
      username: data.username,
      passwordHash: `${salt}$${passwordHash}`,
      avatar: this.generateAvatar(data.username),
      createdAt: now,
      updatedAt: now,
    };
    users.push(record);
    saveLocalUsers(users);
    const user = mapLocalUser(record);
    const token = localToken(id);
    persistSession(token, user);
    return { success: true, user, token, mode: 'offline' };
  }

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    ensureConfigured();
    const emailError = this.validateEmail(credentials.email);
    if (emailError) return { success: false, error: emailError };
    const passwordError = this.validatePassword(credentials.password);
    if (passwordError) return { success: false, error: passwordError };

    const useBackend = await pingBackend();
    if (!useBackend) return this.loginLocal(credentials);

    const form = new FormData();
    form.append('username', credentials.email);
    form.append('password', credentials.password);

    try {
      const res = await apiRequest<ApiTokenResponse>('/auth/login', {
        method: 'POST',
        formData: form,
        skipAuth: true,
      });
      const user = mapApiUser(res.user);
      persistSession(res.access_token, user);
      return { success: true, user, token: res.access_token };
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        return this.loginLocal(credentials);
      }
      return { success: false, error: this.toMessage(err, 'Incorrect email or password') };
    }
  }

  private async loginLocal(credentials: AuthCredentials): Promise<AuthResponse> {
    const users = getLocalUsers();
    const record = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
    if (!record) {
      return {
        success: false,
        error: 'No account found. Try the demo account demo@mindmirror.app / demo123',
      };
    }
    const [salt, expected] = record.passwordHash.split('$');
    const provided = await hashPassword(credentials.password, salt);
    if (provided !== expected) {
      return { success: false, error: 'Incorrect email or password' };
    }
    record.updatedAt = new Date().toISOString();
    saveLocalUsers(users);
    const user = mapLocalUser(record);
    const token = localToken(record.id);
    persistSession(token, user);
    return { success: true, user, token, mode: 'offline' };
  }

  async loginAsGuest(): Promise<AuthResponse> {
    ensureConfigured();
    const useBackend = await pingBackend();
    if (!useBackend) return this.guestLocal();

    try {
      const res = await apiRequest<ApiTokenResponse>('/auth/guest', {
        method: 'POST',
        skipAuth: true,
      });
      const user = mapApiUser(res.user);
      persistSession(res.access_token, user);
      return { success: true, user, token: res.access_token };
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        return this.guestLocal();
      }
      return { success: false, error: this.toMessage(err, 'Guest login failed') };
    }
  }

  private async guestLocal(): Promise<AuthResponse> {
    const users = getLocalUsers();
    const id = uuid();
    const now = new Date().toISOString();
    const record: LocalUserRecord = {
      id,
      email: `guest-${id.slice(0, 6)}@local`,
      username: `guest_${id.slice(0, 6)}`,
      passwordHash: '',
      avatar: this.generateAvatar('Guest'),
      createdAt: now,
      updatedAt: now,
      isGuest: true,
    };
    users.push(record);
    saveLocalUsers(users);
    const user = mapLocalUser(record);
    const token = localToken(id);
    persistSession(token, user);
    return { success: true, user, token, mode: 'offline' };
  }

  async loginWithOAuth(provider: 'google' | 'github'): Promise<AuthResponse> {
    return {
      success: false,
      error: `${provider} login is not configured on this deployment. Please use email/password.`,
    };
  }

  async handleOAuthCallback(): Promise<AuthResponse> {
    return { success: false, error: 'OAuth callback is not supported in this build.' };
  }

  async logout(): Promise<void> {
    ensureConfigured();
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (token && !isLocalToken(token)) {
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }

  async resetPasswordForEmail(_email: string): Promise<AuthResponse> {
    return {
      success: false,
      error: 'Password reset via email is not configured on this deployment.',
    };
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr) as User;
      user.createdAt = new Date(user.createdAt);
      if (user.lastLoginAt) user.lastLoginAt = new Date(user.lastLoginAt);
      return user;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser() && !!this.getToken();
  }

  async restoreSession(): Promise<User | null> {
    ensureConfigured();
    const cached = this.getCurrentUser();
    const token = this.getToken();
    if (!cached || !token) return null;

    if (isLocalToken(token)) {
      return cached;
    }

    try {
      const fresh = await apiRequest<ApiUser>('/auth/me');
      const user = mapApiUser(fresh);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      return user;
    } catch {
      return cached;
    }
  }

  generateAvatar(username: string): string {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
    ];
    const color = colors[(username || 'X').charCodeAt(0) % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${color.slice(1)}&color=fff&size=128`;
  }

  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    ensureConfigured();
    const payload: Record<string, string> = {};
    if (updates.username) payload.username = updates.username;
    if (updates.email) payload.email = updates.email;
    if (updates.avatar) payload.avatar_url = updates.avatar;

    const token = this.getToken();
    if (isLocalToken(token)) {
      const cached = this.getCurrentUser();
      if (!cached) return { success: false, error: 'Not signed in' };
      const users = getLocalUsers();
      const record = users.find(u => u.id === cached.id);
      if (!record) return { success: false, error: 'Account not found' };
      if (payload.username) record.username = payload.username;
      if (payload.email) record.email = payload.email;
      if (payload.avatar_url) record.avatar = payload.avatar_url;
      record.updatedAt = new Date().toISOString();
      saveLocalUsers(users);
      const user = mapLocalUser(record);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      return { success: true, user, token: token || undefined, mode: 'offline' };
    }

    try {
      const fresh = await apiRequest<ApiUser>('/auth/me', { method: 'PATCH', body: payload });
      const user = mapApiUser(fresh);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      return { success: true, user, token: token || undefined };
    } catch (err) {
      return { success: false, error: this.toMessage(err, 'Update failed') };
    }
  }

  async changePassword(_oldPassword: string, _newPassword: string): Promise<AuthResponse> {
    return {
      success: false,
      error: 'Password change is not supported in this build. Please contact an administrator.',
    };
  }

  isOffline(): boolean {
    return backendAvailable === false;
  }

  private toMessage(err: unknown, fallback: string): string {
    if (err instanceof ApiError) return err.message || fallback;
    if (err instanceof Error) return err.message || fallback;
    return fallback;
  }
}

// Seed a demo account once for first-time visitors in offline mode
function seedLocalDemoIfEmpty() {
  try {
    if (localStorage.getItem(STORAGE_KEY_LOCAL_USERS)) return;
    void hashPassword('demo123', 'demo-salt').then(hash => {
      const record: LocalUserRecord = {
        id: uuid(),
        email: 'demo@mindmirror.app',
        username: 'demo',
        passwordHash: `demo-salt$${hash}`,
        avatar: 'https://ui-avatars.com/api/?name=demo&background=4F46E5&color=fff&size=128',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveLocalUsers([record]);
    });
  } catch {
    // ignore
  }
}

if (typeof window !== 'undefined') {
  seedLocalDemoIfEmpty();
}

export const authService = AuthService.getInstance();
