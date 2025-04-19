import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { InterviewProblem } from '../../../../shared/types/interview';
import { Modal } from '../Modal';
import { axiosInstance } from '../../api/axios';
const API_URL = import.meta.env.VITE_API_URL;

// Configuration for OpenAI Whisper and GPT-4o
const OPENAI_API_URL = import.meta.env.OPENAI_API_URL || 'https://api.openai.com/v1';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewQuestion {
  id: string;
  question: string;
  asked: boolean;
}

export const VideoInterviewScreen: React.FC = () => {
  // URL params and navigation
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  
  // State for media handling
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [transcription, setTranscription] = useState('');
  
  // Interview state
  const [problem, setProblem] = useState<InterviewProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [interviewSessionId, setInterviewSessionId] = useState<string | null>(null);
  const [loadingResponse, setLoadingResponse] = useState(false);
  
  // Countdown state
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Interview metrics
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  // Load problem details and initialize questions
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axiosInstance.get(`${API_URL}/video-interviews/${problemId}`);
        setProblem(response.data);
        
        let parsedQuestions: InterviewQuestion[] = [];
        
        // Parse questions from question_script
        if (response.data.question_script) {
          // Split by newlines and filter out empty lines
          const lines = response.data.question_script.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
          
          // Process each line to extract questions
          lines.forEach((line, index) => {
            // Check if line contains a question mark or looks like a question
            if (line.includes('?') || line.toLowerCase().startsWith('how') || 
                line.toLowerCase().startsWith('what') || line.toLowerCase().startsWith('why')) {
              parsedQuestions.push({
                id: `q-${index}`,
                question: line,
                asked: false
              });
            }
          });
        }
        
        // Add follow-up questions if available
        if (response.data.follow_up_questions && Array.isArray(response.data.follow_up_questions)) {
          response.data.follow_up_questions.forEach((q: string, i: number) => {
            if (q && q.trim()) {
              parsedQuestions.push({
                id: `fq-${i}`,
                question: q.trim(),
                asked: false
              });
            }
          });
        }
        
        // If we still don't have enough questions, add generic ones
        if (parsedQuestions.length < 3) {
          const genericQuestions = [
            "Can you tell me about your experience with this technology?",
            "How would you approach this problem in a production environment?",
            "What challenges do you foresee with this solution?"
          ];
          
          while (parsedQuestions.length < 3) {
            parsedQuestions.push({
              id: `gq-${parsedQuestions.length}`,
              question: genericQuestions[parsedQuestions.length % genericQuestions.length],
              asked: false
            });
          }
        }
        
        // Set the questions state
        setQuestions(parsedQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setError('Failed to load problem');
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Request camera and microphone access
  useEffect(() => {
    const requestMediaPermission = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        setStream(mediaStream);
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Failed to access camera or microphone. Please ensure permissions are granted.');
      }
    };
    
    requestMediaPermission();
    
    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start interview session
  const startInterview = async () => {
    if (!problemId) return;
    
    try {
      // Create a new interview session
      const response = await axiosInstance.post(`${API_URL}/video-interviews/${problemId}/start`);
      console.log(response.data);
      setInterviewSessionId(response.data._id);
      
      // Set start time
      const now = new Date();
      setStartTime(now);
      
      // Add initial message from AI interviewer
      const initialMessage = {
        role: 'assistant' as const,
        content: `こんにちは！本日の面接官を担当します。『${problem?.title}』について話し合っていきましょう。全てで3つの質問をします。まずは最初の質問からはじめましょう：${questions[0].question}`
      };

      await speakTextWithOpenAI(initialMessage.content, () => {
        startRecording();
      });
      
      setConversationHistory([initialMessage]);
      
      // Mark first question as asked
      const updatedQuestions = [...questions];
      updatedQuestions[0].asked = true;
      setQuestions(updatedQuestions);
      
      setInterviewStarted(true);
    } catch (error) {
      console.error('Error starting interview:', error);
      setError('Failed to start interview session');
    }
  };

  // Start countdown and then interview
  const handleReadyClick = () => {
    setCountdown(3);
    setShowModal(true);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev !== null && prev > 0) {
          return prev - 1;
        } else {
          clearInterval(timer);
          setShowModal(false);
          startInterview();
          return null;
        }
      });
    }, 1000);
  };

  // Handle starting the recording
  const startRecording = () => {
    if (!stream) return;
    
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setAudioChunks(prev => [...prev, event.data]);
      }
    };
    
    mediaRecorder.onstop = handleRecordingStopped;
    
    // Start recording
    setAudioChunks([]);
    mediaRecorder.start();
    setRecording(true);
  };

  // Handle stopping the recording and processing audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Process audio after recording stops
  const handleRecordingStopped = async () => {
    if (audioChunks.length === 0) return;
    
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    
    // Create a FormData object to send the audio
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');
    
    try {
      setLoadingResponse(true);
      
      // Send to Whisper API for transcription
      const response = await axios.post(
        `${OPENAI_API_URL}/audio/transcriptions`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const transcribedText = response.data.text;
      setTranscription(transcribedText);
      
      // Add user message to conversation
      const userMessage = {
        role: 'user' as const,
        content: transcribedText
      };
      
      setConversationHistory(prev => [...prev, userMessage]);
      
      // Get AI response
      await getAIResponse(transcribedText);
      
      setLoadingResponse(false);
    } catch (error) {
      console.error('Error processing audio:', error);
      setLoadingResponse(false);
      setError('Failed to process recording');
    }
  };

  // Get response from GPT-4o
  const getAIResponse = async (userMessage: string) => {
    if (!problemId || !interviewSessionId) return;
    
    try {
      // Determine next action based on current question index
      const nextIndex = currentQuestionIndex + 1;
      
      // Check if this was the last question
      const isLastQuestion = nextIndex >= questions.length;
      
      let aiResponse;
      
      if (isLastQuestion) {
        // If all questions have been asked, end the interview
        aiResponse = "Thank you for your thoughtful responses. We've now completed all the questions for this interview. I appreciate your time and insights. Is there anything else you'd like to add or any questions you have for me before we conclude?";
        setInterviewEnded(true);
      } else {
        // Ask the next question
        const nextQuestion = questions[nextIndex].question;
        aiResponse = `Thank you for your response. Let's move on to the next question: ${nextQuestion}`;
        
        // Mark question as asked
        const updatedQuestions = [...questions];
        updatedQuestions[nextIndex].asked = true;
        setQuestions(updatedQuestions);
        
        // Update current question index
        setCurrentQuestionIndex(nextIndex);
      }
      
      // Add AI response to conversation
      const assistantMessage = {
        role: 'assistant' as const,
        content: aiResponse
      };
      
      setConversationHistory(prev => [...prev, assistantMessage]);
      
      // Save conversation to the interview session
      await axiosInstance.post(`${API_URL}/video-interviews/${interviewSessionId}/message`, {
        messages: [
          { speaker: 'user', message: userMessage },
          { speaker: 'ai', message: aiResponse }
        ]
      });
      
      // Start recording for next response
      if (!isLastQuestion) {
        startRecording();
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Failed to get interviewer response');
    }
  };
  const speakText = (text: string, onEndCallback?: () => void) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP'; // 日本語設定
    if (onEndCallback) {
      utterance.onend = onEndCallback;
    }
    window.speechSynthesis.speak(utterance);
  };

  let currentAudio: HTMLAudioElement | null = null;

  const speakTextWithOpenAI = async (text: string, onEndCallback?: () => void) => {
    try {
      const response = await fetch(`${API_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // ここで前回のaudioを停止する！！
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }

      const audio = new Audio(audioUrl);
      currentAudio = audio; // 今回のaudioを保存しておく
      audio.play();

      audio.onended = () => {
        if (onEndCallback) {
          onEndCallback();
        }
      };
    } catch (error) {
      console.error('Error generating or playing TTS:', error);
      if (onEndCallback) {
        onEndCallback();
      }
    }
  };
  

  // Handle ending the interview
  // Update the endInterview function in frontend/src/components/interview/VideoInterviewScreen.tsx

  const endInterview = async () => {
    if (!interviewSessionId) return;
    
    try {
      // Calculate duration
      if (startTime) {
        const endTime = new Date();
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationMinutes = Math.round(durationMs / 60000);
        setDuration(durationMinutes);
      }
      
      // Submit interview completion - UPDATED ENDPOINT
      const response = await axiosInstance.post(`${API_URL}/video-interviews/${interviewSessionId}/complete`, {
        transcript: conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join('\n\n'),
        question_responses: questions
          .filter(q => q.asked)
          .map((q, index) => {
            const userMsg = conversationHistory.filter(msg => msg.role === 'user')[index];
            return {
              question: q.question,
              response_transcript: userMsg ? userMsg.content : '',
              response_time: 60 // Default value, calculate actual time if needed
            };
          })
      });
    
    // Set feedback if available
    if (response.data.feedback) {
      setFeedbackText(response.data.feedback);
    } else {
      setFeedbackText('Thank you for completing the interview. Your responses have been recorded.');
    }
    
    // Navigate to results page
    navigate(`/interview/${interviewSessionId}/results`);
  } catch (error) {
    console.error('Error ending interview:', error);
    setError('Failed to submit interview results');
  }
};

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
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{problem.title}</h1>
          <div className="flex items-center space-x-4">
            {recording && (
              <span className="flex items-center text-red-600">
                <span className="w-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                Recording
              </span>
            )}
            {interviewStarted && !interviewEnded ? (
              <button
                onClick={endInterview}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                End Interview
              </button>
            ) : (
              !interviewStarted && (
                <button
                  onClick={handleReadyClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Start Interview
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Video section (smaller) */}
        <div className="w-full md:w-1/4 bg-gray-900 p-4 flex flex-col">
          <div className="bg-black rounded-lg overflow-hidden flex-grow flex items-center justify-center">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-auto"
              />
            ) : (
              <div className="text-gray-400">
                Loading camera...
              </div>
            )}
          </div>
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <h3 className="text-white text-lg font-medium mb-2">Interview Info</h3>
            <div className="text-gray-300 text-sm">
              <p><span className="font-semibold">Problem:</span> {problem.title}</p>
              <p><span className="font-semibold">Difficulty:</span> {problem.difficulty}</p>
              <p><span className="font-semibold">Type:</span> {problem.interview_type}</p>
              {startTime && (
                <p><span className="font-semibold">Duration:</span> {Math.floor((Date.now() - startTime.getTime()) / 60000)} min</p>
              )}
            </div>
          </div>
        </div>

        {/* Interview section (larger) */}
        <div className="w-full md:w-3/4 flex flex-col">
          {/* AI Interviewer section */}
          <div className="flex-grow bg-white p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">AI Interviewer</h2>
              </div>

              {/* Conversation history */}
              <div className="space-y-6">
                {conversationHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                      </div>
                    )}
                    <div 
                      className={`max-w-md p-4 rounded-lg ${
                        message.role === 'assistant' 
                          ? 'bg-indigo-50 text-gray-700' 
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ml-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading indicator */}
                {loadingResponse && (
                  <div className="flex justify-start">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                    </div>
                    <div className="max-w-md p-4 rounded-lg bg-indigo-50">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Instruction panel if interview hasn't started */}
              {!interviewStarted && (
                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Interview Instructions</h3>
                  <p className="text-blue-700 mb-4">
                    This is a video interview with an AI interviewer. You'll be asked 3 questions about the problem shown above.
                    Please speak clearly and make sure your microphone and camera are working properly.
                  </p>
                  <p className="text-blue-700 font-medium">
                    Click "Start Interview" when you're ready to begin.
                  </p>
                </div>
              )}
              
              {/* Transcription debug (can be removed in production) */}
              {transcription && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700">Transcription Debug:</h3>
                  <p className="text-sm text-gray-500">{transcription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Countdown Modal */}
      {showModal && countdown !== null && (
        <Modal 
          onClose={() => {}}
          closeOnOutsideClick={false}
          size="lg"
        >
          <div className="p-10 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-6">Interview will begin in...</h2>
            <div className="text-6xl font-bold text-blue-600 mb-8">
              {countdown}
            </div>
            <p className="text-gray-600">Prepare yourself. Remember to speak clearly.</p>
          </div>
        </Modal>
      )}
      
      {/* Feedback Modal */}
      {interviewEnded && feedbackText && (
        <Modal
          onClose={() => {}}
          closeOnOutsideClick={false}
          size="lg"
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Interview Complete</h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Feedback</h3>
              <p className="text-gray-700">{feedbackText}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};