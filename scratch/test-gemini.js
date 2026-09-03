import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing key as Bearer token:', apiKey ? `${apiKey.slice(0, 10)}...` : 'MISSING');

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Respond in JSON: {\"status\": \"ok\"}" }] }]
  })
})
.then(r => r.text())
.then(t => console.log('BEARER RESPONSE:', t))
.catch(e => console.error('ERROR:', e));
