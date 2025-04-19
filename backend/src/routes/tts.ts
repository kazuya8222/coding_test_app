import express, { Request, Response as ExpressResponse } from 'express';
import { Response as NodeResponse } from 'express-serve-static-core';
import axios from 'axios';
const router = express.Router();

router.post('/', async (req: Request, res: NodeResponse) => {
  const { message } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/audio/speech', {
      model: 'tts-1',  // または 'tts-1-hd'
      input: message,
      voice: 'nova',  // nova, echo, shimmer など選べる
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      responseType: 'arraybuffer', // バイナリで受け取る！
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error: any) {
    console.error('Error in TTS:', error.response?.data || error.message);
    res.status(500).send('Failed to generate speech');
  }
});

module.exports = router;
