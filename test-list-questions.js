import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ListQuestions() {
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/questions');
        setQuestions(res.data);
      } catch (err) {
        setMessage(`Error: ${err.response?.data || err.message}`);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <div>
      <h2>List of Questions</h2>
      {message && <p>{message}</p>}
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

export default ListQuestions;
