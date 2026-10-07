import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Explore } from './pages/Explore';
import { OpportunityMap } from './pages/OpportunityMap';
import { Applications } from './pages/Applications';
import { SavedOpportunities } from './pages/SavedOpportunities';
import { CareerAssistant } from './pages/CareerAssistant';
import { SkillGap } from './pages/SkillGap';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SourcesPage } from './pages/SourcesPage';
import { Profile } from './pages/Profile';
import { AuthPage } from './pages/AuthPage';

const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500 flex items-center justify-center animate-spin">
            <span className="w-4 h-4 rounded-full bg-blue-500" />
          </div>
          <span>Loading OpportunityAI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/map" element={<OpportunityMap />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/saved" element={<SavedOpportunities />} />
            <Route path="/assistant" element={<CareerAssistant />} />
            <Route path="/skill-gap" element={<SkillGap />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
