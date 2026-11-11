import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return { user: action.user, isLoading: false, isAuthenticated: true };
    case 'AUTH_FAILURE':
    case 'LOGOUT':
      return { user: null, isLoading: false, isAuthenticated: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.user } };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuth = useCallback(async () => {
    try {
      const data = await authAPI.me();
      dispatch({ type: 'AUTH_SUCCESS', user: data.user });
    } catch {
      dispatch({ type: 'AUTH_FAILURE' });
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for auth:logout events (from API interceptor)
    const handleLogout = () => dispatch({ type: 'LOGOUT' });
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [checkAuth]);

  const login = useCallback(async (credentials) => {
    const data = await authAPI.login(credentials);
    dispatch({ type: 'AUTH_SUCCESS', user: data.user });
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await authAPI.register(userData);
    dispatch({ type: 'AUTH_SUCCESS', user: data.user });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((user) => {
    dispatch({ type: 'UPDATE_USER', user });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
