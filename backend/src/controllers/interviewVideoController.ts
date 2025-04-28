import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import InterviewSession, { IMessage } from '../models/InterviewSession';
import Problem from '../models/Problem';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createPresignedUrl } from '../utils/storage';

// OpenAI API configuration
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Storage configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const AUDIO_DIR = path.join(UPLOAD_DIR, 'audio');
const VIDEO_DIR = path.join(UPLOAD_DIR, 'video');

// Ensure directories exist
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

// interface MessageRequest {
//   speaker: 'user' | 'ai';
//   message: string;
//   timestamp?: Date;
//   audio_data?: string; // base64 encoded audio data
// }

/**
 * Get problem details
 */
export const getProblemDetails = async (req: Request, res: Response) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) { 
    console.error('Error getting problem details:', error);
    res.status(500).json({ message: 'Error getting problem details', error });
  }
};

/**
 * Start a video interview session
 */
export const startVideoInterview = async (req: AuthRequest, res: Response) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const interview = new InterviewSession({
      user_id: req.user._id,
      problem_id: problem._id,
      interview_type: problem.interview_type,
      status: 'in_progress',
      start_time: new Date()
    });

    await interview.save();
    res.json(interview);
  } catch (error) {
    console.error('Error starting video interview:', error);
    res.status(500).json({ message: 'Error starting interview', error });
  }
};

/**
 * Add a message to the interview session
 */
export const addInterviewMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messages } = req.body;
    const interview = await InterviewSession.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.user_id.toString() !== (req as any).user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Process and add messages
    for (const message of messages) {
      const newMessage: IMessage = {
        speaker: message.speaker,
        message: message.message,
        timestamp: message.timestamp || new Date()
      };

      // Process audio if provided
      if (message.audio_data) {
        // Save audio file
        const audioFileName = `${uuidv4()}.webm`;
        const audioPath = path.join(AUDIO_DIR, audioFileName);
        
        // Convert base64 to file
        const audioBuffer = Buffer.from(message.audio_data.split(',')[1], 'base64');
        fs.writeFileSync(audioPath, audioBuffer);
        
        // Get URL for the audio
        const audioUrl = await createPresignedUrl(audioPath, 'audio/webm');
        newMessage.audio_url = audioUrl;
      }

      interview.messages.push(newMessage);
    }

    await interview.save();
    res.json({ message: 'Messages added successfully', interview_id: interview._id });
  } catch (error) {
    console.error('Error adding interview message:', error);
    res.status(500).json({ message: 'Error adding message', error });
  }
};

/**
 * Process audio for transcription
 */
export const processAudio = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }

    // Get the audio file
    const audioPath = req.file.path;

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
    });

    res.json({ 
      transcript: transcription.text,
      audio_url: req.file.filename
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ message: 'Error processing audio', error });
  }
};

/**
 * Generate AI response based on interview context
 */
export const generateAIResponse = async (req: Request, res: Response) => {
  try {
    const { interviewId, userMessage, conversationHistory, currentQuestion } = req.body;
    
    // Find the interview session
    const interview = await InterviewSession.findById(interviewId)
      .populate('problem_id');
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Get the problem details
    const problem = interview.problem_id as any;

    // Create system prompt based on problem
    const systemPrompt = `You are an AI interviewer helping evaluate a candidate.
Problem Title: ${problem.title}
Problem Description: ${problem.description}
Difficulty: ${problem.difficulty}
Interview Type: ${interview.interview_type}

For this ${interview.interview_type} interview, focus on asking relevant questions and evaluating the candidate's responses.
If this is a technical question, ask follow-up questions based on their response.
Current question: ${currentQuestion}

Your role is to:
1. Evaluate their response to the current question
2. Provide a natural, conversational reply
3. Ask follow-up questions if appropriate
4. Move to the next question when appropriate
5. Keep the tone professional but friendly`;

    // Format conversation history for GPT
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // Get response from GPT-4o
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = completion.choices[0].message.content;

    res.json({ 
      message: response,
      interview_id: interviewId
    });
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ message: 'Error generating AI response', error });
  }
};

/**
 * Save video recording
 */
export const saveVideoRecording = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    const interview = await InterviewSession.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.user_id.toString() !== (req as any).user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Save video URL to interview
    interview.video_recording_url = req.file.filename;
    await interview.save();

    res.json({ 
      message: 'Video saved successfully',
      video_url: req.file.filename
    });
  } catch (error) {
    console.error('Error saving video recording:', error);
    res.status(500).json({ message: 'Error saving video recording', error });
  }
};

/**
 * Complete the interview and generate feedback
 */
export const completeInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { transcript, question_responses } = req.body;
    const interview = await InterviewSession.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.user_id.toString() !== (req as any).user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update interview status
    interview.status = 'completed';
    interview.end_time = new Date();
    
    // Save transcript and question responses if provided
    if (transcript) {
      interview.full_transcript = transcript;
    }
    
    if (question_responses && Array.isArray(question_responses)) {
      interview.question_responses = question_responses;
    }

    // Generate AI feedback based on interview data
    let feedback = '';
    if (interview.messages.length > 0) {
      const userMessages = interview.messages.filter(m => m.speaker === 'user');
      const userResponses = userMessages.map(m => m.message).join('\n\n');
      
      const systemPrompt = `You are an expert interviewer. You've just conducted an interview where the candidate provided the following responses:

${userResponses}

Please provide constructive feedback about:
1. The candidate's communication skills
2. The quality and depth of their answers
3. Areas where they showed strength
4. Areas where they could improve
5. Overall impression

Keep the feedback balanced, constructive, and helpful. Focus on specific aspects of their responses rather than making general statements.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      feedback = completion.choices[0].message.content || '';
      
      // Create evaluation
      interview.evaluation = {
        overall_score: 0, // This would be calculated based on various factors
        feedback,
        evaluated_at: new Date()
      };

      // Perform speech analysis if we have transcript data
      if (transcript) {
        // Simple speech analysis - in production this would be more sophisticated
        const words = transcript.split(/\s+/).length;
        const duration = ((interview.end_time?.getTime() || 0) - (interview.start_time?.getTime() || 0)) / 1000 / 60; // duration in minutes
        const speechRate = duration > 0 ? words / duration : 0;
        
        // Count filler words
        const fillerWordRegex = /\b(um|uh|like|you know|actually|basically|literally)\b/gi;
        const fillerWordMatches = transcript.match(fillerWordRegex) || [];
        const fillerWordCount = fillerWordMatches.length;
        
        interview.speech_analysis = {
          speech_rate: speechRate,
          filler_word_count: fillerWordCount,
          clarity_score: Math.random() * 100, // Would use real analysis in production
          confidence_score: Math.random() * 100, // Would use real analysis in production
          sentiment_analysis: {
            positive: Math.random(),
            negative: Math.random(),
            neutral: Math.random(),
          },
          keywords: [],
          analyzed_at: new Date()
        };
      }
    }

    await interview.save();

    res.json({ 
      message: 'Interview completed successfully',
      interview_id: interview._id,
      feedback
    });
  } catch (error) {
    console.error('Error completing interview:', error);
    res.status(500).json({ message: 'Error completing interview', error });
  }
};

/**
 * Get detailed interview results including feedback and analysis
 */
export const getInterviewResults = async (req: AuthRequest, res: Response) => {
  try {
    console.log(req);
    const interview = await InterviewSession.findById(req.params.id)
      .populate('problem_id')
      .populate('user_id', 'name email profile');
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check if user is authorized to view this interview
    if (interview.user_id._id.toString() !== (req as any).user._id.toString() && (req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(interview);
  } catch (error) {
    console.error('Error getting interview results:', error);
    res.status(500).json({ message: 'Error getting interview results', error });
  }
};