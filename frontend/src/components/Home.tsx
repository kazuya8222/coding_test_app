import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">CodeInterview AI</h1>
            <div className="space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                ログイン
              </Link>
              <Link
                to="/register"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                新規登録
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            AIがあなたのコーディング面接をサポート
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            最新のAI技術を活用したコーディング面接シミュレーションで、
            効率的な面接対策と採用プロセスの最適化を実現します。
          </p>
          <div className="space-x-6">
            <Link
              to="/register"
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              無料で始める
            </Link>
            <Link
              to="/login"
              className="inline-block bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ログイン
            </Link>
          </div>
        </div>

        {/* 特徴セクション */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
            <div className="text-blue-500 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.707.707M12 17.25V21" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">リアルな面接体験</h3>
            <p className="text-gray-600">
              AIが実際の面接官のように質問し、コードレビューを行います。
              本番さながらの緊張感の中で練習できます。
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
            <div className="text-blue-500 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">即時フィードバック</h3>
            <p className="text-gray-600">
              コードの品質、パフォーマンス、ベストプラクティスについて、
              AIが即座に詳細なフィードバックを提供します。
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
            <div className="text-blue-500 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">進捗の可視化</h3>
            <p className="text-gray-600">
              面接スキルの成長をグラフで確認できます。
              弱点を特定し、効率的な学習計画を立てることができます。
            </p>
          </div>
        </div>

        {/* 採用担当者向けセクション */}
        <div className="mt-24 bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              採用担当者の方へ
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              CodeInterview AIは、採用プロセスの効率化にも貢献します。
              AIによる客観的な評価と、候補者のスキルレベルの可視化により、
              より効率的な採用判断が可能になります。
            </p>
            <Link
              to="/register"
              className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              企業向けプランを確認
            </Link>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white mt-24 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            © 2024 CodeInterview AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}; 