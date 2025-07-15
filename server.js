const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json()); // replaces body-parser

const Q_FILE = path.join(__dirname, '../data/questions.json');
const S_FILE = path.join(__dirname, '../data/scores.json');

// Read and write helpers
async function readStore(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeStore(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

// Create a new question
app.post('/api/create_question', async (req, res) => {
  const {
    category, question, answerOptions,
    correctAnswer, questionType, difficulty, author
  } = req.body;

  if (!category || !question || !answerOptions || !correctAnswer) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const questions = await readStore(Q_FILE);
  const id = Date.now().toString(); // Simple unique ID
  const newQuestion = {
    id, category, question, answerOptions,
    correctAnswer, questionType, difficulty, author
  };

  questions.push(newQuestion);
  await writeStore(Q_FILE, questions);
  res.status(201).json({ message: 'Question created', id });
});

// Get all questions
app.get('/api/questions', async (req, res) => {
  const questions = await readStore(Q_FILE);
  res.json(questions);
});

// Edit a question
app.put('/api/edit_question', async (req, res) => {
  const { id, ...updatedFields } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing question ID.' });

  const questions = await readStore(Q_FILE);
  const index = questions.findIndex(q => q.id === id);

  if (index === -1) return res.status(404).json({ error: 'Question not found.' });

  questions[index] = { ...questions[index], ...updatedFields };
  await writeStore(Q_FILE, questions);
  res.json({ message: 'Question updated', question: questions[index] });
});

// Search for questions
app.get('/api/search_questions', async (req, res) => {
  const { term } = req.query;
  const questions = await readStore(Q_FILE);
  const result = questions.filter(q =>
    q.question.toLowerCase().includes(term.toLowerCase())
  );
  res.json(result);
});

// Submit an answer
app.post('/api/submit_answer', async (req, res) => {
  const { questionId, selectedAnswer, userId } = req.body;

  if (!questionId || !selectedAnswer || !userId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const questions = await readStore(Q_FILE);
  const scores = await readStore(S_FILE);

  const question = questions.find(q => q.id === questionId);
  if (!question) return res.status(404).json({ error: 'Question not found' });

  const isCorrect = selectedAnswer === question.correctAnswer;

  const scoreEntry = { userId, questionId, isCorrect, timestamp: Date.now() };
  scores.push(scoreEntry);
  await writeStore(S_FILE, scores);

  res.json({ message: 'Answer submitted', isCorrect });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Quiz API server running on http://localhost:${PORT}`);
});
