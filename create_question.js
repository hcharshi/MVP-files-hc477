import React, { useState } from 'react';
import axios from 'axios';

function CreateQuestion() {
  const [message, setMessage] = useState('');
  const [questionId, setQuestionId] = useState(null);

  const handleCreate = async () => {
    try {
      const res = await axios.post('http://localhost:3000/api/create_question', {
        category: 'Science',
        question: 'What planet is known as the Red Planet?',
        answerOptions: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 'Mars',
        questionType: 'Multiple Choice',
        difficulty: 'Easy',
        author: 'hc477'
      });

      setQuestionId(res.data.id);
      setMessage(`Question created! ID: ${res.data.id}`);
    } catch (err) {
      setMessage(`Error: ${err.response?.data || err.message}`);
    }
  };

  return (
    <div>
      <h2>Create Question</h2>
      <button onClick={handleCreate}>Create Question</button>
      <p>{message}</p>
    </div>
  );
}

export default CreateQuestion;
