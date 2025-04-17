import { Request, Response } from 'express';
import { VM } from 'vm2';
import { InterviewProblemModel } from '../../models/InterviewProblem';

interface RunCodeRequest {
  problemId: string;
  code: string;
  language: string;
}

export const runCode = async (req: Request, res: Response) => {
  try {
    const { problemId, code, language } = req.body as RunCodeRequest;

    if (!problemId || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 問題の取得
    const problem = await InterviewProblemModel.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    if (!problem.testCases || problem.testCases.length === 0) {
      return res.status(400).json({ error: 'No test cases found for this problem' });
    }

    // テストケースの実行
    const results = await Promise.all(
      problem.testCases.map(async (testCase) => {
        try {
          const vm = new VM({
            timeout: 1000,
            sandbox: {},
          });

          // ユーザーのコードを実行
          const userCode = `
            ${code}
            return solution(${JSON.stringify(testCase.input)});
          `;

          const output = await vm.run(userCode);

          // 期待される出力と比較
          const isCorrect = JSON.stringify(output) === JSON.stringify(testCase.expectedOutput);

          return {
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: output,
            isCorrect,
          };
        } catch (error) {
          return {
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            isCorrect: false,
          };
        }
      })
    );

    // 結果の集計
    const passedCount = results.filter((r) => r.isCorrect).length;
    const totalCount = results.length;

    res.json({
      results,
      summary: {
        passed: passedCount,
        total: totalCount,
        success: passedCount === totalCount,
      },
    });
  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}; 