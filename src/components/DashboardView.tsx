import React from 'react';
import { 
  Sparkles, Smile, Award, Users, FileText, CheckCircle2, 
  ArrowRight, ShieldAlert, BadgeAlert, Mail, Phone, ExternalLink 
} from 'lucide-react';
import { ModuleId } from '../types';
import { getModuleTitle } from './CoachModule';

interface DashboardViewProps {
  onSelectModule: (id: ModuleId) => void;
  stats: {
    totalGenerations: number;
    reviewedCount: number;
    pendingReview: number;
    avgEmpathy: number;
    avgProfessionalism: number;
  };
  currentUser: { name: string; role: string };
}

export default function DashboardView({ onSelectModule, stats, currentUser }: DashboardViewProps) {
  const MODULES: { id: ModuleId; description: string; icon: any; iconBg: string; textAccent: string; badge: string }[] = [
    { 
      id: 'email_improvement', 
      description: 'Improve rough support email drafts with structural guidelines and polish.',
      icon: Mail, 
      iconBg: 'bg-blue-600',
      textAccent: 'text-blue-600',
      badge: 'Email Polish' 
    },
    { 
      id: 'complaint_handling', 
      description: 'Draft empathetic replies to highly frustrated or angry customer comments.',
      icon: Smile, 
      iconBg: 'bg-rose-600',
      textAccent: 'text-rose-600',
      badge: 'De-escalation' 
    },
    { 
      id: 'call_script', 
      description: 'Create ready-to-use verbal logs, verification scripts, and closing dialogues.',
      icon: Phone, 
      iconBg: 'bg-emerald-600',
      textAccent: 'text-emerald-600',
      badge: 'Verbal scripts' 
    },
    { 
      id: 'soft_skills', 
      description: 'Audit proposed lines, evaluate empathy scores, and receive developmental tips.',
      icon: Award, 
      iconBg: 'bg-indigo-600',
      textAccent: 'text-indigo-600',
      badge: 'Interactive Audit' 
    },
    { 
      id: 'escalation', 
      description: 'Format synchronized technical internal incident notes alongside customer delay updates.',
      icon: ShieldAlert, 
      iconBg: 'bg-amber-600',
      textAccent: 'text-amber-600',
      badge: 'Operations Escalation' 
    },
    { 
      id: 'email_writer', 
      description: 'Synthesize raw short descriptions into standard emails, short snippets, and WhatsApp copies.',
      icon: FileText, 
      iconBg: 'bg-sky-600',
      textAccent: 'text-sky-600',
      badge: 'Copy Generator' 
    },
    {
      id: 'universal_coach',
      description: 'Analyze any text to automatically identify input type (Query or Draft), generate six variations, compute quality metrics, design de-escalations for angry clients, and perform strict financial compliance validation.',
      icon: Sparkles,
      iconBg: 'bg-violet-600',
      textAccent: 'text-violet-600',
      badge: 'Intelligent AI Coach'
    }
  ];

  const motivationalQuotes = [
    "“Words are, of course, the most powerful drug used by mankind.” — Rudyard Kipling",
    "“Empathy is seeing with the eyes of another, listening with the ears of another, and feeling with the heart of another.” — Alfred Adler",
    "“Excellent customer service is a series of small, polite, empathetic actions that build brand loyalty.”",
    "“De-escalation starts with human validation. Always connect before you resolve.”"
  ];

  const randomQuote = motivationalQuotes[Math.floor((new Date().getDate()) % motivationalQuotes.length)];

  return (
    <div id="dashboard-view" className="space-y-6 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-sm p-5 sm:p-6 text-white relative overflow-hidden border border-slate-800">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[10px] uppercase tracking-wider font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3 h-3" />
            Active Team Standard Workspace
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome, <span className="text-blue-400 font-bold">{currentUser.name}</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
            Practice customer support interactions directly inside our live sandbox. Polished drafts, complaint handling de-escalations, and verbal closing dialogues can feel professional & concise within seconds.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total practice runs */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-sm shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Practice Runs</span>
            <span id="metric-generations" className="text-xl font-bold text-slate-900">{stats.totalGenerations}</span>
          </div>
        </div>

        {/* Empathy score metrics */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-sm shrink-0">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Avg Empathy</span>
            <span id="metric-empathy" className="text-xl font-bold text-slate-900">{stats.avgEmpathy ? stats.avgEmpathy : '0.0'} <span className="text-[10px] text-slate-400">/ 10</span></span>
          </div>
        </div>

        {/* Professionalism metrics */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-sm shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Avg Professional</span>
            <span id="metric-prof" className="text-xl font-bold text-slate-900">{stats.avgProfessionalism ? stats.avgProfessionalism : '0.0'} <span className="text-[10px] text-slate-400">/ 10</span></span>
          </div>
        </div>

        {/* Manager feedback cycles */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-sm shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Reviewed Runs</span>
            <span id="metric-reviewed" className="text-xl font-bold text-slate-900">{stats.reviewedCount}</span>
          </div>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 text-center font-sans text-slate-600 text-xs shadow-xs italic">
        {randomQuote}
      </div>

      {/* Modules Block */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Your Action Coaching Modules</h2>
          <span className="text-[10px] text-slate-400 font-mono">Select a launcher below</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((col) => {
            const Icon = col.icon;
            return (
              <div 
                key={col.id}
                id={`card-${col.id}`}
                onClick={() => onSelectModule(col.id)}
                className="bg-white rounded-sm border border-slate-200 p-4 flex flex-col justify-between hover:shadow-xs hover:border-slate-350 cursor-pointer text-left transition relative"
              >
                <div>
                  {/* Header row inside card */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-1.5 ${col.iconBg} text-white rounded-sm`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="px-1.5 py-0.5 rounded-sm text-[8px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-widest">
                      {col.badge}
                    </span>
                  </div>

                  {/* Title and details */}
                  <h3 className="text-sm font-semibold text-slate-900">
                    {getModuleTitle(col.id)}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 lines-clamp-3 leading-normal">
                    {col.description}
                  </p>
                </div>

                <div className="flex items-center justify-start gap-1 text-[11px] font-semibold text-blue-600 mt-4 pt-2 border-t border-slate-150">
                  Open Coach Module
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Information Block - Proactive training reminder */}
      <div className="p-4 bg-blue-50/50 rounded-sm border border-blue-100 flex flex-col sm:flex-row items-start gap-3 text-left">
        <div className="p-1.5 bg-blue-600 text-white rounded-sm flex-shrink-0 mt-0.5">
          <Award className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-tight">Save practice logs to supervisor boards</h4>
          <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
            Whenever you craft an exemplary response, tap <strong>Save to History</strong>. This schedules the interaction on the Supervisor Review panel. Your manager can evaluate scores, annotate drafts, and feature high-quality patterns on the public team learning logs for the entire team!
          </p>
        </div>
      </div>

    </div>
  );
}
