import { readFileSync } from 'fs';
import OpenAI from 'openai';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    })
);

console.log('Testing LLM model:', env.MODELSCOPE_LLM_MODEL);

const client = new OpenAI({
  baseURL: env.MODELSCOPE_BASE_URL,
  apiKey: env.MODELSCOPE_API_KEY,
});

try {
  const stream = await client.chat.completions.create({
    model: env.MODELSCOPE_LLM_MODEL,
    messages: [{ role: 'user', content: '你好，请简短回复' }],
    stream: true,
    max_tokens: 100,
  });

  process.stdout.write('Response: ');
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? '';
    if (text) process.stdout.write(text);
  }
  console.log('\nDone!');
} catch (e) {
  console.error('Error:', e.message, e.status ?? '');
}
