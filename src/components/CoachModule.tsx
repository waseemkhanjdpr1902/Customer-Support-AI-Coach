import React, { useState } from 'react';
import { 
  Sparkles, Copy, Check, Save, RotateCcw, 
  ArrowRight, ShieldAlert, BadgeAlert, HelpCircle, 
  Smile, Award, FileText, ChevronRight, UserCog
} from 'lucide-react';
import { ModuleId, User } from '../types';

interface CoachModuleProps {
  moduleId: ModuleId;
  currentUser: User;
  onSaveSuccess?: () => void;
}

const TONES = [
  'Professional',
  'Empathetic',
  'Polite',
  'Firm',
  'Apology',
  'Escalation'
];

export default function CoachModule({ moduleId, currentUser, onSaveSuccess }: CoachModuleProps) {
  // Inputs
  const [tone, setTone] = useState('Professional');
  
  // Dynamic inputs state based on module
  const [inputs, setInputs] = useState<Record<string, string>>({
    // Email Improvement
    originalEmail: '',
    issueType: '',
    // Complaint Handling
    complaint: '',
    resolution: '',
    // Call Script
    callReason: '',
    customerType: 'standard',
    issueSummary: '',
    // Soft Skills
    agentResponse: '',
    // Escalation
    delayReason: '',
    currentStatus: '',
    nextAction: '',
    // Email Writer
    purpose: '',
    recipientType: '',
    keyPoints: ''
  });

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<Record<string, any> | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [customRewriteCommand, setCustomRewriteCommand] = useState('');
  const [rewritingField, setRewritingField] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleInputChange = (field: string, val: string) => {
    setInputs(prev => ({ ...prev, [field]: val }));
    setIsSaved(false); // Reset saved badge when inputs change
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Pre-fill sample values for the agent to learn quickly
  const loadSampleData = () => {
    setIsSaved(false);
    if (moduleId === 'email_improvement') {
      setInputs(prev => ({
        ...prev,
        originalEmail: "I know you are mad but we can't refund your money because our policy says 14 days and you bought it 20 days ago. Sorry but rules are rules.",
        issueType: "Refund request outside return duration window"
      }));
      setTone('Empathetic');
    } else if (moduleId === 'complaint_handling') {
      setInputs(prev => ({
        ...prev,
        complaint: "Your delivery driver literally threw the fragile package at my door, cracking the glass screen inside! This is completely unacceptable!",
        issueType: "Damaged delivery by driver",
        resolution: "Ship complimentary replacement immediately and extend $15 credit."
      }));
      setTone('Apology');
    } else if (moduleId === 'call_script') {
      setInputs(prev => ({
        ...prev,
        callReason: "Billing overcharge duplicate transaction error",
        customerType: "Upset and frustrated caller",
        issueSummary: "The customer noticed a double-charge of $45 on their subscription statement this morning."
      }));
      setTone('Polite');
    } else if (moduleId === 'soft_skills') {
      setInputs(prev => ({
        ...prev,
        agentResponse: "Your withdrawal is under process. Charges are applicable as per policy. Just wait for some time."
      }));
      setTone('Polite');
    } else if (moduleId === 'escalation') {
      setInputs(prev => ({
        ...prev,
        issueSummary: "Database replication failure causing dashboard blank sync states for premium profiles.",
        delayReason: "AWS regional network packet loss affecting clusters.",
        currentStatus: "Engineering team is deploying connection buffers.",
        nextAction: "Perform cluster health report in 30 minutes."
      }));
      setTone('Escalation');
    } else if (moduleId === 'email_writer') {
      setInputs(prev => ({
        ...prev,
        purpose: "Welcome new enterprise client and request API onboarding session",
        recipientType: "CTO and Engineering Leads",
        keyPoints: "Welcome package attached; Scheduling link included; Need safe workspace IP whitelist ranges."
      }));
      setTone('Professional');
    }
  };

  const cleanInputs = () => {
    setInputs({
      originalEmail: '', issueType: '', complaint: '', resolution: '',
      callReason: '', customerType: 'standard', issueSummary: '',
      agentResponse: '', delayReason: '', currentStatus: '', nextAction: '',
      purpose: '', recipientType: '', keyPoints: ''
    });
    setOutput(null);
    setIsSaved(false);
  };

  // Call Express API endpoint to generate results using true server-side Gemini
  const generateOutput = async () => {
    setLoading(true);
    setIsSaved(false);
    setOutput(null);

    try {
      // Package only inputs relevant to current module
      const response = await fetch('/api/coach/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          moduleId,
          inputs,
          tone
        })
      });

      const data = await response.json();
      if (response.ok) {
        setOutput(data);
      } else {
        console.error('API Error:', data);
        // Use direct fallback from payload response if available, or error status
        if (data.fallback) {
          setOutput(data.fallback);
        } else {
          alert('Could not coordinate response with Coaching Engine. Please try again.');
        }
      }
    } catch (err) {
      console.error('Network Error:', err);
      alert('Network failure connecting to AI Coaching server.');
    } finally {
      setLoading(false);
    }
  };

  // Perform quick modification/rewrite command on specific fields
  const handleRewrite = async (fieldKey: string, command: string) => {
    if (!output || !output[fieldKey]) return;
    setRewritingField(fieldKey);

    try {
      const response = await fetch('/api/coach/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          originalText: output[fieldKey],
          command,
          tone
        })
      });

      const data = await response.json();
      if (response.ok && data.rewrittenText) {
        setOutput(prev => prev ? ({
          ...prev,
          [fieldKey]: data.rewrittenText
        }) : null);
      }
    } catch (err) {
      console.error('Rewrite Error:', err);
    } finally {
      setRewritingField(null);
    }
  };

  // Save outputs to history table so Managers can review them
  const saveToHistory = async () => {
    if (!output) return;
    setSaveStatus('saving');

    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          moduleId,
          tone,
          inputData: inputs,
          outputData: output
        })
      });

      if (response.ok) {
        setIsSaved(true);
        setSaveStatus('success');
        if (onSaveSuccess) onSaveSuccess();
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div id={`coach-${moduleId}`} className="space-y-5">
      {/* Module Title / Guide Header */}
      <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] font-bold bg-blue-50 text-blue-700 uppercase tracking-widest border border-blue-105 font-mono mb-1.5">
            Module {getModuleNumber(moduleId)} of 6
          </span>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">{getModuleTitle(moduleId)}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{getModuleDescription(moduleId)}</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button 
            id="btn-sample"
            onClick={loadSampleData}
            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-sm hover:bg-blue-100 transition flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample Scenario
          </button>
          <button 
            id="btn-clear"
            onClick={cleanInputs}
            className="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-sm hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Form Inputs & Guided Explanations */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100 block text-left">Coaching inputs</h3>
          
          {/* Dynamic input render based on active module ID */}
          {moduleId === 'email_improvement' && (
            <div className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Issue Type</label>
                <input 
                  id="inp-issue-type"
                  type="text"
                  placeholder="e.g. Broken hardware item, Refund outside terms"
                  value={inputs.issueType}
                  onChange={(e) => handleInputChange('issueType', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Original Draft Email</label>
                <textarea 
                  id="inp-email-draft"
                  rows={5}
                  placeholder="Paste the rough email response you want to coach here..."
                  value={inputs.originalEmail}
                  onChange={(e) => handleInputChange('originalEmail', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition resize-none font-sans"
                />
              </div>
            </div>
          )}

          {moduleId === 'complaint_handling' && (
            <div className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Product/Service Issue</label>
                <input 
                  id="inp-complaint-issue"
                  type="text"
                  placeholder="e.g. Delivery driver damaged item, Service server delay"
                  value={inputs.issueType}
                  onChange={(e) => handleInputChange('issueType', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Complaint</label>
                <textarea 
                  id="inp-complaint-text"
                  rows={3}
                  placeholder="Paste what the angry customer wrote..."
                  value={inputs.complaint}
                  onChange={(e) => handleInputChange('complaint', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Resolution Available / Approved Compensation</label>
                <textarea 
                  id="inp-complaint-resolution"
                  rows={2}
                  placeholder="What is approved? (e.g. Free replacement + $15 voucher)"
                  value={inputs.resolution}
                  onChange={(e) => handleInputChange('resolution', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition resize-none"
                />
              </div>
            </div>
          )}

          {moduleId === 'call_script' && (
            <div className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Reason for Call</label>
                <input 
                  id="inp-script-reason"
                  type="text"
                  placeholder="e.g. Duplicate account charge, Password reset locked"
                  value={inputs.callReason}
                  onChange={(e) => handleInputChange('callReason', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Type</label>
                <select 
                  id="inp-script-cust-type"
                  value={inputs.customerType}
                  onChange={(e) => handleInputChange('customerType', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
                >
                  <option value="standard">Standard Customer (Inquiry)</option>
                  <option value="upset">Highly Angry/Upset Caller</option>
                  <option value="first-time">First-time User</option>
                  <option value="elderly">Elderly Customer (Requires patience)</option>
                  <option value="confused">Confused/Non-technical Customer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Call Issue Summary & Key Details</label>
                <textarea 
                  id="inp-script-summary"
                  rows={3}
                  placeholder="Sum up the technical problem they need addressed during the conversation..."
                  value={inputs.issueSummary}
                  onChange={(e) => handleInputChange('issueSummary', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition resize-none"
                />
              </div>
            </div>
          )}

          {moduleId === 'soft_skills' && (
            <div className="space-y-3.5 text-left">
              <div className="p-2 bg-blue-50 text-blue-800 rounded-sm text-[11px] flex gap-2 border border-blue-100">
                <Smile className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Paste statements or lines you previously used or plan to say on live chat, and let the coach evaluate your empathy and tone.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Your Proposed Response / Chat Statement</label>
                <textarea 
                  id="inp-skills-draft"
                  rows={5}
                  placeholder="Type or paste the verbal phrase you want tested (e.g., 'Calm down, there is no need to write in caps...')"
                  value={inputs.agentResponse}
                  onChange={(e) => handleInputChange('agentResponse', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition resize-none"
                />
              </div>
            </div>
          )}

          {moduleId === 'escalation' && (
            <div className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Issue Overview</label>
                <textarea 
                  id="inp-esc-overview"
                  rows={2}
                  placeholder="Summary of the core issue (e.g. Account subscription failure)"
                  value={inputs.issueSummary}
                  onChange={(e) => handleInputChange('issueSummary', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Delay Reason</label>
                <input 
                  id="inp-esc-delay"
                  type="text"
                  placeholder="e.g. Server sync downtime, Logistics buffer mismatch"
                  value={inputs.delayReason}
                  onChange={(e) => handleInputChange('delayReason', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tech Status</label>
                  <input 
                  id="inp-esc-status"
                    type="text"
                    placeholder="e.g. engineering tier 2 reviews"
                    value={inputs.currentStatus}
                    onChange={(e) => handleInputChange('currentStatus', e.target.value)}
                    className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Next Promised Action</label>
                  <input 
                  id="inp-esc-action"
                    type="text"
                    placeholder="e.g. deploy overrides in 1hr"
                    value={inputs.nextAction}
                    onChange={(e) => handleInputChange('nextAction', e.target.value)}
                    className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {moduleId === 'email_writer' && (
            <div className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email Purpose / Goal</label>
                <input 
                  id="inp-writer-purpose"
                  type="text"
                  placeholder="e.g. Onboard enterprise suite, cancel duplicate subscription"
                  value={inputs.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Recipient Type</label>
                <input 
                  id="inp-writer-recipient"
                  type="text"
                  placeholder="e.g. Lead Developer, angry subscriber, billing auditor"
                  value={inputs.recipientType}
                  onChange={(e) => handleInputChange('recipientType', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Key Points & Details to Mention</label>
                <textarea 
                  id="inp-writer-points"
                  rows={3}
                  placeholder="Bullet main factors (e.g. Schedule meeting; refund initiated; server restored...)"
                  value={inputs.keyPoints}
                  onChange={(e) => handleInputChange('keyPoints', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition resize-none"
                />
              </div>
            </div>
          )}

          {/* Tone Selector & Form Actions */}
          <div className="border-t border-slate-150 pt-3.5 space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-505 mb-1.5 uppercase tracking-wider">Coaching Tone Target</label>
              <div className="grid grid-cols-3 gap-1.5">
                {TONES.map(t => (
                  <button
                    key={t}
                    id={`btn-tone-${t.toLowerCase()}`}
                    onClick={() => { setTone(t); setIsSaved(false); }}
                    className={`px-2 py-1.5 rounded-sm text-xs border text-center font-semibold transition cursor-pointer ${
                      tone === t 
                        ? 'bg-slate-900 border-slate-900 text-white font-bold' 
                        : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="btn-generate"
              onClick={generateOutput}
              disabled={loading || isInputEmpty(moduleId, inputs)}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-sm text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing drafts...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Coach Feedback
                </>
              )}
            </button>
          </div>
        </div>

        {/* Guided Explanation Box */}
        {renderGuidedToolExplanation(moduleId)}
      </div>

        {/* Right Column: AI Coaching Workspace */}
        <div className="lg:col-span-7 space-y-4">
          {!output && !loading && (
            <div className="bg-slate-50 border border-dashed border-slate-250 rounded-sm p-8 text-center h-[520px] flex flex-col justify-center items-center">
              <div className="bg-white p-3.5 rounded border border-slate-250 text-blue-600 mb-3.5 animate-bounce">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wide">Workspace Ready</h4>
              <p className="text-slate-500 text-xs max-w-xs mt-1 leading-relaxed">
                Provide coaching inputs on the left, select a desired tone, and hit <strong>Generate Coach Feedback</strong>.
              </p>
              <button 
                onClick={loadSampleData}
                className="mt-3.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-100 border border-blue-150 hover:bg-blue-200 rounded-sm transition cursor-pointer"
              >
                Or Load Sandbox Scenario
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-slate-200 rounded-sm p-8 text-center h-[520px] flex flex-col justify-center items-center space-y-3.5 shadow-xs">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin"></div>
                <Sparkles className="w-4 h-4 text-blue-600 absolute top-4 left-4" />
              </div>
              <div>
                <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider font-mono">Consolidation Engine active...</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">Analyzing tone variables, editing phrasing, scoring empathy</p>
              </div>
              <div className="w-40 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full animate-[loading_1.5s_infinite]"></div>
              </div>
            </div>
          )}

          {output && !loading && (
            <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[520px]">
              {/* Output Header */}
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 p-1 rounded-sm text-white">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold tracking-tight">AI Coached Output Result</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Tone: {tone}</span>
                  </div>
                </div>
                
                {/* Save To History Button */}
                <div className="flex items-center gap-1.5">
                  {isSaved ? (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Saved
                    </span>
                  ) : (
                    <button
                      id="btn-save-to-history"
                      onClick={saveToHistory}
                      disabled={saveStatus === 'saving'}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded-sm text-xs font-bold transition cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                    >
                      <Save className="w-3 h-3" />
                      {saveStatus === 'saving' ? 'Saving...' : 'Save to History'}
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Field Output Render */}
              <div className="p-4 space-y-4 flex-grow text-left">
                {/* 1. Email Improvement Output Fields */}
                {moduleId === 'email_improvement' && (
                  <div className="space-y-3.5">
                    {renderOutputBlock("betterSubjectLine", "Recommended Subject Line", output.betterSubjectLine)}
                    {renderOutputBlock("improvedEmail", "Coached Customer Email Reply", output.improvedEmail, true)}
                    {renderOutputBlock("explanationOfImprovements", "Coaching & Training Explanations", output.explanationOfImprovements)}
                  </div>
                )}

                {/* 2. Complaint Handling Output Fields */}
                {moduleId === 'complaint_handling' && (
                  <div className="space-y-3.5">
                    {renderOutputBlock("empatheticReply", "Complete Empathetic Reply", output.empatheticReply, true)}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {renderOutputBlock("apologyLine", "Core Sincere Apology Wording", output.apologyLine)}
                      {renderOutputBlock("resolutionWording", "Framing of the Resolution", output.resolutionWording)}
                    </div>
                    {renderOutputBlock("followUpLine", "Support Follow-Up Promised Line", output.followUpLine)}
                  </div>
                )}

                {/* 3. Call Script Output Fields */}
                {moduleId === 'call_script' && (
                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {renderOutputBlock("openingScript", "1. Opening & Greeting Verbals", output.openingScript, false, true)}
                    {renderOutputBlock("verificationScript", "2. Caller Verification & Security Check", output.verificationScript, false, true)}
                    {renderOutputBlock("issueExplanation", "3. Phrasing the Technical Problem Summary", output.issueExplanation, false, true)}
                    {renderOutputBlock("resolutionScript", "4. Explaining the Resolution & Seeking Agreement", output.resolutionScript, false, true)}
                    {renderOutputBlock("closingScript", "5. Professional Assurance & Farewell Closing", output.closingScript, false, true)}
                  </div>
                )}

                {/* 4. Soft Skills Output Fields */}
                {moduleId === 'soft_skills' && (
                  <div className="space-y-4">
                    {/* Performance Score Cards (3 columns) */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-sm border border-slate-200">
                      <div className="text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider mb-0.5">Confidence Score</span>
                        <div className="flex items-baseline justify-center gap-0.5">
                          <span className={`text-xl font-extrabold ${getScoreColor(output.confidenceScore || 8)}`}>{output.confidenceScore || 8}</span>
                          <span className="text-[10px] text-slate-400 font-bold">/10</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${getScoreBg(output.confidenceScore || 8)}`} style={{ width: `${(output.confidenceScore || 8) * 10}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="text-center border-l border-slate-200 pl-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider mb-0.5">Empathy Score</span>
                        <div className="flex items-baseline justify-center gap-0.5">
                          <span className={`text-xl font-extrabold ${getScoreColor(output.empathyScore || 7)}`}>{output.empathyScore || 7}</span>
                          <span className="text-[10px] text-slate-400 font-bold">/10</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${getScoreBg(output.empathyScore || 7)}`} style={{ width: `${(output.empathyScore || 7) * 10}%` }}></div>
                        </div>
                      </div>

                      <div className="text-center border-l border-slate-200 pl-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider mb-0.5">Professionalism</span>
                        <div className="flex items-baseline justify-center gap-0.5">
                          <span className={`text-xl font-extrabold ${getScoreColor(output.professionalismScore || 9)}`}>{output.professionalismScore || 9}</span>
                          <span className="text-[10px] text-slate-400 font-bold">/10</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${getScoreBg(output.professionalismScore || 9)}`} style={{ width: `${(output.professionalismScore || 9) * 10}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Negative Words Audit Alert */}
                    {output.avoidNegativeWords && (
                      <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-sm text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-800">
                          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          <span>Negative Phrase Analysis & Replacement</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-amber-700">{output.avoidNegativeWords}</p>
                      </div>
                    )}

                    {/* Highly Crafted Variations Layout */}
                    <div className="space-y-3.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block -mb-1">Multi-Channel Brokerage Formulations</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {renderOutputBlock("professionalVersion", "1. Professional Version (Verified Investor)", output.professionalVersion, true)}
                        {renderOutputBlock("empatheticVersion", "2. Empathetic Version (Validating feelings)", output.empatheticVersion, true)}
                        {renderOutputBlock("positiveVersion", "3. Positive Version (Action-Focused)", output.positiveVersion, true)}
                        {renderOutputBlock("regulatoryFriendlyVersion", "4. Regulatory-Friendly Version", output.regulatoryFriendlyVersion, true)}
                        {renderOutputBlock("highCsatVersion", "5. High CSAT Version (Rapid Resolution)", output.highCsatVersion, true)}
                        {renderOutputBlock("complianceSafeVersion", "6. Compliance Safe Version (Zero Liability)", output.complianceSafeVersion, true)}
                      </div>
                    </div>

                    {/* General Diagnostic Comments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {renderOutputBlock("whatIsGood", "What worked well", output.whatIsGood)}
                      {renderOutputBlock("whatNeedsImprovement", "Areas for tone correction", output.whatNeedsImprovement)}
                    </div>
                    
                    {renderOutputBlock("softSkillTip", "Support Interaction Tip", output.softSkillTip)}
                  </div>
                )}

                {/* 5. Escalation Handling Output Fields */}
                {moduleId === 'escalation' && (
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-250 text-[11px] font-bold uppercase tracking-wider font-mono">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>Risk Assessment:</span> 
                      <span className={`ml-1 px-1.5 py-0.5 rounded-sm text-[9px] text-white font-bold ${
                        output.riskLevel?.toLowerCase() === 'high' ? 'bg-red-600' :
                        output.riskLevel?.toLowerCase() === 'medium' ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}>
                        {output.riskLevel || 'Medium'}
                      </span>
                    </div>

                    {renderOutputBlock("internalEscalationNote", "Internal Ticketing Desk Escalation Note", output.internalEscalationNote, true)}
                    {renderOutputBlock("customerFacingUpdate", "Customer-Facing Account Incident Update", output.customerFacingUpdate, true)}
                    {renderOutputBlock("managerSummary", "Executive / Manager Summary (High level Status)", output.managerSummary)}
                  </div>
                )}

                {/* 6. AI Email Writer Output Fields */}
                {moduleId === 'email_writer' && (
                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {renderOutputBlock("subjectLine", "Proposed Subject Line", output.subjectLine)}
                    {renderOutputBlock("fullEmail", "Standard Professional Full Email Copy", output.fullEmail, true)}
                    {renderOutputBlock("shortVersion", "Alternative Short variation", output.shortVersion, true)}
                    {renderOutputBlock("whatsAppUpdate", "WhatsApp / SMS Instant Notification Update", output.whatsAppUpdate)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Modular helper to render copyable section boxes with built-in rewrite controls
  function renderOutputBlock(
    key: string, 
    label: string, 
    value: string, 
    showRewriteControls = false, 
    scriptBlockStyle = false
  ) {
    if (!value) return null;
    return (
      <div className={`rounded-sm border border-slate-205 p-3 text-left transition ${scriptBlockStyle ? 'bg-slate-50 border-l-4 border-l-blue-600' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1 font-sans">
            {scriptBlockStyle && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>}
            {label}
          </span>
          <button
            id={`btn-copy-${key}`}
            onClick={() => handleCopy(value, key)}
            className="p-1 px-1.5 text-slate-400 hover:text-blue-600 text-[10px] font-bold rounded-sm hover:bg-slate-50 flex items-center gap-1 transition"
            title="Copy section"
          >
            {copiedField === key ? (
              <>
                <Check className="w-2.5 h-2.5 text-emerald-500" />
                <span className="text-emerald-500 text-[9px]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-2.5 h-2.5" />
                <span className="text-[9px]">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Content presentation field */}
        <p className="text-[11px] sm:text-xs text-slate-650 select-all font-sans whitespace-pre-line leading-relaxed">
          {value}
        </p>

        {/* Rewrite action triggers when rewrite controller is toggled */}
        {showRewriteControls && (
          <div className="mt-3 pt-3 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest shrink-0">Modifier actions:</span>
            
            {/* Instant prompt modifier buttons */}
            <div className="flex flex-wrap gap-1">
              <button
                id={`btn-rewrite-polite-${key}`}
                disabled={rewritingField === key}
                onClick={() => handleRewrite(key, 'make_polite')}
                className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-sm transition cursor-pointer"
              >
                {rewritingField === key ? '...' : 'Make More Polite'}
              </button>
              
              <button
                id={`btn-rewrite-prof-${key}`}
                disabled={rewritingField === key}
                onClick={() => handleRewrite(key, 'make_professional')}
                className="px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-sm transition cursor-pointer"
              >
                {rewritingField === key ? '...' : 'Professional'}
              </button>

              <button
                id={`btn-rewrite-short-${key}`}
                disabled={rewritingField === key}
                onClick={() => handleRewrite(key, 'shorten')}
                className="px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-sm transition cursor-pointer"
              >
                {rewritingField === key ? '...' : 'Shorten'}
              </button>
            </div>

            {/* Custom modifier input */}
            <div className="w-full mt-1 flex gap-1 items-center">
              <input 
                id={`inp-rewrite-command-${key}`}
                type="text"
                placeholder="Custom instruction (e.g. 'Add order delay apology', 'shorter')"
                value={customRewriteCommand}
                onChange={(e) => setCustomRewriteCommand(e.target.value)}
                className="flex-grow text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white inline-block"
              />
              <button
                id={`btn-rewrite-custom-${key}`}
                disabled={rewritingField === key || !customRewriteCommand.trim()}
                onClick={() => {
                  handleRewrite(key, customRewriteCommand);
                  setCustomRewriteCommand('');
                }}
                className="px-2.5 py-1.5 bg-slate-900 text-white rounded-sm text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                Rewrite
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Empathy Score presentation helpers
function getScoreColor(score: number): string {
  if (!score) return 'text-slate-400';
  if (score >= 8) return 'text-emerald-600';
  if (score >= 5) return 'text-amber-600';
  return 'text-red-500';
}

function getScoreBg(score: number): string {
  if (!score) return 'bg-slate-300';
  if (score >= 8) return 'bg-emerald-500';
  if (score >= 5) return 'bg-amber-500';
  return 'bg-red-500';
}

function isInputEmpty(moduleId: ModuleId, inputs: Record<string, string>): boolean {
  if (moduleId === 'email_improvement') {
    return !inputs.originalEmail?.trim() || !inputs.issueType?.trim();
  }
  if (moduleId === 'complaint_handling') {
    return !inputs.complaint?.trim() || !inputs.issueType?.trim() || !inputs.resolution?.trim();
  }
  if (moduleId === 'call_script') {
    return !inputs.callReason?.trim() || !inputs.issueSummary?.trim();
  }
  if (moduleId === 'soft_skills') {
    return !inputs.agentResponse?.trim();
  }
  if (moduleId === 'escalation') {
    return !inputs.issueSummary?.trim() || !inputs.delayReason?.trim();
  }
  if (moduleId === 'email_writer') {
    return !inputs.purpose?.trim() || !inputs.keyPoints?.trim();
  }
  return true;
}

// Layout text labeling mapping helpers
function getModuleNumber(id: ModuleId): string {
  switch (id) {
    case 'email_improvement': return '1';
    case 'complaint_handling': return '2';
    case 'call_script': return '3';
    case 'soft_skills': return '4';
    case 'escalation': return '5';
    case 'email_writer': return '6';
  }
}

function renderGuidedToolExplanation(id: ModuleId) {
  let what = "";
  let when = "";
  let example = "";
  let expected = "";
  let tips = "";

  switch (id) {
    case 'email_improvement':
      what = "Analyzes, updates, and rewrites customer support email drafts to sound polished and polite while highlighting improvements.";
      when = "When a draft feels too blunt, needs to deliver unfavorable policy news, or requires a refined professional posture.";
      example = "We can't refund your money because our policy says 14 days and you bought it 20 days ago.";
      expected = "An empathetic client-first email draft offering alternative solutions & actionable coaching insights.";
      tips = "Describe any limitations gently. Always offer alternative options to turn a refusal into a relationship builder.";
      break;
    case 'complaint_handling':
      what = "Generates high-empathy, ownership-focused responses for dissatisfied or angry service complaints.";
      when = "When a buyer complains about a broken product, transit error, or driver behavior, and you need to lock in a resolution.";
      example = "Your carrier courier literally threw the parcel, breaking the internal display screen!";
      expected = "A compassionate reply accepting operational care and explicitly outlining approved remedy steps.";
      tips = "Be transparent about available resolutions. Focus on the solution rather than defending structural limits.";
      break;
    case 'call_script':
      what = "Builds structured, conversational, verbal telephone dialog cues to guide live support agent conversations.";
      when = "Preparing for complex verbal calls, overcharge inquiries, technical walk-throughs, or managing difficult callers.";
      example = "Billing overcharge duplicate transaction status for a subscription payment of $45.";
      expected = "A 5-part script layout covering Greeting, Security Verification, Empathy, Resolution, and Professional Closing.";
      tips = "Match the customer archetype to get tailored speaking paces. Use verification scripts to safeguard account privacy.";
      break;
    case 'soft_skills':
      what = "Audits agent responses, corrects negative brokerage words, and generates 6 distinct high-empathy/compliant stock-trading variations.";
      when = "When answering a volatile client query about fund payouts, margin shortfalls, automated risks/closures (RMS), or charge queries.";
      example = "Your transaction failed. Free margin is not sufficient, system is down.";
      expected = "A detailed 10-point audit checking confidence, empathy, and professionalism with positive replacement text feeds.";
      tips = "Avoid using negative words like 'Wait' or 'Not possible'. Use compliance-safe phrasing that validation engines approve.";
      break;
    case 'escalation':
      what = "Transforms hot tech crises into internal logistics tickets and customer delay updates simultaneously.";
      when = "When a major system crash, catalog lag, or server overload occurs, and stakeholders at all levels require instant updates.";
      example = "Database replication bottleneck causing blank customer configuration sync states.";
      expected = "A professional internal ticket note with detailed key parameters, a customer status update, and an executive summary.";
      tips = "Always specify the core technical bottleneck and state the next promised ETA to secure solid customer credibility.";
      break;
    case 'email_writer':
      what = "Drafts comprehensive emails, concise letters, and short mobile message updates from raw bullet points.";
      when = "When sending new enterprise announcements, bulk onboarding guidelines, or following up on resolved tickets.";
      example = "Welcome enterprise clients, schedule API onboarding, need target whitelist IP spaces.";
      expected = "A compelling subject line paired with a primary email body, a concise 3-sentence summary, and a mobile SMS text.";
      tips = "Detail elements with comma-separated points so the copywriting assistant organizes them in the correct hierarchical sequence.";
      break;
  }

  return (
    <div id={`guided-explanation-${id}`} className="bg-slate-50 border border-slate-200 p-4 rounded-sm text-left text-xs space-y-3 shadow-xs">
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200">
        <HelpCircle className="w-4 h-4 text-blue-600" />
        <h4 className="font-bold text-slate-900 tracking-tight text-xs">Guided Tool Companion</h4>
      </div>
      
      <div className="space-y-2.5">
        <div>
          <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider font-mono">What this tool does</span>
          <p className="text-slate-600 mt-0.5 leading-relaxed">{what}</p>
        </div>
        
        <div>
          <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider font-mono">When to use it</span>
          <p className="text-slate-600 mt-0.5 leading-relaxed">{when}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-white p-2 rounded-sm border border-slate-200">
            <span className="font-bold text-slate-550 block text-[9px] uppercase tracking-wider font-mono">Example Input</span>
            <p className="text-slate-500 italic mt-0.5 leading-relaxed text-[11px]">"{example}"</p>
          </div>
          <div className="bg-white p-2 rounded-sm border border-slate-200">
            <span className="font-bold text-slate-550 block text-[9px] uppercase tracking-wider font-mono">Expected Output</span>
            <p className="text-slate-500 mt-0.5 leading-relaxed text-[11px]">{expected}</p>
          </div>
        </div>
        
        <div className="bg-blue-50/50 p-2 rounded-sm border border-blue-100">
          <span className="font-bold text-blue-800 block text-[10px] uppercase tracking-wider font-mono">Tips for Best Results</span>
          <p className="text-slate-600 mt-0.5 leading-relaxed">{tips}</p>
        </div>
      </div>
    </div>
  );
}

export function getModuleTitle(id: ModuleId): string {
  switch (id) {
    case 'email_improvement': return 'Email Improvement Coach';
    case 'complaint_handling': return 'Complaint Handling & De-escalation';
    case 'call_script': return 'Interactive Call Script Generator';
    case 'soft_skills': return 'Brokerage Phrase & Compliance Coach';
    case 'escalation': return 'Escalation Note Architect';
    case 'email_writer': return 'AI Full-Stack Email Copywriter';
  }
}

// Description labels
function getModuleDescription(id: ModuleId): string {
  switch (id) {
    case 'email_improvement': return 'Draft high-impact professional adjustments to customer service emails.';
    case 'complaint_handling': return 'Learn to address angry customer complaint templates with concrete solutions and empathy.';
    case 'call_script': return 'Generate highly structured phone script panels for greetings, checks, solutions, and farewell closings.';
    case 'soft_skills': return 'Evaluate client support statement drafts against positive replacements and regulatory standards.';
    case 'escalation': return 'Synthesize technical issues into elegant logs for internal senior desk teams AND customer updates simultaneously.';
    case 'email_writer': return 'Produce and format multiple template variants from a few descriptive goals.';
  }
}
