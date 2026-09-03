import 'dotenv/config';

const apiKey = process.env.GROQ_API_KEY;

async function testModel(modelId) {
  console.log(`Testing model: ${modelId}...`);
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are a helpful JSON assistant.' },
          { role: 'user', content: 'Respond with JSON: {"status": "ok", "model": "' + modelId + '"}' }
        ]
      })
    });
    const data = await res.json();
    console.log(`RESULT (${modelId}):`, data.choices?.[0]?.message?.content || data.error?.message);
    return data.choices?.[0]?.message?.content;
  } catch (e) {
    console.error(`ERROR (${modelId}):`, e);
  }
}

async function run() {
  await testModel('groq/compound');
  await testModel('openai/gpt-oss-120b');
  await testModel('qwen/qwen3.8-27b');
}

run();
