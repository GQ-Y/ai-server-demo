import OpenAI from 'openai';
import type { HazardSearchResult } from './zilliz.js';

// LLM 使用硅基流动，Embedding 继续用 ModelScope（两个 key 互不干扰）
const client = new OpenAI({
  baseURL: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
  apiKey: process.env.SILICONFLOW_API_KEY,
});

const LLM_MODEL = process.env.SILICONFLOW_LLM_MODEL || 'Qwen/Qwen3.5-397B-A17B';

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

// 相似度阈值：低于此值视为弱相关
const RELEVANCE_THRESHOLD = 0.55;

function buildContext(hits: HazardSearchResult[]): string {
  if (hits.length === 0) {
    return '【知识库检索结果】无匹配记录。请完全基于你的专业知识回答，并在末尾注明"（以上来自模型通用知识，知识库暂无匹配记录）"。';
  }

  const maxScore = Math.max(...hits.map((h) => h.score));
  const header =
    maxScore < RELEVANCE_THRESHOLD
      ? `【知识库检索结果】以下记录与问题相关度较低（最高 ${(maxScore * 100).toFixed(0)}%），请结合自身专业知识补充作答，并在末尾注明知识来源。`
      : `【知识库检索结果】以下记录与问题相关（最高相似度 ${(maxScore * 100).toFixed(0)}%），请优先引用。`;

  const records = hits
    .map((h, i) => {
      const path = [h.category, h.subcategory, h.fineCategory].filter(Boolean).join(' → ');
      return [
        `【记录 ${i + 1}】相似度 ${(h.score * 100).toFixed(1)}%`,
        `编号: ${h.code || '—'}  级别: ${h.level || '—'}  工程板块: ${h.sheetName}`,
        `分类路径: ${path || '—'}`,
        `排查内容: ${h.checkContent || '（无）'}`,
        `整改期限: ${h.rectifyDays ? h.rectifyDays + ' 天' : '—'}`,
      ].join('\n');
    })
    .join('\n\n');

  return `${header}\n\n${records}`;
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
    // SiliconFlow 官方参数，禁用思考模式，降低 TTFT
    // @ts-ignore SiliconFlow 扩展字段
    enable_thinking: false,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content ?? '';
    if (content) yield content;
  }
}
