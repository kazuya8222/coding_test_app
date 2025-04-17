import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import InterviewSession from '../models/InterviewSession';
import Problem from '../models/Problem';
import { InterviewTypeEnum } from '../models/InterviewType';
import { IProblem } from '../models/Problem';

// 全インタビュー取得
export const getInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const interviews = await InterviewSession.find({ user_id: req.user._id })
      .populate('problem_id')
      .sort({ created_at: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interviews', error });
  }
};

// 特定のインタビュー取得
export const getInterviewById = async (req: AuthRequest, res: Response) => {
  try {
    const interview = await InterviewSession.findById(req.params.id)
      .populate('problem_id');
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interview', error });
  }
};

// インタビュー開始
export const startInterview = async (req: AuthRequest, res: Response) => {
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
    res.status(500).json({ message: 'Error starting interview', error });
  }
};

// インタビュー提出
export const submitInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { code, language, messages } = req.body;
    const interview = await InterviewSession.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.status = 'completed';
    interview.end_time = new Date();
    interview.messages = messages;
    
    if (code) {
      interview.submissions.push({
        code,
        language,
        status: 'submitted',
        submitted_at: new Date()
      });
    }

    await interview.save();
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting interview', error });
  }
};

// タイプ別インタビュー取得
export const getInterviewsByType = async (req: AuthRequest, res: Response) => {
  try {
    const type = req.params.type as InterviewTypeEnum;
    
    // Problemモデルから直接データを取得
    const problems = await Problem.find({
      interview_type: type
    })
    .select('title description difficulty interview_type estimated_time language_options technologies company_focus role_focus company_culture')
    .sort({ created_at: -1 });

    // 問題情報を整形
    const formattedProblems = problems.map(problem => ({
      id: problem._id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      type: problem.interview_type,
      role: problem.role_focus?.[0], // 最初の役割を表示
      language: problem.language_options?.[0], // 最初の言語を表示
      techStack: problem.technologies,
      companyCulture: problem.company_culture?.[0], // 最初の企業文化を表示
      time: problem.estimated_time,
      status: 'not_started', // デフォルトのステータス
      createdAt: problem.created_at
    }));

    res.json(formattedProblems);
  } catch (error) {
    console.error('Error fetching problems by type:', error);
    res.status(500).json({ message: 'Error fetching problems by type', error });
  }
};

// 役割別インタビュー取得
export const getInterviewsByRole = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.params.role;
    const interviews = await InterviewSession.find({
      user_id: req.user._id,
      'problem_id.role_focus': role
    })
    .populate('problem_id')
    .sort({ created_at: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interviews by role', error });
  }
};

// 難易度別インタビュー取得
export const getInterviewsByDifficulty = async (req: AuthRequest, res: Response) => {
  try {
    const difficulty = req.params.difficulty;
    const interviews = await InterviewSession.find({
      user_id: req.user._id,
      'problem_id.difficulty': difficulty
    })
    .populate('problem_id')
    .sort({ created_at: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interviews by difficulty', error });
  }
};

// 言語別インタビュー取得
export const getInterviewsByLanguage = async (req: AuthRequest, res: Response) => {
  try {
    const language = req.params.language;
    const interviews = await InterviewSession.find({
      user_id: req.user._id,
      'problem_id.language_options': language
    })
    .populate('problem_id')
    .sort({ created_at: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interviews by language', error });
  }
};

// 技術スタック別インタビュー取得
export const getInterviewsByTechStack = async (req: AuthRequest, res: Response) => {
  try {
    const stack = req.params.stack;
    const interviews = await InterviewSession.find({
      user_id: req.user._id,
      'problem_id.technologies': stack
    })
    .populate('problem_id')
    .sort({ created_at: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interviews by tech stack', error });
  }
};

// 企業文化別インタビュー取得
export const getInterviewsByCompanyCulture = async (req: AuthRequest, res: Response) => {
  try {
    const culture = req.params.culture;
    const interviews = await InterviewSession.find({
      user_id: req.user._id,
      'problem_id.company_culture': culture
    })
    .populate('problem_id')
    .sort({ created_at: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interviews by company culture', error });
  }
}; 