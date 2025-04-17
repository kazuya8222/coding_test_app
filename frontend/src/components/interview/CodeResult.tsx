import React from 'react';

interface TestResult {
  input: any;
  expectedOutput: any;
  actualOutput: any;
  isCorrect: boolean;
  error?: string;
}

interface CodeResultProps {
  results: TestResult[];
  summary: {
    passed: number;
    total: number;
    success: boolean;
  };
}

export const CodeResult: React.FC<CodeResultProps> = ({ results, summary }) => {
  return (
    <div className="mt-4">
      <div className={`p-4 rounded-lg mb-4 ${
        summary.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        <h3 className="text-lg font-semibold">
          {summary.success ? '✅ 全てのテストケースに合格しました！' : '❌ テストケースに失敗しました'}
        </h3>
        <h3>こちらに出力結果が表示されます</h3>
        <p className="mt-1">
          テストケース: {summary.passed}/{summary.total} 合格
        </p>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">入力</h4>
                <pre className="bg-gray-100 p-2 rounded">
                  {JSON.stringify(result.input, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2">期待される出力</h4>
                <pre className="bg-gray-100 p-2 rounded">
                  {JSON.stringify(result.expectedOutput, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">
                {result.isCorrect ? '✅ 実際の出力' : '❌ 実際の出力'}
              </h4>
              {result.error ? (
                <div className="bg-red-100 p-2 rounded text-red-800">
                  <p className="font-semibold">エラー:</p>
                  <pre>{result.error}</pre>
                </div>
              ) : (
                <pre className="bg-gray-100 p-2 rounded">
                  {JSON.stringify(result.actualOutput, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 