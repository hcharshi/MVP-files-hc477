const express    = require('express');
const bodyParser = require('body-parser');
const fs         = require('fs').promises;
const path       = require('path');

const Q_FILE = path.join(__dirname, '../data/questions.json');
const S_FILE = path.join(__dirname, '../data/scores.json');

async function readStore(file) {
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw);
}

async function writeStore(file, arr) {
  await fs.writeFile(file, JSON.stringify(arr, null, 2), 'utf8');
}

async function start() {
  const app = express();
  app.use(bodyParser.json());

  app.post('/api/create_question', async (req, res) => {
    const {
      category, question, answerOptions,
      correctAnswer, questionType, difficulty, author
    } = req.body;
    if (
      !category || !question ||
      !Array.isArray(answerOptions) || answerOptions.length === 0 ||
      !correctAnswer || !questionType ||
      !difficulty || !author
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required and must be valid.'
      });
    }
    const store  = await readStore(Q_FILE);
    const nextId = store.length ? store[store.length - 1].id + 1 : 1;
    store.push({
      id:           nextId,
      category,
      question:     question.trim(),
      answerOptions,
      correctAnswer,
      questionType,
      difficulty,
      author,
      created_at:   new Date().toISOString()
    });
    await writeStore(Q_FILE, store);
    res.json({ success: true, id: nextId });
  });

  app.put('/api/edit_question', async (req, res) => {
    const {
      id, category, question, answerOptions,
      correctAnswer, questionType, difficulty, author
    } = req.body;
    if (
      typeof id !== 'number' ||
      !category || !question ||
      !Array.isArray(answerOptions) || answerOptions.length === 0 ||
      !correctAnswer || !questionType ||
      !difficulty || !author
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields (including numeric id) are required.'
      });
    }
    const store = await readStore(Q_FILE);
    const idx   = store.findIndex(q => q.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    store[idx] = {
      ...store[idx],          // preserve created_at
      category,
      question:     question.trim(),
      answerOptions,
      correctAnswer,
      questionType,
      difficulty,
      author
    };
    await writeStore(Q_FILE, store);
    res.json({ success: true, question: store[idx] });
  });

  app.get('/api/search_questions', async (req, res) => {
    const term = req.query.q;
    if (!term) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required.'
      });
    }
    const store  = await readStore(Q_FILE);
    const lower  = term.toLowerCase();
    const results= store.filter(item =>
      item.question.toLowerCase().includes(lower)
    );
    res.json({ success: true, questions: results });
  });

  app.get('/api/questions', async (req, res) => {
    const store = await readStore(Q_FILE);
    res.json({ success: true, questions: store });
  });

  app.post('/api/participate', async (req, res) => {
    const { user, answers } = req.body;
    // answers: [ { id: questionId, answer: "string" }, ... ]
    if (!user || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Request must include "user" and an "answers" array.'
      });
    }
    const questions = await readStore(Q_FILE);
    let correctCount = 0;
    answers.forEach(ans => {
      const q = questions.find(x => x.id === ans.id);
      if (q && String(ans.answer).trim() === String(q.correctAnswer).trim()) {
        correctCount++;
      }
    });
    const total = answers.length;
    const score = total ? Math.round((correctCount / total) * 100) : 0;

    const history = await readStore(S_FILE);
    const entry = { user, score, total, date: new Date().toISOString() };
    history.push(entry);
    await writeStore(S_FILE, history);

    const sorted = [...history].sort((a,b) => b.score - a.score);
    const rank   = sorted.findIndex(x => x === entry) + 1;

    res.json({
      success: true,
      score,
      total,
      rank,
      timestamp: entry.date
    });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
}

start().catch(err => {
  console.error('Failed to start API server:', err);
  process.exit(1);
});
