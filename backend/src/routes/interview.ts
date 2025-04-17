import express from 'express';
import { InterviewProblemModel } from '../models/InterviewProblem';
import { DomainInfo } from '../../../shared/types/interview';
import { runCode } from '../controllers/interview/runCode';
import { chat } from '../controllers/interview/chat';

const router = express.Router();

// 問題一覧取得
router.get('/problems', async (req, res) => {
  try {
    console.log("interview routes loaded");
    const problems = await InterviewProblemModel.find({})
      .sort({ createdAt: -1 })
      .select('-hints -expectedAnswer -followUpQuestions'); // 機密情報は除外

    res.json(problems);
  } catch (error) {
    console.error('問題一覧の取得に失敗しました:', error);
    res.status(500).json({ error: '問題一覧の取得に失敗しました' });
  }
});

// 問題詳細取得
router.get('/problems/:id', async (req, res) => {
  try {
    const problem = await InterviewProblemModel.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: '問題が見つかりません' });
    }
    res.json(problem);
  } catch (error) {
    console.error('問題詳細の取得に失敗しました:', error);
    res.status(500).json({ error: '問題詳細の取得に失敗しました' });
  }
});

// 分野別統計情報取得
router.get('/domains/stats', async (req, res) => {
  try {
    const stats = await InterviewProblemModel.aggregate([
      {
        $group: {
          _id: '$domain',
          totalProblems: { $sum: 1 },
          averageDifficulty: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ['$difficulty', 'easy'] }, then: 1 },
                  { case: { $eq: ['$difficulty', 'medium'] }, then: 2 },
                  { case: { $eq: ['$difficulty', 'hard'] }, then: 3 }
                ],
                default: 0
              }
            }
          },
          categories: { $addToSet: '$category' },
          commonTags: { $push: '$tags' }
        }
      },
      {
        $project: {
          _id: 0,
          domain: '$_id',
          totalProblems: 1,
          averageDifficulty: { $round: ['$averageDifficulty', 2] },
          categories: 1,
          commonTags: {
            $reduce: {
              input: '$commonTags',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] }
            }
          }
        }
      }
    ]);

    // タグの出現頻度を計算
    const domainStats: DomainInfo[] = stats.map(stat => {
      const tagCounts: Record<string, number> = stat.commonTags.reduce((acc: Record<string, number>, tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});

      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([tag]) => tag);

      return {
        domain: stat.domain,
        categories: stat.categories,
        averageDifficulty: stat.averageDifficulty,
        commonTags: sortedTags,
        description: `${stat.domain}に関する${stat.totalProblems}件の問題があります。`
      };
    });

    res.json(domainStats);
  } catch (error) {
    console.error('統計情報の取得に失敗しました:', error);
    res.status(500).json({ error: '統計情報の取得に失敗しました' });
  }
});

router.post('/run-code', runCode);
router.post('/chat', chat);

export default router; 