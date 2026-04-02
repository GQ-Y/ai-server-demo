import React, { useCallback, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DetailView } from './components/DetailView';
import { AIChatView } from './components/AIChatView';
import { LoginPage } from './components/LoginPage';
import { AddRecordModal } from './components/AddRecordModal';
import { useAuth } from './auth/AuthContext';

export type AppView = 'dashboard' | 'detail' | 'ai-chat';

export default function App() {
  const { isLoggedIn, logout } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [detailFocusId, setDetailFocusId] = useState<string | null>(null);
  const [aiInitialQuery, setAiInitialQuery] = useState<string>('');
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const clearDetailFocus = useCallback(() => setDetailFocusId(null), []);

  const navigateToAIChat = useCallback((query: string) => {
    setAiInitialQuery(query);
    setCurrentView('ai-chat');
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return sessionStorage.getItem('sidebar_collapsed') === '1';
    } catch {
      return false;
    }
  });

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((c) => {
      const next = !c;
      try {
        sessionStorage.setItem('sidebar_collapsed', next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onAddRecord={() => setAddRecordOpen(true)}
        onLogout={logout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />


      <main
        className={`flex-1 flex flex-col h-screen overflow-hidden transition-[margin] duration-200 ease-out ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Header />

        {currentView === 'dashboard' && (
          <Dashboard
            onSelectHazard={(id) => {
              setDetailFocusId(id);
              setCurrentView('detail');
            }}
            onAIChat={navigateToAIChat}
          />
        )}
        {currentView === 'detail' && (
          <DetailView
            focusHazardId={detailFocusId}
            onFocusApplied={clearDetailFocus}
          />
        )}
        {currentView === 'ai-chat' && (
          <AIChatView
            initialQuery={aiInitialQuery}
            onSelectHazard={(id) => {
              setDetailFocusId(id);
              setCurrentView('detail');
            }}
          />
        )}
      </main>

      <AddRecordModal open={addRecordOpen} onClose={() => setAddRecordOpen(false)} />
    </div>
  );
}
