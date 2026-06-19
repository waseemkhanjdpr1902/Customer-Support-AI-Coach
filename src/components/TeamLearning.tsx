import React, { useState } from 'react';
import { 
  Sparkles, Mail, Phone, Smile, Award, ShieldAlert, FileText, 
  BookOpen, HelpCircle, CheckCircle2, ChevronRight, Copy, Check 
} from 'lucide-react';
import { LearningResource } from '../types';

interface TeamLearningProps {
  key?: string;
  resources: LearningResource[];
  initialCategory?: 'all' | 'email_writing' | 'complaint_handling' | 'call_script' | 'escalation' | 'soft_skills' | 'phrase_bank';
}

export default function TeamLearning({ resources, initialCategory = 'all' }: TeamLearningProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'email_writing' | 'complaint_handling' | 'call_script' | 'escalation' | 'soft_skills' | 'phrase_bank'>(initialCategory);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [phraseSearch, setPhraseSearch] = useState('');
  const [phraseSegment, setPhraseSegment] = useState('All Segments');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredResources = resources.filter(res => 
    activeCategory === 'all' || res.category === activeCategory
  );

  return (
    <div id="team-learning-view" className="space-y-5 animate-fade-in text-left">
      {/* Page Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Team Knowledge & Learning Center</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Access high-impact templates, de-escalation checklists, verbal phone frameworks, and our positive phrase bank.
        </p>
      </div>

      {/* Categories Tab Selector */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'All Resources', icon: BookOpen },
          { id: 'phrase_bank', label: 'Positive Phrase Bank', icon: Smile },
          { id: 'email_writing', label: 'Email Phrasing', icon: Mail },
          { id: 'complaint_handling', label: 'Complaint Checklists', icon: HelpCircle },
          { id: 'call_script', label: 'Phone Handbooks', icon: Phone },
          { id: 'escalation', label: 'Incident Escalation', icon: ShieldAlert }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-learning-cat-${tab.id}`}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                isActive 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                  : 'bg-white text-slate-600 border-slate-205 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Learning Resource List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {filteredResources.map((resource) => (
          <div 
            key={resource.id}
            id={`resource-${resource.id}`}
            className="bg-white rounded-sm border border-slate-200 shadow-xs p-4 space-y-3.5 text-left"
          >
            <div className="border-b border-slate-100 pb-2 flex justify-between items-start">
              <div>
                <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 font-bold uppercase px-2 py-0.5 rounded-sm inline-block mb-1 tracking-wider font-mono">
                  {resource.category.replace('_', ' ')}
                </span>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">{resource.title}</h3>
              </div>
              <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            <p className="text-xs text-slate-650 leading-relaxed">
              {resource.content}
            </p>

            {/* If has checklist parameters */}
            {resource.checklist && resource.checklist.length > 0 && (
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-sm border border-slate-200">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block pb-0.5">Standard Checklist</span>
                {resource.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* If has replacements items */}
            {resource.items && resource.items.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Phrasing Transformations</span>
                <div className="space-y-2">
                  {resource.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-sm border border-slate-200 space-y-1.5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-rose-50 border border-rose-100 text-rose-800 rounded-sm">
                          <strong className="text-[9px] uppercase font-bold text-rose-500 block">Draft (To avoid):</strong>
                          “{item.original}”
                        </div>
                        <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-sm">
                          <strong className="text-[9px] uppercase font-bold text-emerald-500 block">Coached (Recommended):</strong>
                          “{item.better}”
                        </div>
                      </div>
                      {item.explanation && (
                        <p className="text-[10px] text-slate-500 font-sans italic leading-normal pl-1 border-l border-slate-200">
                          Tip: {item.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* If is the Phrase Bank */}
            {resource.phrases && resource.phrases.length > 0 && (() => {
              // Extract unique segments from inside brackets, e.g. [Trading], [RMS]
              const allSegments = Array.from(new Set(resource.phrases.map(phr => {
                const match = phr.context.match(/\[(.*?)\]/);
                return match ? match[1] : 'General';
              }))).sort();

              // Filter phrases list based on user search states
              const filteredPhrases = resource.phrases.filter(phr => {
                const matchSegment = phraseSegment === 'All Segments' || phr.context.includes(`[${phraseSegment}]`);
                const matchSearch = phr.expression.toLowerCase().includes(phraseSearch.toLowerCase()) || 
                                    phr.context.toLowerCase().includes(phraseSearch.toLowerCase());
                return matchSegment && matchSearch;
              });

              return (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center bg-slate-50 p-2 border border-slate-200 rounded-sm">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Interactive Phrase Ledger</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm">
                      {filteredPhrases.length} of {resource.phrases.length} Phrases
                    </span>
                  </div>

                  {/* High Density Filter Tools */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Search 120+ specialized phrases..."
                      value={phraseSearch}
                      onChange={(e) => setPhraseSearch(e.target.value)}
                      className="p-1 px-2 text-xs border border-slate-200 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <select
                      value={phraseSegment}
                      onChange={(e) => setPhraseSegment(e.target.value)}
                      className="p-1 px-2 text-xs border border-slate-200 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="All Segments">All Segments ({allSegments.length})</option>
                      {allSegments.map(seg => (
                        <option key={seg} value={seg}>{seg}</option>
                      ))}
                    </select>
                  </div>

                  {/* Compact Scrollable Container */}
                  <div className="grid grid-cols-1 gap-1.5 max-h-[480px] overflow-y-auto pr-1">
                    {filteredPhrases.length === 0 ? (
                      <p className="text-[11px] text-slate-400 py-6 text-center italic">No matching phrases found. Try adjusting your query.</p>
                    ) : (
                      filteredPhrases.map((phr, idx) => (
                        <div 
                          key={idx} 
                          className={`p-2 rounded-sm border flex items-center justify-between gap-3 text-left transition ${
                            phr.category === 'positive' 
                              ? 'bg-emerald-50/20 border-emerald-100 hover:bg-emerald-50/40' 
                              : 'bg-blue-50/20 border-blue-105 hover:bg-blue-50/40'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="flex items-start gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${phr.category === 'positive' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                              <p className="text-[11px] font-semibold text-slate-800 break-words leading-tight">“{phr.expression}”</p>
                            </div>
                            <span className="text-[9px] text-slate-450 block mt-0.5 truncate italic pl-3">Context: {phr.context}</span>
                          </div>

                          <button 
                            onClick={() => handleCopy(phr.expression)}
                            className={`p-1 px-2 text-[9px] font-bold rounded-sm flex items-center gap-1 transition shrink-0 cursor-pointer ${
                              copiedText === phr.expression 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {copiedText === phr.expression ? (
                              <>
                                <Check className="w-2.5 h-2.5" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}

          </div>
        ))}

        {/* Dynamic checklist side tip */}
        <div className="bg-slate-900 text-white rounded-sm p-5 space-y-3 border border-slate-800">
          <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase px-2 py-0.5 rounded-sm inline-block tracking-wider">
            Supervisory Quick Tip
          </span>
          <h3 className="text-sm font-semibold tracking-tight text-white">Active Empathy Calibration</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Coaching parameters operate best under a growth mindset model. When practice runs generate lower Empathy scores (e.g. 2/10), do not panic! Use the <strong>Modifier Actions</strong> in the output workspace to instantly shorten, reformat, or make drafts more polite with a single click.
          </p>
          <div className="border-t border-slate-800 pt-2.5 text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Empower your team. Standardized training.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
