import React from 'react';
import {
  History,
  Share2,
  Zap,
  Droplets,
  Thermometer,
  Gauge,
  Calendar,
  Cpu,
  ZoomIn,
  ZoomOut,
  Rotate3d,
  AlertTriangle,
  Gavel,
  Eye,
  Radio,
  Factory,
  ClipboardCheck,
  FileText,
  Star,
} from 'lucide-react';

export function DetailView() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Breadcrumbs & Utility */}
      <div className="h-12 flex items-center justify-between px-8 bg-surface-container-lowest/50 backdrop-blur-sm border-b border-outline-variant/20 shrink-0">
        <nav className="flex text-xs space-x-2 text-on-surface-variant font-medium">
          <a href="#" className="hover:text-primary transition-colors">首页</a>
          <span>&gt;</span>
          <a href="#" className="hover:text-primary transition-colors">电力系统</a>
          <span>&gt;</span>
          <a href="#" className="hover:text-primary transition-colors">电缆</a>
          <span>&gt;</span>
          <span className="text-primary font-bold">绝缘老化</span>
        </nav>
        <div className="flex gap-6">
          <button className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary transition-colors">
            <History className="w-4 h-4 shrink-0" /> 历史版本
          </button>
          <button className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary transition-colors">
            <Share2 className="w-4 h-4 shrink-0" /> 导出
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Knowledge Graph */}
        <section className="w-[65%] h-full relative graph-grid bg-surface-container-lowest border-r border-outline-variant/20">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            
            {/* Connection Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="#004299" strokeWidth="2" strokeDasharray="4"></line>
              <line x1="50%" y1="50%" x2="70%" y2="25%" stroke="#004299" strokeWidth="2" strokeDasharray="4"></line>
              <line x1="50%" y1="50%" x2="75%" y2="70%" stroke="#004299" strokeWidth="2" strokeDasharray="4"></line>
              <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="#004299" strokeWidth="2" strokeDasharray="4"></line>
              <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="#004299" strokeWidth="2" strokeDasharray="4"></line>
            </svg>

            {/* Central Node */}
            <div className="relative z-20 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-error-container flex items-center justify-center node-pulse border-4 border-white shadow-xl">
                <Zap className="w-12 h-12 text-on-error-container" fill="currentColor" strokeWidth={1.25} />
              </div>
              <p className="absolute top-28 whitespace-nowrap font-bold text-error bg-white/90 px-3 py-1 rounded-full text-sm shadow-sm border border-error/10">电缆绝缘老化</p>
            </div>

            {/* Peripheral Nodes */}
            <div className="absolute top-[25%] left-[25%] z-10 group flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center shadow-lg hover:border-primary hover:shadow-primary/20 transition-all cursor-pointer">
                <Droplets className="w-8 h-8 text-primary" strokeWidth={1.75} />
              </div>
              <p className="mt-2 text-center text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors">环境湿度</p>
            </div>

            <div className="absolute top-[20%] right-[25%] z-10 group flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center shadow-lg hover:border-primary hover:shadow-primary/20 transition-all cursor-pointer">
                <Thermometer className="w-8 h-8 text-primary" strokeWidth={1.75} />
              </div>
              <p className="mt-2 text-center text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors">运行温度</p>
            </div>

            <div className="absolute bottom-[25%] right-[20%] z-10 group flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center shadow-lg hover:border-primary hover:shadow-primary/20 transition-all cursor-pointer">
                <Gauge className="w-8 h-8 text-primary" strokeWidth={1.75} />
              </div>
              <p className="mt-2 text-center text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors">负载电流</p>
            </div>

            <div className="absolute bottom-[20%] left-[20%] z-10 group flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center shadow-lg hover:border-primary hover:shadow-primary/20 transition-all cursor-pointer">
                <Calendar className="w-8 h-8 text-primary" strokeWidth={1.75} />
              </div>
              <p className="mt-2 text-center text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors">使用年限</p>
            </div>

            <div className="absolute bottom-[10%] left-[50%] -translate-x-1/2 z-10 group flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center shadow-lg hover:border-primary hover:shadow-primary/20 transition-all cursor-pointer">
                <Cpu className="w-8 h-8 text-primary" strokeWidth={1.75} />
              </div>
              <p className="mt-2 text-center text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors">材质性能</p>
            </div>
          </div>

          {/* Floating Legend */}
          <div className="absolute bottom-6 left-6 p-4 glass-panel rounded-xl shadow-lg border border-outline-variant/20 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-error shadow-sm"></span>
              <span className="text-xs font-medium text-on-surface">高风险隐患</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-primary-container shadow-sm"></span>
              <span className="text-xs font-medium text-on-surface">关联因素</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-[2px] bg-primary-container opacity-60"></span>
              <span className="text-xs font-medium text-on-surface">强相关联系</span>
            </div>
          </div>

          {/* Graph Controls */}
          <div className="absolute top-6 right-6 flex flex-col gap-2">
            <button className="w-10 h-10 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20">
              <ZoomIn className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20">
              <ZoomOut className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-surface-container-lowest rounded-lg shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20">
              <Rotate3d className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Right Side: Detail Panel */}
        <section className="w-[35%] h-full bg-surface-container-low overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-10">
            
            {/* Hazard Title & Risk Level */}
            <div className="space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-error-container text-on-error-container border border-error/20">
                <AlertTriangle className="w-4 h-4 mr-1 shrink-0" fill="currentColor" strokeWidth={1.5} /> 重大风险 (Major Risk)
              </span>
              <h1 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">电缆绝缘老化破损</h1>
              
              <div className="flex gap-6 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">隐患编号</span>
                  <span className="text-sm font-mono font-bold text-primary-container">HZ-2024-0892</span>
                </div>
                <div className="flex flex-col gap-1 border-l border-outline-variant/30 pl-6">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">风险指数</span>
                  <span className="text-sm font-bold text-error font-mono">88/100</span>
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full"></span>
                隐患详细描述
              </h3>
              <div className="p-5 bg-surface-container-lowest rounded-xl ambient-shadow">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  本隐患指电力电缆因长期运行在高温、潮湿、过电压等恶劣工况下，其绝缘材料发生不可逆的物理及化学性能衰减。表现为绝缘层变色、脆化、龟裂、碳化，甚至出现局部放电。此类隐患极易导致电缆击穿，引发停电事故或电气火灾。
                </p>
              </div>
            </div>

            {/* Regulatory Violations */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full"></span>
                违反规定/标准
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 text-sm p-4 bg-surface-container-lowest rounded-xl ambient-shadow">
                  <Gavel className="w-6 h-6 text-error shrink-0" strokeWidth={1.75} />
                  <div>
                    <p className="font-bold text-on-surface">GB 50217-2018</p>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">《电力工程电缆设计标准》：绝缘选型与耐热等级规定</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm p-4 bg-surface-container-lowest rounded-xl ambient-shadow">
                  <Gavel className="w-6 h-6 text-error shrink-0" strokeWidth={1.75} />
                  <div>
                    <p className="font-bold text-on-surface">DL/T 596</p>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">《电力设备预防性试验规程》：绝缘电阻、介质损耗角正切值标准</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Source */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full"></span>
                隐患来源
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-lowest rounded-xl ambient-shadow flex flex-col items-center justify-center gap-2">
                  <Eye className="w-8 h-8 text-primary" strokeWidth={1.75} />
                  <span className="text-xs font-medium text-on-surface">人工巡检</span>
                </div>
                <div className="p-4 bg-surface-container-lowest rounded-xl ambient-shadow flex flex-col items-center justify-center gap-2">
                  <Radio className="w-8 h-8 text-primary" strokeWidth={1.75} />
                  <span className="text-xs font-medium text-on-surface">在线监测感应</span>
                </div>
                <div className="p-4 bg-surface-container-lowest rounded-xl ambient-shadow flex flex-col items-center justify-center gap-2">
                  <History className="w-8 h-8 text-primary" strokeWidth={1.75} />
                  <span className="text-xs font-medium text-on-surface">预防性试验</span>
                </div>
                <div className="p-4 bg-surface-container-lowest rounded-xl ambient-shadow flex flex-col items-center justify-center gap-2">
                  <Factory className="w-8 h-8 text-primary" strokeWidth={1.75} />
                  <span className="text-xs font-medium text-on-surface">出厂缺陷分析</span>
                </div>
              </div>
            </div>

            {/* Recommended Controls */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full"></span>
                专家处置建议 (Control Measures)
              </h3>
              <div className="bg-primary/5 p-5 rounded-xl border border-primary/10">
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="w-5 h-5 text-primary shrink-0" strokeWidth={1.75} />
                  <div>
                    <p className="text-sm font-bold text-primary-container">推荐管控方案</p>
                    <ul className="text-xs text-on-surface-variant leading-relaxed mt-3 list-disc ml-4 space-y-2">
                      <li>立即进行局部放电带电检测。</li>
                      <li>若检测值超标，应在48小时内安排停电检修。</li>
                      <li>评估环境降温措施，减轻热老化速度。</li>
                      <li>对于严重老化段，实施电缆整段更换。</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-4 pb-8">
              <button className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95">
                <FileText className="w-5 h-5" />
                生成隐患报告 (Generate Report)
              </button>
              <button className="w-full py-3.5 bg-surface-container-lowest border border-outline-variant/50 text-primary-container rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors active:scale-95 ambient-shadow">
                <Star className="w-5 h-5" />
                加入收藏记录 (Add to Favorites)
              </button>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
