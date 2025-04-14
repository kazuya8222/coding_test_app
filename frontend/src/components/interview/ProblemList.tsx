import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { InterviewProblem } from '../../../../shared/types/interview';

const API_URL = import.meta.env.VITE_API_URL;

export const ProblemList: React.FC = () => {
  const [problems, setProblems] = useState<InterviewProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/interview/problems`);
        setProblems(response.data);
        setLoading(false);
      } catch (error) {
        console.error('問題の取得に失敗しました:', error);
        setError('問題の取得に失敗しました');
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const handleStartProblem = (problemId: string) => {
    navigate(`/interview/${problemId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {problems.map((problem) => (
        <div key={problem.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{problem.title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {problem.difficulty}
            </span>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">分野:</span> {problem.domain}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">カテゴリ:</span> {problem.category}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">制限時間:</span> {problem.timeLimit}分
            </div>
          </div>

          <p className="text-gray-700 mb-4 line-clamp-3">
            {problem.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {problem.tags.map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>

          <button
            onClick={() => handleStartProblem(problem.id)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
          >
            問題を開始
          </button>
        </div>
      ))}
    </div>
  );
};
