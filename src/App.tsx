import React, { useCallback, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DetailView } from './components/DetailView';
import { LoginPage } from './components/LoginPage';
import { AddRecordModal } from './components/AddRecordModal';
import { useAuth } from './auth/AuthContext';

export default function App() {
  const { isLoggedIn, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'detail'>('dashboard');
  const [detailFocusId, setDetailFocusId] = useState<string | null>(null);
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const clearDetailFocus = useCallback(() => setDetailFocusId(null), []);

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
      />

      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Header showSearch={currentView === 'detail'} />

        {currentView === 'dashboard' ? (
          <Dashboard
            onSelectHazard={(id) => {
              setDetailFocusId(id);
              setCurrentView('detail');
            }}
          />
        ) : (
          <DetailView
            focusHazardId={detailFocusId}
            onFocusApplied={clearDetailFocus}
          />
        )}
      </main>

      <AddRecordModal open={addRecordOpen} onClose={() => setAddRecordOpen(false)} />
    </div>
  );
}
