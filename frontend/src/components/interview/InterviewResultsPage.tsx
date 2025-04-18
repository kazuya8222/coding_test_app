import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

interface InterviewResult {
  _id: string;
  problem_id: {
    title: string;
    description: string;
    difficulty: string;
    interview_type: string;
  };
  status: string;
  start_time: string;
  end_time: string;
  video_recording_url?: string;
  audio_recording_url?: string;
  full_transcript?: string;
  messages: Array<{
    speaker: 'user' | 'ai';
    message: string;
    timestamp: string;
  }>;
  question_responses?: Array<{
    question: string;
    response_transcript: string;
    response_time: number;
    response_quality_score?: number;
  }>;
  speech_analysis?: {
    speech_rate?: number;
    filler_word_count?: number;
    clarity_score?: number;
    confidence_score?: number;
    sentiment_analysis?: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
  evaluation?: {
    technical_score?: number;
    communication_score?: number;
    problem_solving_score?: number;
    overall_score: number;
    strengths?: string[];
    weaknesses?: string[];
    improvement_suggestions?: string[];
    feedback?: string;
    evaluated_at: string;
  };
}

export const InterviewResultsPage: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'feedback' | 'video'>('overview');

  useEffect(() => {
    const fetchInterviewResults = async () => {
      try {
        const response = await axios.get(`${API_URL}/video-interviews/${interviewId}/results`);
        setResult(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching interview results:', error);
        setError('Failed to load interview results');
        setLoading(false);
      }
    };

    fetchInterviewResults();
  }, [interviewId]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate interview duration in minutes
  const calculateDuration = () => {
    if (!result || !result.start_time || !result.end_time) return 'N/A';
    
    const start = new Date(result.start_time);
    const end = new Date(result.end_time);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    return `${minutes} min ${seconds} sec`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error || 'Interview results not found'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Interview Results</h1>
            <p className="text-sm text-gray-500">{result.problem_id.title} - {result.problem_id.interview_type.charAt(0).toUpperCase() + result.problem_id.interview_type.slice(1)} Interview</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transcript'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('transcript')}
              >
                Transcript
              </button>
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'feedback'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('feedback')}
              >
                Feedback & Analysis
              </button>
              {result.video_recording_url && (
                <button
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'video'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('video')}
                >
                  Video Recording
                </button>
              )}
            </nav>
          </div>

          {/* Tab content */}
          <div>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Interview Summary Card */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Interview Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Problem</h3>
                        <p className="text-base text-gray-900">{result.problem_id.title}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Interview Type</h3>
                        <p className="text-base text-gray-900 capitalize">{result.problem_id.interview_type}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Difficulty</h3>
                        <p className="text-base text-gray-900 capitalize">{result.problem_id.difficulty}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                        <p className="text-base text-gray-900">{formatDate(result.start_time)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                        <p className="text-base text-gray-900">{calculateDuration()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          result.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Summary Card */}
                {result.evaluation && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {result.evaluation.technical_score && (
                        <div className="bg-indigo-50 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-indigo-800 mb-2">Technical Score</h3>
                          <div className="flex items-end">
                            <p className="text-3xl font-bold text-indigo-600">{result.evaluation.technical_score}</p>
                            <p className="text-sm text-indigo-600 ml-1">/100</p>
                          </div>
                        </div>
                      )}
                      {result.evaluation.communication_score && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-green-800 mb-2">Communication Score</h3>
                          <div className="flex items-end">
                            <p className="text-3xl font-bold text-green-600">{result.evaluation.communication_score}</p>
                            <p className="text-sm text-green-600 ml-1">/100</p>
                          </div>
                        </div>
                      )}
                      {result.evaluation.problem_solving_score && (
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-purple-800 mb-2">Problem Solving Score</h3>
                          <div className="flex items-end">
                            <p className="text-3xl font-bold text-purple-600">{result.evaluation.problem_solving_score}</p>
                            <p className="text-sm text-purple-600 ml-1">/100</p>
                          </div>
                        </div>
                      )}
                      <div className="bg-blue-50 rounded-lg p-4 md:col-span-3">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">Overall Score</h3>
                        <div className="w-full bg-blue-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full" 
                            style={{ width: `${result.evaluation.overall_score}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-blue-600">0%</span>
                          <span className="text-sm font-semibold text-blue-800">{result.evaluation.overall_score}%</span>
                          <span className="text-xs text-blue-600">100%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Speech Analysis Card */}
                {result.speech_analysis && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Speech Analysis</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {result.speech_analysis.speech_rate && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Speech Rate</h3>
                            <p className="text-base text-gray-900">{result.speech_analysis.speech_rate.toFixed(1)} words per minute</p>
                          </div>
                        )}
                        {result.speech_analysis.filler_word_count !== undefined && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Filler Words</h3>
                            <p className="text-base text-gray-900">{result.speech_analysis.filler_word_count} instances</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {result.speech_analysis.clarity_score && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Clarity Score</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ width: `${result.speech_analysis.clarity_score}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{result.speech_analysis.clarity_score.toFixed(1)}%</p>
                          </div>
                        )}
                        {result.speech_analysis.confidence_score && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Confidence Score</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${result.speech_analysis.confidence_score}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{result.speech_analysis.confidence_score.toFixed(1)}%</p>
                          </div>
                        )}
                      </div>
                      {result.speech_analysis.sentiment_analysis && (
                        <div className="md:col-span-2">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Sentiment Analysis</h3>
                          <div className="flex">
                            <div className="flex-1 bg-green-100 h-8 rounded-l-lg flex items-center justify-center">
                              <span className="text-sm font-medium text-green-800">
                                Positive: {(result.speech_analysis.sentiment_analysis.positive * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex-1 bg-blue-100 h-8 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-800">
                                Neutral: {(result.speech_analysis.sentiment_analysis.neutral * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex-1 bg-red-100 h-8 rounded-r-lg flex items-center justify-center">
                              <span className="text-sm font-medium text-red-800">
                                Negative: {(result.speech_analysis.sentiment_analysis.negative * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transcript Tab */}
            {activeTab === 'transcript' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Interview Transcript</h2>
                {result.full_transcript ? (
                  <div className="whitespace-pre-wrap text-gray-700">{result.full_transcript}</div>
                ) : (
                  <div className="space-y-6">
                    {result.messages.map((message, index) => (
                      <div key={index} className={`flex ${message.speaker === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        {message.speaker === 'ai' && (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                          </div>
                        )}
                        <div 
                          className={`max-w-lg p-4 rounded-lg ${
                            message.speaker === 'ai' 
                              ? 'bg-indigo-50 text-gray-700' 
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <div className="text-xs mb-1 opacity-75">
                            {formatDate(message.timestamp)}
                          </div>
                          <p>{message.message}</p>
                        </div>
                        {message.speaker === 'user' && (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ml-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="space-y-6">
                {/* Feedback Card */}
                {result.evaluation && result.evaluation.feedback && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Feedback</h2>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-line">{result.evaluation.feedback}</p>
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                {result.evaluation && (result.evaluation.strengths || result.evaluation.weaknesses) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.evaluation.strengths && result.evaluation.strengths.length > 0 && (
                      <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-green-700">Strengths</h2>
                        <ul className="space-y-2">
                          {result.evaluation.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.evaluation.weaknesses && result.evaluation.weaknesses.length > 0 && (
                      <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-red-700">Areas for Improvement</h2>
                        <ul className="space-y-2">
                          {result.evaluation.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Improvement Suggestions */}
                {result.evaluation && result.evaluation.improvement_suggestions && result.evaluation.improvement_suggestions.length > 0 && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-blue-700">Suggestions for Improvement</h2>
                    <div className="space-y-4">
                      {result.evaluation.improvement_suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            </div>
                            <p className="ml-3 text-blue-700">{suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question Responses Analysis */}
                {result.question_responses && result.question_responses.length > 0 && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Question Response Analysis</h2>
                    <div className="space-y-6">
                      {result.question_responses.map((response, index) => (
                        <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                          <h3 className="text-lg font-medium mb-2">Question {index + 1}</h3>
                          <p className="text-gray-700 mb-4">{response.question}</p>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Response Time</h4>
                            <p className="text-gray-800">{response.response_time} seconds</p>
                          </div>
                          
                          {response.response_quality_score !== undefined && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-500 mb-1">Response Quality</h4>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${response.response_quality_score}%` }}
                                ></div>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{response.response_quality_score}%</p>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Your Response</h4>
                            <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                              {response.response_transcript}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Video Recording Tab */}
            {activeTab === 'video' && result.video_recording_url && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Interview Recording</h2>
                <div className="aspect-w-16 aspect-h-9 bg-gray-800 rounded-lg overflow-hidden">
                  <video 
                    controls 
                    className="w-full"
                    src={`${API_URL}/uploads/video/${result.video_recording_url}`}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewResultsPage;