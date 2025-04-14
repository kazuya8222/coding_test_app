import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { InterviewProblem } from '../../../../shared/types/interview';
import { CodeEditor } from './CodeEditor';
import { AIChat } from './AIChat';

const API_URL = import.meta.env.VITE_API_URL;

export const InterviewProblemPage: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const [problem, setProblem] = useState<InterviewProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/interview/problems/${problemId}`);
        setProblem(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setError('Failed to load problem');
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error || 'Problem not found'}
      </div>
    );
  }

  return (
    <div className="split-layout">
      {/* Left side - Code Editor */}
      <div className="split-pane split-pane-left">
        <div className="pane-header">
          <h2 className="text-xl font-semibold">Code Editor</h2>
        </div>
        <div className="flex-1 editor-wrapper">
          <CodeEditor
            problemId={problemId}
            testCases={problem.testCases}
          />
        </div>
      </div>

      {/* Right side - AI Chat */}
      <div className="split-pane split-pane-right">
        {/* Feedback Section */}
        {feedback && (
          <div className="p-4 border-b bg-yellow-50">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Feedback</h3>
                <p className="text-yellow-700">{feedback}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Section */}
        <div className="flex-1">
          <div className="h-full flex flex-col">
            <div className="pane-header">
              <h2 className="text-xl font-semibold">AI Interviewer</h2>
            </div>
            <div className="flex-1">
              <AIChat
                problemId={problemId}
                problem={problem}
                onFeedback={setFeedback}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 