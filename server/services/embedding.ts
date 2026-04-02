import OpenAI from 'openai';

// 聊天侧 Embedding 使用硅基流动，与入库脚本的 ModelScope 配额互不影响
const client = new OpenAI({
  baseURL: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
  apiKey: process.env.SILICONFLOW_API_KEY,
});

const EMBEDDING_MODEL = process.env.SILICONFLOW_EMBEDDING_MODEL || 'Qwen/Qwen3-Embedding-0.6B';

export async function embedText(text: string, retries = 3): Promise<number[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await client.embeddings.create({ model: EMBEDDING_MODEL, input: text });
      return res.data[0].embedding;
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status === 429 && attempt < retries) {
        const delay = attempt * 2000;
        console.warn(`  [embedding] 429 限流，${delay / 1000}s 后重试 (${attempt}/${retries})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error('embedText: 超过最大重试次数');
}
