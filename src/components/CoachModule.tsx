import React, { useState } from 'react';
import { 
  Sparkles, Copy, Check, Save, RotateCcw, 
  ArrowRight, ShieldAlert, BadgeAlert, HelpCircle, 
  Smile, Award, FileText, ChevronRight, UserCog
} from 'lucide-react';
import { ModuleId, User } from '../types';
import { apiClient } from '../apiClient';

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
  const [language, setLanguage] = useState('en');
  
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
    keyPoints: '',
    // Universal Coaching Tool (English/Hindi)
    textToAnalyze: ''
  });

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<Record<string, any> | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [customRewriteCommand, setCustomRewriteCommand] = useState('');
  const [rewritingField, setRewritingField] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<string>('professional');

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
    } else if (moduleId === 'universal_coach') {
      setInputs(prev => ({
        ...prev,
        textToAnalyze: "I want to complain about a refund delay for my stocks payout. You guys are useless."
      }));
      setTone('Professional');
    }
  };

  const cleanInputs = () => {
    setInputs({
      originalEmail: '', issueType: '', complaint: '', resolution: '',
      callReason: '', customerType: 'standard', issueSummary: '',
      agentResponse: '', delayReason: '', currentStatus: '', nextAction: '',
      purpose: '', recipientType: '', keyPoints: '', textToAnalyze: ''
    });
    setOutput(null);
    setIsSaved(false);
  };

  // Call Express API endpoint or run local fallback simulation
  const generateOutput = async () => {
    setLoading(true);
    setIsSaved(false);
    setOutput(null);

    try {
      const data = await apiClient.generateCoachOutput(moduleId, inputs, tone, language);
      if (data) {
        setOutput(data);
      } else {
        alert('Could not coordinate response with Coaching Engine. Please try again.');
      }
    } catch (err) {
      console.error('Generation Error:', err);
      alert('Coaching engine coordinating timeout.');
    } finally {
      setLoading(false);
    }
  };

  // Perform quick modification/rewrite command on specific fields
  const handleRewrite = async (fieldKey: string, command: string) => {
    if (!output || !output[fieldKey]) return;
    setRewritingField(fieldKey);

    try {
      const rewrittenText = await apiClient.rewriteCoachText(output[fieldKey], command, tone, language);
      if (rewrittenText) {
        setOutput(prev => prev ? ({
          ...prev,
          [fieldKey]: rewrittenText
        }) : null);
      }
    } catch (err) {
      console.error('Rewrite Error:', err);
    } finally {
      setRewritingField(null);
    }
  };

  // Save outputs to history (supports local offline database on static hosts like Vercel)
  const saveToHistory = async () => {
    if (!output) return;
    setSaveStatus('saving');

    try {
      const success = await apiClient.saveHistoryItem(
        currentUser.id,
        currentUser.name,
        moduleId,
        tone,
        inputs,
        output
      );

      if (success) {
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

          {moduleId === 'universal_coach' && (
            <div className="space-y-3.5 text-left">
              <div className="p-2 bg-amber-50/55 text-amber-805 rounded-sm text-[11px] flex gap-2 border border-amber-100">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <p className="text-amber-850">Paste any customer complaint, financial service query, or draft written by an agent. The coach will auto-detect the input type, check financial compliance, score key soft skills, and generate 6 varied response options in the language selected below.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Paste Raw Customer Text or Agent Draft</label>
                <textarea 
                  id="inp-universal-text"
                  rows={8}
                  placeholder="e.g., I want to complain about a refund delay for my stocks payout. You guys are useless or Dear client we can't refund your brokerage charges..."
                  value={inputs.textToAnalyze}
                  onChange={(e) => handleInputChange('textToAnalyze', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition resize-none leading-relaxed font-mono"
                />
              </div>
            </div>
          )}

          {/* Tone Selector & Form Actions */}
          <div className="border-t border-slate-150 pt-3.5 space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-550 mb-1.5 uppercase tracking-wider">Coaching Tone Target</label>
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

                {/* 7. Universal AI Coach Output Fields */}
                {moduleId === 'universal_coach' && (
                  <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                    {/* Input Summary and Sentiment Indicator Badges */}
                    <div className="flex flex-wrap gap-2 pb-2.5 border-b border-slate-100 items-center">
                      <div className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-705 text-[11px] font-semibold flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Class:</span>
                        <strong className="text-slate-900">{output.inputType || "Customer Query"}</strong>
                      </div>
                      
                      <div className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 border ${
                        output.customerSentiment?.toLowerCase().includes('angry') || output.customerSentiment?.toLowerCase().includes('gussa')
                          ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        <span className="text-[10px] opacity-70">Sentiment:</span>
                        <strong>{output.customerSentiment || "Frustrated"}</strong>
                      </div>

                      <div className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 border ${
                        output.priority?.toLowerCase() === 'high' || output.priority?.toLowerCase() === 'critical'
                          ? 'bg-red-50 border-red-200 text-red-700 font-bold'
                          : output.priority?.toLowerCase() === 'medium'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}>
                        <span className="text-[10px] opacity-70">Priority:</span>
                        <strong>{output.priority || "Medium"}</strong>
                      </div>
                      
                      <div className="px-2 py-1 rounded bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold flex items-center gap-1 ml-auto">
                        <span className="text-[10px] text-blue-400">Compliance:</span>
                        <strong className="text-blue-900">SEBI Verified</strong>
                      </div>
                    </div>

                    {/* Email Quality Scores & Analysis Rubric (Rendered only if input is agent draft or scores present) */}
                    {output.emailAnalysis && (
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm space-y-3 font-sans">
                        <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1 block text-left">
                          <Smile className="w-3.5 h-3.5 text-blue-500" />
                          Email Quality Scorecard & Suggestions
                        </h5>

                        {/* Scores grid */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                          {[
                            { label: 'Overall', val: output.emailAnalysis.overallScore },
                            { label: 'Empathy', val: output.emailAnalysis.empathyScore },
                            { label: 'Professional', val: output.emailAnalysis.professionalismScore },
                            { label: 'Clarity', val: output.emailAnalysis.clarityScore },
                            { label: 'Ownership', val: output.emailAnalysis.ownershipScore },
                            { label: 'Grammar', val: output.emailAnalysis.grammarScore }
                          ].map(scoreItem => (
                            <div key={scoreItem.label} className="bg-white p-1.5 rounded border border-slate-150 text-center">
                              <span className="text-[9px] font-bold text-slate-400 block truncate">{scoreItem.label}</span>
                              <span className={`text-base font-extrabold ${getScoreColor(scoreItem.val ? (scoreItem.val > 10 ? Math.round(scoreItem.val / 10) : scoreItem.val) : 8)}`}>
                                {scoreItem.val || 80}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Text Analysis */}
                        <div className="text-xs space-y-2 pt-1 border-t border-slate-100 text-left">
                          {output.emailAnalysis.strengths && (
                            <p className="text-slate-600 block">
                              <strong className="text-emerald-700 font-bold block mb-0.5">✓ Performance Strengths:</strong>
                              {output.emailAnalysis.strengths}
                            </p>
                          )}
                          {output.emailAnalysis.areasToImprove && (
                            <p className="text-slate-600 block">
                              <strong className="text-rose-700 font-bold block mb-0.5">✗ Code friction / Areas to Improve:</strong>
                              {output.emailAnalysis.areasToImprove}
                            </p>
                          )}
                          {output.emailAnalysis.suggestedBetterPhrases && (
                            <p className="p-2 bg-blue-50/50 rounded border border-blue-100 text-[11px] text-blue-800 italic block">
                              <strong className="text-blue-900 not-italic font-bold block mb-0.5">⭐ Proactive Phrasing Upgrade:</strong>
                              {output.emailAnalysis.suggestedBetterPhrases}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Response Variations Tab Container */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block text-left">
                        Six Tone response variations (Hindi/English compatible)
                      </span>
                      
                      {/* Tabs Header */}
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-1 border-b border-slate-200 pb-1.5">
                        {['professional', 'empathetic', 'polite', 'firm', 'apology', 'escalation'].map(v => (
                          <button
                            key={v}
                            onClick={() => setSelectedVariation(v)}
                            className={`px-1.5 py-1 text-[10px] font-bold rounded-sm border uppercase tracking-wider text-center transition cursor-pointer ${
                              selectedVariation === v
                                ? 'bg-slate-900 border-slate-900 text-white font-extrabold shadow-sm'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      {output.variations && output.variations[selectedVariation] && (
                        <div className="bg-white border border-slate-200 rounded p-3.5 space-y-2.5 shadow-xs transition duration-150 text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-2 pb-2 border-b border-slate-100">
                            <span className="text-slate-550">
                              Best Use Case: <strong className="text-slate-800 font-bold">{output.variations[selectedVariation].bestUseCase}</strong>
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-sm font-mono text-[9px] uppercase font-bold text-center self-start sm:self-auto shrink-0">
                              Tone: {output.variations[selectedVariation].tone}
                            </span>
                          </div>
                          
                          {renderOutputBlock(
                            `var-${selectedVariation}`, 
                            `${selectedVariation} formulation update`, 
                            output.variations[selectedVariation].response, 
                            true
                          )}
                        </div>
                      )}
                    </div>

                    {/* Angry Client De-escalation Protocol */}
                    {output.angrySentimentHandling && (
                      <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-sm space-y-2.5 text-left">
                        <div className="flex items-center gap-1.5 border-b border-rose-250 pb-1.5 flex-wrap">
                          <BadgeAlert className="w-4 h-4 text-rose-600 shrink-0" />
                          <h5 className="text-[10px] font-extrabold text-rose-800 uppercase tracking-widest">
                            😡 Escalated Client De-escalation Protocol
                          </h5>
                          <span className="ml-auto px-2 py-0.5 bg-rose-600 text-white text-[9px] font-mono rounded-sm font-bold uppercase tracking-wider animate-pulse">
                            Risk Level: {output.angrySentimentHandling.riskLevel || "High"}
                          </span>
                        </div>

                        <div className="text-xs space-y-2 text-rose-900 leading-relaxed font-sans block">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pb-2 border-b border-rose-100">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider block text-rose-600 font-bold">Client Emotion Matrix</span>
                              <span className="font-bold text-rose-950">{output.angrySentimentHandling.customerEmotion}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider block text-rose-600 font-bold">Action Urgency</span>
                              <span className="font-bold text-rose-950">{output.angrySentimentHandling.urgencyLevel}</span>
                            </div>
                          </div>

                          <div className="space-y-3 pt-1">
                            <div>
                              <strong className="text-rose-950 font-bold block text-[10px] uppercase font-mono">1. De-escalating Greeting (Warmly validate emotions):</strong>
                              <p className="bg-white p-2 border border-rose-100 rounded text-[11px] text-slate-800 mt-0.5 shadow-tiny">
                                "{output.angrySentimentHandling.deEscalationResponse}"
                              </p>
                            </div>
                            
                            <div>
                              <strong className="text-rose-950 font-bold block text-[10px] uppercase font-mono">2. Immediate Redress Action (Remove statutory locks):</strong>
                              <p className="bg-white p-2 border border-rose-100 rounded text-[11px] text-slate-800 mt-0.5 shadow-tiny">
                                "{output.angrySentimentHandling.immediateActionStatement}"
                              </p>
                            </div>

                            <div>
                              <strong className="text-rose-950 font-bold block text-[10px] uppercase font-mono">3. Taking Express Ownership (Personal accountability):</strong>
                              <p className="bg-white p-2 border border-rose-100 rounded text-[11px] text-slate-800 mt-0.5 shadow-tiny">
                                "{output.angrySentimentHandling.ownershipStatement}"
                              </p>
                            </div>

                            <div>
                              <strong className="text-rose-950 font-bold block text-[10px] uppercase font-mono">4. Concrete Next Step (Give solid ETA):</strong>
                              <p className="bg-white p-2 border border-rose-100 rounded text-[11px] text-slate-800 mt-0.5 shadow-tiny">
                                "{output.angrySentimentHandling.nextStepStatement}"
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Standard Coaching Tips */}
                    {output.coachingTips && (
                      <div className="bg-blue-50/70 border border-blue-150 p-3.5 rounded-sm space-y-2.5 text-left font-sans">
                        <h5 className="text-[10px] font-extrabold text-blue-800 uppercase tracking-widest flex items-center gap-1 border-b border-blue-200 pb-1.5 block">
                          <UserCog className="w-4 h-4 text-blue-600 shrink-0" />
                          Compliance, Soft Skills & Coaching Insights
                        </h5>
                        
                        <div className="text-xs space-y-3.5 text-slate-700 leading-relaxed block">
                          <div>
                            <strong className="text-blue-900 block font-bold text-[11px]">✍️ Communication Structure Improvement:</strong>
                            <p className="mt-0.5 text-slate-700">{output.coachingTips.communicationImprovement}</p>
                          </div>
                          <div>
                            <strong className="text-blue-900 block font-bold text-[11px]">🧠 Soft Skills & Empathy Refinement:</strong>
                            <p className="mt-0.5 text-slate-700">{output.coachingTips.softSkillsImprovement}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div className="bg-white p-2.5 rounded border border-blue-100 shadow-tiny">
                              <strong className="text-emerald-800 block text-[10px] uppercase font-extrabold mb-0.5">✓ How an Administrator Handles this:</strong>
                              <p className="text-[11px] text-slate-650 italic mt-0.5 leading-relaxed font-sans">"{output.coachingTips.whatSeniorManagerWrites}"</p>
                            </div>
                            <div className="bg-white p-2.5 rounded border border-rose-200 shadow-tiny">
                              <strong className="text-rose-800 block text-[10px] uppercase font-extrabold mb-0.5 font-bold">✗ PHRASES TO STATEDLY AVOID:</strong>
                              <p className="text-[11px] text-rose-955 mt-0.5 leading-relaxed font-sans font-medium">"{output.coachingTips.whatNotToWrite}"</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
    value: any, 
    showRewriteControls = false, 
    scriptBlockStyle = false
  ) {
    if (!value) return null;

    let displayValue = "";
    if (typeof value === 'object' && value !== null) {
      try {
        displayValue = Object.entries(value)
          .map(([k, v]) => {
            const formattedKey = k
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase());
            const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
            return `${formattedKey}: ${valStr}`;
          })
          .join('\n\n');
      } catch (e) {
        displayValue = JSON.stringify(value, null, 2);
      }
    } else {
      displayValue = String(value);
    }

    return (
      <div className={`rounded-sm border border-slate-205 p-3 text-left transition ${scriptBlockStyle ? 'bg-slate-50 border-l-4 border-l-blue-600' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1 font-sans">
            {scriptBlockStyle && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>}
            {label}
          </span>
          <button
            id={`btn-copy-${key}`}
            onClick={() => handleCopy(displayValue, key)}
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
          {displayValue}
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
  if (moduleId === 'universal_coach') {
    return !inputs.textToAnalyze?.trim();
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
    case 'universal_coach': return '7';
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
    case 'universal_coach':
      what = "Analyzes, logs, and processes any input text as either a customer query or an email draft. Computes soft skill grades, checks policy violations, and drafts 6 variations.";
      when = "When you receive any ambiguous stock-trading query, raw complaint, or rough draft that needs SEBI-compliant guidance or multi-tone variations.";
      example = "I want to complain about a refund delay for my stocks payout. You guys are useless.";
      expected = "An in-depth coaching report: detected input parameters, quality scores, angry client de-escalations, and six-fold responses in English.";
      tips = "Paste any freeform text. The tool will automatically draft a high-quality analysis and compliant variations.";
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
    case 'universal_coach': return 'Intelligent CS AI Coach';
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
    case 'universal_coach': return 'Analyze customer queries or email drafts to automatically audit compliance, score empathy, and generate six response variations.';
  }
}
