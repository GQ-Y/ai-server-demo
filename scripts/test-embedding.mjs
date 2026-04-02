import OpenAI from 'openai';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    })
);

const client = new OpenAI({
  baseURL: env.MODELSCOPE_BASE_URL,
  apiKey: env.MODELSCOPE_API_KEY,
});

// Try different embedding models
const models = [
  'iic/nlp_gte_sentence-embedding_chinese-large',
  'iic/nlp_gte_sentence-embedding_chinese-base',
  'Qwen/Qwen3-Embedding-0.6B',
];

for (const model of models) {
  try {
    const res = await client.embeddings.create({
      model,
      input: '高处作业未设置安全防护栏杆',
    });
    const dim = res.data[0].embedding.length;
    console.log(`✓ ${model} => dim=${dim}`);
    break;
  } catch (e) {
    console.log(`✗ ${model} => ${e.message?.slice(0, 100)}`);
  }
}
