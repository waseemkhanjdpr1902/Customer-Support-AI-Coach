import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Mail, Phone, Smile, Award, ShieldAlert, FileText, 
  Menu, X, Laptop, BookOpen, AlertCircle, 
  ArrowRight, Heart, Info, LayoutGrid, Clock, UsersRound
} from 'lucide-react';
import { User, HistoryItem, LearningResource, ModuleId } from './types';
import DashboardView from './components/DashboardView';
import CoachModule from './components/CoachModule';
import HistoryList from './components/HistoryList';
import AdminReview from './components/AdminReview';
import TeamLearning from './components/TeamLearning';
import HomeView from './components/HomeView';
import CommunicationTips from './components/CommunicationTips';

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
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const [stats, setStats] = useState({
    totalGenerations: 0,
    reviewedCount: 0,
    pendingReview: 0,
    avgEmpathy: 0.0,
    avgProfessionalism: 0.0
  });

  const [loading, setLoading] = useState(false);

  // Sync data from Express server
  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const loadHistory = async (userObj: User) => {
    try {
      const url = `/api/history?userId=${userObj.id}&role=${userObj.role}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  const loadLearning = async () => {
    try {
      const res = await fetch('/api/learning');
      if (res.ok) {
        const data = await res.json();
        setLearningResources(data);
      }
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
              if (id === 'phrase_library') {
                setActiveTab('phrase_bank');
              } else if (id === 'learning_center') {
                setActiveTab('learning');
              } else {
                setActiveTab(id);
              }
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
      
      case 'learning':
        return <TeamLearning key="learning-full" resources={learningResources} initialCategory="all" />;

      case 'phrase_bank':
        return <TeamLearning key="learning-phrases" resources={learningResources} initialCategory="phrase_bank" />;

      case 'tips':
        return <CommunicationTips />;

      case 'review':
        return (
          <AdminReview 
            history={history} 
            currentUser={currentUser} 
            onReviewSubmitted={() => loadHistory(currentUser)} 
          />
        );

      default: // Active module tabs (email_improvement, complaint_handling, call_script, soft_skills, escalation, email_writer)
        return (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab('tools')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer font-sans"
            >
              ← Back to Practice Playgrounds
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
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
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
              id="nav-btn-tools"
              onClick={() => setActiveTab('tools')}
              className={`px-3 py-2 rounded-sm transition cursor-pointer ${
                activeTab === 'tools' || ['email_improvement', 'complaint_handling', 'call_script', 'soft_skills', 'escalation', 'email_writer'].includes(activeTab)
                  ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Tools
            </button>
            <button
              id="nav-btn-learning"
              onClick={() => setActiveTab('learning')}
              className={`px-3 py-2 rounded-sm transition cursor-pointer ${
                activeTab === 'learning' 
                  ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Learning Center
            </button>
            <button
              id="nav-btn-phrase-bank"
              onClick={() => setActiveTab('phrase_bank')}
              className={`px-3 py-2 rounded-sm transition cursor-pointer ${
                activeTab === 'phrase_bank' 
                  ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Phrase Library
            </button>
            <button
              id="nav-btn-tips"
              onClick={() => setActiveTab('tips')}
              className={`px-3 py-2 rounded-sm transition cursor-pointer ${
                activeTab === 'tips' 
                  ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Communication Tips
            </button>
            <button
              id="nav-btn-review"
              onClick={() => setActiveTab('review')}
              className={`px-3 py-2 rounded-sm transition cursor-pointer ${
                activeTab === 'review' 
                  ? 'bg-amber-600 text-white font-extrabold shadow-sm' 
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              Manager Audits
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
