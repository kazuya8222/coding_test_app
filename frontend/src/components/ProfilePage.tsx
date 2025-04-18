import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api';
import { UserProfile, ExperienceLevel } from '../types/user';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [languageInput, setLanguageInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    job_title: '',
    experience_level: 'entry' as ExperienceLevel,
    preferred_languages: [] as string[],
    target_companies: [] as string[]
  });
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await userApi.getProfile();
        setFormData({
          name: profileData.name || '',
          bio: profileData.profile?.bio || '',
          job_title: profileData.profile?.job_title || '',
          experience_level: profileData.profile?.experience_level || 'entry',
          preferred_languages: profileData.profile?.preferred_languages || [],
          target_companies: profileData.profile?.target_companies || []
        });
        
        // プロフィール画像がある場合は設定
        if (profileData.profile?.avatar_url) {
          setProfileImage(profileData.profile.avatar_url);
        }
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

  const handleAddLanguage = () => {
    if (languageInput.trim() === '') return;
    
    setFormData(prev => ({
      ...prev,
      preferred_languages: [...prev.preferred_languages, languageInput.trim()]
    }));
    setLanguageInput('');
  };

  const handleRemoveLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preferred_languages: prev.preferred_languages.filter((_, i) => i !== index)
    }));
  };

  const handleAddCompany = () => {
    if (companyInput.trim() === '') return;
    
    setFormData(prev => ({
      ...prev,
      target_companies: [...prev.target_companies, companyInput.trim()]
    }));
    setCompanyInput('');
  };

  const handleRemoveCompany = (index: number) => {
    setFormData(prev => ({
      ...prev,
      target_companies: prev.target_companies.filter((_, i) => i !== index)
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
          experience_level: formData.experience_level,
          preferred_languages: formData.preferred_languages,
          target_companies: formData.target_companies,
          avatar_url: profileImage
        }
      });
      
      // Update the user context with new profile data
      if (setUser && user) {
        setUser({
          ...user,
          name: formData.name,
          profile: {
            ...user.profile,
            bio: formData.bio,
            job_title: formData.job_title,
            experience_level: formData.experience_level,
            preferred_languages: formData.preferred_languages,
            target_companies: formData.target_companies,
            avatar_url: profileImage
          }
        });
      }
      
      // Success notification
      const notification = document.getElementById('notification');
      if (notification) {
        notification.classList.remove('hidden');
        setTimeout(() => {
          notification.classList.add('hidden');
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('プロフィールの更新中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  // プロファイル画像のアップロード処理（モック）
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 実際の実装ではファイルアップロードAPIを呼び出す
      // ここではFileReaderでプレビュー表示のみ
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <span className="mt-4 text-gray-600">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 rounded-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              ダッシュボードに戻る
            </button>
          </div>
        </div>
      </header>

      {/* 成功通知 */}
      <div id="notification" className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg hidden transform transition-transform duration-300 ease-in-out">
        プロフィールが正常に更新されました
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* プロフィールコンテンツ */}
          <div className="flex flex-col md:flex-row">
            {/* サイドバー */}
            <div className="w-full md:w-64 bg-gray-50 p-6 flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4 flex items-center justify-center border-4 border-white shadow">
                  {profileImage ? (
                    <img src={profileImage} alt="プロフィール" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-gray-400">{formData.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <label htmlFor="profile-image" className="absolute bottom-4 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <input 
                    type="file" 
                    id="profile-image" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mt-2">{formData.name}</h2>
              <p className="text-gray-500 text-sm">{formData.job_title || 'プロフィールを編集して職種を追加'}</p>

              {/* タブナビゲーション (モバイル向け) */}
              <div className="w-full mt-8 md:hidden">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${
                      activeTab === 'basic' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    基本情報
                  </button>
                  <button
                    onClick={() => setActiveTab('skills')}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${
                      activeTab === 'skills' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    スキル
                  </button>
                  <button
                    onClick={() => setActiveTab('goals')}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${
                      activeTab === 'goals' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    キャリア目標
                  </button>
                </div>
              </div>

              {/* タブナビゲーション (デスクトップ向け) */}
              <nav className="hidden md:block w-full mt-8 space-y-1">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    activeTab === 'basic' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  基本情報
                </button>
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    activeTab === 'skills' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  スキル
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    activeTab === 'goals' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  キャリア目標
                </button>
              </nav>
            </div>

            {/* メインコンテンツ */}
            <div className="flex-1 p-6 md:p-8">
              <form onSubmit={handleSubmit}>
                {/* 基本情報 */}
                <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">基本情報</h3>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        名前
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
                        職種
                      </label>
                      <input
                        type="text"
                        name="job_title"
                        id="job_title"
                        value={formData.job_title}
                        onChange={handleInputChange}
                        placeholder="例: フロントエンドエンジニア"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-1">
                        経験レベル
                      </label>
                      <select
                        id="experience_level"
                        name="experience_level"
                        value={formData.experience_level}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="entry">エントリーレベル (0-2年)</option>
                        <option value="junior">ジュニア (2-4年)</option>
                        <option value="mid">ミドル (4-7年)</option>
                        <option value="senior">シニア (7年以上)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        自己紹介
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="あなた自身のこと、興味のある分野、強みなどを教えてください"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* スキルタブ */}
                <div className={activeTab === 'skills' ? 'block' : 'hidden'}>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">スキルと言語</h3>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="preferred_languages" className="block text-sm font-medium text-gray-700 mb-1">
                        使用言語とフレームワーク
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          id="language-input"
                          value={languageInput}
                          onChange={(e) => setLanguageInput(e.target.value)}
                          placeholder="例: JavaScript, React, Python"
                          className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddLanguage}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          追加
                        </button>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.preferred_languages.map((lang, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {lang}
                            <button
                              type="button"
                              onClick={() => handleRemoveLanguage(index)}
                              className="ml-1.5 inline-flex text-blue-500 hover:text-blue-600 focus:outline-none"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* キャリア目標タブ */}
                <div className={activeTab === 'goals' ? 'block' : 'hidden'}>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">キャリア目標</h3>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="target_companies" className="block text-sm font-medium text-gray-700 mb-1">
                        志望企業
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          id="company-input"
                          value={companyInput}
                          onChange={(e) => setCompanyInput(e.target.value)}
                          placeholder="志望企業を入力"
                          className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddCompany}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          追加
                        </button>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.target_companies.map((company, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                          >
                            {company}
                            <button
                              type="button"
                              onClick={() => handleRemoveCompany(index)}
                              className="ml-1.5 inline-flex text-green-500 hover:text-green-600 focus:outline-none"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 操作ボタン - 常に表示 */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
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
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                  >
                    {saving && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {saving ? '保存中...' : '変更を保存'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};