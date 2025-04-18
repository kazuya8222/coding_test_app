import {axiosInstance} from './axios';
import { Interview, InterviewType, InterviewRole, InterviewDifficulty } from '../types/interview';

export const interviewApi = {
  // 基本操作
  getInterviews: async () => {
    const response = await axiosInstance.get('/interviews');
    return response.data;
  },

  getInterviewById: async (id: string) => {
    const response = await axiosInstance.get(`/interviews/${id}`);
    return response.data;
  },

  startInterview: async (id: string) => {
    const response = await axiosInstance.post(`/interviews/${id}/start`);
    return response.data;
  },

  submitInterview: async (id: string, data: { code?: string; language?: string; messages: any[] }) => {
    const response = await axiosInstance.post(`/interviews/${id}/submit`, data);
    return response.data;
  },

  // フィルタリング
  getInterviewsByType: async (type: string) => {
    const response = await axiosInstance.get(`/interviews/type/${type}`);
    return response.data;
  },

  getInterviewsByRole: async (role: string) => {
    const response = await axiosInstance.get(`/interviews/role/${role}`);
    return response.data;
  },

  getInterviewsByDifficulty: async (difficulty: string) => {
    const response = await axiosInstance.get(`/interviews/difficulty/${difficulty}`);
    return response.data;
  },

  getInterviewsByLanguage: async (language: string) => {
    const response = await axiosInstance.get(`/interviews/language/${language}`);
    return response.data;
  },

  getInterviewsByTechStack: async (stack: string) => {
    const response = await axiosInstance.get(`/interviews/tech-stack/${stack}`);
    return response.data;
  },

  getInterviewsByCompanyCulture: async (culture: string) => {
    const response = await axiosInstance.get(`/interviews/company-culture/${culture}`);
    return response.data;
  }
}; 