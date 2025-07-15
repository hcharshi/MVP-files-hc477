import React, { useState } from 'react';
import axios from 'axios';

function ParticipateInQuiz() {
  const [questionId, setQuestionId] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:3000/api/submit_answer', {
        questionId,
        selectedAnswer,
        userId: 'hc477'
      });
      setResult(`Response: ${JSON.stringify(res.data)}`);
    } catch (err) {
      setResult(`Error: ${err.response?.data || err.message}`);
    }
  };

  return (
    <div>
      <h2>Participate in Quiz</h2>
      <input
        type="text"
        placeholder="Question ID"
        value={questionId}
        onChange={(e) => setQuestionId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Your Answer"
        value={selectedAnswer}
        onChange={(e) => setSelectedAnswer(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit Answer</button>

      <p>{result}</p>
    </div>
  );
}

export default ParticipateInQuiz;
