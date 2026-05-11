import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend running');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    res.json({
      reply: `You said: ${message}`,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
    });
  }
});

export default app;