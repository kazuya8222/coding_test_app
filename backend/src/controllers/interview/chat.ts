import { Request, Response } from 'express';
import OpenAI from 'openai';
import { InterviewProblemModel } from '../../models/InterviewProblem';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  problemId: string;
  message: string;
  conversationHistory: Message[];
}

// OpenAI APIキーの確認
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chat = async (req: Request, res: Response) => {
  try {
    console.log('Received chat request:', req.body);
    
    const { problemId, message, conversationHistory } = req.body as ChatRequest;

    if (!problemId || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: { problemId, message }
      });
    }

    // 問題の取得
    const problem = await InterviewProblemModel.findById(problemId);
    if (!problem) {
      console.error('Problem not found:', problemId);
      return res.status(404).json({ error: 'Problem not found' });
    }

    console.log('Found problem:', problem);

    // システムプロンプトの作成
    const systemPrompt = `You are an AI interviewer helping a candidate solve a coding problem.
Problem Title: ${problem.title}
Problem Description: ${problem.description}
Difficulty: ${problem.difficulty}
Time Limit: ${problem.timeLimit} minutes

Your role is to:
1. Guide the candidate through solving the problem
2. Provide hints when needed, but don't give away the solution
3. Help debug their code
4. Explain concepts they might be struggling with
5. Keep the conversation focused on the problem`;

    // 会話履歴の整形
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    console.log('Sending request to OpenAI:', {
      model: 'gpt-3.5-turbo',
      messageCount: messages.length
    });

    // OpenAI APIの呼び出し
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log('Received response from OpenAI');

    const response = completion.choices[0].message.content;

    // フィードバックの生成（オプション）
    let feedback = '';
    if (conversationHistory.length > 5) {
      console.log('Generating feedback');
      const feedbackCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Provide brief feedback on the candidate\'s progress and approach to the problem.' },
          ...messages,
        ],
        temperature: 0.5,
        max_tokens: 200,
      });
      feedback = feedbackCompletion.choices[0].message.content;
    }

    const result = {
      message: response,
      feedback,
    };

    console.log('Sending response:', result);
    res.json(result);
  } catch (error) {
    console.error('Error in chat:', error);
    
    // エラーの詳細をログに記録
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}; 