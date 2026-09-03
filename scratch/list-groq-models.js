import 'dotenv/config';

const apiKey = process.env.GROQ_API_KEY;

fetch('https://api.groq.com/openai/v1/models', {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('AVAILABLE GROQ MODELS:');
  if (data.data) {
    data.data.forEach(m => console.log(' -', m.id));
  } else {
    console.log(data);
  }
})
.catch(e => console.error(e));
