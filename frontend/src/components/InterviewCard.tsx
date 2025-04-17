import React from 'react';
import { Interview, InterviewType, InterviewRole, InterviewDifficulty } from '../types/interview';

interface InterviewCardProps {
  interview: Interview;
  onStart: () => void;
}

export const InterviewCard: React.FC<InterviewCardProps> = ({ interview, onStart }) => {
  const getDifficultyColor = (difficulty: InterviewDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: InterviewType) => {
    switch (type) {
      case 'coding':
        return 'コーディング';
      case 'technical':
        return '技術質問';
      case 'behavioral':
        return '行動';
      default:
        return type;
    }
  };

  const getRoleLabel = (role?: InterviewRole) => {
    switch (role) {
      case 'frontend':
        return 'フロントエンド';
      case 'backend':
        return 'バックエンド';
      case 'fullstack':
        return 'フルスタック';
      case 'devops':
        return 'DevOps';
      default:
        return role;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}時間${remainingMinutes}分`
      : `${hours}時間`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{interview.title}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(interview.difficulty)}`}>
            {interview.difficulty}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">タイプ:</span>
            <span>{getTypeLabel(interview.type)}</span>
          </div>
          {interview.role && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium mr-2">役割:</span>
              <span>{getRoleLabel(interview.role)}</span>
            </div>
          )}
          {interview.language && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium mr-2">言語:</span>
              <span>{interview.language}</span>
            </div>
          )}
          {interview.techStack && interview.techStack.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium mr-2">技術スタック:</span>
              <span>{interview.techStack.join(', ')}</span>
            </div>
          )}
          {interview.companyCulture && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium mr-2">企業文化:</span>
              <span>{interview.companyCulture}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4">{interview.description}</p>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              制限時間: {formatTime(interview.time)}
            </span>
            {interview.status !== 'not_started' && (
              <span className={`text-sm ${
                interview.status === 'completed' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {interview.status === 'completed' ? '完了' : '進行中'}
              </span>
            )}
          </div>
          <button
            onClick={onStart}
            disabled={interview.status === 'in_progress'}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              interview.status === 'in_progress'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {interview.status === 'in_progress' ? '進行中' : '開始する'}
          </button>
        </div>
      </div>
    </div>
  );
}; 