import React from 'react';
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BotMessageSquare,
} from 'lucide-react';
import type { AppView } from '../App';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onAddRecord?: () => void;
  onLogout?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  currentView,
  onNavigate,
  onAddRecord,
  onLogout,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const navBtn = (active: boolean, collapsedMode: boolean) =>
    `${collapsedMode ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 w-full flex items-center text-left ${
      active
        ? 'bg-surface-container-lowest text-primary-container font-semibold shadow-sm'
        : 'text-on-surface-variant hover:text-primary-container hover:bg-surface-container/50'
    } ${!collapsedMode ? 'hover:translate-x-1' : ''}`;

  return (
    <aside
      className={`h-screen fixed left-0 top-0 z-40 bg-surface-container-low border-r border-outline-variant/20 flex flex-col transition-[width,padding] duration-200 ease-out ${
        collapsed ? 'w-16 p-2' : 'w-64 p-4 gap-2'
      }`}
    >
      <div
        className={`flex shrink-0 mb-6 w-full ${
          collapsed ? 'flex-col items-center gap-3 mt-2' : 'flex-row items-start gap-2 px-2 mt-4'
        }`}
      >
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white shadow-lg shrink-0">
          <Shield className="w-6 h-6" fill="currentColor" strokeWidth={1.5} />
        </div>
        {!collapsed ? (
          <div className="min-w-0 flex-1 pr-1">
            <h2 className="text-primary-container font-bold font-headline text-sm leading-tight">安全风险质量知识库</h2>
            <p className="text-xs text-on-surface-variant">超级管理员</p>
          </div>
        ) : null}
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? '展开菜单' : '收起菜单'}
            aria-expanded={!collapsed}
            className={`rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-primary-container hover:bg-surface-container/50 transition-colors shrink-0 ${
              collapsed ? 'p-2' : 'p-1.5'
            }`}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        ) : null}
      </div>

      <nav className="flex-1 flex flex-col gap-1 min-h-0">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          title="仪表板"
          className={navBtn(currentView === 'dashboard', collapsed)}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          {!collapsed ? <span className="text-sm tracking-wider">仪表板</span> : null}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('detail')}
          title="隐患管理"
          className={navBtn(currentView === 'detail', collapsed)}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {!collapsed ? <span className="text-sm tracking-wider">隐患管理</span> : null}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('ai-chat')}
          title="AI 智能问答"
          className={navBtn(currentView === 'ai-chat', collapsed)}
        >
          <BotMessageSquare className="w-5 h-5 shrink-0" />
          {!collapsed ? <span className="text-sm tracking-wider">AI 智能问答</span> : null}
        </button>
      </nav>

      <button
        type="button"
        onClick={onAddRecord}
        title="新增记录"
        className={`mt-4 mb-4 shrink-0 bg-gradient-to-r from-primary to-primary-container text-white rounded-md font-medium shadow-md active:scale-95 transition-all flex items-center justify-center ${
          collapsed ? 'mx-0 py-3 px-0' : 'mx-2 py-2.5 gap-2 text-sm'
        }`}
      >
        <Plus className="w-4 h-4 shrink-0" />
        {!collapsed ? <span>新增记录</span> : null}
      </button>

      <div className="mt-auto border-t border-outline-variant/20 pt-4 flex flex-col gap-1 shrink-0">
        <button
          type="button"
          onClick={onLogout}
          title="退出登录"
          className={`flex items-center text-on-surface-variant hover:text-error hover:bg-surface-container/50 rounded-lg transition-all w-full text-left ${
            collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-2'
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed ? <span className="text-sm tracking-wider">退出登录</span> : null}
        </button>
      </div>
    </aside>
  );
}
