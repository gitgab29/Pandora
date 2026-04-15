import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import { authApi } from '../api';
import type { AuthUser } from '../types/auth';

// ── State ──────────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; payload: AuthUser }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; payload: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { user: action.payload, isAuthenticated: true, loading: false };
    case 'CLEAR_USER':
      return { user: null, isAuthenticated: false, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (data: Parameters<typeof authApi.register>[0]) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  // Rehydrate on mount if a token exists
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      dispatch({ type: 'CLEAR_USER' });
      return;
    }
    authApi.me()
      .then(user => dispatch({ type: 'SET_USER', payload: user }))
      .catch(() => {
        authApi.logout();
        dispatch({ type: 'CLEAR_USER' });
      });
  }, []);

  function storeTokensAndUser(tokens: { access: string; refresh: string; user: AuthUser }) {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    dispatch({ type: 'SET_USER', payload: tokens.user });
  }

  async function login(email: string, password: string) {
    const tokens = await authApi.login(email, password);
    storeTokensAndUser(tokens);
  }

  async function loginWithGoogle(idToken: string) {
    const tokens = await authApi.google(idToken);
    storeTokensAndUser(tokens);
  }

  async function register(data: Parameters<typeof authApi.register>[0]) {
    const tokens = await authApi.register(data);
    storeTokensAndUser(tokens);
  }

  function logout() {
    authApi.logout();
    dispatch({ type: 'CLEAR_USER' });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
