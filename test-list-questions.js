const axios = require('axios');

(async function(){
  try {
    const res = await axios.get(
      'http://localhost:3000/api/questions',
      { headers: { 'User-Agent': 'QuizAPI-Test/1.0' } }
    );
    console.log('List response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
})();