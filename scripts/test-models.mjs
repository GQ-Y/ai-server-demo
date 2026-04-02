import { readFileSync } from 'fs';
import OpenAI from 'openai';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; })
);

const client = new OpenAI({ baseURL: env.MODELSCOPE_BASE_URL, apiKey: env.MODELSCOPE_API_KEY });

const models = [
  'Qwen/Qwen3-8B',
  'Qwen/Qwen3-14B',
  'Qwen/Qwen3-32B',
  'Qwen/Qwen2.5-72B-Instruct',
];

for (const model of models) {
  const start = Date.now();
  process.stdout.write(`${model} ... `);
  try {
    const stream = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: '/no_think 高处作业有哪些安全隐患，一句话' }],
      stream: true,
      max_tokens: 60,
    });
    let firstTokenMs = null;
    let text = '';
    for await (const chunk of stream) {
      const c = chunk.choices[0]?.delta?.content ?? '';
      if (c && firstTokenMs === null) firstTokenMs = Date.now() - start;
      text += c;
    }
    console.log(`首Token=${firstTokenMs}ms 总=${Date.now()-start}ms | ${text.slice(0, 40)}`);
  } catch (e) {
    console.log(`错误: ${e.message?.slice(0, 60)}`);
  }
}
