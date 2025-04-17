import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// import { ProblemList } from './interview/ProblemList';

// アイコンのインポート (実際の実装ではreact-iconsなどを使用)
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// 面接カードコンポーネント
interface InterviewCardProps {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time: string;
  description: string;
  onStart: () => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ title, difficulty, time, description, onStart }) => {
  const difficultyColor = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${difficultyColor[difficulty]}`}>
          {difficulty === 'easy' ? '初級' : difficulty === 'medium' ? '中級' : '上級'}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500">所要時間: {time}</p>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      <button
        onClick={onStart}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
      >
        面接開始
      </button>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'coding' | 'technical' | 'behavioral'>('coding');
  const [techRole, setTechRole] = useState<'frontend' | 'backend' | 'fullstack' | 'mobile' | 'devops'>('frontend');
  
  const handleStartInterview = (type: string, id: string) => {
    console.log(`Starting ${type} interview: ${id}`);
    // ここで面接開始のロジックを実装
    // 例: history.push(`/interview/${type}/${id}`);
  };

  const renderCodingInterviews = () => (
    <div>
      <div className="flex space-x-4 mb-4">
        <div className="w-48">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">プログラミング言語</label>
          <select
            id="language"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option>すべて</option>
            <option>JavaScript</option>
            <option>Python</option>
            <option>Java</option>
            <option>C++</option>
            <option>Go</option>
          </select>
        </div>
        <div className="w-48">
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">難易度</label>
          <select
            id="difficulty"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option>すべて</option>
            <option>初級</option>
            <option>中級</option>
            <option>上級</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InterviewCard
          title="配列の二分探索"
          difficulty="easy"
          time="30分"
          description="ソート済み配列から指定された値を効率的に検索するアルゴリズムを実装します。"
          onStart={() => handleStartInterview('coding', 'binary-search')}
        />
        <InterviewCard
          title="連結リストの逆転"
          difficulty="medium"
          time="45分"
          description="単方向連結リストを逆順に並べ替えるアルゴリズムを実装します。"
          onStart={() => handleStartInterview('coding', 'reverse-linked-list')}
        />
        <InterviewCard
          title="グラフの最短経路"
          difficulty="hard"
          time="60分"
          description="重み付きグラフでの最短経路を見つけるダイクストラアルゴリズムを実装します。"
          onStart={() => handleStartInterview('coding', 'shortest-path')}
        />
      </div>

      <div className="mt-4 text-center">
        <button className="text-blue-600 hover:text-blue-800 font-medium">
          もっと見る
        </button>
      </div>
    </div>
  );

  const renderTechnicalInterviews = () => (
    <div>
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          {(['frontend', 'backend', 'fullstack', 'mobile', 'devops'] as const).map((role) => (
            <button
              key={role}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${techRole === role 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
              onClick={() => setTechRole(role)}
            >
              {role === 'frontend' ? 'フロントエンド' :
               role === 'backend' ? 'バックエンド' :
               role === 'fullstack' ? 'フルスタック' :
               role === 'mobile' ? 'モバイル' : 'DevOps'}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex space-x-4 mb-4">
        <div className="w-48">
          <label htmlFor="tech-stack" className="block text-sm font-medium text-gray-700">技術スタック</label>
          <select
            id="tech-stack"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option>すべて</option>
            {techRole === 'frontend' && (
              <>
                <option>React</option>
                <option>Vue</option>
                <option>Angular</option>
              </>
            )}
            {techRole === 'backend' && (
              <>
                <option>Node.js</option>
                <option>Python</option>
                <option>Java</option>
              </>
            )}
          </select>
        </div>
        <div className="w-48">
          <label htmlFor="tech-difficulty" className="block text-sm font-medium text-gray-700">難易度</label>
          <select
            id="tech-difficulty"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option>すべて</option>
            <option>初級</option>
            <option>中級</option>
            <option>上級</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InterviewCard
          title="React パフォーマンス最適化"
          difficulty="medium"
          time="45分"
          description="Reactアプリケーションのパフォーマンスを最適化する手法について議論します。"
          onStart={() => handleStartInterview('technical', 'react-performance')}
        />
        <InterviewCard
          title="状態管理設計"
          difficulty="medium"
          time="30分"
          description="大規模アプリケーションにおける効果的な状態管理手法について議論します。"
          onStart={() => handleStartInterview('technical', 'state-management')}
        />
        <InterviewCard
          title="Web セキュリティ"
          difficulty="hard"
          time="45分"
          description="一般的なWebセキュリティの脆弱性と対策について議論します。"
          onStart={() => handleStartInterview('technical', 'web-security')}
        />
      </div>

      <div className="mt-4 text-center">
        <button className="text-blue-600 hover:text-blue-800 font-medium">
          もっと見る
        </button>
      </div>
    </div>
  );

  const renderBehavioralInterviews = () => (
    <div>
      <div className="flex space-x-4 mb-4">
        <div className="w-48">
          <label htmlFor="interview-type" className="block text-sm font-medium text-gray-700">面接タイプ</label>
          <select
            id="interview-type"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option>すべて</option>
            <option>リーダーシップ</option>
            <option>チームワーク</option>
            <option>問題解決</option>
            <option>コンフリクト解決</option>
          </select>
        </div>
        <div className="w-48">
          <label htmlFor="company-culture" className="block text-sm font-medium text-gray-700">企業文化</label>
          <select
            id="company-culture"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option>すべて</option>
            <option>スタートアップ</option>
            <option>大企業</option>
            <option>GAFA風</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InterviewCard
          title="チームでの困難な状況"
          difficulty="medium"
          time="30分"
          description="チームで困難な状況に直面したときの対処法について議論します。"
          onStart={() => handleStartInterview('behavioral', 'team-challenge')}
        />
        <InterviewCard
          title="リーダーシップ体験"
          difficulty="medium"
          time="30分"
          description="あなたがリーダーシップを発揮した具体的な経験について議論します。"
          onStart={() => handleStartInterview('behavioral', 'leadership')}
        />
        <InterviewCard
          title="失敗からの学び"
          difficulty="easy"
          time="30分"
          description="過去の失敗から学んだこと、そして同じ失敗を繰り返さないための対策について議論します。"
          onStart={() => handleStartInterview('behavioral', 'failure-learning')}
        />
      </div>

      <div className="mt-4 text-center">
        <button className="text-blue-600 hover:text-blue-800 font-medium">
          もっと見る
        </button>
      </div>
    </div>
  );

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
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">総面接回数</h3>
              <p className="mt-2 text-3xl font-bold text-blue-900">12</p>
              <p className="mt-1 text-sm text-blue-600">先週比 +3</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">平均スコア</h3>
              <p className="mt-2 text-3xl font-bold text-green-900">78%</p>
              <p className="mt-1 text-sm text-green-600">先月比 +5%</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800">解いた問題数</h3>
              <p className="mt-2 text-3xl font-bold text-purple-900">24</p>
              <p className="mt-1 text-sm text-purple-600">目標の 60%</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800">次のレベル</h3>
              <p className="mt-2 text-3xl font-bold text-yellow-900">中級</p>
              <div className="mt-2 w-full bg-yellow-200 rounded-full h-2.5">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </div>

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
            {activeTab === 'coding' && renderCodingInterviews()}
            {activeTab === 'technical' && renderTechnicalInterviews()}
            {activeTab === 'behavioral' && renderBehavioralInterviews()}
          </div>
        </div>

        {/* 下部グリッド */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 進捗トラッキング */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">スキル分析</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">テクニカルスキル</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">アルゴリズム</span>
                      <span className="text-sm font-medium text-gray-700">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">データ構造</span>
                      <span className="text-sm font-medium text-gray-700">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">システム設計</span>
                      <span className="text-sm font-medium text-gray-700">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">ソフトスキル</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">コミュニケーション</span>
                      <span className="text-sm font-medium text-gray-700">80%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">問題解決能力</span>
                      <span className="text-sm font-medium text-gray-700">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">リーダーシップ</span>
                      <span className="text-sm font-medium text-gray-700">55%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '55%' }}></div>
                    </div>
                  </div>
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
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">Googleの新しい面接対策モジュールが追加されました</p>
                  <p className="text-xs text-gray-500">2時間前</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">メルカリの面接トレンド分析レポートが更新されました</p>
                  <p className="text-xs text-gray-500">1日前</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};