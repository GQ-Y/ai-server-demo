import { Router, Request, Response } from 'express';
import { embedText } from '../services/embedding.js';
import { searchSimilar } from '../services/zilliz.js';
import { streamLLMReply } from '../services/llm.js';

const router = Router();

/**
 * POST /api/chat
 * Body: { query: string }
 *
 * SSE 响应格式：
 *   data: {"type":"sources","data":[...HazardSearchResult]}
 *   data: {"type":"token","data":"..."}
 *   data: {"type":"done"}
 *   data: {"type":"error","data":"..."}
 */
router.post('/', async (req: Request, res: Response) => {
  const { query } = req.body as { query?: string };
  if (!query || !query.trim()) {
    res.status(400).json({ error: '请传入 query 字段' });
    return;
  }

  // SSE 头 — 必须禁用所有缓冲
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.flushHeaders();

  // 每次写入后立即 flush，确保数据实时下发
  const send = (obj: object) => {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
    if (typeof (res as any).flush === 'function') (res as any).flush();
  };

  try {
    // 立即告知前端"正在处理"，避免用户等待时无反馈
    send({ type: 'thinking', data: '正在语义检索知识库…' });

    // 1. 向量化查询词
    console.log(`  [chat] embedding: "${query.trim().slice(0, 50)}"`);
    const vector = await embedText(query.trim());
    console.log(`  [chat] embedding done, dim=${vector.length}`);

    send({ type: 'thinking', data: '正在匹配相关隐患记录…' });

    // 2. 检索相似隐患
    const hits = await searchSimilar(vector, 5);
    console.log(`  [chat] zilliz hits: ${hits.length}`);

    // 3. 推送来源数据（卡片渲染）
    send({ type: 'sources', data: hits });

    // 4. 流式推送 LLM 回复
    console.log(`  [chat] LLM streaming...`);
    let tokenCount = 0;
    for await (const token of streamLLMReply(query.trim(), hits)) {
      send({ type: 'token', data: token });
      tokenCount++;
    }
    console.log(`  [chat] LLM done, tokens=${tokenCount}`);

    send({ type: 'done' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  [chat] ERROR:`, msg);
    send({ type: 'error', data: msg });
  } finally {
    res.end();
  }
});

export default router;
