import React, { useCallback, useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Flame,
  Zap,
  HardHat,
  Leaf,
  FlaskConical,
  Truck,
  Factory,
  Shield,
  Search,
  BadgeCheck,
  Loader2,
  BotMessageSquare,
} from 'lucide-react';
import type { HazardRecord } from '../data/yinghuanLibrary';
import { loadYinghuanWorkbook, filterHazardRecords, hazardDisplayTitle } from '../data/yinghuanLibrary';

const categories: {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  bg: string;
  hoverBg: string;
}[] = [
  { icon: Flame, title: '消防安全', desc: '设施巡检 · 烟感告警', color: 'text-error', bg: 'bg-error-container/30', hoverBg: 'group-hover:bg-error' },
  { icon: Zap, title: '用电安全', desc: '线路老化 · 负荷监控', color: 'text-amber-600', bg: 'bg-amber-50', hoverBg: 'group-hover:bg-amber-500' },
  { icon: HardHat, title: '建筑施工', desc: '脚手架 · 起重机械', color: 'text-blue-600', bg: 'bg-blue-50', hoverBg: 'group-hover:bg-blue-600' },
  { icon: Leaf, title: '环境危害', desc: '三废处理 · 扬尘监控', color: 'text-emerald-600', bg: 'bg-emerald-50', hoverBg: 'group-hover:bg-emerald-600' },
  { icon: FlaskConical, title: '危险化学品', desc: '存储安全 · 泄露预警', color: 'text-purple-600', bg: 'bg-purple-50', hoverBg: 'group-hover:bg-purple-600' },
  { icon: Truck, title: '交通运输', desc: '车队调度 · 驾驶规范', color: 'text-indigo-600', bg: 'bg-indigo-50', hoverBg: 'group-hover:bg-indigo-600' },
  { icon: Factory, title: '特种设备', desc: '压力容器 · 电梯维保', color: 'text-cyan-600', bg: 'bg-cyan-50', hoverBg: 'group-hover:bg-cyan-600' },
  { icon: HardHat, title: '个体防护', desc: '劳保穿戴 · 作业票证', color: 'text-slate-600', bg: 'bg-slate-100', hoverBg: 'group-hover:bg-primary' },
];

/** 50 个大类：安全 / 生产 / 质量，mock 条数总和 > 10 万 */
const HAZARD_TYPE_META: { domain: '安全' | '生产' | '质量'; name: string; weight: number }[] = [
  { domain: '安全', name: '消防与动火作业', weight: 9.2 },
  { domain: '安全', name: '电气与临时用电', weight: 8.1 },
  { domain: '安全', name: '高处与临边防护', weight: 6.4 },
  { domain: '安全', name: '机械传动与防护罩', weight: 5.9 },
  { domain: '安全', name: '受限空间作业', weight: 5.2 },
  { domain: '安全', name: '危化品储运', weight: 7.3 },
  { domain: '安全', name: '特种设备年检', weight: 6.8 },
  { domain: '安全', name: '厂内车辆与交通', weight: 4.6 },
  { domain: '安全', name: '职业健康监护', weight: 5.1 },
  { domain: '安全', name: '应急与演练', weight: 4.4 },
  { domain: '安全', name: '粉尘与有毒有害', weight: 5.7 },
  { domain: '安全', name: '吊装与起重', weight: 6.2 },
  { domain: '安全', name: '脚手架与模板', weight: 4.9 },
  { domain: '安全', name: '班组安全活动', weight: 3.8 },
  { domain: '安全', name: '安全许可与票证', weight: 5.5 },
  { domain: '安全', name: '个体防护装备', weight: 6.0 },
  { domain: '安全', name: '交叉作业协调', weight: 4.2 },
  { domain: '生产', name: '工艺参数与偏离', weight: 7.1 },
  { domain: '生产', name: '设备完好与劣化', weight: 8.4 },
  { domain: '生产', name: '产线OEE与停机', weight: 7.6 },
  { domain: '生产', name: '物料搬运与FIFO', weight: 5.3 },
  { domain: '生产', name: '现场5S与定置', weight: 6.9 },
  { domain: '生产', name: '能源单耗与跑冒滴漏', weight: 4.7 },
  { domain: '生产', name: '计划检修窗口', weight: 5.0 },
  { domain: '生产', name: '快速换型与调试', weight: 4.3 },
  { domain: '生产', name: '供应链协同与缺料', weight: 5.8 },
  { domain: '生产', name: '产能负荷与瓶颈', weight: 6.5 },
  { domain: '生产', name: '标准作业与SOS', weight: 5.4 },
  { domain: '生产', name: '工装夹具磨损', weight: 4.1 },
  { domain: '生产', name: '备件库存与周转', weight: 4.8 },
  { domain: '生产', name: '生产计划达成', weight: 7.2 },
  { domain: '生产', name: '线边布局与物流', weight: 5.6 },
  { domain: '生产', name: '联锁与旁路管理', weight: 6.3 },
  { domain: '生产', name: '产线异常响应', weight: 6.1 },
  { domain: '质量', name: 'IQC来料检验', weight: 7.4 },
  { domain: '质量', name: 'IPQC过程巡检', weight: 8.0 },
  { domain: '质量', name: 'OQC成品放行', weight: 6.6 },
  { domain: '质量', name: '计量器具与MSA', weight: 4.5 },
  { domain: '质量', name: 'NCR与不合格品', weight: 7.8 },
  { domain: '质量', name: '批次与追溯', weight: 6.7 },
  { domain: '质量', name: 'SPC统计控制', weight: 5.2 },
  { domain: '质量', name: '客户投诉与PPM', weight: 4.9 },
  { domain: '质量', name: '质量改进8D', weight: 5.3 },
  { domain: '质量', name: '文控与发行', weight: 3.9 },
  { domain: '质量', name: '内外审发现项', weight: 4.6 },
  { domain: '质量', name: '首件鉴定', weight: 4.4 },
  { domain: '质量', name: '外观与AOI', weight: 6.2 },
  { domain: '质量', name: '关键尺寸与Cpk', weight: 7.0 },
  { domain: '质量', name: '包装与跌落试验', weight: 4.0 },
  { domain: '质量', name: '质量体系维护', weight: 5.1 },
];

const HAZARD_TYPE_TARGET_TOTAL = 127_800;

function buildHazardTypeStats() {
  const wsum = HAZARD_TYPE_META.reduce((s, r) => s + r.weight, 0);
  const rows = HAZARD_TYPE_META.map((r) => ({
    domain: r.domain,
    name: r.name,
    count: Math.floor((r.weight / wsum) * HAZARD_TYPE_TARGET_TOTAL),
  }));
  const got = rows.reduce((s, r) => s + r.count, 0);
  const drift = HAZARD_TYPE_TARGET_TOTAL - got;
  if (drift !== 0 && rows.length > 0) {
    rows[rows.length - 1] = {
      ...rows[rows.length - 1],
      count: rows[rows.length - 1].count + drift,
    };
  }
  return rows;
}

const hazardTypeStats = buildHazardTypeStats();
const hazardTypeMax = Math.max(...hazardTypeStats.map((r) => r.count));

const domainBarClass: Record<'安全' | '生产' | '质量', string> = {
  安全: 'bg-primary',
  生产: 'bg-amber-500',
  质量: 'bg-emerald-600',
};

type DashboardProps = {
  onSelectHazard?: (hazardId: string) => void;
  onAIChat?: (query: string) => void;
};

export function Dashboard({ onSelectHazard, onAIChat }: DashboardProps) {
  const [library, setLibrary] = useState<HazardRecord[]>([]);
  const [libLoading, setLibLoading] = useState(true);
  const [libError, setLibError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchHint, setSearchHint] = useState('');
  const [searchResults, setSearchResults] = useState<HazardRecord[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadYinghuanWorkbook()
      .then((rows) => {
        if (!cancelled) {
          setLibrary(rows);
          setLibLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setLibError(e instanceof Error ? e.message : '隐患库加载失败');
          setLibLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const runSearch = useCallback(() => {
    const q = searchInput.trim();
    if (!q) {
      setSearchHint('请输入关键词后再查询');
      setSearchResults(null);
      return;
    }
    setSearchHint('');
    setSearchResults(filterHazardRecords(library, q, 40));
  }, [library, searchInput]);

  const hotSearch = useCallback(
    (keyword: string) => {
      setSearchInput(keyword);
      setSearchHint('');
      setSearchResults(filterHazardRecords(library, keyword, 40));
    },
    [library],
  );

  return (
    <div className="flex-1 flex flex-col items-center px-8 py-12 overflow-y-auto">
      {/* Hero Section */}
      <div className="w-full max-w-5xl flex flex-col items-center text-center mb-16">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary-container blur-3xl opacity-10 rounded-full scale-150"></div>
          <div className="relative w-32 h-32 bg-surface-container-lowest rounded-2xl ambient-shadow flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500 group">
            <div className="w-24 h-24 bg-primary rounded-xl flex items-center justify-center text-white shadow-inner">
              <Shield className="w-16 h-16" fill="currentColor" strokeWidth={1.25} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-error rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-white">
              <Zap className="w-6 h-6" fill="currentColor" strokeWidth={1.25} />
            </div>
          </div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-primary mb-4 tracking-tight">
          安全生产，重于泰山
        </h2>
        <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed mb-10">
          整合全业务链条安全隐患数据，构建闭环管理机制，利用智能化分析引擎实时预警，为企业安全运营提供坚实的数字化保障。
        </p>

        {/* Search Container — 隐患标准知识库 */}
        <div className="w-full max-w-3xl relative group">
          {/* 装饰层必须穿透点击，否则会挡住输入框、按钮与结果列表 */}
          <div
            className="pointer-events-none absolute -inset-1 z-0 bg-gradient-to-r from-primary to-primary-container rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-300"
            aria-hidden
          />
          <div className="relative z-10 flex items-center">
            <div className="absolute left-5 text-primary pointer-events-none">
              {libLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Search className="w-8 h-8" />}
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') runSearch();
              }}
              disabled={libLoading || !!libError}
              className="w-full pl-14 pr-32 py-5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ambient-shadow disabled:opacity-60"
              placeholder="搜索隐患编号、级别、排查内容、工程板块、分类…"
            />
            <div className="absolute right-3 flex gap-2">
              <button
                type="button"
                onClick={runSearch}
                disabled={libLoading || !!libError}
                className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-colors shadow-md active:scale-95 disabled:opacity-50 text-sm"
              >
                立即查询
              </button>
              {onAIChat && (
                <button
                  type="button"
                  onClick={() => onAIChat(searchInput.trim())}
                  disabled={libLoading}
                  title="使用 AI 语义问答检索"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-container-lowest border border-primary/30 text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors shadow-sm active:scale-95 disabled:opacity-50 text-sm"
                >
                  <BotMessageSquare className="w-4 h-4 shrink-0" />
                  AI 问答
                </button>
              )}
            </div>
          </div>
          <div className="relative z-10">
          {libError ? (
            <p className="text-center text-sm text-error mt-3">{libError}</p>
          ) : null}
          {searchHint ? <p className="text-center text-sm text-on-surface-variant mt-3">{searchHint}</p> : null}
          <div className="flex flex-wrap gap-3 mt-4 justify-center items-center">
            <span className="text-xs text-on-surface-variant shrink-0">热门搜索:</span>
            <button
              type="button"
              onClick={() => hotSearch('消防')}
              className="text-xs text-primary font-medium hover:underline"
            >
              消防
            </button>
            <button
              type="button"
              onClick={() => hotSearch('基坑')}
              className="text-xs text-primary font-medium hover:underline"
            >
              基坑
            </button>
            <button
              type="button"
              onClick={() => hotSearch('制度')}
              className="text-xs text-primary font-medium hover:underline"
            >
              制度
            </button>
          </div>
          {searchResults !== null ? (
            <div className="mt-6 w-full text-left rounded-xl border border-outline-variant/20 bg-surface-container-lowest ambient-shadow overflow-hidden">
              <div className="px-4 py-2 border-b border-outline-variant/20 bg-surface-container/50 text-xs text-on-surface-variant">
                共匹配 <span className="font-mono font-semibold text-on-surface">{searchResults.length}</span> 条（最多展示 40 条）
              </div>
              <ul className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-outline-variant/15">
                {searchResults.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-on-surface-variant">无匹配条目，请更换关键词</li>
                ) : (
                  searchResults.map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => onSelectHazard?.(h.id)}
                        className="w-full text-left px-4 py-3 hover:bg-surface-container/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-mono font-semibold text-primary-container shrink-0">
                            {h.code || '—'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant shrink-0">
                            {h.level || '—'}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface mt-1 line-clamp-2">{hazardDisplayTitle(h)}</p>
                        <p className="text-[10px] text-outline mt-1 truncate">{h.sheetName}</p>
                        {onSelectHazard ? (
                          <p className="text-[10px] text-primary font-medium mt-2">点击查看隐患详情 →</p>
                        ) : null}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ) : null}
          </div>
        </div>
      </div>

      {/* Bento Grid Categories */}
      <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((cat, idx) => {
          const CatIcon = cat.icon;
          return (
          <button key={idx} className="group bg-surface-container-lowest p-6 rounded-xl ambient-shadow border border-transparent hover:border-primary-container/20 hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-4 active:scale-95">
            <div className={`w-16 h-16 rounded-full ${cat.bg} flex items-center justify-center ${cat.color} ${cat.hoverBg} group-hover:text-white transition-colors duration-300`}>
              <CatIcon className="w-9 h-9" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-lg">{cat.title}</h3>
              <p className="text-xs text-on-surface-variant mt-1">{cat.desc}</p>
            </div>
          </button>
          );
        })}
      </div>

      {/* Dashboard Preview (Asymmetric Layout) */}
      <div className="w-full max-w-6xl mt-20 grid grid-cols-12 gap-8 items-start mb-12">
        {/* Chart Section */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-2xl ambient-shadow border border-outline-variant/20">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h4 className="text-xl font-bold text-primary font-headline">隐患类型分类统计图</h4>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <span className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-primary" /> 安全
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> 生产
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-emerald-600" /> 质量
              </span>
            </div>
          </div>

          <div className="max-h-[22rem] overflow-y-auto custom-scrollbar pr-1 space-y-2.5">
            {hazardTypeStats.map((row) => {
              const pct = hazardTypeMax > 0 ? (row.count / hazardTypeMax) * 100 : 0;
              return (
                <div key={row.name} className="group">
                  <div className="flex items-center justify-between gap-3 text-xs mb-1">
                    <span className="text-on-surface font-medium truncate flex-1 min-w-0" title={row.name}>
                      <span className="text-on-surface-variant font-normal mr-2 shrink-0">[{row.domain}]</span>
                      {row.name}
                    </span>
                    <span className="font-mono text-on-surface-variant shrink-0 tabular-nums">
                      {row.count.toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${domainBarClass[row.domain]} opacity-90 group-hover:opacity-100`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        
      </div>
      
      {/* Footer */}
      <footer className="w-full max-w-6xl mt-auto border-t border-outline-variant/20 pt-8 pb-4 flex justify-center items-center">
        <div className="flex items-center gap-2 text-center">
          <BadgeCheck className="w-5 h-5 text-primary shrink-0" strokeWidth={2} />
          <span className="text-sm text-on-surface-variant">
            © 2024 统一AI安全质量风险治理监控平台 | 安全风险质量知识库
          </span>
        </div>
      </footer>
    </div>
  );
}
