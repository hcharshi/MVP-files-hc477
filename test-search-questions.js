const axios = require('axios');

(async function(){
  try {
    const searchTerm = 'Declaration';
    const res = await axios.get(
      `http://localhost:3000/api/search_questions?q=${encodeURIComponent(searchTerm)}`,
      { headers: { 'User-Agent': 'QuizAPI-Test/1.0' } }
    );
    console.log(
      'Search response:',
      JSON.stringify(res.data, null, 2)
    );
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
})();