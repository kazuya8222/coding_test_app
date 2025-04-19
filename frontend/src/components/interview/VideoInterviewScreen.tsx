import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { InterviewProblem } from '../../types/interview';
import { Modal } from '../Modal';
import { axiosInstance } from '../../api/axios';
const API_URL = import.meta.env.VITE_API_URL;

// Configuration for OpenAI Whisper and GPT-4o
const OPENAI_API_URL = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1';

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
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Audio visualization
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
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
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  
  // Audio playback state
  const [isAITalking, setIsAITalking] = useState(false);
  const [currentAudioMessage, setCurrentAudioMessage] = useState<string>('');
  
  // Countdown state
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Interview metrics
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [mediaReady, setMediaReady] = useState(false);


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
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0);
          
          // Process each line to extract questions
          lines.forEach((line: string, index: number) => {
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
  // MediaStream取得と処理の修正

// Request camera and microphone access
useEffect(() => {
  const requestMediaPermission = async () => {
    try {
      // まず映像のみのストリームを取得（音声なし）
      const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      // 音声のみのストリームを別途取得
      const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
      });
      
      // ビデオ要素には映像のみのストリームを割り当て
      if (videoRef.current) {
        videoRef.current.srcObject = videoOnlyStream;
        // 念のため muted を確実に設定
        videoRef.current.muted = true;
      }
      
      // 両方のストリームを保存（録画用に必要な場合）
      // 注: 実際の録画時には両方のトラックを組み合わせる処理が必要
      setStream(audioOnlyStream);
      
      // 音声分析用のセットアップ
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(audioOnlyStream);
      source.connect(analyser);
      // ここで destination には接続しない
      // 下記の行はコメントアウトしておく
      // source.connect(audioContext.destination);
      
      // 音声の可視化開始
      setIsAnimating(true);

      setMediaReady(true);
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
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };
}, []);


  // Audio visualization when the interview is active
  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current || !isAnimating) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    
    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      
      const barWidth = (WIDTH / bufferLength) * 2.5;
      let x = 0;
      
      // Determine who is speaking and use appropriate color
      const color = isAITalking ? '#6366F1' : '#2563EB'; // Indigo for AI, Blue for user
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2; // Scale down to fit better
        
        ctx.fillStyle = color;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    renderFrame();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, isAITalking]);

  const [interviewInitialized, setInterviewInitialized] = useState(false);

  // Automatically start the interview
  useEffect(() => {
    // If we have the problem and we're already on this screen, start the interview
    if (!interviewInitialized && problem && mediaReady) {
      startInterview();
      setInterviewInitialized(true);
    }
  }, [problem, mediaReady,interviewInitialized]);

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
        content: `はじめまして。今回、面接官を担当するAI面接官です。本日は『${problem?.title}』に関連するトピックについて、いくつか質問させていただきます。全体で3問、順番にお伺いしますので、リラックスしてご自身の考えをお聞かせください。では、まず最初の質問です。${questions[0].question}`
      };
      
      setCurrentAudioMessage(initialMessage.content);
      setIsAITalking(true);
      setIsAnimating(true);
      
      await speakTextWithOpenAI(initialMessage.content, () => {
        setIsAITalking(false);
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

  // Handle starting the recording
  const startRecording = () => {
    if (!stream) {
      console.error('startRecording: stream is null');
      return;
    }
  
    try {
      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
  
      mediaRecorder.ondataavailable = (event) => {
        console.log('ondataavailable event triggered', event);
        if (event.data && event.data.size > 0) {
          console.log('Captured audio chunk:', event.data);
          audioChunksRef.current.push(event.data);
        } else {
          console.warn('ondataavailable triggered but no data');
        }
      };
  
      mediaRecorder.onstart = () => {
        console.log('mediaRecorder.onstart: Recording has started');
      };
      mediaRecorder.onerror = (e) => {
        console.error('mediaRecorder error:', e);
      };
  
      mediaRecorder.onstop = () => {
        console.log('mediaRecorder.onstop: Recording has stopped');
        handleRecordingStopped();
      };
  
      console.log('mediaRecorder readyState before start:', mediaRecorder.state); // ←ここ重要
      audioChunksRef.current = [];
      mediaRecorder.start(100);
      console.log('Recording started with state:', mediaRecorder.state);
  
      setRecording(true);
      setRecordingStartTime(Date.now());
      monitorSilence();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };
  
  
  

  // Process audio after recording stops
  const handleRecordingStopped = async () => {
    console.log('handleRecordingStopped triggered');
    console.log('audioChunksRef.current:', audioChunksRef.current);
  
    if (audioChunksRef.current.length === 0) {
      console.error('No audio chunks captured');
      return;
    }
  
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
  
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');
  
    try {
      setLoadingResponse(true);
  
      const response = await axios.post(
        `https://api.openai.com/v1/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      const transcribedText = response.data.text;
      console.log('Transcription result:', transcribedText);
  
      setTranscription(transcribedText);
  
      const userMessage = { role: 'user' as const, content: transcribedText };
      setConversationHistory(prev => [...prev, userMessage]);
  
      await getFollowUpQuestion(transcribedText);
    } catch (error) {
      console.error('Error processing audio:', error);
      setError('Failed to process recording');
    } finally {
      setLoadingResponse(false);
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
      
      let aiResponse: string;
      
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
      
      // Set current audio message and indicate AI is talking
      setCurrentAudioMessage(aiResponse);
      setIsAITalking(true);
      
      // Start TTS
      await speakTextWithOpenAI(aiResponse, () => {
        setIsAITalking(false);
        if (!isLastQuestion) {
          startRecording();
        }
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Failed to get interviewer response');
    }
  };
  const getFollowUpQuestion = async (userAnswer: string) => {
    try {
      const response = await axios.post(`${API_URL}/followup`, {
        userAnswer,
      });
  
      const followUp = response.data.followUpQuestion;
  
      setCurrentAudioMessage(followUp);
      setIsAITalking(true);
  
      await speakTextWithOpenAI(followUp, () => {
        setIsAITalking(false);
        startRecording();
      });
    } catch (error) {
      console.error('Error fetching follow-up:', error);
      setError('Failed to fetch follow-up question');
    }
  };
  

  // Speech synthesis with OpenAI TTS
  let currentAudio: HTMLAudioElement | null = null;

  const speakTextWithOpenAI = async (text: string, onEndCallback?: () => void) => {
    try {
      // 前の音声が再生中なら必ず停止する
      if (currentAudio) {
        currentAudio.pause();
        URL.revokeObjectURL(currentAudio.src); // メモリリークを防ぐ
        currentAudio = null;
      }
  
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
  
      // 新しい Audio オブジェクトを作成
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      
      // 再生が終了したときの処理
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl); // 不要になったURLを解放
        currentAudio = null;
        if (onEndCallback) {
          onEndCallback();
        }
      };
      
      // 再生開始
      await audio.play();
    } catch (error) {
      console.error('Error generating or playing TTS:', error);
      if (onEndCallback) {
        onEndCallback();
      }
    }
  };

  const monitorSilence = () => {
    if (!analyserRef.current) return;
  
    const analyser = analyserRef.current;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
  
    let silenceStart: number = Date.now();
    const silenceThreshold = 15; // 0〜255のスケール、ここでは小さい値で無音と判定
    const maxSilenceDuration = 3000; // 3秒
  
    const checkSilence = () => {
      if (!recording) return; // 録音してなかったら監視終了
  
      analyser.getByteTimeDomainData(dataArray);
  
      // 音量（振幅）の最大値を計算
      let maxVolume: number = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = Math.abs(dataArray[i] - 128); // 128中心
        if (v > maxVolume) {
          maxVolume = v;
        }
      }
  
      if (maxVolume < silenceThreshold) {
        // 無音が続いている
        if (Date.now() - silenceStart > maxSilenceDuration) {
          console.log('無音検出 → 自動停止');
          stopRecording();
          return; // 停止したので監視も終了
        }
      } else {
        // 音を検知 → 無音タイマーリセット
        silenceStart = Date.now();
      }
  
      requestAnimationFrame(checkSilence); // 継続監視
    };
  
    requestAnimationFrame(checkSilence);
  };
  const stopRecording = () => {
    if (!mediaRecorderRef.current || !recording) {
      console.log('stopRecording called: but no active recording');
      return;
    }
  
    const now = Date.now();
    const MIN_RECORDING_TIME = 500; // 最低録音時間500ms
    const elapsed = recordingStartTime ? now - recordingStartTime : Infinity;
  
    if (elapsed < MIN_RECORDING_TIME) {
      console.log(`録音時間短すぎ（${elapsed}ms）。少し待ちます...`);
      setTimeout(() => {
        if (mediaRecorderRef.current && recording) {
          console.log('遅延後stopRecording実行');
          mediaRecorderRef.current.stop();
        }
      }, MIN_RECORDING_TIME - elapsed);
    } else {
      console.log('stopRecording called: stopping mediaRecorder');
      mediaRecorderRef.current.stop();
    }
  };
  

  // Handle ending the interview
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
      
      // Submit interview completion
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
                録音中
              </span>
            )}
            {interviewStarted && !interviewEnded && (
              <button
                onClick={endInterview}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                面接を終了
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content - Modern voice chat UI */}
      <main className="flex-grow flex flex-col overflow-hidden">
        <div className="flex-grow flex flex-col md:flex-row p-6 gap-6">
          {/* Left panel - Video and info */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            {/* Video preview */}
            <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400">カメラを読み込み中...</div>
              )}
            </div>
            
            {/* Interview info */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">面接情報</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">問題:</span> {problem.title}</p>
                <p><span className="font-medium">難易度:</span> {problem.difficulty}</p>
                <p><span className="font-medium">タイプ:</span> {problem.type}</p>
                {startTime && (
                  <p><span className="font-medium">経過時間:</span> {Math.floor((Date.now() - startTime.getTime()) / 60000)} 分</p>
                )}
              </div>
            </div>
            
            {/* Question progress */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">質問の進捗</h3>
              <div className="space-y-3">
                {questions.map((q, index) => (
                  <div key={q.id} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      currentQuestionIndex > index 
                        ? 'bg-green-100 text-green-600' 
                        : currentQuestionIndex === index 
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {currentQuestionIndex > index ? '✓' : index + 1}
                    </div>
                    <p className={`text-sm ${
                      currentQuestionIndex > index 
                        ? 'text-gray-500 line-through' 
                        : currentQuestionIndex === index 
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-400'
                    }`}>
                      {q.question.length > 50 ? q.question.substring(0, 50) + '...' : q.question}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right panel - Voice chat UI */}
          <div className="w-full md:w-2/3 bg-white rounded-lg shadow flex flex-col">
            {/* Voice chat header */}
            <div className="p-4 border-b border-gray-200 flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">AI面接官</h2>
              {(recording || isAITalking) && (
                <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                  isAITalking 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isAITalking ? '話し中...' : '聞いています...'}
                </span>
              )}
            </div>
            
            {/* Voice visualization area */}
            <div className="flex-grow p-6 flex flex-col items-center justify-center">
              {interviewStarted ? (
                <>
                  {/* Current speaking text */}
                  <div className="w-full max-w-xl mb-8 text-center">
                    <p className="text-xl text-gray-700 font-medium">
                      {isAITalking ? currentAudioMessage : recording ? '音声を認識しています...' : ''}
                    </p>
                  </div>
                  
                  {/* Voice visualization canvas */}
                  <div className={`w-64 h-64 rounded-full flex items-center justify-center bg-gray-50 ${
                    isAITalking || recording ? 'border-4 border-blue-400 animate-pulse' : 'border border-gray-200'
                  }`}>
                    <canvas 
                      ref={canvasRef} 
                      width="256" 
                      height="256" 
                      className="rounded-full"
                    />
                    
                    {/* Dynamic circle in the middle */}
                    <div className={`absolute w-40 h-40 rounded-full bg-white flex items-center justify-center shadow-md 
                      ${isAITalking || recording ? 'animate-ping opacity-30' : 'opacity-0'}`}>
                    </div>
                    
                    <div className="absolute w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-md">
                      {isAITalking ? (
                        <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                      ) : recording ? (
                        <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                        </svg>
                      ) : (
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {/* Status text */}
                  <div className="mt-8 text-center">
                    <p className="text-lg font-medium text-gray-600">
                      {isAITalking ? 'AIが話しています...' : recording ? 'あなたの番です' : '待機中...'}
                    </p>
                    {recording && (
                      <button
                        onClick={stopRecording}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        返答を完了
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center bg-blue-50 p-8 rounded-lg">
                  <h3 className="text-xl font-medium text-blue-800 mb-4">面接の準備ができました</h3>
                  <p className="text-blue-700 mb-6">
                    AIインタビュアーがあなたに質問をします。
                    質問に対して自然に話すだけです。
                    面接は自動的に開始されます。
                  </p>
                  <div className="animate-bounce">
                    <svg className="mx-auto w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>
            
            {/* Previous conversation summary */}
            {conversationHistory.length > 2 && (
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">会話の履歴:</h3>
                <div className="max-h-48 overflow-y-auto">
                  {conversationHistory.slice(0, -2).map((message, index) => (
                    <div key={index} className="py-1 px-2 text-sm">
                      <span className={`font-medium ${message.role === 'assistant' ? 'text-indigo-600' : 'text-blue-600'}`}>
                        {message.role === 'assistant' ? 'AI: ' : 'あなた: '}
                      </span>
                      <span className="text-gray-700">
                        {message.content.length > 100 
                          ? message.content.substring(0, 100) + '...' 
                          : message.content}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Feedback Modal */}
      {interviewEnded && feedbackText && (
        <Modal
          onClose={() => {}}
          closeOnOutsideClick={false}
          size="lg"
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">面接完了</h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">フィードバック</h3>
              <p className="text-gray-700">{feedbackText}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                ダッシュボードに戻る
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};