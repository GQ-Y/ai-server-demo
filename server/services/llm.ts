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
你是一名专业的安全生产顾问，精通建筑施工、铁路、市政等工程领域的安全法规与施工标准。
你的任务是根据用户问题，给出详尽、专业、可操作的回答。

**格式要求（严格遵守）：**
- 使用 Markdown 格式，用 ### 作为二级标题，**加粗** 标注关键词
- 段落之间只空一行，不要多余空行
- 列表用 * 符号，紧凑排列
- 回答字数不限，以回答完整、详尽为准，不要为了简短而省略重要内容

**内容规则：**
1. 知识库有相关记录时：引用并以 \`[编号: XXXXXXXX]\` 格式标注，围绕该记录展开详细说明
2. 知识库记录不足时：直接用专业知识补充，说明具体方法、措施步骤、适用规范或标准名称
3. 两种内容自然融合，统一以专业权威口吻呈现，**不要添加任何关于"知识来源"的免责声明**
4. 对每个隐患或要求，要解释：**为什么**会产生这个风险、**怎么做**具体措施、**参照什么标准**
5. 最后给出 2-3 条综合建议，要具体可执行，不要泛泛而谈`;
}

// 相似度阈值：低于此值视为弱相关
const RELEVANCE_THRESHOLD = 0.55;

function buildContext(hits: HazardSearchResult[]): string {
  if (hits.length === 0) {
    return '【知识库检索结果】无匹配记录，请完全基于你的专业知识详细作答。';
  }

  const maxScore = Math.max(...hits.map((h) => h.score));
  const header =
    maxScore < RELEVANCE_THRESHOLD
      ? `【知识库检索结果】以下记录与问题相关度较低（最高 ${(maxScore * 100).toFixed(0)}%），请结合专业知识详细补充。`
      : `【知识库检索结果】以下记录与问题相关（最高相似度 ${(maxScore * 100).toFixed(0)}%），请优先引用并展开详细说明。`;

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
    max_tokens: 3000,
    // SiliconFlow 官方参数，禁用思考模式，降低 TTFT
    // @ts-ignore SiliconFlow 扩展字段
    enable_thinking: false,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content ?? '';
    if (content) yield content;
  }
}
