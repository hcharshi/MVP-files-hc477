const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5001;


let users = [];
let questions = [];
let scores = [
  {
    username: "Alice",
    score: 950,
    category: "Science",
    timestamp: new Date().toISOString(),
    quizId: "quiz-1"
  },
  {
    username: "Bob",
    score: 880,
    category: "History",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    quizId: "quiz-2"
  },
  {
    username: "Charlie",
    score: 920,
    category: "General Knowledge",
    timestamp: new Date().toISOString(),
    quizId: "quiz-3"
  },
  {
    username: "David",
    score: 850,
    category: "Sports",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    quizId: "quiz-4"
  },
  {
    username: "Eve",
    score: 970,
    category: "Science",
    timestamp: new Date().toISOString(),
    quizId: "quiz-5"
  }
];

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const sendToVMWithReply = async (vm, payload) => {
  console.log(`Mock VM call to ${vm}:`, payload);

  switch (payload.type) {
    case 'register':
      users.push({
        username: payload.username,
        email: payload.email,
        password: payload.password
      });
      return { success: true };
    case 'login':
      const user = users.find(u => u.email === payload.email);
      if (user) return { success: true, token: 'mock-token-123' };
      return { success: false, error: 'User not found' };
    case 'createQuestion':
      const newQuestion = { id: questions.length + 1, ...payload };
      questions.push(newQuestion);
      return { success: true, questionId: newQuestion.id };
    case 'submitScore':
      scores.push({
        username: payload.username,
        score: payload.score,
        category: payload.category,
        timestamp: payload.timestamp
      });
      return { success: true, rank: scores.length };
    case 'getLeaderboard':
      return {
        success: true,
        data: scores.sort((a, b) => b.score - a.score).slice(0, 10)
      };
    default:
      return { success: false, error: 'Unknown operation' };
  }
};



app.put('/api/questions/update/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const questionIndex = questions.findIndex(q => q.id === parseInt(id));
    if (questionIndex !== -1) {
      questions[questionIndex] = {
        ...questions[questionIndex],
        ...updateData,
        id: questions[questionIndex].id
      };
      res.json({ message: 'Question updated successfully' });
    } else {
      res.status(404).json({ error: 'Question not found' });
    }
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create manual question (Admin)
app.post('/api/questions/create-manual', async (req, res) => {
  const { category, text, answerOptions, correctAnswer, questionType, difficulty, author, status } = req.body;

  try {
    if (!category || !text || !correctAnswer || !questionType || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newQuestion = {
      id: questions.length + 1,
      category,
      text,
      question: text,
      answerOptions,
      options: answerOptions,
      correctAnswer,
      answer: correctAnswer,
      questionType,
      difficulty,
      author: author || 'Admin',
      status: 'approved',
      createdAt: new Date().toISOString(),
      createdBy: 'Admin'
    };

    questions.push(newQuestion);

    res.json({ message: 'Question created successfully (Auto-approved)', questionId: newQuestion.id });
  } catch (error) {
    console.error("Create manual question error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post('/api/questions/create-bulk', async (req, res) => {
  const { questions: bulkQuestions } = req.body;

  try {
    if (!Array.isArray(bulkQuestions)) {
      return res.status(400).json({ error: 'Questions must be an array' });
    }

    let created = 0;
    const errors = [];

    bulkQuestions.forEach((q, index) => {
      if (!q.category || !q.text || !q.correctAnswer || !q.questionType || !q.difficulty) {
        errors.push(`Question ${index + 1}: Missing required fields`);
        return;
      }

      const newQuestion = {
        id: questions.length + created + 1,
        category: q.category,
        text: q.text,
        question: q.text,
        answerOptions: q.answerOptions,
        options: q.answerOptions,
        correctAnswer: q.correctAnswer,
        answer: q.correctAnswer,
        questionType: q.questionType,
        difficulty: q.difficulty,
        author: 'Admin',
        status: 'approved',
        createdAt: new Date().toISOString(),
        createdBy: 'Admin'
      };

      questions.push(newQuestion);
      created++;
    });

    res.json({
      message: `Bulk import completed`,
      created,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Bulk create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashPass = await bcrypt.hash(password, 10);
    const payload = {
      type: 'register',
      username,
      email,
      password: hashPass
    };
    const response = await sendToVMWithReply('dbvm', payload);
    response.success ? res.json({ message: `Registration successful for ${username}` })
      : res.status(400).json({ error: response.error || 'Registration failed' });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await sendToVMWithReply('dbvm', { type: 'login', email, password });
    response.success ? res.json({ message: 'Login successful', token: response.token })
      : res.status(401).json({ error: response.error || "Login failed" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create question (user submitted)
app.post('/api/questions/create', async (req, res) => {
  const { category, text, answerOptions, correctAnswer, questionType, difficulty, author } = req.body;

  try {
    if (!category || !text || !correctAnswer || !questionType || !difficulty || !author) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payload = {
      type: 'createQuestion',
      category,
      text,
      answerOptions,
      correctAnswer,
      questionType,
      difficulty,
      author,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const response = await sendToVMWithReply('dbvm', payload);
    response.success
      ? res.json({ message: 'Question created successfully and is pending approval', questionId: response.questionId })
      : res.status(400).json({ error: response.error || 'Failed to create question' });
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post('/api/participate', async (req, res) => {
  const { name, score, quizId, category } = req.body;
  try {
    const payload = {
      type: 'submitScore',
      username: name,
      score: parseInt(score),
      quizId: quizId || `quiz-${Date.now()}`,
      category: category || 'General',
      timestamp: new Date().toISOString()
    };
    const response = await sendToVMWithReply('dbvm', payload);
    response.success
      ? res.json({ message: "Participation recorded successfully!", rank: response.rank })
      : res.status(400).json({ error: response.error || 'Failed to record participation' });
  } catch (error) {
    console.error("Participation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/leaderboard/:type', async (req, res) => {
  const { type } = req.params;
  const { category } = req.query;
  try {
    let filteredScores = [...scores];
    const now = new Date();
    switch (type) {
      case 'daily':
        filteredScores = filteredScores.filter(s => new Date(s.timestamp).toDateString() === now.toDateString());
        break;
      case 'weekly':
        filteredScores = filteredScores.filter(s => new Date(s.timestamp) >= new Date(now - 7 * 864e5));
        break;
      case 'monthly':
        filteredScores = filteredScores.filter(s => new Date(s.timestamp) >= new Date(now - 30 * 864e5));
        break;
      case 'category':
        if (category) filteredScores = filteredScores.filter(s => s.category === category);
        break;
      case 'user':
        const userBests = {};
        filteredScores.forEach(s => {
          if (!userBests[s.username] || userBests[s.username].score < s.score)
            userBests[s.username] = s;
        });
        filteredScores = Object.values(userBests);
        break;
    }
    const leaderboard = filteredScores.sort((a, b) => b.score - a.score).slice(0, 10)
      .map((entry, i) => ({ ...entry, rank: i + 1, name: entry.username }));
    res.json({ leaderboard, totalEntries: filteredScores.length, type, category: category || null });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// List questions
app.get("/api/questions", (req, res) => {
  const sampleQuestions = [
    {
      id: 1,
      category: "General Knowledge",
      question: "What is the capital of France?",
      options: ["Paris", "Madrid", "Rome", "Berlin"],
      answer: "Paris",
      difficulty: "easy"
    },
    {
      id: 2,
      category: "Science",
      question: "What is H2O?",
      options: ["Hydrogen", "Water", "Oxygen", "Carbon"],
      answer: "Water",
      difficulty: "easy"
    }
  ];

  const allQuestions = [...sampleQuestions, ...questions.map(q => ({
    id: q.id,
    category: q.category,
    question: q.text,
    options: q.answerOptions,
    answer: q.correctAnswer,
    difficulty: q.difficulty
  }))];

  res.json(allQuestions);
});


app.get('/debug/data', (req, res) => {
  res.json({ users: users.length, questions: questions.length, scores: scores.length, data: { users, questions, scores } });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('CORS enabled for http://localhost:3000');
  console.log('Running in development mode with mock data');
});
