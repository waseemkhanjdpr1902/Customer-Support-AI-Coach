import React, { useState } from 'react';
import { 
  Sparkles, Copy, Check, Save, RotateCcw, 
  ArrowRight, ShieldAlert, BadgeAlert, HelpCircle, 
  Smile, Award, FileText, ChevronRight, UserCog,
  Search, CheckCircle, XCircle, Info, ShieldCheck
} from 'lucide-react';
import { ModuleId, User } from '../types';
import { apiClient } from '../apiClient';

interface CoachModuleProps {
  moduleId: ModuleId;
  currentUser: User;
  onSaveSuccess?: () => void;
}

const PHRASES_DATA = [
  {
    id: 'phrase-1',
    category: 'Payouts & Refunds',
    prohibited: "Your payout of Rs 50,000 is stuck in standard processing. Just wait for some time.",
    compliant: "Your withdrawal request for Rs 50,000 has been registered. Under standard banking settlement cycles, we are actively tracing this transaction and it will be updated in your bank ledger within the next 2 hours.",
    sebiRule: "SEBI Settlement of Client Funds Mandate (Section 4.2)",
    explanation: "Avoid telling clients to 'just wait' or calling transactions 'stuck'. Always provide specific operational settlement periods and state that tracing/verification is in progress under standard bank policies."
  },
  {
    id: 'phrase-2',
    category: 'Payouts & Refunds',
    prohibited: "Don't worry, we guarantee 100% refund of delayed funds charges.",
    compliant: "We are reviewing the delayed transaction against our standard guidelines. In accordance with standard tariff directives and SEBI regulatory disclosures, we do not promise or offer financial guarantees on market profits or charge refunds.",
    sebiRule: "SEBI circular on Prohibition of Guaranteed Returns (Clause 6)",
    explanation: "Strictly prohibit using words like 'guarantee' or promising certain refunds for delayed transactions. Always mention tariff disclosures and regulatory checks."
  },
  {
    id: 'phrase-3',
    category: 'KYC & Demat',
    prohibited: "Your KYC verification is rejected. You entered wrong details. Modify it or we will close description.",
    compliant: "We sincerely apologize for the inconvenience. A discrepancy in your registered name has been detected in your KYC documents. In compliance with regulatory verification requirements, you can easily modify these details through our online portal for instant approval and setup.",
    sebiRule: "SEBI KRA (KYC Registration Agency) Regulations, 2011",
    explanation: "Avoid aggressive rejection terminology. Express apology for the verification checkpoint, outline the specific mismatches, and guide the investor helper link step-by-step."
  },
  {
    id: 'phrase-4',
    category: 'KYC & Demat',
    prohibited: "We will skip KRA document verification to open your account fast.",
    compliant: "In compliance with standard financial safety regulations and KRA norms, PAN and in-person verification are mandatory prior to opening an account. This audit process typically requires up to 12 working hours.",
    sebiRule: "PMLA Act Section 12 & SEBI anti-money laundering circulars",
    explanation: "Never suggest or write that regulatory checks, paperwork, or document uploads can be skipped, bypassed, or falsified to save time."
  },
  {
    id: 'phrase-5',
    category: 'Margin & RMS',
    prohibited: "Our Risk Management Team automatically closed/squared-off your open trade because you had zero margin. We are not responsible.",
    compliant: "In strict compliance with exchange margin shortfall guidelines, our Risk Management Desk (RMS) is required to automatically square off outstanding positions. We highly recommend monitoring and maintaining adequate ledger margins to protect your active positions.",
    sebiRule: "SEBI Peak Margin & Automatic Risk Square-Off Mandate",
    explanation: "Avoid telling the user 'we are not responsible' or using defensive tones. Formulate it as standard automatic risk management framework (RMS) triggers linked strictly to SEBI Peak Margin guidelines."
  },
  {
    id: 'phrase-6',
    category: 'Margin & RMS',
    prohibited: "Take 10x high leverage directly from our premium desk and trade risk-free.",
    compliant: "Peak leverage criteria for derivative trading are strictly governed by Exchange and SEBI Margin Trading Facility (MTF) regulations. Standard Disclosure: All derivative investments are subject to capital risk factors.",
    sebiRule: "SEBI Margin Trading Facility Directive 2022",
    explanation: "Never claim leverage is 'risk-free' or state arbitrary, unapproved multipliers. Frame margin allocations under the legal MTF framework."
  },
  {
    id: 'phrase-7',
    category: 'Charges & Brokerage',
    prohibited: "This transaction charge was deducted by the system. We can't refund it, go complain to SEBI or web portal.",
    compliant: "The charges in your ledger have been applied in strict accordance with the standard tariff structure, stamp duty, and statutory transaction fees. If you require a detailed breakdown, our complaint desk can arrange a manual audit of your ledger statements.",
    sebiRule: "SEBI Code of Conduct for Stock Brokers & Transparency circulars",
    explanation: "Never invite angry clients to 'complain to SEBI' or dismiss billing questions. Offer a formal compliance manual ledger audit if a calculation dispute exists."
  },
  {
    id: 'phrase-8',
    category: 'Charges & Brokerage',
    prohibited: "Our system has hidden annual charges that we deduct dynamically.",
    compliant: "We implement a fully transparent pricing model. You can review our complete annual billing criteria, Demat maintenance rules, and our transparent tariff schedule. There are absolutely no hidden terms or dynamic charges.",
    sebiRule: "SEBI Guideline on Transparency and Disclosure of Brokerage Charges",
    explanation: "Ensure the active agent response stresses absolute transparency and direct reference to standard, approved tariff sheets."
  }
];

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

  // Phrase Library States
  const [phraseSearch, setPhraseSearch] = useState('');
  const [selectedPhraseCategory, setSelectedPhraseCategory] = useState('All');
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxEvaluation, setSandboxEvaluation] = useState<{
    compliancyScore: number;
    issuesFound: string[];
    suggestedCategory: string;
    suggestion: string;
  } | null>(null);

  const evaluateSandbox = () => {
    const text = sandboxInput.toLowerCase();
    if (!text.trim()) {
      setSandboxEvaluation(null);
      return;
    }

    let compliancyScore = 10;
    const issuesFound: string[] = [];
    let suggestedCategory = 'Payouts & Refunds';
    let suggestion = '';

    if (text.includes('wait') || text.includes('stuck') || text.includes('some time')) {
      compliancyScore -= 3;
      issuesFound.push('❌ Used unapproved delay language ("wait", "stuck"). SEBI guidelines prohibit telling clients to wait without specifying standard depository turnaround times.');
      suggestedCategory = 'Payouts & Refunds';
      suggestion = 'Your withdrawal request has been successfully registered. In accordance with depository processing timelines, the funds will be transferred to your bank ledger account within 2 working hours.';
    }

    if (text.includes('guarantee') || text.includes('100%') || text.includes('profit') || text.includes('return')) {
      compliancyScore -= 4;
      issuesFound.push('🚨 COMPLIANCE BREACH: Guaranteed returns/refunds promise. SEBI Code of Conduct strictly prevents stock brokers from guaranteeing capital returns or refunds for market issues.');
      suggestedCategory = 'Payouts & Refunds';
      suggestion = 'Brokerage charges strictly follow our published regulatory tariff. In line with compliance guidelines, we do not guarantee specific returns, profits, or automated surcharge waivers.';
    }

    if (text.includes('kra') || text.includes('skip') || text.includes('bypass') || text.includes('without documents')) {
      compliancyScore -= 4;
      issuesFound.push('🚨 COMPLIANCE BREACH: Attempting/suggesting to bypass document verification. Account onboarding and KRA digital verification are strictly mandated by the Prevention of Money Laundering Act (PMLA).');
      suggestedCategory = 'KYC & Demat';
      suggestion = 'In compliance with standard financial safety regulations and KRA norms, PAN check and in-person verification are mandatory before activating the account. This audit process normally takes up to 12 working hours.';
    }

    if (text.includes('closed') || text.includes('rms') || text.includes('squared-off') || text.includes('margin') || text.includes('collateral')) {
      if (text.includes('our fault') || text.includes('not our fault') || text.includes('responsibility') || text.includes('not responsible')) {
        compliancyScore -= 2;
        issuesFound.push('⚠️ Defensive brand language: Denied platform liability or responsibility. Frame liquidation actions purely around exchange margin criteria squared-off by system.');
      }
      suggestedCategory = 'Margin & RMS';
      suggestion = 'In strict compliance with exchange margin shortfall guidelines, the Risk Management Desk (RMS) automatically closes positions during deficit triggers. We recommend maintaining adequate ledger margin to prevent system square-offs.';
    }

    if (text.includes('complain') || text.includes('sebi') || text.includes('portal')) {
      compliancyScore -= 2;
      issuesFound.push('⚠️ Deflection language. Strictly avoid inviting upset clients to check complaint links or go direct to SEBI. Instead, direct them to an internal senior audit ledger check.');
      suggestedCategory = 'Charges & Brokerage';
      suggestion = 'The charges on your ledger statement have been applied in accordance with standard tariff schedules, stamp duty, and statutory transaction fees. If you detect any discrepancies, our compliance desk will initiate a manual audit check.';
    }

    if (compliancyScore === 10) {
      if (text.length < 15) {
        compliancyScore = 8;
        issuesFound.push('ℹ️ Statement is too brief to convey adequate empathy. Provide specific regulatory background descriptions.');
      } else {
        issuesFound.push('✅ No severe compliance keywords flagged! Clear, objective tone identified.');
      }
      suggestion = 'Excellent! Your statement matches compliant criteria. Keep details transparent, state standard policies, and refer to verified schedules.';
    }

    setSandboxEvaluation({
      compliancyScore,
      issuesFound,
      suggestedCategory,
      suggestion
    });
  };

  const renderPhraseLibrary = () => {
    // Filter phrases
    const filteredPhrases = PHRASES_DATA.filter(p => {
      const matchesSearch = p.prohibited.toLowerCase().includes(phraseSearch.toLowerCase()) || 
                            p.compliant.toLowerCase().includes(phraseSearch.toLowerCase()) || 
                            p.explanation.toLowerCase().includes(phraseSearch.toLowerCase()) ||
                            p.sebiRule.toLowerCase().includes(phraseSearch.toLowerCase());
      const matchesCategory = selectedPhraseCategory === 'All' || p.category === selectedPhraseCategory;
      return matchesSearch && matchesCategory;
    });

    return (
      <div className="bg-white rounded-sm border border-slate-205 p-6 space-y-6 text-left animate-fade-in shadow-xs lg:col-span-12 w-full">
        {/* Banner */}
        <div id="phrase-library-intro" className="flex flex-col md:flex-row justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-[10px] uppercase tracking-wider font-bold bg-indigo-50 text-indigo-700 border border-indigo-150">
              <ShieldCheck className="w-3.5 h-3.5" />
              SEBI & Depository Compliant Registry
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Customer Support Phrase Card Index</h3>
            <p className="text-xs text-slate-500 max-w-2xl">
              An interactive database of prohibited financial phrasing and standard-approved regulatory alternatives. Directly copy vetted answers to eliminate micro-aggressions, guarantee compliance, and reduce SEBI audit logs.
            </p>
          </div>
          
          {/* Regulatory Quick Counter */}
          <div className="flex gap-3 bg-slate-50 border border-slate-200 p-3 rounded-sm items-center self-start shrink-0">
            <div className="text-center px-1">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Approved</span>
              <strong className="text-sm font-extrabold text-emerald-600 block">v1.2 Standard</strong>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="text-center px-1">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Core Count</span>
              <strong className="text-sm font-extrabold text-slate-900 block">{PHRASES_DATA.length} Verified</strong>
            </div>
          </div>
        </div>

        {/* Sandbox compliance workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Phrase Database Section */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search & Category Header */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="text"
                  placeholder="Search broker rules, keywords, SEBI circular codes (e.g., 'margin', 'KYC', 'KRA')..."
                  value={phraseSearch}
                  onChange={(e) => setPhraseSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
                {phraseSearch && (
                  <button 
                    onClick={() => setPhraseSearch('')}
                    className="text-slate-400 hover:text-slate-600 text-xs absolute right-3 top-3 font-semibold font-mono"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category selector pills */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-2">
                {['All', 'Payouts & Refunds', 'KYC & Demat', 'Margin & RMS', 'Charges & Brokerage'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedPhraseCategory(cat)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer transition ${
                      selectedPhraseCategory === cat 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'bg-slate-50 text-slate-650 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Phrase items list */}
            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
              {filteredPhrases.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 bg-slate-50 rounded-sm">
                  <p className="text-xs text-slate-500 font-medium">No vetting results found for current query. Refine your search inputs.</p>
                </div>
              ) : (
                filteredPhrases.map(item => (
                  <div key={item.id} className="border border-slate-200 rounded-sm overflow-hidden bg-white shadow-xs hover:border-slate-300 transition flex flex-col">
                    {/* Item header */}
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-indigo-50 border border-indigo-100 text-indigo-700 font-sans uppercase">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 font-mono">
                          {item.sebiRule}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.compliant, item.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-sm border transition flex items-center gap-1 cursor-pointer select-none ${
                          copiedField === item.id 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {copiedField === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            Copied alternative!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            Copy Approved Text
                          </>
                        )}
                      </button>
                    </div>

                    {/* Prohibited vs Compliant blocks */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 border-b border-slate-100">
                      {/* Prohibited / Avoid */}
                      <div className="space-y-1.5 p-3 bg-red-50/50 border border-red-100 rounded-sm">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-wider font-mono">
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                          Prohibited Phrase
                        </div>
                        <p className="text-[11px] text-red-955 italic line-through font-normal leading-relaxed">
                          "{item.prohibited}"
                        </p>
                      </div>

                      {/* Compliant / Use */}
                      <div className="space-y-1.5 p-3 bg-emerald-50/50 border border-emerald-100 rounded-sm">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider font-mono">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          SEBI-Compliant Standard
                        </div>
                        <p className="text-[11.5px] text-emerald-950 font-medium leading-relaxed font-sans">
                          "{item.compliant}"
                        </p>
                      </div>
                    </div>

                    {/* Explanatory notes */}
                    <div className="px-4 py-2.5 bg-slate-50/50 text-[11px] text-slate-500 flex gap-2 items-start leading-relaxed">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="text-slate-800 text-[10px] uppercase font-bold tracking-wider font-mono">Why this alternative works:</strong>
                        <p className="text-slate-650 mt-0.5">{item.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Interactive Compliance Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Interactive Sandbox Evaluator */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm space-y-3 shadow-xs">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 tracking-tight text-xs">Verify Phrase Compliancy</h4>
              </div>

              <div className="space-y-2 text-left">
                <p className="text-[11px] text-slate-500 leading-normal font-sans">
                  Write or paste your planned chat response to check for compliance failures prior to transmitting to an active broker customer.
                </p>
                <textarea 
                  rows={4}
                  placeholder="e.g., 'Just wait for some time. Our RMS team closed it due to margin shortcut...'"
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-205 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-sans"
                />
                <div className="flex justify-between items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSandboxInput('');
                      setSandboxEvaluation(null);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-700 font-bold font-mono tracking-wider cursor-pointer"
                  >
                    Reset Check
                  </button>
                  <button
                    onClick={evaluateSandbox}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-sm text-xs font-extrabold hover:bg-blue-700 transition flex items-center gap-1 cursor-pointer"
                  >
                    Test Draft Compliancy
                  </button>
                </div>
              </div>

              {/* Sandbox Evaluation Assessment Output */}
              {sandboxEvaluation && (
                <div className="space-y-3 mt-3 pt-3 border-t border-slate-200 animate-fade-in text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 id-sandbox-evaluation-score uppercase tracking-widest font-mono">Compliancy Score</span>
                    <div className="flex items-baseline gap-0.5">
                      <strong className={`text-sm font-extrabold ${
                        sandboxEvaluation.compliancyScore >= 8 ? 'text-emerald-600' :
                        sandboxEvaluation.compliancyScore >= 5 ? 'text-amber-600' :
                        'text-rose-600'
                      }`}>
                        {sandboxEvaluation.compliancyScore}
                      </strong>
                      <span className="text-[10px] text-slate-400">/ 10</span>
                    </div>
                  </div>

                  {/* Bulleted checklist updates */}
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {sandboxEvaluation.issuesFound.map((issue, idx) => (
                      <p key={idx} className="text-[10px] leading-relaxed text-slate-600 font-medium">
                        {issue}
                      </p>
                    ))}
                  </div>

                  {/* Dynamic suggestion recommendation */}
                  {sandboxEvaluation.compliancyScore < 10 && (
                    <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-sm space-y-1">
                      <span className="block text-[8px] font-bold text-indigo-700 uppercase tracking-widest font-mono">
                        Recommend Library Replacement ({sandboxEvaluation.suggestedCategory})
                      </span>
                      <p className="text-[10.5px] italic text-indigo-950 font-normal leading-relaxed">
                        "{sandboxEvaluation.suggestion}"
                      </p>
                      <button
                        onClick={() => handleCopy(sandboxEvaluation.suggestion, 'sandbox-copy')}
                        className="text-[9px] font-bold text-blue-700 hover:text-blue-800 underline block pt-0.5"
                      >
                        {copiedField === 'sandbox-copy' ? 'Copied alternative!' : 'Copy to Clipboard'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SEBI Code of Conduct Core Checklist */}
            <div className="bg-white border border-slate-200 p-4 rounded-sm space-y-3 text-left shadow-xs">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-105">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 tracking-tight text-xs">Broker Compliance Guardrails</h4>
              </div>
              
              <ul className="space-y-2.5 text-[11px] leading-relaxed">
                <li className="flex gap-2 items-start">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong className="text-slate-800 font-semibold block text-[10.5px]">Direct Tariff Citations Only</strong>
                    <span className="text-slate-500 font-normal">Billing details must reference Standard Rate List to avoid non-disclosure penalties.</span>
                  </div>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong className="text-slate-800 font-semibold block text-[10.5px]">Emphasize Automatic RMS Triggers</strong>
                    <span className="text-slate-500 font-normal">RMS square-offs must be declared as system automated limits to maintain regulatory objectivity.</span>
                  </div>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong className="text-slate-800 font-semibold block text-[10.5px]">Clear Settled Schedules</strong>
                    <span className="text-slate-500 font-normal">Explain payout cycles using exact hour estimations, stating standard clearing hours strictly.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
    if (moduleId === 'email_coach') {
      setInputs(prev => ({
        ...prev,
        emailInputText: "My Demat payout of Rs 50,000 is delayed for 3 days. This is worst service, give me double return or I complain to SEBI and write online fraud!",
        emailTask: "Write Apology Email"
      }));
      setTone('Empathetic');
    } else if (moduleId === 'email_improvement') {
      setInputs(prev => ({
        ...prev,
        originalEmail: "I know you are mad but we can't refund your money because our policy says 14 days and you bought it 20 days ago. Sorry but rules are rules.",
        issueType: "Refund request outside return duration window"
      }));
      setTone('Empathetic');
    } else if (moduleId === 'complaint_handling') {
      setInputs(prev => ({
        ...prev,
        complaint: "Your executive delayed my Demat KYC verification for over a week! I missed trading on a major market movement and lost potential profits. Setup my account now or I will raise a complaint with SEBI!",
        issueType: "Demat KYC verification delay",
        resolution: "Expedite Demat validation by manual review team within 2 hours, waive first year annual maintenance charges."
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
        agentResponse: "Your Demat trade was automatically closed by our RMS team due to margin shortfall. Your payout of Rs 50,000 is on hold because of KYC discrepancies. If you don't like it you can complain to SEBI."
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
        purpose: "Resolve delayed Demat bank account linking and refund standard processing fee",
        recipientType: "Active Stock Market Investor",
        keyPoints: "Verification completed manually; Bank linking active within 2 hours; Fee of Rs 500 credited back to your trading ledger; Apology for delay."
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
            Module {getModuleNumber(moduleId)} of 3
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

      {moduleId === 'soft_skills' ? (
        renderPhraseLibrary()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Form Inputs & Guided Explanations */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100 block text-left">Coaching inputs</h3>
          
          {/* Dynamic input render based on active module ID */}
          {moduleId === 'email_coach' && (
            <div className="space-y-3.5 text-left animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Email Task / Purpose</label>
                <select 
                  id="inp-email-coach-task"
                  value={inputs.emailTask || 'Improve Existing Email'}
                  onChange={(e) => handleInputChange('emailTask', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
                >
                  <option value="Improve Existing Email">Improve Existing Email</option>
                  <option value="Write New Customer Reply">Write New Customer Reply</option>
                  <option value="Write Internal Escalation Email">Write Internal Escalation Email</option>
                  <option value="Write Apology Email">Write Apology Email</option>
                  <option value="Make Email More Professional">Make Email More Professional</option>
                  <option value="Make Email Short & Clear">Make Email Short & Clear</option>
                  <option value="Senior Management Version">Senior Management Version</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Raw Input / Core Details</label>
                <textarea 
                  id="inp-email-coach-input"
                  rows={8}
                  placeholder="Paste customer query, email draft, complaint details, or escalation requirement here…"
                  value={inputs.emailInputText || ''}
                  onChange={(e) => handleInputChange('emailInputText', e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition resize-none leading-relaxed font-sans"
                />
              </div>
            </div>
          )}

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
                {/* 0. AI Email Coach Output Fields */}
                {moduleId === 'email_coach' && (
                  <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1 animate-fade-in">
                    {/* Metadata & Status Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2.5 border-b border-slate-100 items-center">
                      <div className="px-2 py-1.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold flex flex-col">
                        <span className="text-[9px] text-slate-400 uppercase font-mono">Class</span>
                        <strong className="text-slate-900 mt-0.5">{output.detectedInputType || "Customer Query"}</strong>
                      </div>
                      
                      <div className={`px-2 py-1.5 rounded text-[11px] font-semibold flex flex-col border ${
                        output.customerSentiment?.toLowerCase() === 'angry' ? 'bg-red-50 text-red-700 border-red-200' :
                        output.customerSentiment?.toLowerCase() === 'frustrated' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        <span className="text-[9px] opacity-70 uppercase font-mono">Sentiment</span>
                        <strong className="mt-0.5">{output.customerSentiment || "Frustrated"}</strong>
                      </div>

                      <div className={`px-2 py-1.5 rounded text-[11px] font-semibold flex flex-col border ${
                        output.priorityLevel?.toLowerCase() === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                        output.priorityLevel?.toLowerCase() === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        <span className="text-[9px] opacity-70 uppercase font-mono">Priority</span>
                        <strong className="mt-0.5">{output.priorityLevel || "Medium"}</strong>
                      </div>

                      <div className="px-2 py-1.5 rounded bg-blue-50 border border-blue-100 text-blue-700 text-[11px] flex flex-col">
                        <span className="text-[9px] text-blue-400 uppercase font-mono">Recommended Tone</span>
                        <strong className="mt-0.5">{output.recommendedTone || "Professional"}</strong>
                      </div>
                    </div>

                    {/* Main Email outputs */}
                    {renderOutputBlock("subjectLine", "Subject Line", output.subjectLine)}
                    {renderOutputBlock("finalEmailDraft", "Final Email Draft", output.finalEmailDraft, true)}

                    {/* Staggered Variants */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {renderOutputBlock("shortVersion", "Short Version", output.shortVersion, true)}
                      {renderOutputBlock("moreEmpatheticVersion", "More Empathetic Version", output.moreEmpatheticVersion, true)}
                      {renderOutputBlock("moreProfessionalVersion", "More Professional Version", output.moreProfessionalVersion, true)}
                    </div>

                    {/* Coaching Explanations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {renderOutputBlock("keyImprovementsMade", "Key Improvements Made", output.keyImprovementsMade)}
                      {renderOutputBlock("wordsPhrasesToAvoid", "Words/Phrases to Avoid", output.wordsPhrasesToAvoid)}
                    </div>
                  </div>
                )}

                {/* 1. Email Improvement Output Fields */}
                {moduleId === 'email_improvement' && (
                  <div className="space-y-5">
                    {/* Scorecards & Compliance Badges Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-lg text-left flex items-center justify-between shadow-3xs">
                        <div className="space-y-0.5">
                          <span className="block text-[9px] uppercase tracking-wider font-extrabold text-emerald-600 font-mono">Empathy Score</span>
                          <span className="text-xl font-black text-emerald-800">88 / 100</span>
                        </div>
                        <Smile className="w-8 h-8 text-emerald-400 shrink-0" />
                      </div>

                      <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-lg text-left flex items-center justify-between shadow-3xs">
                        <div className="space-y-0.5">
                          <span className="block text-[9px] uppercase tracking-wider font-extrabold text-blue-600 font-mono">Confidence Score</span>
                          <span className="text-xl font-black text-blue-800">94% Rating</span>
                        </div>
                        <Award className="w-8 h-8 text-blue-400 shrink-0" />
                      </div>

                      <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-lg text-left flex items-center justify-between shadow-3xs">
                        <div className="space-y-0.5">
                          <span className="block text-[9px] uppercase tracking-wider font-extrabold text-indigo-600 font-mono">Compliance Check</span>
                          <span className="text-xs font-bold text-indigo-800 flex items-center gap-1 mt-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            PASSED
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-extrabold bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full uppercase">SEBI Safe</span>
                      </div>
                    </div>

                    {/* Current Issue Card */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-left">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Current Issue Under Evaluation</h4>
                      <p className="text-xs font-bold text-slate-800 mt-1 leading-snug">{inputs.issueType || "Demat Transaction / Service Delay"}</p>
                    </div>

                    {/* What's Wrong Card */}
                    <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-lg text-left space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-rose-700 font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        What was Wrong with the Original Draft?
                      </h4>
                      <p className="text-xs text-rose-800 leading-relaxed font-medium">
                        {output.explanationOfImprovements || "Draft contained passive-aggressive constraints, rigid policy jargon ('rules are rules'), did not assure customer of ledger safety, and omitted standard regulatory disclaimer language."}
                      </p>
                    </div>

                    {/* Three Version Alternatives tabs or blocks */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-450 font-mono">Improved Draft Options</h4>
                      
                      {/* 1. Better version */}
                      <div className="bg-white border border-slate-200 rounded-lg p-4 text-left shadow-3xs relative space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Recommended Better Version
                          </span>
                          <button
                            onClick={() => handleCopy(output.improvedEmail || '', 'better_v')}
                            className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-md transition text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedField === 'better_v' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            {copiedField === 'better_v' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        {output.betterSubjectLine && (
                          <div className="bg-slate-50 p-2.5 rounded border border-slate-150 text-[11px] font-bold text-slate-800">
                            <span className="text-[9px] text-slate-400 block uppercase font-mono tracking-wider font-extrabold mb-0.5">Recommended Subject Line</span>
                            {output.betterSubjectLine}
                          </div>
                        )}
                        <pre className="text-xs text-slate-750 font-sans whitespace-pre-wrap leading-relaxed select-all">
                          {output.improvedEmail}
                        </pre>
                      </div>

                      {/* 2. Professional version */}
                      <div className="bg-white border border-slate-200 rounded-lg p-4 text-left shadow-3xs relative space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Corporate Professional Version (SEBI Standard)
                          </span>
                          <button
                            onClick={() => {
                              const profText = `Subject: Operational Review Notification - ${output.betterSubjectLine || "Account Incident Support"}\n\nDear Investor,\n\nPursuant to brokerage account regulatory standards, we have initiated a formal review regarding your inquiry about ${inputs.issueType || "this transaction delay"}.\n\nWe wish to clarify that all depository assets and customer ledger positions remain fully secured under strict SEBI guidelines. Our risk management desk is conducting a diligent log audit to resolve any bottlenecks in accordance with standard operating procedures. The finalized ledger adjustments and settlement reports will be updated inside your back-office cabinet shortly.\n\nThank you for your cooperation.\n\nSincerely,\nOperations & Compliance desk\nAnand Rathi Investment Services`;
                              handleCopy(profText, 'prof_v');
                            }}
                            className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-md transition text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedField === 'prof_v' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            {copiedField === 'prof_v' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="text-xs text-slate-750 font-sans whitespace-pre-wrap leading-relaxed select-all">
                          {`Subject: Operational Review Notification - ${output.betterSubjectLine || "Account Incident Support"}\n\nDear Investor,\n\nPursuant to brokerage account regulatory standards, we have initiated a formal review regarding your inquiry about ${inputs.issueType || "this transaction delay"}.\n\nWe wish to clarify that all depository assets and customer ledger positions remain fully secured under strict SEBI guidelines. Our risk management desk is conducting a diligent log audit to resolve any bottlenecks in accordance with standard operating procedures. The finalized ledger adjustments and settlement reports will be updated inside your back-office cabinet shortly.\n\nThank you for your cooperation.\n\nSincerely,\nOperations & Compliance desk\nAnand Rathi Investment Services`}
                        </pre>
                      </div>

                      {/* 3. Simple English version */}
                      <div className="bg-white border border-slate-200 rounded-lg p-4 text-left shadow-3xs relative space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Simple English Version (Easy Reading)
                          </span>
                          <button
                            onClick={() => {
                              const simpleText = `Subject: Update on your query: ${inputs.issueType || "Account Issue"}\n\nHello,\n\nThank you for reaching out to us. We have received your query about ${inputs.issueType || "this service delay"}.\n\nWe want to reassure you that your money and your account are 100% safe with us. We are checking the details with our bank partners right now. Everything should be updated in your ledger within 2 hours. We will send you an email confirmation as soon as it is done.\n\nBest regards,\nCustomer Care Team\nAnand Rathi`;
                              handleCopy(simpleText, 'simple_v');
                            }}
                            className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-md transition text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedField === 'simple_v' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            {copiedField === 'simple_v' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="text-xs text-slate-750 font-sans whitespace-pre-wrap leading-relaxed select-all">
                          {`Subject: Update on your query: ${inputs.issueType || "Account Issue"}\n\nHello,\n\nThank you for reaching out to us. We have received your query about ${inputs.issueType || "this service delay"}.\n\nWe want to reassure you that your money and your account are 100% safe with us. We are checking the details with our bank partners right now. Everything should be updated in your ledger within 2 hours. We will send you an email confirmation as soon as it is done.\n\nBest regards,\nCustomer Care Team\nAnand Rathi`}
                        </pre>
                      </div>
                    </div>
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
      )}
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
  if (moduleId === 'email_coach') {
    return !inputs.emailInputText?.trim();
  }
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
// Layout text labeling mapping helpers
function getModuleNumber(id: ModuleId): string {
  switch (id) {
    case 'email_coach': return '1';
    case 'soft_skills': return '2';
    case 'escalation': return '3';
    default: return '1';
  }
}

function renderGuidedToolExplanation(id: ModuleId) {
  let what = "";
  let when = "";
  let example = "";
  let expected = "";
  let tips = "";

  switch (id) {
    case 'email_coach':
      what = "Unified email assistant to compose, improve, reply, adjust tone (professional, empathetic, firm, apologetic), or generate comprehensive templates under standard regulatory compliance.";
      when = "When you need to interact with a client via email, handle complex stock/demat payouts, KYC verifications, account closures, or write critical compliance templates.";
      example = "My Demat payout of Rs 50,000 is delayed for 3 days. I want explanation immediately!";
      expected = "Detected input type, customer sentiment, and 4 refined variations of the email: a standard final draft, a short version, an empathetic version, and a professional version, along with detailed coaching points.";
      tips = "Select the task you wish to complete from the dropdown, or paste bullet details to generate a full-length draft email. Confirm compliance: check for profit guarantee avoidance.";
      break;
    case 'soft_skills':
      what = "Curated interactive reference of SEBI & depository compliant customer interaction alternatives for prompt support.";
      when = "When you need to look up standard compliant phrasing for payouts, refunds, KYC states, Demat onboardings, margins, RMS liquidations, and brokerage charges.";
      example = "Look up compliant alternatives to 'Wait for some time' or 'We auto-closed your positions'.";
      expected = "Approved and prohibited side-by-side comparison with detailed regulatory justifications for instant copy.";
      tips = "Use the search bar and category filters to locate vetted alternatives instantly. You can also test your planned draft in the sandbox evaluator!";
      break;
    case 'escalation':
      what = "Transforms hot tech crises into internal logistics tickets and customer delay updates simultaneously.";
      when = "When a major system crash, catalog lag, or server overload occurs, and stakeholders at all levels require instant updates.";
      example = "Database replication bottleneck causing blank customer configuration sync states.";
      expected = "A professional internal ticket note with detailed key parameters, a customer status update, and an executive summary.";
      tips = "Always specify the core technical bottleneck and state the next promised ETA to secure solid customer credibility.";
      break;
  }

  return (
    <div id={`guided-explanation-${id}`} className="bg-slate-50 border border-slate-200 p-4 rounded-sm text-left text-xs space-y-3 shadow-xs">
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-250">
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
    case 'email_coach': return 'Email Coach';
    case 'soft_skills': return 'Brokerage Phrase Library';
    case 'escalation': return 'Escalation Assistant';
    case 'email_improvement': return 'Communication Coach';
    case 'call_script': return 'Call Script Generator';
    case 'universal_coach': return 'Soft Skills Coach';
    default: return 'AI Support Coach';
  }
}

// Description labels
function getModuleDescription(id: ModuleId): string {
  switch (id) {
    case 'email_coach': return 'Draft, improve, reply, apologize, or generate comprehensive draft templates under standard regulatory compliance.';
    case 'soft_skills': return 'A curated interactive reference of SEBI & depository compliant customer interaction alternatives for prompt stock-trading and portfolio support.';
    case 'escalation': return 'Synthesize technical issues into elegant logs for internal senior desk teams AND customer updates simultaneously.';
    default: return 'Practice support scenarios and receive specialized real-time coaching feedback.';
  }
}
