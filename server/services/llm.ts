import OpenAI from 'openai';
import type { HazardSearchResult } from './zilliz.js';

const client = new OpenAI({
  baseURL: process.env.MODELSCOPE_BASE_URL,
  apiKey: process.env.MODELSCOPE_API_KEY,
});

const LLM_MODEL = process.env.MODELSCOPE_LLM_MODEL || 'Qwen/Qwen3-235B-A22B';

function buildSystemPrompt(): string {
  return `/no_think
你是一名专业的安全生产隐患知识库助手，服务于建筑施工、铁路、市政等工程领域。
你的任务是根据用户提问，基于已检索到的隐患知识库记录，给出专业、准确、结构化的回答。

**格式要求（严格遵守）：**
- 使用 Markdown 格式输出，用 ### 作为二级标题，**加粗** 标注关键词
- 段落之间只空一行，不要多余的空行
- 列表用 * 符号，保持紧凑，不要每项之间再空行
- 整体回答控制在 400 字以内，言简意赅

**内容规则：**
1. 知识库有相关记录时：优先引用，用 \`[编号: 00010101]\` 格式标注，不杜撰编号
2. 知识库记录相关度不足（相似度 < 55% 或内容偏题）时：直接用你的专业知识回答，在回答末尾注明"（以上来自模型通用知识，知识库暂无完全匹配记录）"
3. 两种情况均可混用：先引用匹配度高的记录，再用自身知识补充知识库未覆盖的部分
4. 最后给出 1-2 条综合建议`;
}

function buildContext(hits: HazardSearchResult[]): string {
  if (hits.length === 0) return '（未检索到相关隐患记录）';
  return hits
    .map((h, i) => {
      const path = [h.category, h.subcategory, h.fineCategory].filter(Boolean).join(' → ');
      return [
        `【记录 ${i + 1}】`,
        `编号: ${h.code || '—'}  级别: ${h.level || '—'}  工程板块: ${h.sheetName}`,
        `分类路径: ${path || '—'}`,
        `排查内容: ${h.checkContent || '（无）'}`,
        `整改期限: ${h.rectifyDays ? h.rectifyDays + ' 天' : '—'}`,
        `语义相似度: ${(h.score * 100).toFixed(1)}%`,
      ].join('\n');
    })
    .join('\n\n');
}

export async function* streamLLMReply(
  userQuery: string,
  hits: HazardSearchResult[],
): AsyncGenerator<string> {
  const context = buildContext(hits);
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt() },
    {
      role: 'user',
      content: `用户问题：${userQuery}\n\n以下是从知识库检索到的相关隐患记录：\n\n${context}`,
    },
  ];

  const stream = await client.chat.completions.create({
    model: LLM_MODEL,
    messages,
    stream: true,
    max_tokens: 1500,
  });

  let inThinkBlock = false;
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content ?? '';
    if (!content) continue;
    // 过滤 <think>...</think> 思考块，避免输出给用户
    if (content.includes('<think>')) { inThinkBlock = true; }
    if (inThinkBlock) {
      if (content.includes('</think>')) { inThinkBlock = false; }
      continue;
    }
    yield content;
  }
}
