const axios = require('axios');

(async function(){
  try {
    const answers = [
      { id: 1, answer: '1776' },
      { id: 2, answer: 'Mars' }
    ];
    const res = await axios.post(
      'http://localhost:3000/api/participate',
      { user: 'hc477', answers },
      { headers: { 'User-Agent': 'QuizAPI-Test/1.0' } }
    );
    console.log('Participate response:', res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
})();