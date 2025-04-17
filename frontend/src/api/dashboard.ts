import { DashboardStats, RecentActivity, SkillProgress } from '../types/user';
import { Interview } from '../types/interview';

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch('/dashboard/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return response.json();
};

export const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
  const response = await fetch('/dashboard/activity');
  if (!response.ok) {
    throw new Error('Failed to fetch recent activity');
  }
  return response.json();
};

export const fetchSkillProgress = async (): Promise<SkillProgress> => {
  const response = await fetch('/dashboard/skills');
  if (!response.ok) {
    throw new Error('Failed to fetch skill progress');
  }
  return response.json();
};

export const fetchInterviews = async (type: string): Promise<Interview[]> => {
  const response = await fetch(`/interviews?type=${type}`);
  if (!response.ok) {
    throw new Error('Failed to fetch interviews');
  }
  return response.json();
}; 