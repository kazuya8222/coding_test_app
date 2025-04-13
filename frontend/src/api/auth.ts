import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse } from '../../../shared/types/auth';

const API_URL = import.meta.env.VITE_API_URL;

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/api/auth/register`, data);
    return response.data;
  },

  login: async (data: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/api/auth/login`, data);
    return response.data;
  },

  getProfile: async (token: string): Promise<AuthResponse['user']> => {
    const response = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
}; 