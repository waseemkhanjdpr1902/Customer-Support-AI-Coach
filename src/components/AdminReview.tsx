import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, FolderHeart, Calendar, Search, 
  MessageSquare, Users, AlertCircle, RefreshCw, BarChart3,
  Award, Send, Trash, Smile, ShieldAlert
} from 'lucide-react';
import { HistoryItem, ModuleId } from '../types';
import { getModuleTitle } from './CoachModule';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminReviewProps {
  history: HistoryItem[];
  currentUser: { id: string; name: string };
  onReviewSubmitted: () => void;
}

const COMMON_AREAS = [
  "Tone Adjustment",
  "Active Listening",
  "Policy Framing",
  "Clear Next Steps",
  "Sincere Apologies",
  "Concise Framing",
  "Conflict De-escalation",
  "Technical Phrasing"
];

export default function AdminReview({ history, currentUser, onReviewSubmitted }: AdminReviewProps) {
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'reviewed' | 'needs_work' | 'exemplary'>('reviewed');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [agentFilter, setAgentFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  
  // Analytics State
  const [stats, setStats] = useState<any>({
    totalGenerations: 0,
    reviewedCount: 0,
    pendingReview: 0,
    chartData: []
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Load analytics counts
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [history]);

  const handleToggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(prev => prev.filter(a => a !== area));
    } else {
      setSelectedAreas(prev => [...prev, area]);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHistoryId || !comment.trim()) return;

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          historyId: selectedHistoryId,
          reviewerId: currentUser.id,
          reviewerName: currentUser.name,
          comment,
          status,
          improvementAreas: selectedAreas
        })
      });

      if (response.ok) {
        setComment('');
        setSelectedAreas([]);
        setSelectedHistoryId(null);
        onReviewSubmitted(); // Trigger parent reload of database items
        loadStats(); // Update metrics
      } else {
        alert('Could not submit audit review context.');
      }
    } catch (err) {
      console.error(err);
      alert('Network logging failure.');
    }
  };

  const selectedItem = history.find(h => h.id === selectedHistoryId);

  // Group unique agents for the filter dropdown
  const uniqueAgents = Array.from(new Set(history.map(h => h.userName)));

  const filteredHistory = history.filter(item => {
    const matchesAgent = agentFilter === 'all' || item.userName === agentFilter;
    const matchesModule = moduleFilter === 'all' || item.moduleId === moduleFilter;
    return matchesAgent && matchesModule;
  });

  return (
    <div id="admin-review-panel" className="space-y-5 animate-fade-in text-left">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Manager & Review Portal</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Perform audits on agent practice outcomes, attach constructive review comments, and log improvement metrics.
        </p>
      </div>

      {/* Analytics Breakdown & Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Stats Card */}
        <div className="lg:col-span-4 bg-white p-4 rounded-sm border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pb-1 border-b border-slate-100">Audits Overview</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 text-xs text-slate-650">
                <span className="font-medium text-slate-500">Total Practice Runs</span>
                <span className="font-bold text-slate-900">{stats.totalGenerations}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 text-xs text-slate-650">
                <span className="font-medium text-slate-500">Reviewed Outcomes</span>
                <span className="font-bold text-emerald-600">{stats.reviewedCount}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-650">
                <span className="font-medium text-slate-500">Pending Review Audits</span>
                <span className="font-bold text-amber-500">{stats.pendingReview}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-sm bg-blue-50 border border-blue-100">
            <div className="flex items-start gap-2 text-[11px] text-slate-600 leading-normal">
              <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <p>Common Areas track how recurring feedback parameters stack up dynamically. Add tagged values below when analyzing agent outputs.</p>
            </div>
          </div>
        </div>

        {/* Right: Improvement Areas Chart Panel */}
        <div className="lg:col-span-8 bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 font-mono">
              <BarChart3 className="w-3.5 h-3.5" />
              Common Focus Indicators
            </h3>
            <button 
              onClick={loadStats} 
              disabled={statsLoading}
              className="p-1 px-2 rounded-sm bg-slate-100 text-slate-650 text-[10px] font-bold hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer border border-slate-200"
            >
              <RefreshCw className={`w-3 h-3 ${statsLoading ? 'animate-spin' : ''}`} />
              Sync Graph
            </button>
          </div>

          {/* Bar Chart Container */}
          <div className="h-44 w-full">
            {stats.chartData && stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '2px', border: '1px solid #cbd5e1', fontSize: '11px', padding: '6px' }}
                    cursor={{ fill: '#f8fafc' }} 
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[2, 2, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[11px] text-slate-400">
                No audited improvement areas yet. Add tag filters to review submissions.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Review Workplace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Grid Panel: History Submissions List */}
        <div className="lg:col-span-5 bg-white rounded-sm border border-slate-200 shadow-xs p-3.5 space-y-3">
          <div className="border-b border-slate-100 pb-2.5 space-y-2">
            <h3 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Outcomes Queue</h3>
            
            {/* Filters */}
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Agent</label>
                <select 
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none"
                >
                  <option value="all">All Agents</option>
                  {uniqueAgents.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Module</label>
                <select 
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none"
                >
                  <option value="all">All Modules</option>
                  <option value="email_improvement">Email Polish</option>
                  <option value="complaint_handling">De-escalation</option>
                  <option value="call_script">Call Scripts</option>
                  <option value="soft_skills">Soft Skills Coach</option>
                  <option value="escalation">Escalation Note</option>
                  <option value="email_writer">AI Email Writer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submission Items */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No submissions match filters.
              </div>
            ) : (
              filteredHistory.map(item => {
                const isSelected = selectedHistoryId === item.id;
                const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                return (
                  <div
                    key={item.id}
                    id={`queue-item-${item.id}`}
                    onClick={() => {
                       setSelectedHistoryId(item.id);
                       if (item.review) {
                         setComment(item.review.comment);
                         setStatus(item.review.status);
                         setSelectedAreas(item.review.improvementAreas || []);
                       } else {
                         setComment('');
                         setStatus('reviewed');
                         setSelectedAreas([]);
                       }
                    }}
                    className={`p-3 rounded-sm border transition cursor-pointer text-left ${
                      isSelected 
                        ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-500/5' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] font-bold text-blue-600 block">{item.userName}</span>
                      <span className="text-[9px] text-slate-400">{formattedDate}</span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 mt-1 pointer-events-none">{getModuleTitle(item.moduleId)}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500 font-bold border border-slate-200 font-mono">
                        Tone: {item.tone}
                      </span>
                      {item.review ? (
                        <span className={`text-[9px] font-bold uppercase flex items-center gap-0.5 ${
                          item.review.status === 'exemplary' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Audited
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-amber-500 uppercase font-mono">
                          Pending Audit
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Grid Panel: Submission Audit Form Workspace */}
        <div className="lg:col-span-7 bg-white rounded-sm border border-slate-200 shadow-xs p-4 flex flex-col justify-between min-h-[560px]">
          {selectedItem ? (
            <div className="space-y-4">
              {/* Submission metadata summary header */}
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] font-mono text-slate-400 block font-semibold">COACH RUN ID: {selectedItem.id}</span>
                <div className="flex items-center justify-between mt-1.5">
                  <h3 className="text-sm font-bold text-slate-900">{selectedItem.userName}’s Output</h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                    Tone: {selectedItem.tone}
                  </span>
                </div>
              </div>

              {/* Read Only Input Context */}
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Original Inputs</span>
                <div className="p-2.5 bg-slate-50 rounded-sm border border-slate-200 text-xs text-slate-600 space-y-1 select-all leading-normal max-h-32 overflow-y-auto">
                  {Object.entries(selectedItem.inputData).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-1 sm:grid-cols-12 gap-1 pb-1 last:pb-0">
                      <strong className="sm:col-span-3 text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</strong>
                      <span className="sm:col-span-9 text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Read Only Output Reconstructed */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">AI-Coached Output</span>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {Object.entries(selectedItem.outputData).map(([k, v]) => {
                    if (!v || typeof v === 'object' || k === 'empathyScore' || k === 'professionalismScore' || k === 'riskLevel') return null;
                    return (
                      <div key={k} className="p-2.5 bg-blue-50/20 border border-slate-200 rounded-sm">
                        <span className="text-[9px] font-bold text-blue-700 uppercase block mb-0.5 tracking-wide">{k.replace(/([A-Z])/g, ' $1')}</span>
                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed select-all">{v}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Audit evaluation form */}
              <form onSubmit={handleSubmitReview} className="mt-3 pt-3 border-t border-slate-200 space-y-3 text-xs">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Manager Evaluation & Feedback Form</h4>
                
                {/* Improvement area select badges */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Constructive evaluation tags:</label>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_AREAS.map(area => {
                      const isActive = selectedAreas.includes(area);
                      return (
                        <button
                          key={area}
                          id={`tag-area-${area.toLowerCase().replace(/\s+/g, '-')}`}
                          type="button"
                          onClick={() => handleToggleArea(area)}
                          className={`px-2 py-0.5 rounded-sm text-[11px] border transition cursor-pointer font-medium ${
                            isActive 
                              ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs' 
                              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rating selection and review text */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5 font-sans">Audit Rating Status:</label>
                    <select
                      id="inp-review-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full text-xs px-2 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:bg-white"
                    >
                      <option value="reviewed">Approved & Reviewed</option>
                      <option value="exemplary">💖 Exemplary Benchmark</option>
                      <option value="needs_work">⚠ Needs Phrasing Work</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5 font-sans">Review assessment comment:</label>
                    <textarea
                      id="inp-review-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="e.g. Magnificent framing! This completely diffuses the issue..."
                      rows={2}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:bg-white resize-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200">
                  <button
                    id="btn-submit-review"
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs rounded-sm transition flex items-center gap-1.5 cursor-pointer shadow-xs uppercase tracking-wider shrink-0"
                  >
                    <Send className="w-3 h-3" />
                    Submit Review Comment
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-8 text-slate-400">
              <FolderHeart className="w-10 h-10 text-slate-350 mb-2 animate-bounce" />
              <h4 className="text-xs font-bold text-slate-700">Audit Form Workspace</h4>
              <p className="text-slate-400 text-[11px] tracking-wide max-w-xs leading-normal mt-0.5">
                Select an agent practice run from the submissions queue on the left to begin your audit reviews.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
