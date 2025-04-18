import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, LoginCredentials, RegisterData, User } from '../../../shared/types/auth';
import { authApi } from '../api/auth';
import { userApi } from '../api/users';
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await userApi.getProfile();
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false
          }));
        } catch (error) {
          localStorage.removeItem('token');
          setState(prev => ({
            ...prev,
            token: null,
            isAuthenticated: false,
            isLoading: false
          }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { token, user } = await authApi.login(credentials);
      localStorage.setItem('token', token);
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || 'ログインに失敗しました',
        isLoading: false
      }));
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const { token, user } = await authApi.register(data);
      localStorage.setItem('token', token);
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || '登録に失敗しました',
        isLoading: false
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 