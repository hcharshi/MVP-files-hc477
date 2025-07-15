import React, { useState } from 'react';
import axios from 'axios';

function SearchQuestions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/search_questions?term=${encodeURIComponent(searchTerm)}`);
      setResults(res.data);
      setMessage('');
    } catch (err) {
      setResults([]);
      setMessage(`Error: ${err.response?.data || err.message}`);
    }
  };

  return (
    <div>
      <h2>Search Questions</h2>
      <input
        type="text"
        placeholder="Enter search term"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {message && <p>{message}</p>}

      <ul>
        {results.map((q) => (
          <li key={q.id || q._id}>
            <strong>{q.question}</strong> - <em>{q.category}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchQuestions;
