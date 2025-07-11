const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');

async function start() {
  const app = express();
  app.use(bodyParser.json());

  const conn = await amqp.connect('amqp://guest:guest@100.114.222.11');
  const ch   = await conn.createChannel();
  const q    = 'quiz_queue';
  await ch.assertQueue(q, { durable: true });

  app.post('/api/create_question', async (req, res) => {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: 'Field "question" is required.' });
    }
    const msg = JSON.stringify({ type: 'create_question', question });
    ch.sendToQueue(q, Buffer.from(msg), { persistent: true });
    res.json({ success: true });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
}

start().catch(err => {
  console.error('Failed to start API server:', err);
  process.exit(1);
});