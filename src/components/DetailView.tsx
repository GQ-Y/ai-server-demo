import React, { useEffect, useMemo, useState } from 'react';
import {
  History,
  Share2,
  Zap,
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
  ShieldAlert,
  Building2,
  ListTree,
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
  const graphTitle = selected
    ? hazardDisplayTitle(selected).slice(0, 14) + (hazardDisplayTitle(selected).length > 14 ? '…' : '')
    : '—';

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Breadcrumbs & Utility */}
      <div className="h-12 flex items-center justify-between px-8 bg-surface-container-lowest/50 backdrop-blur-sm border-b border-outline-variant/20 shrink-0">
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
        <div className="flex gap-6 shrink-0">
          <button className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary transition-colors">
            <History className="w-4 h-4 shrink-0" /> 历史版本
          </button>
          <button className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary transition-colors">
            <Share2 className="w-4 h-4 shrink-0" /> 导出
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Hazard list (Excel 数据源) */}
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
                正在解析 Excel…
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
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-mono font-semibold text-primary-container truncate">
                            {h.code || '—'}
                          </span>
                          <span className="text-[10px] shrink-0 px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                            {h.level || '—'}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-snug">
                          {h.checkContent || hazardDisplayTitle(h)}
                        </p>
                        <p className="text-[10px] text-outline mt-1 truncate">{h.sheetName}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Knowledge Graph */}
        <section className="flex-1 min-w-0 h-full relative graph-grid bg-surface-container-lowest border-r border-outline-variant/20">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {!selected ? (
              <p className="text-sm text-on-surface-variant">请选择左侧隐患条目</p>
            ) : (
              <>
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                  <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="#004299" strokeWidth="2" strokeDasharray="4" />
                  <line x1="50%" y1="50%" x2="70%" y2="25%" stroke="#004299" strokeWidth="2" strokeDasharray="4" />
                  <line x1="50%" y1="50%" x2="75%" y2="70%" stroke="#004299" strokeWidth="2" strokeDasharray="4" />
                  <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="#004299" strokeWidth="2" strokeDasharray="4" />
                  <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="#004299" strokeWidth="2" strokeDasharray="4" />
                </svg>

                <div className="relative z-20 flex flex-col items-center">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center node-pulse border-4 border-white shadow-xl ${
                      riskInfo.major ? 'bg-error-container' : 'bg-primary/15'
                    }`}
                  >
                    <Zap
                      className={`w-12 h-12 ${riskInfo.major ? 'text-on-error-container' : 'text-primary'}`}
                      fill={riskInfo.major ? 'currentColor' : 'none'}
                      strokeWidth={1.25}
                    />
                  </div>
                  <p className="absolute top-28 max-w-[14rem] text-center font-bold text-error bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm border border-error/10 line-clamp-2">
                    {graphTitle}
                  </p>
                </div>

                <div className="absolute top-[25%] left-[25%] z-10 group flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center shadow-lg hover:border-primary transition-all cursor-pointer">
                    <Layers className="w-8 h-8 text-primary" strokeWidth={1.75} />
                  </div>
                  <p className="mt-2 text-center text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors max-w-[5rem] line-clamp-2">
                    {selected.category || '类别'}
                  </p>
                </div>

                <div className="absolute top-[20%] right-[25%] z-10 group flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center shadow-lg hover:border-primary transition-all cursor-pointer">
                    <Tags className="w-8 h-8 text-primary" strokeWidth={1.75} />
                  </div>
                  <p className="mt-2 text-center text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors max-w-[5rem] line-clamp-2">
                    {selected.subcategory || '子类别'}
                  </p>
                </div>

                <div className="absolute bottom-[25%] right-[20%] z-10 group flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center shadow-lg hover:border-primary transition-all cursor-pointer">
                    <ShieldAlert className="w-8 h-8 text-primary" strokeWidth={1.75} />
                  </div>
                  <p className="mt-2 text-center text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors max-w-[5rem] line-clamp-2">
                    {selected.level || '级别'}
                  </p>
                </div>

                <div className="absolute bottom-[20%] left-[20%] z-10 group flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center shadow-lg hover:border-primary transition-all cursor-pointer">
                    <Calendar className="w-8 h-8 text-primary" strokeWidth={1.75} />
                  </div>
                  <p className="mt-2 text-center text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors max-w-[5rem] line-clamp-2">
                    {selected.rectifyDays ? `${selected.rectifyDays} 天` : '整改期限'}
                  </p>
                </div>

                <div className="absolute bottom-[10%] left-[50%] -translate-x-1/2 z-10 group flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center shadow-lg hover:border-primary transition-all cursor-pointer">
                    <Building2 className="w-8 h-8 text-primary" strokeWidth={1.75} />
                  </div>
                  <p className="mt-2 text-center text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors max-w-[8rem] line-clamp-2">
                    {selected.sheetName}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="absolute bottom-6 left-6 p-4 glass-panel rounded-xl shadow-lg border border-outline-variant/20 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-error shadow-sm" />
              <span className="text-xs font-medium text-on-surface">当前选中隐患</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-primary-container shadow-sm" />
              <span className="text-xs font-medium text-on-surface">分类与属性</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-[2px] bg-primary-container opacity-60" />
              <span className="text-xs font-medium text-on-surface">关联展示</span>
            </div>
          </div>

          <div className="absolute top-6 right-6 flex flex-col gap-2">
            <button
              type="button"
              className="w-10 h-10 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="w-10 h-10 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="w-10 h-10 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20"
            >
              <Rotate3d className="w-5 h-5" />
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
                      {selected.checkContent || '（本条在 Excel 中无排查内容字段）'}
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
