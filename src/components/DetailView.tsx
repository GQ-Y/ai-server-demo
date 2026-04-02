import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ZoomIn,
  ZoomOut,
  Rotate3d,
  AlertTriangle,
  Gavel,
  ClipboardCheck,
  Loader2,
  Search,
  Layers,
  Tags,
  Building2,
  ListTree,
  Box,
  ChevronDown,
  Link2,
} from 'lucide-react';
import {
  type HazardRecord,
  loadYinghuanWorkbook,
  hazardDisplayTitle,
  levelToRiskScore,
  extractStandardRefs,
} from '../data/yinghuanLibrary';
import { getDisposalAdviceBullets } from '../data/disposalAdvice';

function riskLabel(score: number): { text: string; major: boolean } {
  if (score >= 85) return { text: '重大风险 (Major Risk)', major: true };
  if (score >= 70) return { text: '较大风险', major: false };
  if (score >= 55) return { text: '一般风险', major: false };
  return { text: '低风险', major: false };
}

type HierarchyDepth = 'sheet' | 'l1' | 'l2' | 'l3';

function formatCategoryPath(h: HazardRecord): string {
  const parts = [h.category, h.subcategory, h.fineCategory].filter(Boolean);
  return parts.length > 0 ? parts.join(' → ') : '未归类';
}

function computeHierarchyStats(items: HazardRecord[], selected: HazardRecord) {
  const sheet = selected.sheetName;
  const cat = selected.category;
  const sub = selected.subcategory;
  const fine = selected.fineCategory.trim();

  const inSheet = items.filter((h) => h.sheetName === sheet);
  const inL1 = inSheet.filter((h) => h.category === cat);
  const inL2 = inL1.filter((h) => h.subcategory === sub);
  const inL3 = fine ? inL2.filter((h) => h.fineCategory === fine) : [];

  let currentDepth: HierarchyDepth = 'sheet';
  if (fine) currentDepth = 'l3';
  else if (sub) currentDepth = 'l2';
  else if (cat) currentDepth = 'l1';

  return {
    sheet: { label: sheet || '—', count: inSheet.length },
    l1: { label: cat || '—', count: inL1.length },
    l2: { label: sub || '—', count: inL2.length },
    l3: {
      label: fine || '（未填写细分类别）',
      count: fine ? inL3.length : inL2.length,
      mergedWithL2: !fine,
    },
    currentDepth,
  };
}

export type DetailViewProps = {
  /** 从首页搜索跳转时要高亮选中的隐患 id，应用后由 onFocusApplied 通知父级清空 */
  focusHazardId?: string | null;
  onFocusApplied?: () => void;
};

export function DetailView({ focusHazardId = null, onFocusApplied }: DetailViewProps) {
  const [items, setItems] = useState<HazardRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'err'>('loading');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    loadYinghuanWorkbook()
      .then((rows) => {
        if (cancelled) return;
        setItems(rows);
        setLoadState('ok');
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadState('err');
        setErrMsg(e instanceof Error ? e.message : '加载失败');
        setItems([]);
        setSelectedId(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** 数据就绪后：优先定位首页传入的 focusHazardId，否则保留当前选中或第一条 */
  useEffect(() => {
    if (loadState !== 'ok' || items.length === 0) return;

    if (focusHazardId) {
      if (items.some((h) => h.id === focusHazardId)) {
        setQuery('');
        setSelectedId(focusHazardId);
        onFocusApplied?.();
        return;
      }
      onFocusApplied?.();
    }

    setSelectedId((prev) => {
      if (prev && items.some((h) => h.id === prev)) return prev;
      return items[0]?.id ?? null;
    });
  }, [loadState, items, focusHazardId, onFocusApplied]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((h) =>
      [h.code, h.checkContent, h.category, h.subcategory, h.fineCategory, h.sheetName, h.level]
        .join('\n')
        .toLowerCase()
        .includes(q),
    );
  }, [items, query]);

  useEffect(() => {
    setSelectedId((prev) => {
      if (filtered.length === 0) return null;
      if (prev && filtered.some((h) => h.id === prev)) return prev;
      return filtered[0].id;
    });
  }, [filtered]);

  const selected = useMemo(
    () => (selectedId ? items.find((h) => h.id === selectedId) ?? null : null),
    [items, selectedId],
  );

  const standards = useMemo(
    () => (selected ? extractStandardRefs(selected.checkContent) : []),
    [selected],
  );

  const disposalBullets = useMemo(
    () => (selected ? getDisposalAdviceBullets(selected) : []),
    [selected],
  );

  const risk = selected ? levelToRiskScore(selected.level) : 0;
  const riskInfo = riskLabel(risk);

  const hierarchyStats = useMemo(
    () => (selected && items.length > 0 ? computeHierarchyStats(items, selected) : null),
    [items, selected],
  );

  const [graphScale, setGraphScale] = useState(1);

  const zoomIn = useCallback(() => {
    setGraphScale((s) => Math.min(1.4, Math.round((s + 0.12) * 100) / 100));
  }, []);
  const zoomOut = useCallback(() => {
    setGraphScale((s) => Math.max(0.72, Math.round((s - 0.12) * 100) / 100));
  }, []);
  const resetGraphView = useCallback(() => {
    setGraphScale(1);
  }, []);

  const applyLevelFilter = useCallback(
    (text: string) => {
      const t = text.trim();
      if (t && t !== '—') setQuery(t);
    },
    [setQuery],
  );

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Breadcrumbs & Utility */}
      <div className="h-12 flex items-center px-8 bg-surface-container-lowest/50 backdrop-blur-sm border-b border-outline-variant/20 shrink-0">
        <nav className="flex text-xs space-x-2 text-on-surface-variant font-medium truncate min-w-0">
          <a href="#" className="hover:text-primary transition-colors shrink-0">
            首页
          </a>
          <span className="shrink-0">&gt;</span>
          <span className="text-primary font-bold truncate">
            {selected?.sheetName ?? '隐患库'}
          </span>
          {selected?.category ? (
            <>
              <span className="shrink-0">&gt;</span>
              <span className="truncate">{selected.category}</span>
            </>
          ) : null}
          {selected?.fineCategory ? (
            <>
              <span className="shrink-0">&gt;</span>
              <span className="text-primary font-bold truncate">{selected.fineCategory}</span>
            </>
          ) : null}
        </nav>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 隐患列表（标准知识库） */}
        <aside className="w-80 shrink-0 border-r border-outline-variant/20 bg-surface-container-low flex flex-col min-h-0">
          <div className="p-3 border-b border-outline-variant/20 space-y-2 shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
              <ListTree className="w-4 h-4 text-primary" />
              隐患列表
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-outline pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="编号 / 级别 / 内容 / 板块…"
                className="w-full pl-8 pr-2 py-2 text-xs rounded-lg bg-surface-container-lowest border border-outline-variant/30 outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
            {loadState === 'loading' ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-on-surface-variant text-sm">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                正在获取数据…
              </div>
            ) : loadState === 'err' ? (
              <div className="p-4 text-xs text-error leading-relaxed">{errMsg}</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-xs text-on-surface-variant">无匹配隐患，请调整筛选。</div>
            ) : (
              <ul className="p-2 space-y-1">
                {filtered.map((h) => {
                  const active = h.id === selectedId;
                  return (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(h.id)}
                        className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors border ${
                          active
                            ? 'bg-surface-container-lowest border-primary-container/40 shadow-sm'
                            : 'border-transparent hover:bg-surface-container/80'
                        }`}
                      >
                        <p className="text-sm font-semibold text-on-surface leading-snug line-clamp-2">
                          {hazardDisplayTitle(h)}
                        </p>
                        <p className="text-[11px] text-on-surface-variant mt-1.5 line-clamp-2 leading-snug">
                          <span className="text-outline">类别</span> {formatCategoryPath(h)}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-outline-variant/15">
                          <span className="text-[10px] font-mono text-primary-container truncate" title={h.code || undefined}>
                            {h.code || '—'}
                          </span>
                          <span className="text-[10px] shrink-0 px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                            {h.level || '—'}
                          </span>
                        </div>
                        <p className="text-[10px] text-outline mt-1 truncate">{h.sheetName}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Knowledge Graph — 层级、条数、关联与交互 */}
        <section className="flex-1 min-w-0 h-full min-h-0 relative graph-grid bg-surface-container-lowest border-r border-outline-variant/20 flex flex-col">
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <p className="text-sm text-on-surface-variant">请选择左侧隐患条目</p>
              </div>
            ) : hierarchyStats ? (
              <>
                <div className="shrink-0 px-4 py-3 border-b border-outline-variant/15 flex items-start justify-between gap-3 bg-surface-container-lowest/95">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-primary font-headline">分类关联图谱</h3>
                    <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">
                      自上而下为 <span className="text-on-surface font-medium">工程板块 → 一级类别 → 二级类别 → 三级类目</span> 的包含关系；数字为全库内同路径下的隐患条数。点击卡片将左侧列表按该级关键词筛选。
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] font-medium text-primary">
                    <Link2 className="w-3 h-3" />
                    可点击筛选
                  </span>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar">
                  <div
                    className="mx-auto max-w-lg space-y-1 transition-transform duration-200 will-change-transform"
                    style={{ transform: `scale(${graphScale})`, transformOrigin: 'top center' }}
                  >
                    {(() => {
                      const hs = hierarchyStats;
                      const cd = hs.currentDepth;
                      const ring = (depth: HierarchyDepth) =>
                        cd === depth
                          ? 'ring-2 ring-primary border-primary-container/40 shadow-md bg-primary/5'
                          : 'border-outline-variant/25 hover:border-primary-container/30 hover:bg-surface-container/60';

                      const LinkRow = () => (
                        <div className="flex items-center justify-center gap-1 py-1 text-[10px] text-on-surface-variant select-none">
                          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                          <span>下级归属上级路径</span>
                        </div>
                      );

                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => applyLevelFilter(hs.sheet.label)}
                            title="筛选：工程板块"
                            className={`w-full rounded-xl border p-3 text-left transition-all active:scale-[0.99] ${ring('sheet')}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                                <Building2 className="w-5 h-5" strokeWidth={1.75} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                                  工程板块
                                </div>
                                <p className="text-sm font-semibold text-on-surface mt-0.5 break-words">{hs.sheet.label}</p>
                                <p className="text-xs font-mono text-primary mt-1">本板块累计 {hs.sheet.count.toLocaleString('zh-CN')} 条</p>
                              </div>
                              {cd === 'sheet' ? (
                                <span className="shrink-0 rounded bg-primary text-white text-[10px] px-1.5 py-0.5 font-bold">
                                  当前
                                </span>
                              ) : null}
                            </div>
                          </button>

                          <LinkRow />

                          <button
                            type="button"
                            onClick={() => applyLevelFilter(hs.l1.label)}
                            title="筛选：一级类别"
                            className={`w-full rounded-xl border p-3 text-left transition-all active:scale-[0.99] ${ring('l1')}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                                <Layers className="w-5 h-5" strokeWidth={1.75} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                                  一级类别
                                </div>
                                <p className="text-sm font-semibold text-on-surface mt-0.5 break-words">{hs.l1.label}</p>
                                <p className="text-xs font-mono text-primary mt-1">
                                  本板块内该一级下 {hs.l1.count.toLocaleString('zh-CN')} 条
                                </p>
                              </div>
                              {cd === 'l1' ? (
                                <span className="shrink-0 rounded bg-primary text-white text-[10px] px-1.5 py-0.5 font-bold">
                                  当前
                                </span>
                              ) : null}
                            </div>
                          </button>

                          <LinkRow />

                          <button
                            type="button"
                            onClick={() => applyLevelFilter(hs.l2.label)}
                            title="筛选：二级类别"
                            className={`w-full rounded-xl border p-3 text-left transition-all active:scale-[0.99] ${ring('l2')}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                                <Tags className="w-5 h-5" strokeWidth={1.75} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                                  二级类别
                                </div>
                                <p className="text-sm font-semibold text-on-surface mt-0.5 break-words">{hs.l2.label}</p>
                                <p className="text-xs font-mono text-primary mt-1">
                                  该一级路径下二级 {hs.l2.count.toLocaleString('zh-CN')} 条
                                </p>
                              </div>
                              {cd === 'l2' ? (
                                <span className="shrink-0 rounded bg-primary text-white text-[10px] px-1.5 py-0.5 font-bold">
                                  当前
                                </span>
                              ) : null}
                            </div>
                          </button>

                          <LinkRow />

                          <button
                            type="button"
                            onClick={() => (hs.l3.mergedWithL2 ? applyLevelFilter(hs.l2.label) : applyLevelFilter(hs.l3.label))}
                            title={hs.l3.mergedWithL2 ? '筛选：二级路径（未填三级）' : '筛选：三级类目'}
                            className={`w-full rounded-xl border p-3 text-left transition-all active:scale-[0.99] ${ring('l3')}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                                <Box className="w-5 h-5" strokeWidth={1.75} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                                  三级类目
                                </div>
                                <p className="text-sm font-semibold text-on-surface mt-0.5 break-words">{hs.l3.label}</p>
                                <p className="text-xs font-mono text-primary mt-1">
                                  {hs.l3.mergedWithL2
                                    ? `未填细分类别时与二级同路径，共 ${hs.l3.count.toLocaleString('zh-CN')} 条`
                                    : `该二级路径下三级 ${hs.l3.count.toLocaleString('zh-CN')} 条`}
                                </p>
                              </div>
                              {cd === 'l3' ? (
                                <span className="shrink-0 rounded bg-primary text-white text-[10px] px-1.5 py-0.5 font-bold">
                                  当前
                                </span>
                              ) : null}
                            </div>
                          </button>

                          <div className="mt-4 rounded-xl border border-outline-variant/20 bg-surface-container/80 p-3">
                            <p className="text-[10px] font-bold text-on-surface-variant mb-2">当前隐患 · 属性关联</p>
                            <div className="flex flex-wrap gap-2 text-[11px]">
                              <span className="inline-flex items-center gap-1 rounded-md bg-surface-container-lowest px-2 py-1 border border-outline-variant/20">
                                <AlertTriangle className="w-3.5 h-3.5 text-error" />
                                级别 {selected.level || '—'}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-md bg-surface-container-lowest px-2 py-1 border border-outline-variant/20">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                整改 {selected.rectifyDays ? `${selected.rectifyDays} 天` : '—'}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 border ${
                                  riskInfo.major
                                    ? 'bg-error-container/40 border-error/30 text-on-error-container'
                                    : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface'
                                }`}
                              >
                                风险指数 {risk}/100
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <div className="absolute bottom-4 left-4 max-w-[14rem] p-3 glass-panel rounded-xl shadow-lg border border-outline-variant/20 text-[10px] text-on-surface-variant leading-relaxed pointer-events-none">
            <p className="font-semibold text-on-surface mb-1">图例</p>
            <p>高亮「当前」：本隐患在分类树上所处的最深可用层级（有三级则标三级）。</p>
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10">
            <button
              type="button"
              onClick={zoomIn}
              title="放大"
              className="w-9 h-9 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={zoomOut}
              title="缩小"
              className="w-9 h-9 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetGraphView}
              title="重置缩放"
              className="w-9 h-9 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20"
            >
              <Rotate3d className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Detail Panel */}
        <section className="w-[min(36%,420px)] shrink-0 h-full bg-surface-container-low overflow-y-auto custom-scrollbar min-h-0">
          <div className="p-8 space-y-10">
            {!selected ? (
              <p className="text-sm text-on-surface-variant">请选择左侧列表中的隐患以查看详情。</p>
            ) : (
              <>
                <div className="space-y-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                      riskInfo.major
                        ? 'bg-error-container text-on-error-container border-error/20'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant/30'
                    }`}
                  >
                    <AlertTriangle
                      className="w-4 h-4 mr-1 shrink-0"
                      fill={riskInfo.major ? 'currentColor' : 'none'}
                      strokeWidth={1.5}
                    />
                    {riskInfo.text}
                  </span>
                  <h1 className="text-2xl font-extrabold font-headline text-on-surface tracking-tight leading-tight">
                    {hazardDisplayTitle(selected)}
                  </h1>

                  <div className="flex gap-6 pt-2 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                        隐患编号
                      </span>
                      <span className="text-sm font-mono font-bold text-primary-container">
                        {selected.code || '—'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 border-l border-outline-variant/30 pl-6">
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                        风险指数(推导)
                      </span>
                      <span className="text-sm font-bold text-error font-mono">
                        {risk}/100
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 border-l border-outline-variant/30 pl-6">
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                        整改期限
                      </span>
                      <span className="text-sm font-mono font-bold text-on-surface">
                        {selected.rectifyDays ? `${selected.rectifyDays} 天` : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full" />
                    隐患详细描述
                  </h3>
                  <div className="p-5 bg-surface-container-lowest rounded-xl ambient-shadow">
                    <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                      {selected.checkContent || '（本条在标准知识库中未填写排查内容）'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full" />
                    分类结构
                  </h3>
                  <div className="p-4 bg-surface-container-lowest rounded-xl ambient-shadow text-xs space-y-2 text-on-surface-variant">
                    <p>
                      <span className="font-bold text-on-surface">工程板块：</span>
                      {selected.sheetName}
                    </p>
                    <p>
                      <span className="font-bold text-on-surface">类别 / 子类 / 细类：</span>
                      {[selected.category, selected.subcategory, selected.fineCategory].filter(Boolean).join(' → ') ||
                        '—'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full" />
                    违反规定/标准
                  </h3>
                  <div className="flex flex-col gap-3">
                    {standards.map((s) => (
                      <div
                        key={s.code}
                        className="flex items-start gap-3 text-sm p-4 bg-surface-container-lowest rounded-xl ambient-shadow"
                      >
                        <Gavel className="w-6 h-6 text-error shrink-0" strokeWidth={1.75} />
                        <div>
                          <p className="font-bold text-on-surface">{s.code}</p>
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pb-8">
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full" />
                    处置建议
                  </h3>
                  <div className="bg-primary/5 p-5 rounded-xl border border-primary/10">
                    <div className="flex items-start gap-3">
                      <ClipboardCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.75} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-primary-container">建议动作</p>
                        <ul className="text-xs text-on-surface-variant leading-relaxed mt-3 list-disc ml-4 space-y-2.5">
                          {disposalBullets.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
