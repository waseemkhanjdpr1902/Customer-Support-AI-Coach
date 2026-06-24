import React, { useState } from 'react';
import { 
  Sparkles, Mail, Phone, Smile, Award, ShieldAlert, FileText, 
  Search, Filter, Calendar, Folder, ChevronRight, MessageSquare, 
  CheckCircle, BadgeAlert, Copy, Check, Trash2, Download, FileSpreadsheet
} from 'lucide-react';
import { HistoryItem, ModuleId } from '../types';
import { getModuleTitle } from './CoachModule';
import { apiClient } from '../apiClient';

interface HistoryListProps {
  history: HistoryItem[];
  currentUser: { id: string; role: string };
  onRefresh?: () => void;
}

export default function HistoryList({ history, currentUser, onRefresh }: HistoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [toneFilter, setToneFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    await apiClient.deleteHistoryItem(id);
    if (onRefresh) onRefresh();
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear your entire coaching saved history? This cannot be undone.")) return;
    await apiClient.clearAllHistory();
    if (onRefresh) onRefresh();
  };

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) return;
    
    // Construct CSV Header
    const headers = ["ID", "Module", "User", "Date", "Tone", "Inputs Given", "Outputs Generated"];
    const rows = filteredHistory.map(item => {
      const inputsStr = Object.entries(item.inputData)
        .map(([k, v]) => `${k}: ${String(v).replace(/"/g, '""')}`)
        .join(' | ');
      const outputsStr = Object.entries(item.outputData)
        .map(([k, v]) => `${k}: ${String(v).replace(/"/g, '""')}`)
        .join(' | ');
        
      return [
        item.id,
        item.moduleId,
        item.userName,
        new Date(item.timestamp).toISOString(),
        item.tone,
        `"${inputsStr}"`,
        `"${outputsStr}"`
      ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CS_AI_Coach_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTXT = () => {
    if (filteredHistory.length === 0) return;
    
    let content = `CS AI COACH COCHING HISTORY LOGS\n`;
    content += `Export Date: ${new Date().toLocaleString()}\n`;
    content += `==================================================\n\n`;
    
    filteredHistory.forEach((item, index) => {
      content += `${index + 1}. MODULE: ${getModuleTitle(item.moduleId).toUpperCase()}\n`;
      content += `   Agent name: ${item.userName}\n`;
      content += `   Timestamp: ${new Date(item.timestamp).toLocaleString()}\n`;
      content += `   Instruction Tone: ${item.tone}\n`;
      content += `   --------------------------------------------------\n`;
      content += `   INPUTS GIVEN:\n`;
      Object.entries(item.inputData).forEach(([k, v]) => {
        content += `     - ${camelCaseToWords(k)}: ${v}\n`;
      });
      content += `\n   AI COACH RECCOMENDATIONS / OUTPUTS:\n`;
      Object.entries(item.outputData).forEach(([k, v]) => {
        if (v && typeof v !== 'object') {
          content += `     - ${camelCaseToWords(k)}:\n       ${String(v).replace(/\n/g, '\n       ')}\n`;
        }
      });
      if (item.review) {
        content += `\n   SUPERVISOR REVIEW:\n`;
        content += `     - Reviewer: ${item.review.reviewerName}\n`;
        content += `     - Status: ${item.review.status}\n`;
        content += `     - Feedback: "${item.review.comment}"\n`;
      }
      content += `\n==================================================\n\n`;
    });
    
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `CS_AI_Coach_Logs_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(item.inputData).toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(item.outputData).toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesModule = moduleFilter === 'all' || item.moduleId === moduleFilter;
    const matchesTone = toneFilter === 'all' || item.tone.toLowerCase() === toneFilter.toLowerCase();
    
    return matchesSearch && matchesModule && matchesTone;
  });

  return (
    <div id="history-list-view" className="space-y-5 animate-fade-in text-left">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-sm border border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Saved Coaching History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser.role === 'manager' 
              ? "View and filter all standard practice outputs saved by agents across your department."
              : "Review your previously saved coaching drafts, empathy audits, and script cards."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-705 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-sm flex items-center gap-1.5 cursor-pointer transition select-none"
            title="Export filtered results to CSV file"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          
          <button
            id="btn-export-txt"
            onClick={handleExportTXT}
            className="px-3 py-1.5 text-xs font-semibold text-slate-705 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-sm flex items-center gap-1.5 cursor-pointer transition select-none"
            title="Download formatted text transcription"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download TXT</span>
          </button>
          
          <button
            id="btn-clear-all"
            onClick={handleClearAll}
            className="px-3 py-1.5 text-xs font-semibold text-red-650 bg-red-50 hover:bg-red-100 border border-red-100 rounded-sm flex items-center gap-1.5 cursor-pointer transition select-none"
            title="Delete all history from localStorage"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Control panel (Search & Filters) */}
      <div className="bg-white p-3 rounded-sm border border-slate-200 shadow-xs flex flex-col md:flex-row gap-2.5">
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Search saved text, customer concerns, or names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {/* Module filter */}
          <select 
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="text-[11px] px-2 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-slate-100 cursor-pointer text-slate-600 font-semibold"
          >
            <option value="all">All Modules</option>
            <option value="email_coach">Email Coach</option>
            <option value="soft_skills">Brokerage Phrase Library</option>
            <option value="escalation">Escalation Assistant</option>
            <option value="email_improvement">Communication Coach</option>
            <option value="call_script">Call Scripts</option>
            <option value="universal_coach">Soft Skills Coach</option>
          </select>

          {/* Tone filter */}
          <select 
            value={toneFilter}
            onChange={(e) => setToneFilter(e.target.value)}
            className="text-[11px] px-2 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-slate-100 cursor-pointer text-slate-600 font-semibold"
          >
            <option value="all">All Tones</option>
            <option value="professional">Professional</option>
            <option value="empathetic">Empathetic</option>
            <option value="polite">Polite</option>
            <option value="firm">Firm</option>
            <option value="apology">Apology</option>
            <option value="escalation">Escalation</option>
          </select>
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white p-8 text-center border border-slate-200 rounded-sm">
          <Folder className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-700">No History Records Found</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mx-auto">
            Try adjusting your search query or practice saving newly processed coach materials first.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {filteredHistory.map(item => {
            const isExpanded = expandedId === item.id;
            const ModuleIcon = getModuleIcon(item.moduleId);
            const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div 
                key={item.id}
                id={`history-${item.id}`}
                className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden transition hover:border-slate-350"
              >
                {/* Header overview row */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50"
                >
                  <div className="flex items-start sm:items-center gap-2.5 overflow-hidden">
                    <div className={`p-1.5 rounded-sm text-white shrink-0 ${getModuleColorBg(item.moduleId)}`}>
                      <ModuleIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex flex-wrap items-center gap-1.5 text-left">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{getModuleTitle(item.moduleId)}</h4>
                        <span className="px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-700 text-[9px] font-bold font-mono">
                          {item.tone}
                        </span>
                        {item.review && (
                          <span className={`px-1.5 py-0.5 border rounded-sm text-[9px] font-bold uppercase flex items-center gap-0.5 ${
                            item.review.status === 'exemplary' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            <Award className="w-2.5 h-2.5" />
                            {item.review.status}
                          </span>
                        )}
                      </div>
                      
                      {/* Secondary metrics */}
                      <div className="flex gap-3 items-center text-[10px] text-slate-400 mt-0.5 font-sans">
                        <span className="font-semibold text-blue-600">{item.userName}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t border-slate-100 pt-1.5 sm:border-0 sm:pt-0 shrink-0">
                    <button
                      id={`btn-delete-log-${item.id}`}
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 text-slate-450 hover:text-red-650 hover:bg-slate-100/80 rounded-sm transition cursor-pointer"
                      title="Delete Saved Log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-medium">Click to view fields</span>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transform transition ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-200 space-y-4 bg-white text-xs">
                    {/* 1. INPUT DATA SUMMARY */}
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Original Inputs Given</h5>
                      <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-200 text-xs text-slate-600 space-y-1.5">
                        {Object.entries(item.inputData).map(([k, v]) => (
                          <div key={k} className="grid grid-cols-1 sm:grid-cols-12 gap-1 pb-1 border-b border-slate-100 last:border-0 last:pb-0">
                            <span className="sm:col-span-3 font-semibold text-slate-500 capitalize">{camelCaseToWords(k)}:</span>
                            <span className="sm:col-span-9 font-normal text-slate-800 whitespace-pre-line">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. RECONSTRUCTED OUTPUT FIELDS */}
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Coached Outputs Generated</h5>
                      {Object.entries(item.outputData).map(([k, v]) => {
                        if (!v || typeof v === 'object' || k === 'empathyScore' || k === 'professionalismScore' || k === 'riskLevel') return null;
                        return (
                          <div key={k} className="p-3 bg-blue-50/20 rounded-sm border border-blue-105">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-bold text-blue-700 uppercase tracking-widest">{camelCaseToWords(k)}</span>
                              <button 
                                id={`history-copy-${item.id}-${k}`}
                                onClick={() => handleCopy(v, `${item.id}-${k}`)}
                                className="p-0.5 text-slate-400 hover:text-blue-600 text-[10px] font-mono flex items-center gap-1 hover:bg-white rounded-sm transition cursor-pointer"
                              >
                                {copiedId === `${item.id}-${k}` ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 text-emerald-500" />
                                    <span className="text-emerald-500">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed select-all whitespace-pre-line">{v}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* 3. MANAGER REVIEW COMMENTS CARD */}
                    {item.review ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 flex gap-2.5 rounded-sm">
                        <div className="p-1 bg-emerald-600 text-white rounded-sm h-fit shrink-0">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-bold text-emerald-800">Review by {item.review.reviewerName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(item.review.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {/* Review Rating Status Badge */}
                          <p className="text-xs text-slate-700 mt-1 italic font-semibold">
                            “{item.review.comment}”
                          </p>

                          {/* Action improvements list */}
                          {item.review.improvementAreas && item.review.improvementAreas.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.review.improvementAreas.map((area: string) => (
                                <span key={area} className="px-1.5 py-0.5 rounded-sm bg-white text-emerald-800 text-[9px] font-bold border border-emerald-100 uppercase tracking-wider font-mono">
                                  {area}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      currentUser.role === 'agent' && (
                        <div className="p-2.5 bg-slate-50 rounded-sm border border-dashed border-slate-200 text-slate-400 text-[11px] flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-slate-350" />
                          <p>Pending feedback comment from Customer Success supervisors. This item is visible in the manager review list.</p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Map helper to fetch module icon
function getModuleIcon(id: ModuleId) {
  switch (id) {
    case 'email_coach': return Mail;
    case 'email_improvement': return Mail;
    case 'complaint_handling': return Smile;
    case 'call_script': return Phone;
    case 'soft_skills': return Award;
    case 'escalation': return ShieldAlert;
    case 'email_writer': return FileText;
    case 'universal_coach': return Smile;
    default: return FileText;
  }
}

function getModuleColorBg(id: ModuleId): string {
  switch (id) {
    case 'email_coach': return 'bg-blue-600';
    case 'email_improvement': return 'bg-blue-600';
    case 'complaint_handling': return 'bg-rose-600';
    case 'call_script': return 'bg-emerald-600';
    case 'soft_skills': return 'bg-indigo-600';
    case 'escalation': return 'bg-amber-600';
    case 'email_writer': return 'bg-sky-600';
    case 'universal_coach': return 'bg-emerald-600';
    default: return 'bg-slate-600';
  }
}

function camelCaseToWords(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (match) => match.toUpperCase());
}
