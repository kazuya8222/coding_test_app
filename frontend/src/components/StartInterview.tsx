import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';

interface StartInterviewProps {
  interviewId: string;
  interviewTitle: string;
  interviewType: string;
  interviewDuration: number;
  onStart: (id: string) => Promise<void>;
  disabled?: boolean;
}

export const StartInterview: React.FC<StartInterviewProps> = ({
  interviewId,
  interviewTitle,
  interviewType,
  interviewDuration,
  onStart,
  disabled = false
}) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (countdown === 0) {
      startInterview();
    }
  }, [countdown]);

  const handleStartClick = () => {
    setShowModal(true);
    setError(null);
  };
  
  const startCountdown = () => {
    setCountdown(3);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev !== null && prev > 0) {
          return prev - 1;
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);
    
    return () => clearInterval(timer);
  };
  
  const startInterview = async () => {
    setIsLoading(true);
    try {
      await onStart(interviewId);
      // Navigate to the interview page
      navigate(`/interview/${interviewId}`);
    } catch (err) {
      console.error('Failed to start interview:', err);
      setError('面接の開始に失敗しました。もう一度お試しください。');
      setCountdown(null);
      setIsLoading(false);
    }
  };
  
  const handleReadyClick = () => {
    startCountdown();
  };
  
  const getTypeLabel = (type: string) => {
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
  
  const formatDuration = (minutes: number) => {
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
    <>
      <button
        onClick={handleStartClick}
        disabled={disabled || isLoading}
        className={`px-4 py-2 rounded-md transition-colors duration-200 ${
          disabled || isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? '開始中...' : '開始する'}
      </button>
      
      {showModal && (
        <Modal 
          onClose={() => countdown === null && !isLoading && setShowModal(false)}
          closeOnOutsideClick={countdown === null && !isLoading}
        >
          {countdown !== null ? (
            <div className="p-10 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold mb-6">面接が始まります...</h2>
              <div className="text-6xl font-bold text-blue-600 mb-8">
                {countdown}
              </div>
              <p className="text-gray-600">落ち着いて、自信を持って！</p>
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">{interviewTitle}</h2>
              <p className="mb-3">このインタビューの準備はできていますか？</p>
              
              <div className="mb-4">
                <h3 className="font-medium">インタビュー詳細:</h3>
                <ul className="list-disc pl-5 mt-2">
                  <li>タイプ: {getTypeLabel(interviewType)}</li>
                  <li>予想時間: {formatDuration(interviewDuration)}</li>
                </ul>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleReadyClick}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  準備OK
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
};