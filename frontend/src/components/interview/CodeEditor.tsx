import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface CodeEditorProps {
  problemId: string;
  initialCode?: string;
  language?: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

const languageTemplates = {
  javascript: `function solution(input) {
  // Write your code here
  return input;
}`,
  python: `def solution(input):
    # Write your code here
    return input`,
  java: `public class Solution {
    public static Object solution(Object input) {
        // Write your code here
        return input;
    }
}`,
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  problemId,
  initialCode,
  language = 'javascript',
  testCases = []
}) => {
  const [code, setCode] = useState(initialCode || languageTemplates[language]);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [testResults, setTestResults] = useState<Array<{
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }>>([]);
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    setCode(languageTemplates[newLanguage]);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const response = await axios.post(`${API_URL}/api/interview/run-code`, {
        problemId,
        code,
        language: selectedLanguage,
        testCases
      });
      
      if (response.data.testResults) {
        setTestResults(response.data.testResults);
      } else {
        setOutput(response.data.output);
      }
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('Error: Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="btn btn-primary"
        >
          {isRunning ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Code
            </>
          )}
        </button>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={selectedLanguage}
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
          }}
        />
      </div>

      {testResults.length > 0 ? (
        <div className="mt-4 overflow-auto" style={{ maxHeight: '30vh' }}>
          <h3 className="font-bold mb-2 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Test Results
          </h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded card ${
                  result.passed ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                }`}
              >
                <div className="font-medium flex items-center">
                  {result.passed ? (
                    <svg className="w-5 h-5 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  Test Case {index + 1}
                </div>
                <div className="mt-2 text-sm">
                  <div className="mb-1"><span className="font-medium">Input:</span> {result.input}</div>
                  <div className="mb-1"><span className="font-medium">Expected:</span> {result.expected}</div>
                  <div className="mb-1"><span className="font-medium">Actual:</span> {result.actual}</div>
                  <div className="font-bold mt-2">
                    {result.passed ? (
                      <span className="text-green-600">✓ Passed</span>
                    ) : (
                      <span className="text-red-600">✗ Failed</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : output && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
          <h3 className="font-bold mb-2 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Output
          </h3>
          <pre className="whitespace-pre-wrap bg-gray-800 text-gray-100 p-3 rounded">{output}</pre>
        </div>
      )}
    </div>
  );
}; 