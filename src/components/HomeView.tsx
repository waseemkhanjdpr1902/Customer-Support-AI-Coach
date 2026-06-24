import React from 'react';
import { 
  Mail, Smile, Phone, Award, ShieldAlert, FileText, 
  BookOpen, Users, Sparkles, ChevronRight, MessageSquare, BookOpenCheck,
  CheckCircle2, AlertCircle, HelpCircle
} from 'lucide-react';
import { ModuleId } from '../types';

const brandLogo = "/src/assets/images/coach_ai_logo_1781955449391.jpg";

interface HomeViewProps {
  onSelectFeature: (tabId: string) => void;
  stats: {
    totalGenerations: number;
    reviewedCount: number;
  };
}

export default function HomeView({ onSelectFeature, stats }: HomeViewProps) {
  const FEATURES = [
    {
      id: 'email_coach',
      title: 'Email Coach',
      description: 'Draft, improve, rewrite, reply, or correct grammar for clients in seconds using our multi-tone variation generator.',
      icon: Mail,
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      actionLabel: 'Open Email Coach'
    },
    {
      id: 'soft_skills',
      title: 'Brokerage Phrase Library',
      description: 'Search our curated repository of approved regulatory phrases and copy compliant alternatives instantly to avoid audit logs.',
      icon: MessageSquare,
      iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      actionLabel: 'Open Phrase Library'
    },
    {
      id: 'escalation',
      title: 'Escalation Assistant',
      description: 'Formulate dual-facing drafts of system outages, trading restrictions, or margin shortfalls for supervisors & clients.',
      icon: ShieldAlert,
      iconBg: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      actionLabel: 'Open Escalation Assistant'
    },
    {
      id: 'email_improvement',
      title: 'Communication Coach',
      description: 'Transform rough email drafts or technical bullet points into friendly, respectful, and crystal-clear client communication.',
      icon: Sparkles,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      actionLabel: 'Open Comm Coach'
    },
    {
      id: 'call_script',
      title: 'Call Script Generator',
      description: 'Generate structured verification and conversational script prompts for phone, chat, and live branch customer service staff.',
      icon: Phone,
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      actionLabel: 'Open Call Scripts'
    },
    {
      id: 'universal_coach',
      title: 'Soft Skills Coach',
      description: 'Paste raw support logs or proposed drafts to calculate scorecards, examine active empathy levels, and rewrite in 6 variations.',
      icon: Smile,
      iconBg: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
      actionLabel: 'Open Soft Skills Coach'
    },
    {
      id: 'history',
      title: 'Saved Logs',
      description: 'Browse, review, copy, delete, and download/export all previously registered AI-assisted drafts and compliance assessments.',
      icon: BookOpenCheck,
      iconBg: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
      actionLabel: 'Open Saved History'
    }
  ];

  const COMMON_EXAMPLES = [
    "MTF & Pledge / Unpledge Guidelines",
    "DP / Freeze / Unfreeze Issues",
    "Account Opening & Closure Delays",
    "KYC Verification & KRA Modification",
    "Delayed Payout & RMS Margin Requirements",
    "Brokerage & GST Charged Explanations",
    "SEBI / SCORES Complaint Replies",
    "Escalating Sensitive Trades to Senior Desk"
  ];

  return (
    <div id="home-landing-section" className="space-y-6 animate-fade-in text-left">
      
      {/* Immersive side-by-side welcome and query block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Welcome Card */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-sm p-6 sm:p-7 relative overflow-hidden shadow-md flex flex-col justify-between min-h-[440px]">
          <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-blue-600/10 via-emerald-600/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-[10px] uppercase tracking-wider font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Empowering Exceptional Broking Customer Relations
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
              <img 
                src={brandLogo} 
                alt="COACH.AI Logo" 
                className="h-12 w-auto object-contain rounded-sm border border-slate-800 shadow shadow-blue-500/10 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="border-l border-slate-800 pl-4 py-0.5">
                <h1 className="text-xl sm:text-2.5xl font-black text-white tracking-tight">
                  CS AI Coach
                </h1>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block font-mono mt-0.5">Broking Support Assistant</span>
              </div>
            </div>
            
            <p className="text-slate-350 text-xs sm:text-sm leading-relaxed pt-2 max-w-2xl font-medium">
              This tool helps customer support agents improve emails, replies, complaint handling, escalation responses, call scripts, and professional communication in real time.
            </p>

            {/* Checklist highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-3.5">
              <div className="flex items-center gap-2 text-slate-350">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-semibold leading-none">Faster Responses & Drafts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-350">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-semibold leading-none">SEBI & Exchange Compliance</span>
              </div>
              <div className="flex items-center gap-2 text-slate-350">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-semibold leading-none">Defuse Customer Stress Instantly</span>
              </div>
              <div className="flex items-center gap-2 text-slate-350">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-semibold leading-none">Clear Feedback & Scorecards</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-5 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <button
              onClick={() => onSelectFeature('email_coach')}
              className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-sm tracking-wide transition flex items-center gap-1.5 cursor-pointer uppercase shadow"
            >
              Open AI Workbench
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3.5 text-xs text-slate-400 font-mono">
              <span>Runs completed: <strong className="text-emerald-400 font-bold">{stats.totalGenerations}</strong></span>
              <span>•</span>
              <span>Audited Standard: <strong className="text-blue-400 font-bold">{stats.reviewedCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Query Examples & Pro-tip Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
              <h3 className="text-xs font-bold text-slate-930 tracking-tight uppercase">Common Query Examples</h3>
            </div>
            
            <ul className="space-y-2 text-left">
              {COMMON_EXAMPLES.map((example, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-[11px] text-slate-600 hover:text-indigo-600 transition leading-tight font-medium cursor-default">
                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-indigo-50/40 border border-indigo-100 rounded-sm p-4.5 space-y-2 shadow-xs text-left">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-indigo-700 shrink-0 animate-pulse" />
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Agent Pro Tip</span>
            </div>
            <p className="text-[11px] text-indigo-900 leading-relaxed font-semibold italic">
              "Be clear, concise, and empathetic. The AI Coach is here to help you communicate better with stock-market investors every day."
            </p>
          </div>
        </div>
      </div>

      {/* Structured Modules Registry Layout */}
      <div className="space-y-4 pt-1">
        <div>
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-sans block">
            CS Agent AI Coaching modules
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Pick from our specialized training and copywriting workbench modules below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div 
                key={feat.id}
                id={`feat-card-${feat.id}`}
                className="bg-white rounded-sm border border-slate-205 p-4.5 flex flex-col justify-between hover:shadow-sm hover:border-slate-350 transition text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`p-2 rounded-sm ${feat.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[8px] bg-slate-100 text-slate-450 font-bold uppercase tracking-widest border border-slate-200 px-1.5 py-0.5 rounded-sm">
                      {feat.id === 'history' ? 'Local DB' : 'Coach Module'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                    {feat.title}
                  </h3>
                  
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-medium">
                    {feat.description}
                  </p>
                </div>

                <button
                  id={`btn-open-feat-${feat.id}`}
                  onClick={() => onSelectFeature(feat.id)}
                  className="w-full mt-4 pt-2.5 border-t border-slate-100 text-left text-[11px] font-bold text-blue-600 hover:text-blue-700 transition flex items-center justify-between group cursor-pointer"
                >
                  <span>{feat.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
