import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DetailView } from './components/DetailView';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'detail'>('dashboard');

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Header showSearch={currentView === 'detail'} />
        
        {currentView === 'dashboard' ? <Dashboard /> : <DetailView />}
      </main>
    </div>
  );
}
