import { UserProfile } from '../frontend/src/types/user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  profile: UserProfile;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
} 