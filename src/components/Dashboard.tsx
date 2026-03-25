import React from 'react';

const categories = [
  { icon: 'local_fire_department', title: '消防安全', desc: '设施巡检 · 烟感告警', color: 'text-error', bg: 'bg-error-container/30', hoverBg: 'group-hover:bg-error' },
  { icon: 'bolt', title: '用电安全', desc: '线路老化 · 负荷监控', color: 'text-amber-600', bg: 'bg-amber-50', hoverBg: 'group-hover:bg-amber-500' },
  { icon: 'construction', title: '建筑施工', desc: '脚手架 · 起重机械', color: 'text-blue-600', bg: 'bg-blue-50', hoverBg: 'group-hover:bg-blue-600' },
  { icon: 'eco', title: '环境危害', desc: '三废处理 · 扬尘监控', color: 'text-emerald-600', bg: 'bg-emerald-50', hoverBg: 'group-hover:bg-emerald-600' },
  { icon: 'science', title: '危险化学品', desc: '存储安全 · 泄露预警', color: 'text-purple-600', bg: 'bg-purple-50', hoverBg: 'group-hover:bg-purple-600' },
  { icon: 'local_shipping', title: '交通运输', desc: '车队调度 · 驾驶规范', color: 'text-indigo-600', bg: 'bg-indigo-50', hoverBg: 'group-hover:bg-indigo-600' },
  { icon: 'precision_manufacturing', title: '特种设备', desc: '压力容器 · 电梯维保', color: 'text-cyan-600', bg: 'bg-cyan-50', hoverBg: 'group-hover:bg-cyan-600' },
  { icon: 'engineering', title: '个体防护', desc: '劳保穿戴 · 作业票证', color: 'text-slate-600', bg: 'bg-slate-100', hoverBg: 'group-hover:bg-primary' },
];

export function Dashboard() {
  return (
    <div className="flex-1 flex flex-col items-center px-8 py-12 overflow-y-auto">
      {/* Hero Section */}
      <div className="w-full max-w-5xl flex flex-col items-center text-center mb-16">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary-container blur-3xl opacity-10 rounded-full scale-150"></div>
          <div className="relative w-32 h-32 bg-surface-container-lowest rounded-2xl ambient-shadow flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500 group">
            <div className="w-24 h-24 bg-primary rounded-xl flex items-center justify-center text-white shadow-inner">
              <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-error rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-white">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
          </div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-primary mb-4 tracking-tight">
          安全生产，重于泰山
        </h2>
        <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed mb-10">
          整合全业务链条安全隐患数据，构建闭环管理机制，利用智能化分析引擎实时预警，为企业安全运营提供坚实的数字化保障。
        </p>

        {/* Search Container */}
        <div className="w-full max-w-3xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-container rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-300"></div>
          <div className="relative flex items-center">
            <div className="absolute left-5 text-primary">
              <span className="material-symbols-outlined text-2xl">search</span>
            </div>
            <input 
              type="text" 
              className="w-full pl-14 pr-32 py-5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ambient-shadow" 
              placeholder="搜索隐患代码、地点、类型或责任人..." 
            />
            <button className="absolute right-3 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-colors shadow-md active:scale-95">
              立即查询
            </button>
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            <span className="text-xs text-on-surface-variant">热门搜索:</span>
            <a href="#" className="text-xs text-primary font-medium hover:underline">消防栓检查</a>
            <a href="#" className="text-xs text-primary font-medium hover:underline">电气火灾监控</a>
            <a href="#" className="text-xs text-primary font-medium hover:underline">深基坑支护</a>
          </div>
        </div>
      </div>

      {/* Bento Grid Categories */}
      <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <button key={idx} className="group bg-surface-container-lowest p-6 rounded-xl ambient-shadow border border-transparent hover:border-primary-container/20 hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-4 active:scale-95">
            <div className={`w-16 h-16 rounded-full ${cat.bg} flex items-center justify-center ${cat.color} ${cat.hoverBg} group-hover:text-white transition-colors duration-300`}>
              <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-lg">{cat.title}</h3>
              <p className="text-xs text-on-surface-variant mt-1">{cat.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Dashboard Preview (Asymmetric Layout) */}
      <div className="w-full max-w-6xl mt-20 grid grid-cols-12 gap-8 items-start mb-12">
        {/* Chart Section */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-2xl ambient-shadow border border-outline-variant/20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-xl font-bold text-primary font-headline">隐患实时趋势图</h4>
              <p className="text-sm text-on-surface-variant mt-1">近 30 天隐患发现与闭环对比</p>
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-primary"></span> 新增
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> 闭环
              </span>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {/* Mockup Bar Chart */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full bg-surface-container rounded-t-md relative h-40">
                <div className="absolute bottom-0 left-0 w-1/2 bg-primary/20 h-32 rounded-t-sm hover:bg-primary/30 transition-colors"></div>
                <div className="absolute bottom-0 right-0 w-1/2 bg-emerald-500/20 h-24 rounded-t-sm hover:bg-emerald-500/30 transition-colors"></div>
              </div>
              <span className="text-[10px] text-on-surface-variant font-mono">05-01</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full bg-surface-container rounded-t-md relative h-40">
                <div className="absolute bottom-0 left-0 w-1/2 bg-primary/40 h-36 rounded-t-sm hover:bg-primary/50 transition-colors"></div>
                <div className="absolute bottom-0 right-0 w-1/2 bg-emerald-500/40 h-28 rounded-t-sm hover:bg-emerald-500/50 transition-colors"></div>
              </div>
              <span className="text-[10px] text-on-surface-variant font-mono">05-08</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full bg-surface-container rounded-t-md relative h-40">
                <div className="absolute bottom-0 left-0 w-1/2 bg-primary h-40 rounded-t-sm hover:bg-primary-container transition-colors"></div>
                <div className="absolute bottom-0 right-0 w-1/2 bg-emerald-500 h-36 rounded-t-sm hover:bg-emerald-600 transition-colors"></div>
              </div>
              <span className="text-[10px] text-on-surface-variant font-mono">今日</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Highlight Card */}
          <div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-2xl text-white ambient-shadow relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <h4 className="text-sm font-medium opacity-80 mb-1">今日高频风险点</h4>
            <div className="text-3xl font-extrabold mb-4 font-headline">区域 C4 动力站</div>
            <div className="flex items-center gap-2 mb-6">
              <span className="px-2 py-0.5 bg-error/80 text-white rounded text-[10px] font-bold border border-white/20">高危预警</span>
              <span className="text-xs opacity-80 font-mono">持续时间: 4.5h</span>
            </div>
            <button className="w-full py-2.5 bg-white text-primary font-bold rounded-lg text-sm hover:bg-surface-container-low transition-colors active:scale-95">
              查看详情报告
            </button>
          </div>

          {/* Activity List */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 ambient-shadow">
            <h4 className="font-bold text-on-surface mb-4">最新动态</h4>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-on-surface">张伟 提交了 消防栓巡检记录</p>
                  <p className="text-xs text-on-surface-variant mt-1">10 分钟前 · 第五车间</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-on-surface">配电室 02 隐患已闭环</p>
                  <p className="text-xs text-on-surface-variant mt-1">35 分钟前 · 审核人: 李芳</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full max-w-6xl mt-auto border-t border-outline-variant/20 pt-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">verified_user</span>
          <span className="text-sm text-on-surface-variant">© 2024 统一AI安全质量风险治理监控平台 | 中国铁路安全标准认证</span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-on-surface-variant">
          <a href="#" className="hover:text-primary transition-colors">隐私政策</a>
          <a href="#" className="hover:text-primary transition-colors">服务条款</a>
          <a href="#" className="hover:text-primary transition-colors">联系支持</a>
        </div>
      </footer>
    </div>
  );
}
