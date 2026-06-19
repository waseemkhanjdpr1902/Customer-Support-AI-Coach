import React from 'react';
import { 
  Mail, Smile, Phone, Award, ShieldAlert, FileText, 
  BookOpen, Users, Sparkles, ChevronRight, MessageSquare, BookOpenCheck
} from 'lucide-react';
import { ModuleId } from '../types';

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
      id: 'email_improvement',
      title: 'Email Improvement',
      description: 'Polishes rough email responses into professional, empathetic drafts aligned with target tones.',
      icon: Mail,
      iconBg: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
      actionLabel: 'Open Email Tool'
    },
    {
      id: 'complaint_handling',
      title: 'Complaint Handling',
      description: 'Frames unreserved, empathetic response logs to de-escalate angry client feedback.',
      icon: Smile,
      iconBg: 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
      actionLabel: 'Open De-escalate'
    },
    {
      id: 'call_script',
      title: 'Call Script Generator',
      description: 'Produces structured 5-part interactive phone guides tailored for patient greetings and solutions.',
      icon: Phone,
      iconBg: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
      actionLabel: 'Open Scriptor'
    },
    {
      id: 'soft_skills',
      title: 'Brokerage Phrase Coach',
      description: 'Provides 10-point audits of agent statements to generate compliant and high-empathy stock-trading variations.',
      icon: Award,
      iconBg: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20',
      actionLabel: 'Open Coach'
    },
    {
      id: 'escalation',
      title: 'Escalation Handling',
      description: 'Formulates technical senior logs and customerupdates simultaneously during account incidents.',
      icon: ShieldAlert,
      iconBg: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
      actionLabel: 'Open Escalator'
    },
    {
      id: 'email_writer',
      title: 'AI Email Writer',
      description: 'Auto-generates multi-format customer templates including full emails and quick WhatsApp notices.',
      icon: FileText,
      iconBg: 'bg-sky-500/10 text-sky-600 border border-sky-500/20',
      actionLabel: 'Open Writer'
    },
    {
      id: 'phrase_library',
      title: 'Phrase Library',
      description: 'Access a positive phrasing bank containing instant verbal alternatives for standard team responses.',
      icon: MessageSquare,
      iconBg: 'bg-violet-500/10 text-violet-600 border border-violet-500/20',
      actionLabel: 'Open Library'
    },
    {
      id: 'learning_center',
      title: 'Team Learning Center',
      description: 'Explore curated lists of de-escalation checklists, team standards, and helpful customer strategies.',
      icon: BookOpenCheck,
      iconBg: 'bg-teal-500/10 text-teal-600 border border-teal-500/20',
      actionLabel: 'Open Learning'
    }
  ];

  return (
    <div id="home-landing-section" className="space-y-8 animate-fade-in text-left">
      
      {/* Immersive Swiss Clean Hero Card */}
      <div className="bg-slate-900 rounded-sm p-6 sm:p-8 text-white relative overflow-hidden border border-slate-800 shadow-md">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-blue-600/15 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] uppercase tracking-wider font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Exceptional Customer Support
          </div>
          
          <h1 className="text-2.5xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white font-sans">
            Customer Support AI Coach
          </h1>
          
          <p className="text-blue-200/90 text-sm sm:text-base font-medium leading-relaxed">
            A simple internal AI assistant for improving customer emails, complaint handling, call scripts, escalation responses, and soft skills.
          </p>
          
          <div className="h-px bg-slate-800 my-4"></div>
          
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            This tool is designed for customer support team members to learn while working. Agents can improve their responses, generate professional communication, and understand better wording in real time.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => onSelectFeature('tools')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-sm tracking-wide transition flex items-center gap-1 cursor-pointer uppercase shadow"
            >
              Initialize Coaching Playground
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono">
              <span>Runs completed: <strong className="text-emerald-400 font-bold">{stats.totalGenerations}</strong></span>
              <span>•</span>
              <span>Audited standard: <strong className="text-blue-400 font-bold">{stats.reviewedCount}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Key Features Guide Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-[11px] uppercase font-extrabold tracking-widest text-slate-400 font-sans block">
            Integrated Training & Copywriting Features
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pick from our specialized playgrounds to get micro-feedback coaching or draft standard text.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div 
                key={feat.id}
                id={`feat-card-${feat.id}`}
                className="bg-white rounded-sm border border-slate-200 p-4.5 flex flex-col justify-between hover:shadow-xs hover:border-slate-350 transition text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`p-2 rounded-sm ${feat.iconBg}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[8px] bg-slate-100 text-slate-400 font-semibold uppercase tracking-widest border border-slate-150 px-1.5 py-0.5 rounded-sm">
                      Tool Link
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                    {feat.title}
                  </h3>
                  
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <button
                  id={`btn-open-feat-${feat.id}`}
                  onClick={() => onSelectFeature(feat.id)}
                  className="w-full mt-4 pt-2 border-t border-slate-100 text-left text-[11px] font-bold text-blue-600 hover:text-blue-700 transition flex items-center justify-between group cursor-pointer"
                >
                  <span>{feat.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Elegant Swiss Bento Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-sm space-y-2">
          <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase">🚀 Learn While Working</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Eliminate slow training cycles! Test real emails or chat logs, learn actionable adjustments instantly, and save your favorites to history.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-sm space-y-2">
          <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase">🛡️ Dual Output Modes</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Never leak security secrets to customers. Generate separate, clean customer updates alongside rigorous internal operational ticketing notes.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-sm space-y-2 font-sans">
          <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase">📈 High-Performance AI</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            The platform automatically handles high availability, utilizing high-quality OpenAI reasoning first, with dynamic fallback to fast Groq models.
          </p>
        </div>
      </div>

    </div>
  );
}
