/**
 * 隐患知识库数据入库脚本 v3
 * 策略：边向量化边插入（每批 embed → 立即 insert），单条 400 失败则跳过
 * 运行：npx tsx scripts/ingest.ts  或  npm run ingest
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import OpenAI from 'openai';
import * as XLSX from 'xlsx';

// ---------- 加载 .env ----------
function loadEnv(): Record<string, string> {
  const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
  return Object.fromEntries(
    raw
      .split('\n')
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
      }),
  );
}

const env = loadEnv();

// ---------- Zilliz REST API ----------
const ZILLIZ_BASE = env.ZILLIZ_ENDPOINT.replace(/\/$/, '');
const ZILLIZ_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${env.ZILLIZ_API_KEY}`,
};
const COLLECTION_NAME = 'hazard_knowledge';
const EMBEDDING_DIM = parseInt(env.EMBEDDING_DIM || '1024', 10);

async function zillizPost(path: string, body: object): Promise<any> {
  const url = `${ZILLIZ_BASE}/v2/vectordb${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: ZILLIZ_HEADERS,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { throw new Error(`Zilliz ${path} invalid JSON: ${text.slice(0, 200)}`); }
  if (!res.ok) throw new Error(`Zilliz ${path} HTTP ${res.status}: ${text.slice(0, 200)}`);
  return json;
}

async function getRowCount(): Promise<number> {
  const res = await zillizPost('/collections/get_stats', { collectionName: COLLECTION_NAME });
  return res.data?.rowCount ?? 0;
}

async function hasCollection(): Promise<boolean> {
  const res = await zillizPost('/collections/list', {});
  return (res.data ?? []).includes(COLLECTION_NAME);
}

async function createCollection(): Promise<void> {
  await zillizPost('/collections/create', {
    collectionName: COLLECTION_NAME,
    dimension: EMBEDDING_DIM,
    metricType: 'COSINE',
    primaryFieldName: 'pk',
    vectorFieldName: 'vector',
    schema: {
      autoId: false,
      fields: [
        { fieldName: 'pk', dataType: 'VarChar', isPrimary: true, elementTypeParams: { max_length: '200' } },
        { fieldName: 'vector', dataType: 'FloatVector', elementTypeParams: { dim: String(EMBEDDING_DIM) } },
        { fieldName: 'code', dataType: 'VarChar', elementTypeParams: { max_length: '64' } },
        { fieldName: 'level', dataType: 'VarChar', elementTypeParams: { max_length: '32' } },
        { fieldName: 'sheetName', dataType: 'VarChar', elementTypeParams: { max_length: '128' } },
        { fieldName: 'category', dataType: 'VarChar', elementTypeParams: { max_length: '256' } },
        { fieldName: 'subcategory', dataType: 'VarChar', elementTypeParams: { max_length: '256' } },
        { fieldName: 'fineCategory', dataType: 'VarChar', elementTypeParams: { max_length: '256' } },
        { fieldName: 'checkContent', dataType: 'VarChar', elementTypeParams: { max_length: '2048' } },
        { fieldName: 'rectifyDays', dataType: 'VarChar', elementTypeParams: { max_length: '32' } },
      ],
    },
    indexParams: [
      { fieldName: 'vector', indexName: 'vector_idx', metricType: 'COSINE', indexType: 'AUTOINDEX' },
    ],
  });
}

// ---------- Embedding（硅基流动） ----------
const openai = new OpenAI({
  baseURL: env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
  apiKey: env.SILICONFLOW_API_KEY,
});
const EMBEDDING_MODEL = env.SILICONFLOW_EMBEDDING_MODEL || 'Qwen/Qwen3-Embedding-0.6B';
const BATCH_SIZE = 4;
const EMBED_DELAY_MS = 3000;
const MAX_RETRIES = 6;

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/** 清理可能触发内容过滤的文本 */
function sanitize(text: string): string {
  return text
    .replace(/[^\u4e00-\u9fff\u3000-\u303f\uff00-\uffffA-Za-z0-9\s，。、：；""''（）【】《》！？…\-_/.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

/** 尝试对单条文本嵌入，失败时返回 null */
async function embedSingle(text: string): Promise<number[] | null> {
  const candidates = [text, sanitize(text), text.slice(0, 200)];
  for (const t of candidates) {
    try {
      const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: [t] });
      return res.data[0].embedding;
    } catch (e: any) {
      if (e?.status === 400) continue; // 内容过滤，换备选文本
      if (e?.status === 429) {
        await sleep(8000);
        try {
          const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: [t] });
          return res.data[0].embedding;
        } catch { return null; }
      }
      return null;
    }
  }
  return null;
}

/** 批量 embed，单条失败则跳过 */
async function embedBatch(
  texts: string[],
): Promise<Array<number[] | null>> {
  // 先尝试整批
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: texts });
      res.data.sort((a, b) => a.index - b.index);
      return res.data.map((d) => d.embedding);
    } catch (e: any) {
      if (e?.status === 400) {
        // 整批触发内容过滤，逐条单独尝试
        const results: Array<number[] | null> = [];
        for (const t of texts) {
          results.push(await embedSingle(t));
          await sleep(300);
        }
        return results;
      }
      if (e?.status === 429 && attempt < MAX_RETRIES) {
        const wait = Math.pow(2, attempt) * 3000;
        await sleep(wait);
        continue;
      }
      // 其他错误，逐条
      const results: Array<number[] | null> = [];
      for (const t of texts) {
        results.push(await embedSingle(t));
        await sleep(300);
      }
      return results;
    }
  }
  return texts.map(() => null);
}

// ---------- 解析 XLSX ----------
interface HazardRow {
  id: string;
  sheetName: string;
  category: string;
  subcategory: string;
  fineCategory: string;
  code: string;
  level: string;
  checkContent: string;
  rectifyDays: string;
  textForEmbedding: string;
}

function str(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function parseXlsx(filePath: string): HazardRow[] {
  const buf = readFileSync(filePath);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const out: HazardRow[] = [];
  let seq = 0;

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '', raw: false });
    let lastCat = '';
    let lastSub = '';
    let lastFine = '';

    for (const row of rows) {
      const category = str(row['类别']) || lastCat;
      const subcategory = str(row['子类别']) || lastSub;
      const fineCategory = str(row['细分类别']) || lastFine;
      lastCat = category;
      lastSub = subcategory;
      lastFine = fineCategory;

      const code = str(row['隐患编号']);
      const level = str(row['隐患级别']);
      const checkContent = str(row['排查内容']);
      const rectifyDays = str(row['整改期限(天)']);

      if (code === '隐患编号' && !checkContent) continue;
      if (!code && !checkContent) continue;

      const id = `${sheetName}::${code || `row-${seq}`}::${seq}`;
      seq++;
      const textParts = [category, subcategory, fineCategory, checkContent].filter(Boolean);
      out.push({
        id,
        sheetName,
        category,
        subcategory,
        fineCategory,
        code,
        level,
        checkContent,
        rectifyDays,
        textForEmbedding: textParts.join(' | '),
      });
    }
  }
  return out;
}

// ---------- 主流程 ----------
async function main() {
  console.log('=== 隐患知识库入库脚本 v3（跳过内容过滤）===\n');

  // 1. 解析
  const xlsxPath = resolve(process.cwd(), 'public/xlsx/yinghuanfenlei.xlsx');
  console.log('[1/3] 解析 XLSX...');
  const rows = parseXlsx(xlsxPath);
  console.log(`     ${rows.length} 条，${new Set(rows.map((r) => r.sheetName)).size} 个板块\n`);

  // 2. 初始化 Collection
  console.log('[2/3] 初始化 Zilliz Collection...');
  const exists = await hasCollection();
  if (!exists) {
    await createCollection();
    console.log('     Collection 创建成功');
  } else {
    const count = await getRowCount();
    console.log(`     Collection 已存在，当前 ${count} 条记录`);
  }
  console.log();

  // 3. 边向量化边插入（支持断点续传：跳过已入库记录）
  const alreadyCount = exists ? await getRowCount() : 0;
  // 向上取整到批次边界，避免漏掉部分批次
  const resumeFrom = Math.floor(alreadyCount / BATCH_SIZE) * BATCH_SIZE;
  if (resumeFrom > 0) {
    console.log(`[3/3] 断点续传：跳过前 ${resumeFrom} 条（已入库 ${alreadyCount} 条），从第 ${resumeFrom + 1} 条继续`);
  } else {
    console.log(`[3/3] 向量化 + 写入（批次: ${BATCH_SIZE}，延迟: ${EMBED_DELAY_MS}ms）`);
  }
  let inserted = 0;
  let skipped = 0;
  const startTime = Date.now();

  for (let i = resumeFrom; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const texts = batch.map((r) => r.textForEmbedding);

    const vectors = await embedBatch(texts);

    // 只插入有向量的条目
    const validData: object[] = [];
    for (let j = 0; j < batch.length; j++) {
      const r = batch[j];
      const vec = vectors[j];
      if (!vec) {
        skipped++;
        continue;
      }
      validData.push({
        pk: r.id.slice(0, 200),
        vector: vec,
        code: r.code.slice(0, 64),
        level: r.level.slice(0, 32),
        sheetName: r.sheetName.slice(0, 128),
        category: r.category.slice(0, 256),
        subcategory: r.subcategory.slice(0, 256),
        fineCategory: r.fineCategory.slice(0, 256),
        checkContent: r.checkContent.slice(0, 2048),
        rectifyDays: r.rectifyDays.slice(0, 32),
      });
    }

    if (validData.length > 0) {
      try {
        await zillizPost('/entities/upsert', { collectionName: COLLECTION_NAME, data: validData });
        inserted += validData.length;
      } catch (e: any) {
        console.error(`\n  插入失败(i=${i}):`, e.message?.slice(0, 100));
      }
    }

    const done = Math.min(i + BATCH_SIZE, rows.length);
    const pct = Math.round((done / rows.length) * 100);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const eta = Math.round(((Date.now() - startTime) / done) * (rows.length - done) / 1000);
    process.stdout.write(
      `  ${done}/${rows.length} (${pct}%) | 写入:${inserted} 跳过:${skipped} | 用时:${elapsed}s 剩余:~${eta}s  \r`,
    );

    if (done < rows.length) await sleep(EMBED_DELAY_MS);
  }

  process.stdout.write('\n');
  console.log('\n✅ 入库完成！');
  const finalCount = await getRowCount();
  console.log(`   Zilliz 实际条数: ${finalCount}`);
  console.log(`   本次写入: ${inserted}  跳过: ${skipped}`);
  console.log('\n下一步：npm run dev:server 启动后端，然后在网页上测试 AI 问答');
}

main().catch((e) => {
  console.error('\n❌ 失败:', e.message ?? e);
  process.exit(1);
});
