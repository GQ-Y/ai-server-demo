/**
 * Zilliz Cloud RESTful API v2 封装
 * Serverless 免费集群不支持 gRPC，使用 HTTPS REST API
 */

const COLLECTION_NAME = 'hazard_knowledge';
const TOP_K = 5;

function baseUrl(): string {
  const endpoint = process.env.ZILLIZ_ENDPOINT!;
  return endpoint.replace(/\/$/, '');
}

async function zillizFetch(path: string, body: object): Promise<any> {
  const url = `${baseUrl()}/v2/vectordb${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.ZILLIZ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json() as any;
  if (!res.ok || (json.code !== 0 && json.code !== undefined && json.code !== 200)) {
    throw new Error(`Zilliz API error: ${json.message || JSON.stringify(json)}`);
  }
  return json;
}

export interface HazardSearchResult {
  pk: string;
  code: string;
  level: string;
  sheetName: string;
  category: string;
  subcategory: string;
  fineCategory: string;
  checkContent: string;
  rectifyDays: string;
  score: number;
}

export async function searchSimilar(vector: number[], topK = TOP_K): Promise<HazardSearchResult[]> {
  const res = await zillizFetch('/entities/search', {
    collectionName: COLLECTION_NAME,
    data: [vector],
    limit: topK,
    outputFields: [
      'pk',
      'code',
      'level',
      'sheetName',
      'category',
      'subcategory',
      'fineCategory',
      'checkContent',
      'rectifyDays',
    ],
    searchParams: { metric_type: 'COSINE' },
  });

  // Zilliz REST API v2 返回格式：res.data 直接是数组
  const hits: any[] = Array.isArray(res.data) ? res.data : [];
  return hits.map((h: any) => ({
    pk: h.pk ?? '',
    code: h.code ?? '',
    level: h.level ?? '',
    sheetName: h.sheetName ?? '',
    category: h.category ?? '',
    subcategory: h.subcategory ?? '',
    fineCategory: h.fineCategory ?? '',
    checkContent: h.checkContent ?? '',
    rectifyDays: h.rectifyDays ?? '',
    score: typeof h.distance === 'number' ? h.distance : parseFloat(h.distance ?? '0'),
  }));
}
