import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { InterviewProblem } from '../../../../shared/types/interview';

const API_URL = import.meta.env.VITE_API_URL;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  problemId: string;
  problem?: InterviewProblem;
  onFeedback: (feedback: string) => void;
}

// Function to format text with basic markdown-like styling
const formatText = (text: string) => {
  // Bold: **text** or __text__
  const boldFormatted = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');
  
  // Italic: *text* or _text_
  const italicFormatted = boldFormatted.replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>');
  
  // Code: `text`
  const codeFormatted = italicFormatted.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Code blocks: ```text```
  const codeBlockFormatted = codeFormatted.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
  
  // Split by line breaks
  return codeBlockFormatted.split('\n');
};

export const AIChat: React.FC<AIChatProps> = ({ problemId, problem, onFeedback }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial message when component mounts
  useEffect(() => {
    const initialMessage = problem 
      ? `Hello! I'm your AI interviewer. Here's your coding problem:\n\n**${problem.title}**\n\n${problem.description}\n\nDifficulty: ${problem.difficulty}\nTime Limit: ${problem.timeLimit} minutes\n\nFeel free to ask questions if you need any clarification or hints.`
      : 'Hello! I\'m your AI interviewer. I\'m here to guide you through this coding problem. Feel free to ask questions or request hints if you need help.';
      
    setMessages([{
      role: 'assistant',
      content: initialMessage
    }]);
  }, [problem]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/interview/chat`, {
        problemId,
        message: input,
        conversationHistory: messages
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.message
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.data.feedback) {
        onFeedback(response.data.feedback);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100vh - 130px)' }}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
            )}
            <div
              className={`${
                message.role === 'user' 
                  ? 'chat-message chat-message-user'
                  : 'chat-message chat-message-assistant'
              }`}
            >
              {formatText(message.content).map((line, i) => (
                <React.Fragment key={i}>
                  <span dangerouslySetInnerHTML={{ __html: line }} />
                  {i < formatText(message.content).length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <div className="chat-message chat-message-assistant">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="btn btn-primary"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}; 