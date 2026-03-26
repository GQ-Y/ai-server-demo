export interface HazardRecord {
  id: string;
  /** 全库扁平解析顺序（从 0 起），用于前 300 条定制处置建议 */
  sourceOrderIndex: number;
  sheetName: string;
  category: string;
  subcategory: string;
  fineCategory: string;
  code: string;
  level: string;
  checkContent: string;
  rectifyDays: string;
}

function str(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

/** 从 public 目录下的隐患分类 Excel 解析全部工作表为扁平列表 */
export async function loadYinghuanWorkbook(url = '/xlsx/yinghuanfenlei.xlsx'): Promise<HazardRecord[]> {
  const XLSX = await import('xlsx');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`无法加载隐患库文件（${res.status}）`);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const out: HazardRecord[] = [];
  let seq = 0;

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      defval: '',
      raw: false,
    }) as Record<string, unknown>[];

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
      seq += 1;
      const sourceOrderIndex = out.length;
      out.push({
        id,
        sourceOrderIndex,
        sheetName,
        category,
        subcategory,
        fineCategory,
        code,
        level,
        checkContent,
        rectifyDays,
      });
    }
  }

  return out;
}

/** 首页 / 列表搜索：在已加载的隐患库中按关键词筛选 */
export function filterHazardRecords(items: HazardRecord[], q: string, limit = 40): HazardRecord[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const filtered = items.filter((h) =>
    [h.code, h.checkContent, h.category, h.subcategory, h.fineCategory, h.sheetName, h.level, h.rectifyDays]
      .join('\n')
      .toLowerCase()
      .includes(query),
  );
  return filtered.slice(0, limit);
}

export function hazardDisplayTitle(h: HazardRecord): string {
  if (h.fineCategory) return h.fineCategory;
  if (h.checkContent) return h.checkContent.slice(0, 48) + (h.checkContent.length > 48 ? '…' : '');
  return h.code || '未命名隐患';
}

export function levelToRiskScore(level: string): number {
  const t = level.replace(/\s/g, '');
  if (/[ⅠI1一]/.test(t) && t.length <= 4) return 92;
  if (/[ⅡI2二]/.test(t) && t.length <= 4) return 76;
  if (/[ⅢI3三]/.test(t) && t.length <= 4) return 58;
  if (/[ⅣI4四]/.test(t) && t.length <= 4) return 42;
  return 65;
}

export interface StandardRef {
  code: string;
  desc: string;
}

/** 从排查内容中抽取《…》及 GB 代号，用于右侧「违反规定/标准」展示 */
export function extractStandardRefs(text: string): StandardRef[] {
  const results: StandardRef[] = [];
  const seen = new Set<string>();

  for (const m of text.matchAll(/《([^》]{2,120})》/g)) {
    const name = m[1].trim();
    if (name && !seen.has(name)) {
      seen.add(name);
      results.push({ code: name, desc: '标准 / 规范名称引用（来自排查内容原文）' });
    }
  }

  for (const m of text.matchAll(/GB\s*[\d.\-]+(?:\/[Tt]?\s*[\d.\-]+)?/g)) {
    const code = m[0].replace(/\s+/g, ' ').trim();
    if (code && !seen.has(code)) {
      seen.add(code);
      results.push({ code, desc: '国家标准代号引用（来自排查内容原文）' });
    }
  }

  if (results.length === 0) {
    results.push({
      code: '工程板块管理制度',
      desc: '请结合当前工程板块 Excel 工作表分类及企业制度、行业规范综合判定。',
    });
  }

  return results.slice(0, 6);
}
