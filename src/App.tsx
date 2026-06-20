import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Mail, Phone, Smile, Award, ShieldAlert, FileText
} from 'lucide-react';
import { User, HistoryItem, LearningResource, ModuleId } from './types';
import { STATIC_LEARNING_RESOURCES, STATIC_STATS, STATIC_HISTORY } from './fallbackData';
import { apiClient } from './apiClient';
import DashboardView from './components/DashboardView';
import CoachModule from './components/CoachModule';
import HistoryList from './components/HistoryList';
import HomeView from './components/HomeView';

const brandLogo = "/src/assets/images/coach_ai_logo_1781955449391.jpg";

const GUEST_USER: User = {
  id: "u-static",
  name: "Support Coach Guest",
  email: "guest@supportcoach.ai",
  role: "manager", // Set to manager by default to allow exploring all modules and reviews without blockades
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
};

export default function App() {
  const [currentUser] = useState<User>(GUEST_USER);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [history, setHistory] = useState<HistoryItem[]>(STATIC_HISTORY);
  const [learningResources, setLearningResources] = useState<LearningResource[]>(STATIC_LEARNING_RESOURCES);
  const [stats, setStats] = useState(STATIC_STATS);

  const [loading, setLoading] = useState(false);

  // Sync data from Express server (with resilient client fallbacks)
  const loadStats = async () => {
    try {
      const data = await apiClient.getStats();
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const loadHistory = async (userObj: User) => {
    try {
      const data = await apiClient.getHistory(userObj.id, userObj.role);
      setHistory(data);
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  const loadLearning = async () => {
    try {
      const data = await apiClient.getLearningResources();
      setLearningResources(data);
    } catch (err) {
      console.error("Error loading learning resources:", err);
    }
  };

  const syncAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadHistory(currentUser),
      loadLearning(),
      loadStats()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    syncAllData();
  }, [currentUser]);

  // Dynamic router to render the correct view panel
  const renderMainContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView 
            onSelectFeature={(id) => {
              setActiveTab(id);
            }}
            stats={stats}
          />
        );
      
      case 'tools':
      case 'dashboard':
        return (
          <DashboardView 
            currentUser={currentUser} 
            stats={stats} 
            onSelectModule={(id) => setActiveTab(id)} 
          />
        );
      
      case 'history':
        return <HistoryList history={history} currentUser={currentUser} />;

      default: // Active module tabs (email_coach, email_improvement, complaint_handling, call_script, soft_skills, escalation, email_writer)
        return (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer font-sans"
            >
              ← Back to AI Workbench
            </button>
            <CoachModule 
              moduleId={activeTab as ModuleId} 
              currentUser={currentUser} 
              onSaveSuccess={() => {
                loadHistory(currentUser);
                loadStats();
              }}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-700 antialiased">
      
      {/* Sleek Top Navigation Bar replacing side drawers */}
      <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition shrink-0" onClick={() => setActiveTab('home')}>
            <img 
              src={brandLogo} 
              alt="COACH.AI Logo" 
              className="w-8 h-8 rounded object-cover border border-slate-700 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              <h1 className="text-sm font-black text-white tracking-wider leading-none">COACH.AI</h1>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Support Coach Suite</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-1 md:gap-2 text-[11px] font-bold uppercase tracking-wide">
            <button
              id="nav-btn-home"
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-sm transition cursor-pointer ${
                activeTab === 'home' 
                  ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              id="nav-btn-email"
              onClick={() => setActiveTab('email_coach')}
              className={`px-3 py-2 rounded-sm transition cursor-pointer ${
                activeTab === 'email_coach' 
                  ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              AI Email Draft Writer
            </button>
            <button
              id="nav-btn-soft-skills"
              onClick={() => setActiveTab('soft_skills')}
              className={`px-3 py-2 rounded-sm transition cursor-pointer ${
                activeTab === 'soft_skills' 
                  ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Brokerage Phrase Library
            </button>
            <button
              id="nav-btn-escalation"
              onClick={() => setActiveTab('escalation')}
              className={`px-3 py-2 rounded-sm transition cursor-pointer ${
                activeTab === 'escalation' 
                  ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Escalation Assistant
            </button>
            <button
              id="nav-btn-history"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 rounded-sm transition cursor-pointer ${
                activeTab === 'history' 
                  ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Saved Logs
            </button>
          </nav>

          {/* User profile capsule info */}
          <div className="hidden lg:flex items-center gap-2.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-300">Sandbox Training Online</span>
          </div>
        </div>
      </header>

      {/* Main workspace container */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {loading ? (
          <div className="h-[50vh] flex flex-col items-center justify-center space-y-3">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest">Caching sandbox environment...</p>
          </div>
        ) : (
          renderMainContent()
        )}
      </main>

      {/* Clean elegant footer */}
      <footer className="bg-white border-t border-slate-205 py-4 text-center text-[10px] text-slate-400 uppercase font-mono tracking-wider">
        <div>COACH v1.2 Standard • Team Practice Sandbox Room • Licensed for Internal Development</div>
      </footer>

    </div>
  );
}
