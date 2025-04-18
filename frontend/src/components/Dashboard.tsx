import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userApi, interviewApi } from '../api/index';
import { InterviewType, InterviewRole, InterviewDifficulty } from '../types/interview';
import { DashboardStats, RecentActivity, SkillProgress } from '../types/user';
import { InterviewCard } from './InterviewCard';
import { BellIcon, SettingsIcon } from './Icons';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<InterviewType>('coding');
  const [techRole, setTechRole] = useState<InterviewRole>('frontend');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress | null>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, activityData, progressData] = await Promise.all([
          userApi.getDashboardStats(),
          userApi.getRecentActivity(),
          userApi.getSkillProgress()
        ]);
        setStats(statsData);
        setRecentActivity(activityData);
        setSkillProgress(progressData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const data = await interviewApi.getInterviewsByType(activeTab);
        setInterviews(data);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [activeTab]);

  const handleStartInterview = async (interviewId: string) => {
    try {
      const response = await interviewApi.startInterview(interviewId);
      // 面接開始後の処理（例：面接ページへのリダイレクト）
      console.log('Interview started:', response);
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダーセクション */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">CodeInterview AI</h1>
            <div className="flex items-center space-x-6">
              <button className="text-gray-600 hover:text-gray-900">
                <BellIcon />
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                <SettingsIcon />
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-gray-700">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 概要カード */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">総面接回数</h3>
                <p className="mt-2 text-3xl font-bold text-blue-900">{stats.totalInterviews}</p>
                <p className="mt-1 text-sm text-blue-600">先週比 +{stats.weeklyChange}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">平均スコア</h3>
                <p className="mt-2 text-3xl font-bold text-green-900">{stats.averageScore}%</p>
                <p className="mt-1 text-sm text-green-600">先月比 +{stats.monthlyScoreChange}%</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="text-sm font-medium text-purple-800">解いた問題数</h3>
                <p className="mt-2 text-3xl font-bold text-purple-900">{stats.problemsSolved}</p>
                <p className="mt-1 text-sm text-purple-600">目標の {stats.progressPercentage}%</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-800">次のレベル</h3>
                <p className="mt-2 text-3xl font-bold text-yellow-900">{stats.nextLevel}</p>
                <div className="mt-2 w-full bg-yellow-200 rounded-full h-2.5">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${stats.levelProgress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 面接タイプタブ */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'coding' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
                onClick={() => setActiveTab('coding')}
              >
                コーディング面接
              </button>
              <button
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'technical' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
                onClick={() => setActiveTab('technical')}
              >
                技術質問面接
              </button>
              <button
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'behavioral' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
                onClick={() => setActiveTab('behavioral')}
              >
                行動面接
              </button>
            </nav>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interviews.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onStart={() => handleStartInterview(interview.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 進捗トラッキング */}
        {skillProgress && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">スキル分析</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">テクニカルスキル</h3>
                  <div className="space-y-3">
                    {Object.entries(skillProgress.technical).map(([skill, value]) => (
                      <div key={skill}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{skill}</span>
                          <span className="text-sm font-medium text-gray-700">{value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">ソフトスキル</h3>
                  <div className="space-y-3">
                    {Object.entries(skillProgress.soft).map(([skill, value]) => (
                      <div key={skill}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{skill}</span>
                          <span className="text-sm font-medium text-gray-700">{value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* クイックアクション */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">クイックアクション</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center">
                  <span>前回の面接を続ける</span>
                </button>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center">
                  <span>カスタム面接を作成</span>
                </button>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center">
                  <span>面接をスケジュール</span>
                </button>
              </div>

              <h3 className="text-md font-semibold text-gray-800 mt-6 mb-3">お知らせ</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};