import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: process.env.MODELSCOPE_BASE_URL,
  apiKey: process.env.MODELSCOPE_API_KEY,
});

const EMBEDDING_MODEL = process.env.MODELSCOPE_EMBEDDING_MODEL || 'Qwen/Qwen3-Embedding-0.6B';

export async function embedText(text: string): Promise<number[]> {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}
