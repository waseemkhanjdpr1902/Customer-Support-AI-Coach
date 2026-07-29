import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Mail, Phone, Smile, Award, ShieldAlert, FileText,
  Home, BookOpenCheck, Menu, X, ChevronRight, MessageSquare, HelpCircle
} from 'lucide-react';
import { User, HistoryItem, LearningResource, ModuleId } from './types';
import { STATIC_LEARNING_RESOURCES, STATIC_STATS, STATIC_HISTORY } from './fallbackData';
import { apiClient } from './apiClient';
import DashboardView from './components/DashboardView';
import CoachModule from './components/CoachModule';
import HistoryList from './components/HistoryList';
import HomeView from './components/HomeView';
import EmailCoach from './components/EmailCoach';
import brandLogo from './assets/images/coach_ai_logo_1781955449391.jpg';

export const TEAM_MEMBERS: User[] = [
  { id: "u-1", name: "Alice Vance", email: "alice@finbroking.corp", role: "agent", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
  { id: "u-2", name: "Bob Carter", email: "bob@finbroking.corp", role: "agent", avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" },
  { id: "u-3", name: "Charlie Stone", email: "charlie@finbroking.corp", role: "agent", avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" },
  { id: "u-4", name: "Sarah Jenkins", email: "sarah@finbroking.corp", role: "manager", avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" },
  { id: "u-5", name: "David Miller", email: "david@finbroking.corp", role: "manager", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(TEAM_MEMBERS[3]); // Sarah Jenkins (Manager) default
  const [activeTab, setActiveTab] = useState<string>('home');
  const [history, setHistory] = useState<HistoryItem[]>(STATIC_HISTORY);
  const [learningResources, setLearningResources] = useState<LearningResource[]>(STATIC_LEARNING_RESOURCES);
  const [stats, setStats] = useState(STATIC_STATS);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Sidebar navigation metadata
  const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Home, countAttr: null },
    { id: 'email_coach', label: 'Email Coach', icon: Mail, countAttr: null },
    { id: 'soft_skills', label: 'Brokerage Phrase Library', icon: BookOpenCheck, countAttr: null },
    { id: 'escalation', label: 'Escalation Assistant', icon: ShieldAlert, countAttr: null },
    { id: 'email_improvement', label: 'Communication Coach', icon: Sparkles, countAttr: null },
    { id: 'call_script', label: 'Call Script Generator', icon: Phone, countAttr: null },
    { id: 'universal_coach', label: 'Soft Skills Coach', icon: Smile, countAttr: null },
    { id: 'history', label: 'Saved Logs', icon: Award, countAttr: 'totalGenerations' }
  ];

  // Dynamic router to render the correct view panel
  const renderMainContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView 
            onSelectFeature={(id) => {
              setActiveTab(id);
              setMobileMenuOpen(false);
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
            onSelectModule={(id) => {
              setActiveTab(id);
              setMobileMenuOpen(false);
            }} 
          />
        );
      
      case 'history':
        return (
          <HistoryList 
            history={history} 
            currentUser={currentUser} 
            onRefresh={() => {
              loadHistory(currentUser);
              loadStats();
            }}
          />
        );

      case 'email_coach':
        return (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer font-sans"
            >
              ← Back to AI Workbench
            </button>
            <EmailCoach 
              currentUser={currentUser} 
              onSaveSuccess={() => {
                loadHistory(currentUser);
                loadStats();
              }}
            />
          </div>
        );

      default: // Active module tabs (email_improvement, call_script, soft_skills, escalation, email_writer)
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

  const activeNavItem = NAV_ITEMS.find(item => item.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-700 antialiased overflow-x-hidden">
      
      {/* LEFT SIDEBAR - Desktop layout */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900 border-r border-slate-800 text-slate-100 z-30 select-none shadow-lg">
        {/* Logo & Brand Identity */}
        <div className="p-4 border-b border-slate-800 flex flex-col gap-2.5 cursor-pointer hover:opacity-95 transition text-left" onClick={() => setActiveTab('home')}>
          <img 
            src={brandLogo} 
            alt="Anand Rathi Logo" 
            className="w-full h-auto max-h-12 object-contain rounded-sm border border-slate-800 shadow shadow-blue-500/5"
            referrerPolicy="no-referrer"
          />
          <div className="px-1">
            <h1 className="text-xs font-black text-white tracking-wider leading-none">CS AI Coach</h1>
            <span className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-widest block mt-1">Broking Support Assistant</span>
          </div>
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex-grow p-3 space-y-1 overflow-y-auto pr-1 text-left">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const totalCount = item.countAttr ? (stats as any)[item.countAttr] : null;

            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm transition cursor-pointer text-xs font-bold leading-none ${
                  isActive 
                    ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-600/10 border border-blue-500/10' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Icon className={`w-4 h-4 shrink-0 transition ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {totalCount !== null && totalCount > 0 && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {totalCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Support helper section footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 text-left">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-[10px] font-bold text-slate-300">Need Help?</h5>
              <p className="text-[9px] text-slate-500 leading-normal font-semibold">
                Use AI Coach to draft compliance-ready replies, de-escalate trade risks, and review client complaints.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE COMPANION - Hamburger top bar & responsive nav menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-800 text-white z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
          <img 
            src={brandLogo} 
            alt="Anand Rathi Logo" 
            className="h-7 w-auto object-contain rounded-xs"
            referrerPolicy="no-referrer"
          />
          <span className="text-xs font-black tracking-widest text-white">CS AI COACH</span>
        </div>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-sm hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-35 backdrop-blur-2xs" onClick={() => setMobileMenuOpen(false)}>
          <aside className="fixed top-14 left-0 bottom-0 w-64 bg-slate-900 border-r border-slate-810 text-white p-4 space-y-2 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-sm text-xs font-bold transition cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </aside>
        </div>
      )}

      {/* RIGHT CONTENT WORKSPACE AREA */}
      <div className="flex-1 min-h-screen flex flex-col lg:pl-64 pt-14 lg:pt-0">
        {/* Dynamic header with title info */}
        <header className="hidden lg:flex bg-white h-14 border-b border-slate-205 items-center justify-between px-8 shrink-0 select-none">
          <div className="flex items-center gap-1.5 text-left">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">Workspace Desk:</h2>
            <span className="text-xs font-bold text-slate-800">{activeNavItem?.label || 'AI Coaching Assistant'}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Team Member Switcher */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-sm">
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name} 
                className="w-6 h-6 rounded-full object-cover border border-slate-300"
                referrerPolicy="no-referrer"
              />
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const sel = TEAM_MEMBERS.find(m => m.id === e.target.value);
                  if (sel) setCurrentUser(sel);
                }}
                className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer pr-1"
              >
                {TEAM_MEMBERS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role === 'manager' ? 'Supervisor' : 'Agent'})
                  </option>
                ))}
              </select>
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded font-mono ${
                currentUser.role === 'manager' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {currentUser.role}
              </span>
            </div>

            {/* Safe indicators */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] uppercase font-bold tracking-widest font-mono text-emerald-700">Audit Desk Sandbox</span>
            </div>
            
            {/* Saved Logs quick counter button */}
            <button 
              onClick={() => setActiveTab('history')}
              className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-sm uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <BookOpenCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Logs ({stats.totalGenerations || 0})</span>
            </button>
          </div>
        </header>

        {/* Scrollable Container */}
        <main className="flex-grow p-4 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto overflow-x-hidden">
          {loading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center space-y-3">
              <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest">Compiling Coach Sandbox...</p>
            </div>
          ) : (
            renderMainContent()
          )}
        </main>

        {/* Clean elegant footer */}
        <footer className="bg-white border-t border-slate-200 py-3.5 text-center text-[10px] text-slate-450 uppercase font-mono tracking-wider">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div>Internal Use Only – Anand Rathi Customer Support Excellence Platform</div>
            <div>Authorized Access Only • No Public Data Exposed</div>
          </div>
        </footer>
      </div>

    </div>
  );
}
