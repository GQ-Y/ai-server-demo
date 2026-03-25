import React from 'react';

interface HeaderProps {
  showSearch?: boolean;
}

export function Header({ showSearch = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/20 flex justify-between items-center w-full px-6 h-16">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-primary-container tracking-wide font-headline">
          统一AI安全质量风险治理监控平台
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {showSearch && (
          <div className="relative hidden md:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm">search</span>
            <input 
              type="text" 
              placeholder="搜索隐患、资产或报告..." 
              className="pl-10 pr-4 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary-container/50 text-sm w-64 outline-none transition-all"
            />
          </div>
        )}

        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors active:scale-95 duration-150 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-white"></span>
          </button>
          <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors active:scale-95 duration-150">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        <div className="h-8 w-px bg-outline-variant/30"></div>

        <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=f2f4f6" 
            alt="User Avatar" 
            className="w-8 h-8 rounded-full bg-surface-container object-cover border border-outline-variant/20"
          />
          <span className="font-headline text-sm font-medium tracking-tight text-on-surface">管理员</span>
        </div>
      </div>
    </header>
  );
}
