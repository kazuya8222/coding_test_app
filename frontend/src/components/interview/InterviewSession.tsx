import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { InterviewProblem } from '../../../../shared/types/interview';

const API_URL = import.meta.env.VITE_API_URL;

export const InterviewSession: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<InterviewProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/interview/problems/${problemId}`);
        setProblem(response.data);
        setLoading(false);
        // タイマーを開始
        setTimer(response.data.timeLimit * 60);
      } catch (error) {
        console.error('問題の取得に失敗しました:', error);
        setError('問題の取得に失敗しました');
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (timer !== null && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev !== null ? prev - 1 : null);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      // タイマーが0になったら自動的に回答を表示
      setShowAnswer(true);
    }
  }, [timer]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="text-red-500 text-center p-4">
        {error || '問題が見つかりません'}
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{problem.title}</h1>
        <div className="text-lg font-semibold text-gray-700">
          残り時間: {timer !== null ? formatTime(timer) : '--:--'}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {problem.difficulty}
          </span>
          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
            {problem.domain}
          </span>
          <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
            {problem.category}
          </span>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">{problem.description}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setCurrentHintIndex(prev => Math.min(prev + 1, problem.hints.length - 1))}
            disabled={currentHintIndex >= problem.hints.length - 1}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 disabled:bg-gray-300"
          >
            {currentHintIndex === -1 ? 'ヒントを表示' : '次のヒントを表示'}
          </button>

          {currentHintIndex >= 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">ヒント {currentHintIndex + 1}</h3>
              <p className="text-yellow-700">{problem.hints[currentHintIndex]}</p>
            </div>
          )}

          <button
            onClick={() => setShowAnswer(true)}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
          >
            回答を表示
          </button>

          {showAnswer && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">期待される回答</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{problem.expectedAnswer}</p>
              
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-2">フォローアップ質問</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {problem.followUpQuestions.map((question, index) => (
                    <li key={index} className="mb-2">{question}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-300"
      >
        ダッシュボードに戻る
      </button>
    </div>
  );
}; 