import React, { useState, useEffect } from 'react';
import { InterviewProblem } from '../../../../shared/types/interview';

export const ProblemList: React.FC = () => {
  const [problems, setProblems] = useState<InterviewProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    domain: '',
    category: '',
    difficulty: '',
    tag: ''
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch('/api/interview/problems');
        const data = await response.json();
        setProblems(data);
      } catch (error) {
        console.error('問題の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const filteredProblems = problems.filter(problem => {
    if (filters.domain && problem.domain !== filters.domain) return false;
    if (filters.category && problem.category !== filters.category) return false;
    if (filters.difficulty && problem.difficulty !== filters.difficulty) return false;
    if (filters.tag && !problem.tags.includes(filters.tag)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.domain}
            onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
            className="rounded-lg border-gray-300"
          >
            <option value="">分野を選択</option>
            <option value="アルゴリズム">アルゴリズム</option>
            <option value="システム設計">システム設計</option>
            <option value="データベース">データベース</option>
            <option value="ネットワーク">ネットワーク</option>
            <option value="セキュリティ">セキュリティ</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="rounded-lg border-gray-300"
          >
            <option value="">カテゴリを選択</option>
            <option value="ソート">ソート</option>
            <option value="探索">探索</option>
            <option value="動的計画法">動的計画法</option>
            <option value="グラフ">グラフ</option>
            <option value="文字列処理">文字列処理</option>
            <option value="数学">数学</option>
            <option value="スケーラビリティ">スケーラビリティ</option>
            <option value="可用性">可用性</option>
            <option value="パフォーマンス">パフォーマンス</option>
            <option value="キャッシュ戦略">キャッシュ戦略</option>
            <option value="データベース設計">データベース設計</option>
            <option value="正規化">正規化</option>
            <option value="インデックス">インデックス</option>
            <option value="トランザクション">トランザクション</option>
            <option value="レプリケーション">レプリケーション</option>
            <option value="パーティショニング">パーティショニング</option>
            <option value="TCP/IP">TCP/IP</option>
            <option value="HTTP">HTTP</option>
            <option value="WebSocket">WebSocket</option>
            <option value="DNS">DNS</option>
            <option value="ロードバランシング">ロードバランシング</option>
            <option value="認証">認証</option>
            <option value="認可">認可</option>
            <option value="暗号化">暗号化</option>
            <option value="セッション管理">セッション管理</option>
            <option value="XSS対策">XSS対策</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="rounded-lg border-gray-300"
          >
            <option value="">難易度を選択</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <input
            type="text"
            placeholder="タグで検索"
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            className="rounded-lg border-gray-300"
          />
        </div>
      </div>

      {/* 問題リスト */}
      <div className="space-y-4">
        {filteredProblems.map((problem) => (
          <div key={problem.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{problem.title}</h3>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {problem.domain}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {problem.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
                <p className="mt-4 text-gray-600">{problem.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {problem.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">制限時間: {problem.timeLimit}分</p>
                <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200">
                  開始
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 