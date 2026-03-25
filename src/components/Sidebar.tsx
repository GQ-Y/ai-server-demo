import React from 'react';
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  Plus,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'detail';
  onNavigate: (view: 'dashboard' | 'detail') => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-surface-container-low border-r border-outline-variant/20 flex flex-col p-4 gap-2">
      <div className="flex items-center gap-3 mb-8 px-2 mt-4">
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white shadow-lg">
          <Shield className="w-6 h-6" fill="currentColor" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-primary-container font-bold font-headline text-sm leading-tight">AI安全风险知识库</h2>
          <p className="text-xs text-on-surface-variant">系统管理员</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        <button 
          onClick={() => onNavigate('dashboard')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left ${
            currentView === 'dashboard' 
              ? 'bg-surface-container-lowest text-primary-container font-semibold shadow-sm' 
              : 'text-on-surface-variant hover:text-primary-container hover:bg-surface-container/50 hover:translate-x-1'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <span className="text-sm tracking-wider">仪表板</span>
        </button>
        
        <button 
          onClick={() => onNavigate('detail')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left ${
            currentView === 'detail' 
              ? 'bg-surface-container-lowest text-primary-container font-semibold shadow-sm' 
              : 'text-on-surface-variant hover:text-primary-container hover:bg-surface-container/50 hover:translate-x-1'
          }`}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-sm tracking-wider">隐患管理</span>
        </button>
      </nav>

      <button className="mt-4 mb-8 mx-2 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-md font-medium text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
        <Plus className="w-4 h-4 shrink-0" />
        新增记录
      </button>

      <div className="mt-auto border-t border-outline-variant/20 pt-4 flex flex-col gap-1">
        <button className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-error hover:bg-surface-container/50 rounded-lg transition-all w-full text-left">
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="text-sm tracking-wider">退出登录</span>
        </button>
      </div>
    </aside>
  );
}
