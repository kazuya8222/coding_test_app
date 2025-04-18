import {axiosInstance} from './axios';
import { UserProfile, SkillProgress, DashboardStats, RecentActivity } from '../types/user';

export const userApi = {
  // プロフィール関連
  getProfile: async () => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data;
  },

  // 面接履歴と進捗
  getInterviewHistory: async () => {
    const response = await axiosInstance.get('/users/interview-history');
    return response.data;
  },

  getSkillProgress: async () => {
    const response = await axiosInstance.get('/users/skill-progress');
    return response.data;
  },

  // ダッシュボード関連
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/users/dashboard/stats');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await axiosInstance.get('/users/dashboard/recent-activity');
    return response.data;
  },

  getRecommendedInterviews: async () => {
    const response = await axiosInstance.get('/users/dashboard/recommendations');
    return response.data;
  },

  // お気に入り関連
  getFavoriteInterviews: async () => {
    const response = await axiosInstance.get('/users/favorites');
    return response.data;
  },

  updateFavoriteInterviews: async (interviewIds: string[]) => {
    const response = await axiosInstance.post('/users/favorites', { interviewIds });
    return response.data;
  }
}; 