import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api';
import { UserProfile } from '../types/user';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    job_title: '',
    experience_level: '',
    preferred_languages: [] as string[],
    target_companies: [] as string[]
  });
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await userApi.getProfile();
        setProfile(profileData.profile);
        setFormData({
          name: profileData.name || '',
          bio: profileData.profile?.bio || '',
          job_title: profileData.profile?.job_title || '',
          experience_level: profileData.profile?.experience_level || 'entry',
          preferred_languages: profileData.profile?.preferred_languages || [],
          target_companies: profileData.profile?.target_companies || []
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'preferred_languages' | 'target_companies') => {
    const values = e.target.value.split(',').map(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [field]: values
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updatedProfile = await userApi.updateProfile({
        name: formData.name,
        profile: {
          bio: formData.bio,
          job_title: formData.job_title,
          experience_level: formData.experience_level as 'entry' | 'junior' | 'mid' | 'senior',
          preferred_languages: formData.preferred_languages,
          target_companies: formData.target_companies
        }
      });
      
      // Update the user context with the new profile data
      if (setUser && user) {
        setUser({
          ...user,
          name: formData.name,
          profile: {
            ...user.profile,
            bio: formData.bio,
            job_title: formData.job_title,
            experience_level: formData.experience_level as 'entry' | 'junior' | 'mid' | 'senior',
            preferred_languages: formData.preferred_languages,
            target_companies: formData.target_companies
          }
        });
      }
      
      alert('プロフィールが正常に更新されました');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('プロフィールの更新中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">プロフィール設定</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              ダッシュボードに戻る
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* 名前 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  名前
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              {/* 職種 */}
              <div>
                <label htmlFor="job_title" className="block text-sm font-medium text-gray-700">
                  職種
                </label>
                <input
                  type="text"
                  name="job_title"
                  id="job_title"
                  value={formData.job_title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* 経験レベル */}
              <div>
                <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700">
                  経験レベル
                </label>
                <select
                  id="experience_level"
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="entry">エントリーレベル</option>
                  <option value="junior">ジュニア</option>
                  <option value="mid">ミドル</option>
                  <option value="senior">シニア</option>
                </select>
              </div>
              
              {/* 自己紹介 */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  自己紹介
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* 使用言語 */}
              <div>
                <label htmlFor="preferred_languages" className="block text-sm font-medium text-gray-700">
                  使用言語（カンマ区切りで入力）
                </label>
                <input
                  type="text"
                  id="preferred_languages"
                  value={formData.preferred_languages.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'preferred_languages')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* 志望企業 */}
              <div>
                <label htmlFor="target_companies" className="block text-sm font-medium text-gray-700">
                  志望企業（カンマ区切りで入力）
                </label>
                <input
                  type="text"
                  id="target_companies"
                  value={formData.target_companies.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'target_companies')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* 操作ボタン */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存する'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};