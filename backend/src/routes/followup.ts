import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { userAnswer } = req.body;
  
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'あなたは優秀な面接官です。',name: 'system' },
        { role: 'user', content: `候補者の回答：「${userAnswer}」\nこの回答をさらに深掘りするための質問を一つだけ日本語で考えてください。`,name: 'user' }
      ],
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      }
    });

    const followUpQuestion = response.data.choices[0].message.content;
    res.json({ followUpQuestion });
  } catch (error: any) {
    console.error('Error generating follow-up:', error.response?.data || error.message);
    res.status(500).send('Failed to generate follow-up question');
  }
});

export default router;
