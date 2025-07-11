const axios = require('axios');

(async function(){
  try {
    const createRes = await axios.post(
      'http://localhost:3000/api/create_question',
      {
        category:      'Science',
        question:      'What planet is known as the Red Planet?',
        answerOptions: ['Earth','Mars','Jupiter','Saturn'],
        correctAnswer: 'Mars',
        questionType:  'Multiple Choice',
        difficulty:    'Easy',
        author:        'hc477'
      }
    );
    const qid = createRes.data.id;
    console.log('Created id:', qid);

    const editRes = await axios.put(
      'http://localhost:3000/api/edit_question',
      {
        id:            qid,
        category:      'Astronomy',
        question:      'Which planet is nicknamed the Red Planet?',
        answerOptions: ['Mercury','Venus','Mars','Neptune'],
        correctAnswer: 'Mars',
        questionType:  'Multiple Choice',
        difficulty:    'Easy',
        author:        'hc477'
      }
    );
    console.log('Edit response:', editRes.data);

    const listRes = await axios.get('http://localhost:3000/api/questions');
    console.log('List now:', listRes.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
})();
