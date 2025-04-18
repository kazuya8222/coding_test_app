// scripts/seedInitialData.ts
import mongoose from 'mongoose';
import User from '../models/User';
import InterviewType, { IInterviewType, InterviewTypeEnum } from '../models/InterviewType';
import InterviewCategory, { IInterviewCategory } from '../models/InterviewCategory';
import Problem from '../models/Problem';
import connectDB from '../config/database';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

interface TypeIdMap {
  [key: string]: mongoose.Types.ObjectId;
}

const seedData = async (): Promise<void> => {
  try {
    await connectDB();
    
    console.log('Seeding database...');
    
    // 既存データのクリア (開発環境のみ)
    if (process.env.NODE_ENV === 'development') {
      await InterviewType.deleteMany({});
      await InterviewCategory.deleteMany({});
      await Problem.deleteMany({});
      // ユーザーデータは注意して扱う - 開発環境でも管理者は残す
      await User.deleteMany({ role: 'user' });
      
      console.log('Existing data cleared');
    }
    
    // 面接タイプの作成
    const interviewTypes = await InterviewType.insertMany([
      {
        name: 'coding' as InterviewTypeEnum,
        description: 'プログラミングスキルとアルゴリズムの理解を評価します'
      },
      {
        name: 'technical' as InterviewTypeEnum,
        description: '技術的な知識と概念の理解を評価します'
      },
      {
        name: 'behavioral' as InterviewTypeEnum,
        description: '行動パターンやソフトスキルを評価します'
      }
    ]);
    
    console.log('Interview types created');
    
    // マッピング用のIDを取得
    const typeIds: TypeIdMap = {
      coding: interviewTypes[0]._id,
      technical: interviewTypes[1]._id,
      behavioral: interviewTypes[2]._id
    };
    
    // カテゴリーの作成
    const codingCategories = await InterviewCategory.insertMany([
      {
        type_id: typeIds.coding,
        name: 'algorithms',
        description: 'アルゴリズムとデータ構造'
      },
      {
        type_id: typeIds.coding,
        name: 'data_structures',
        description: 'データ構造の実装と操作'
      }
    ]);
    
    const technicalCategories = await InterviewCategory.insertMany([
      {
        type_id: typeIds.technical,
        name: 'frontend',
        description: 'フロントエンド開発に関する質問'
      },
      {
        type_id: typeIds.technical,
        name: 'backend',
        description: 'バックエンド開発に関する質問'
      }
    ]);
    
    const behavioralCategories = await InterviewCategory.insertMany([
      {
        type_id: typeIds.behavioral,
        name: 'leadership',
        description: 'リーダーシップに関する質問'
      },
      {
        type_id: typeIds.behavioral,
        name: 'teamwork',
        description: 'チームワークに関する質問'
      }
    ]);
    
    console.log('Categories created');
    
    // サンプル問題の作成
    const codingProblems = await Problem.insertMany([
      {
        title: '配列の二分探索',
        description: 'ソート済み配列から指定された値を効率的に検索するアルゴリズムを実装します。',
        difficulty: 'easy',
        category_id: codingCategories[0]._id,
        interview_type_id: typeIds.coding,
        interview_type: 'coding',
        estimated_time: 30,
        language_options: ['JavaScript', 'Python', 'Java'],
        popularity: 95,
        starter_code: 'function binarySearch(arr, target) {\n  // Your code here\n}',
        test_cases: [
          {
            input: { arr: [1, 2, 3, 4, 5], target: 3 },
            expected: 2
          },
          {
            input: { arr: [1, 2, 3, 4, 5], target: 6 },
            expected: -1
          }
        ],
        solution_code: 'function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    \n    if (arr[mid] === target) {\n      return mid;\n    } else if (arr[mid] < target) {\n      left = mid + 1;\n    } else {\n      right = mid - 1;\n    }\n  }\n  \n  return -1;\n}',
        time_complexity: 'O(log n)',
        space_complexity: 'O(1)',
        hints: ['ソート済み配列では、中央の要素と比較することで探索範囲を半分に絞れます']
      },
      {
        title: '連結リストの逆転',
        description: '単方向連結リストを逆順に並べ替えるアルゴリズムを実装します。',
        difficulty: 'medium',
        category_id: codingCategories[1]._id,
        interview_type_id: typeIds.coding,
        interview_type: 'coding',
        estimated_time: 45,
        language_options: ['JavaScript', 'Python', 'Java', 'C++'],
        popularity: 88,
        starter_code: 'function reverseLinkedList(head) {\n  // Your code here\n}',
        test_cases: [
          {
            input: { list: [1, 2, 3, 4, 5] },
            expected: [5, 4, 3, 2, 1]
          },
          {
            input: { list: [1] },
            expected: [1]
          }
        ],
        solution_code: 'function reverseLinkedList(head) {\n  let prev = null;\n  let current = head;\n  let next = null;\n\n  while (current !== null) {\n    next = current.next;\n    current.next = prev;\n    prev = current;\n    current = next;\n  }\n\n  return prev;\n}',
        time_complexity: 'O(n)',
        space_complexity: 'O(1)',
        hints: ['各ノードの次のポインタを前のノードに向け直すことを考えてみましょう']
      }
    ]);
    
    const technicalProblems = await Problem.insertMany([
      {
        title: 'フロントエンド（React）',
        description: 'Reactアプリケーションのパフォーマンスを最適化する手法について議論します。',
        difficulty: 'medium',
        category_id: technicalCategories[0]._id,
        interview_type_id: typeIds.technical,
        interview_type: 'technical',
        estimated_time: 45,
        technologies: ['React', 'JavaScript'],
        role_focus: ['frontend'],
        popularity: 85,
        question_script: 'Reactアプリケーションのパフォーマンスを最適化するための方法をいくつか説明してください。',
        follow_up_questions: [
          'useMemoとuseCallbackの違いは何ですか？',
          'React.memoはどのような場合に使用すべきですか？'
        ],
        expected_answers: [
          'コンポーネントのメモ化、仮想DOMの最適化、状態管理の最適化などが含まれるべき'
        ]
      },
      {
        title: 'バックエンド（API設計、DB設計）',
        description: 'スケーラブルなデータベース設計の原則と手法について議論します。',
        difficulty: 'hard',
        category_id: technicalCategories[1]._id,
        interview_type_id: typeIds.technical,
        interview_type: 'technical',
        estimated_time: 50,
        technologies: ['SQL', 'NoSQL', 'Database Design'],
        role_focus: ['backend', 'fullstack'],
        popularity: 78,
        question_script: '大規模なウェブアプリケーション向けのデータベース設計で考慮すべき主要な原則について説明してください。',
        follow_up_questions: [
          'SQL と NoSQL データベースをいつ、どのように選択しますか？',
          'データベースのシャーディングとは何ですか？どのような場合に適用すべきですか？'
        ],
        expected_answers: [
          '正規化と非正規化のトレードオフ、インデックス戦略、パーティショニング、CAP定理などに言及すべき'
        ]
      },
      {
        title: 'インフラ、ネットワーク',
        description: '保守運用、サイバーセキュリティの対策手法について議論します。',
        difficulty: 'hard',
        category_id: technicalCategories[1]._id,
        interview_type_id: typeIds.technical,
        interview_type: 'technical',
        estimated_time: 50,
        technologies: ['SQL', 'NoSQL', 'Database Design'],
        role_focus: ['backend', 'fullstack'],
        popularity: 78,
        question_script: '大規模なウェブアプリケーション向けのデータベース設計で考慮すべき主要な原則について説明してください。',
        follow_up_questions: [
          'SQL と NoSQL データベースをいつ、どのように選択しますか？',
          'データベースのシャーディングとは何ですか？どのような場合に適用すべきですか？'
        ],
        expected_answers: [
          '正規化と非正規化のトレードオフ、インデックス戦略、パーティショニング、CAP定理などに言及すべき'
        ]
      }
    ]);
    
    const behavioralProblems = await Problem.insertMany([
      {
        title: '新卒採用',
        description: 'チームで困難な状況に直面したときの対処法について議論します。',
        difficulty: 'medium',
        category_id: behavioralCategories[1]._id,
        interview_type_id: typeIds.behavioral,
        interview_type: 'behavioral',
        estimated_time: 30,
        popularity: 90,
        question_type: 'teamwork',
        company_culture: ['startup', 'enterprise'],
        question_script: 'チームメンバーとの意見の不一致や対立に直面したとき、どのように対処しましたか？具体的な例を教えてください。',
        follow_up_questions: [
          'その経験から何を学びましたか？',
          '今振り返って、何か違う対応をしたいと思うことはありますか？'
        ],
        answer_evaluation_criteria: [
          '問題解決能力', 
          'コミュニケーションスキル', 
          '自己認識'
        ]
      },
      {
        title: '中途採用',
        description: 'あなたがリーダーシップを発揮した具体的な経験について議論します。',
        difficulty: 'medium',
        category_id: behavioralCategories[0]._id,
        interview_type_id: typeIds.behavioral,
        interview_type: 'behavioral',
        estimated_time: 30,
        popularity: 92,
        question_type: 'leadership',
        company_culture: ['enterprise', 'gafa'],
        question_script: 'あなたがチームをリードした状況について具体的に教えてください。どのような課題があり、どのように対処しましたか？',
        follow_up_questions: [
          'その経験からリーダーシップについて何を学びましたか？',
          'チームメンバーのモチベーションを高めるために何をしましたか？'
        ],
        answer_evaluation_criteria: [
          'リーダーシップスキル',
          '決断力',
          'チーム管理能力',
          '結果志向'
        ]
      },
      {
        title: 'インターンシップ採用',
        description: 'あなたがリーダーシップを発揮した具体的な経験について議論します。',
        difficulty: 'medium',
        category_id: behavioralCategories[0]._id,
        interview_type_id: typeIds.behavioral,
        interview_type: 'behavioral',
        estimated_time: 30,
        popularity: 92,
        question_type: 'leadership',
        company_culture: ['enterprise', 'gafa'],
        question_script: 'あなたがチームをリードした状況について具体的に教えてください。どのような課題があり、どのように対処しましたか？',
        follow_up_questions: [
          'その経験からリーダーシップについて何を学びましたか？',
          'チームメンバーのモチベーションを高めるために何をしましたか？'
        ],
        answer_evaluation_criteria: [
          'リーダーシップスキル',
          '決断力',
          'チーム管理能力',
          '結果志向'
        ]
      }
    ]);
    
    console.log('Problems created');
    
    // サンプルユーザーの作成
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('password123', salt);
    
    const users = await User.insertMany([
      {
        email: 'admin@example.com',
        password_hash: password_hash,
        name: '管理者',
        role: 'admin',
        profile: {
          experience_level: 'senior',
          preferred_languages: ['JavaScript', 'TypeScript', 'Python'],
          job_title: 'サービス管理者',
          bio: 'システム管理者でありエンジニアリング教育経験者',
          target_companies: ['Google', 'Amazon', 'Microsoft']
        },
        progress: {
          current_level: 'advanced',
          level_progress: 95,
          total_problems_solved: 87
        },
        skills: [
          {
            name: 'JavaScript',
            category: 'technical',
            score: 95,
            last_evaluated: new Date()
          },
          {
            name: 'リーダーシップ',
            category: 'soft',
            score: 90,
            last_evaluated: new Date()
          }
        ]
      },
      {
        email: 'user1@example.com',
        password_hash: password_hash,
        name: 'サンプルユーザー1',
        role: 'user',
        profile: {
          experience_level: 'junior',
          preferred_languages: ['JavaScript', 'Python'],
          job_title: 'フロントエンドデベロッパー',
          bio: 'Webフロントエンド開発に興味があるエンジニア',
          target_companies: ['Google', 'Facebook', 'Line']
        },
        progress: {
          current_level: 'beginner',
          level_progress: 45,
          total_problems_solved: 15,
          coding_interviews_completed: 5,
          technical_interviews_completed: 3,
          behavioral_interviews_completed: 2,
          coding_avg_score: 78,
          technical_avg_score: 65,
          behavioral_avg_score: 72
        },
        skills: [
          {
            name: 'JavaScript',
            category: 'technical',
            score: 75,
            last_evaluated: new Date()
          },
          {
            name: 'コミュニケーション',
            category: 'soft',
            score: 68,
            last_evaluated: new Date()
          }
        ]
      },
      {
        email: 'user2@example.com',
        password_hash: password_hash,
        name: 'サンプルユーザー2',
        role: 'user',
        profile: {
          experience_level: 'mid',
          preferred_languages: ['Java', 'Kotlin', 'SQL'],
          job_title: 'バックエンドエンジニア',
          bio: 'データベース設計と最適化が得意なエンジニア',
          target_companies: ['Rakuten', 'CyberAgent', 'DeNA']
        },
        progress: {
          current_level: 'intermediate',
          level_progress: 72,
          total_problems_solved: 42,
          coding_interviews_completed: 12,
          technical_interviews_completed: 8,
          behavioral_interviews_completed: 5,
          coding_avg_score: 82,
          technical_avg_score: 85,
          behavioral_avg_score: 78
        },
        skills: [
          {
            name: 'Java',
            category: 'technical',
            score: 85,
            last_evaluated: new Date()
          },
          {
            name: 'SQL',
            category: 'technical',
            score: 90,
            last_evaluated: new Date()
          },
          {
            name: 'チームワーク',
            category: 'soft',
            score: 82,
            last_evaluated: new Date()
          }
        ]
      }
    ]);
    
    console.log('Users created');
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();