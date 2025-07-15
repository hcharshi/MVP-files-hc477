import React, { useEffect, useState } from 'react';
import axios from 'axios';

function QuestionManager() {
  const [questions, setQuestions] = useState([]);
  const [createdId, setCreatedId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const runSequence = async () => {
      try {
        // Step 1: Create
        const createRes = await axios.post('http://localhost:3000/api/create_question', {
          category: 'Science',
          question: 'What planet is known as the Red Planet?',
          answerOptions: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
          correctAnswer: 'Mars',
          questionType: 'Multiple Choice',
          difficulty: 'Easy',
          author: 'hc477',
        });

        const qid = createRes.data.id;
        setCreatedId(qid);
        setMessage(`Created question ID: ${qid}`);

        // Step 2: Edit
        const editRes = await axios.put('http://localhost:3000/api/edit_question', {
          id: qid,
          category: 'Astronomy',
          question: 'Which planet is nicknamed the Red Planet?',
          answerOptions: ['Mercury', 'Venus', 'Mars', 'Neptune'],
          correctAnswer: 'Mars',
          questionType: 'Multiple Choice',
          difficulty: 'Easy',
          author: 'hc477',
        });

        setMessage(prev => prev + '\n' + `Edited question: ${JSON.stringify(editRes.data)}`);

        // Step 3: List
        const listRes = await axios.get('http://localhost:3000/api/questions');
        setQuestions(listRes.data);
      } catch (err) {
        setMessage(`Error: ${err.response?.data || err.message}`);
      }
    };

    runSequence();
  }, []);

  return (
    <div>
      <h2>Question Manager (Create → Edit → List)</h2>
      <pre>{message}</pre>
      <h3>All Questions</h3>
      <ul>
        {questions.map((q) => (
          <li key={q.id || q._id}>
            <strong>{q.question}</strong> - <em>{q.category}</em> ({q.difficulty})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuestionManager;
