import axios from 'axios';
import { UserProfile, SkillProgress, DashboardStats, RecentActivity } from '../types/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const userApi = {
  // プロフィール関連
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/users/profile`);
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await axios.put(`${API_URL}/users/profile`, data);
    return response.data;
  },

  // 面接履歴と進捗
  getInterviewHistory: async () => {
    const response = await axios.get(`${API_URL}/users/interview-history`);
    return response.data;
  },

  getSkillProgress: async () => {
    const response = await axios.get(`${API_URL}/users/skill-progress`);
    return response.data;
  },

  // ダッシュボード関連
  getDashboardStats: async () => {
    const response = await axios.get(`${API_URL}/users/dashboard/stats`);
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await axios.get(`${API_URL}/users/dashboard/recent-activity`);
    return response.data;
  },

  getRecommendedInterviews: async () => {
    const response = await axios.get(`${API_URL}/users/dashboard/recommendations`);
    return response.data;
  },

  // お気に入り関連
  getFavoriteInterviews: async () => {
    const response = await axios.get(`${API_URL}/users/favorites`);
    return response.data;
  },

  updateFavoriteInterviews: async (interviewIds: string[]) => {
    const response = await axios.post(`${API_URL}/users/favorites`, { interviewIds });
    return response.data;
  }
}; 