import mongoose from 'mongoose';
import { InterviewProblemModel } from '../models/InterviewProblem';
import dotenv from 'dotenv';

dotenv.config();

const sampleProblems: any[] = [
  {
    domain: 'アルゴリズム',
    category: 'ソート',
    title: 'マージソートの実装',
    description: '与えられた整数配列をマージソートでソートする関数を実装してください。時間計算量と空間計算量についても説明してください。',
    difficulty: 'medium',
    timeLimit: 30,
    tags: ['ソート', '分割統治法', '再帰'],
    hints: [
      '配列を半分に分割することを考えてみましょう',
      'マージ処理では、2つのソート済み配列を1つに結合します',
      '再帰的に処理を行うことで、小さな問題に分解できます'
    ],
    expectedAnswer: 'マージソートは分割統治法を用いたソートアルゴリズムです。時間計算量はO(n log n)、空間計算量はO(n)です。',
    followUpQuestions: [
      'マージソートの安定性について説明してください',
      'クイックソートとの違いは何ですか？',
      '実装したコードの最適化ポイントはありますか？'
    ]
  },
  {
    domain: 'システム設計',
    category: 'スケーラビリティ',
    title: 'Twitterのようなマイクロブログサービスの設計',
    description: 'Twitterのようなマイクロブログサービスを設計してください。特に、タイムラインの表示、フォロー/フォロワー機能、トレンドトピックの実装について詳細に説明してください。',
    difficulty: 'hard',
    timeLimit: 45,
    tags: ['分散システム', 'キャッシュ', 'メッセージキュー'],
    hints: [
      'データのパーティショニング戦略を考えてみましょう',
      'キャッシュ層をどのように活用しますか？',
      'リアルタイム性をどのように確保しますか？'
    ],
    expectedAnswer: 'システムは複数のマイクロサービスで構成され、それぞれが特定の機能を担当します。タイムラインはフォローしているユーザーのツイートを時系列で表示し、キャッシュとメッセージキューを活用してパフォーマンスを最適化します。',
    followUpQuestions: [
      'システムの可用性をどのように確保しますか？',
      'データの整合性をどのように保証しますか？',
      'スパム対策はどのように実装しますか？'
    ]
  },
  {
    domain: 'データベース',
    category: 'インデックス',
    title: 'インデックスの最適化',
    description: 'あるECサイトのデータベースで、商品検索のパフォーマンスが低下しています。どのようなインデックスを追加すべきか、またその理由について説明してください。',
    difficulty: 'medium',
    timeLimit: 25,
    tags: ['パフォーマンス', 'クエリ最適化', 'Bツリー'],
    hints: [
      'どのカラムが検索条件として頻繁に使用されていますか？',
      '複合インデックスの順序は重要です',
      'インデックスのトレードオフを考慮してください'
    ],
    expectedAnswer: '商品名、カテゴリ、価格帯などの頻繁に検索されるカラムにインデックスを追加します。複合インデックスを使用することで、複数の条件での検索を効率化できます。',
    followUpQuestions: [
      'インデックスを追加することによるデメリットは何ですか？',
      'どのような場合にインデックスが使用されないですか？',
      'パーティショニングとインデックスの関係について説明してください'
    ]
  }
];

async function seedProblems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codeinterview');
    console.log('Connected to MongoDB');

    // 既存のデータを削除
    await InterviewProblemModel.deleteMany({});
    console.log('Cleared existing problems');

    // 新しいデータを挿入
    await InterviewProblemModel.insertMany(sampleProblems);
    console.log('Successfully seeded problems');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding problems:', error);
    process.exit(1);
  }
}

seedProblems(); 