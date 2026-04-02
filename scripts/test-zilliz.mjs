import OpenAI from 'openai';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; })
);

const ZILLIZ_BASE = env.ZILLIZ_ENDPOINT;
const TOKEN = env.ZILLIZ_API_KEY;

// 先生成一个查询向量
const client = new OpenAI({ baseURL: env.MODELSCOPE_BASE_URL, apiKey: env.MODELSCOPE_API_KEY });
const embRes = await client.embeddings.create({ model: env.MODELSCOPE_EMBEDDING_MODEL, input: ['登高作业安全隐患'] });
const vector = embRes.data[0].embedding;
console.log('向量维度:', vector.length);

// 搜索
const searchRes = await fetch(`${ZILLIZ_BASE}/v2/vectordb/entities/search`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
  body: JSON.stringify({
    collectionName: 'hazard_knowledge',
    data: [vector],
    limit: 3,
    outputFields: ['pk', 'code', 'level', 'checkContent', 'sheetName'],
  }),
});
const json = await searchRes.json();
console.log('搜索结果 code:', json.code);
console.log('data 类型:', typeof json.data, Array.isArray(json.data));
console.log('data 内容:', JSON.stringify(json.data).slice(0, 500));
