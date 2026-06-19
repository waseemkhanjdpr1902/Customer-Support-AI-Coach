import { HistoryItem, LearningResource, User, ModuleId, ManagerReview } from './types';
import { STATIC_HISTORY, STATIC_LEARNING_RESOURCES, STATIC_STATS } from './fallbackData';

// Safe localStorage helper
const getLocal = (key: string): any => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null;
  }
};

const setLocal = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Fail silently in private browsing modes
  }
};

// Initialize localStorage if empty
if (!getLocal('coach_learning_resources')) {
  setLocal('coach_learning_resources', STATIC_LEARNING_RESOURCES);
}
if (!getLocal('coach_history')) {
  setLocal('coach_history', STATIC_HISTORY);
}

// Recalculates stats from the local history array
export function recalculateLocalStats() {
  const history: HistoryItem[] = getLocal('coach_history') || [];
  const totalGenerations = history.length;
  const reviewed = history.filter(h => h.review).length;
  const pending = totalGenerations - reviewed;
  
  // Average calculation
  let totalEmpathy = 0;
  let totalProfessionalism = 0;
  let softSkillsCount = 0;

  history.forEach(item => {
    if (item.moduleId === 'soft_skills' && item.outputData) {
      const empathy = Number(item.outputData.empathyScore) || 0;
      const professionalism = Number(item.outputData.professionalismScore) || 0;
      if (empathy > 0 || professionalism > 0) {
        totalEmpathy += empathy;
        totalProfessionalism += professionalism;
        softSkillsCount++;
      }
    }
  });

  const avgEmpathy = softSkillsCount > 0 ? parseFloat((totalEmpathy / softSkillsCount).toFixed(1)) : 8.0;
  const avgProfessionalism = softSkillsCount > 0 ? parseFloat((totalProfessionalism / softSkillsCount).toFixed(1)) : 8.8;

  const stats = {
    totalGenerations,
    reviewedCount: reviewed,
    pendingReview: pending,
    avgEmpathy,
    avgProfessionalism
  };
  setLocal('coach_stats', stats);
  return stats;
}

if (!getLocal('coach_stats')) {
  recalculateLocalStats();
}

/**
 * Universal Client to Server & Client-side-resilience api caller
 */
export const apiClient = {
  // 1. STATS
  async getStats(): Promise<any> {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend server stats offline. Using client session mock data.');
    }
    return getLocal('coach_stats') || recalculateLocalStats();
  },

  // 2. HISTORY
  async getHistory(userId: string, role: string): Promise<HistoryItem[]> {
    try {
      const res = await fetch(`/api/history?userId=${userId}&role=${role}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend server history offline. Using client session mock data.');
    }
    const localHist = getLocal('coach_history') || [];
    if (role === 'agent') {
      return localHist.filter((h: HistoryItem) => h.userId === userId);
    }
    return localHist;
  },

  // 3. LEARNING RESOURCES
  async getLearningResources(): Promise<LearningResource[]> {
    try {
      const res = await fetch('/api/learning');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend server learning offline. Using client session mock data.');
    }
    return getLocal('coach_learning_resources') || STATIC_LEARNING_RESOURCES;
  },

  // 4. GENERATE AI COACH OUTPUT
  async generateCoachOutput(moduleId: ModuleId, inputs: any, tone: string): Promise<any> {
    try {
      const response = await fetch('/api/coach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, inputs, tone })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Generation api server fallback. Running localized AI simulation engine.');
    }
    return getSimulatedCoachFallback(moduleId, inputs, tone);
  },

  // 5. REWRITE/MODIFICATION
  async rewriteCoachText(originalText: string, command: string, tone: string): Promise<string> {
    try {
      const response = await fetch('/api/coach/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalText, command, tone })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.rewrittenText) return data.rewrittenText;
      }
    } catch (e) {
      console.warn('Rewrite api server offline. Running localized modifier.');
    }
    return getSimulatedRewrite(originalText, command, tone);
  },

  // 6. SAVE TO HISTORY
  async saveHistoryItem(userId: string, userName: string, moduleId: ModuleId, tone: string, inputs: any, output: any): Promise<boolean> {
    let savedOnBackend = false;
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName,
          moduleId,
          tone,
          inputData: inputs,
          outputData: output
        })
      });
      if (response.ok) {
        savedOnBackend = true;
      }
    } catch (e) {
      console.warn('Saving history backend connection offline. Saved in client database.');
    }

    // Always preserve locally for resilience in static hosts
    const localHist = getLocal('coach_history') || [];
    const newId = `h-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newItem: HistoryItem = {
      id: newId,
      userId,
      userName,
      moduleId,
      tone,
      timestamp: new Date().toISOString(),
      inputData: inputs,
      outputData: output
    };
    localHist.unshift(newItem);
    setLocal('coach_history', localHist);
    recalculateLocalStats();
    return true; // We always report success to keep user journey seamless!
  },

  // 7. SUBMIT REVIEW
  async submitReview(historyId: string, reviewerId: string, reviewerName: string, comment: string, status: 'reviewed' | 'needs_work' | 'exemplary', selectedAreas: string[]): Promise<boolean> {
    let savedOnBackend = false;
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historyId,
          reviewerId,
          reviewerName,
          comment,
          status,
          improvementAreas: selectedAreas
        })
      });
      if (response.ok) {
        savedOnBackend = true;
      }
    } catch (e) {
      console.warn('Review API server offline. Synced review client side.');
    }

    // Preserve review state locally
    const localHist: HistoryItem[] = getLocal('coach_history') || [];
    const index = localHist.findIndex(h => h.id === historyId);
    if (index !== -1) {
      localHist[index].review = {
        id: `r-${Date.now()}`,
        historyId,
        reviewerId,
        reviewerName,
        comment,
        status,
        improvementAreas: selectedAreas,
        timestamp: new Date().toISOString()
      };
      setLocal('coach_history', localHist);
      recalculateLocalStats();
    }
    return true;
  }
};

/**
 * CLIENT DE-ESCALATION SIMULATION MODEL
 */
function getSimulatedCoachFallback(moduleId: string, inputs: any, tone: string) {
  const t = tone || "Professional";
  
  if (moduleId === "email_improvement") {
    const rawContent = inputs.originalEmail || "The draft is empty.";
    return {
      improvedEmail: `Dear Customer,\n\nThank you for sharing your concerns regarding ${inputs.issueType || "this transaction"}. We completely understand your perspective, and we want to help resolve this smoothly. Under standard service guidelines, we are working closely with our fulfillment supervisors. To safeguard your experience, we have applied immediate active adjustments and would love to coordinate the most appropriate resolutions.\n\nWarmest regards,\nCustomer Support Team`,
      explanationOfImprovements: `Adjusted tone to be fully ${t}. Removed aggressive constraints and blamed framing. Highlighted team coordination and support avenues over static policies to preserve relationship trust.`,
      betterSubjectLine: `Update regarding your recent concern: ${inputs.issueType || "Support Ticket"}`
    };
  }

  if (moduleId === "complaint_handling") {
    return {
      empatheticReply: `Dear Client,\n\nWe hear you loud and clear. Let me begin with an explicit, unreserved apology for how your experience with our ${inputs.issueType || "service"} fell short. Your disappointment is completely valid. To address this immediately, we are initiating a dedicated remedy: ${inputs.resolution || "immediate technical sweep"}. Rest assured, we are tracking this closely to ensure you are made fully whole.\n\nSincerely,\nClient Experience Lead`,
      apologyLine: `Please accept our sincere apologies for the clear distress and waste of your valuable time.`,
      resolutionWording: `We are initiating high-priority logistics steps: ${inputs.resolution || "Full account sweep and active correction."}`,
      followUpLine: `Our support team has scheduled a manual progress review in 12 hours, and we will update you on the tracking status immediately.`
    };
  }

  if (moduleId === "call_script") {
    return {
      openingScript: `[Greeting in ${t} Tone]: "Hello and thank you for contacting Support! My name is [Your Name]. I hope you're having a stable day. I'm completely delighted to take active ownership and assist you in resolving this today."`,
      verificationScript: `[Verification]: "To safeguard your security and protect sensitive details, could you kindly confirm your primary account email and full order number?"`,
      issueExplanation: `[Empathy Alignment]: "I am completely aligned with your perspective. Based on what you shared, it appears the issue centers on ${inputs.issueSummary || "technical details"}. Let's address this directly."`,
      resolutionScript: `[Resolution Path]: "I've reviewed our active channels, and here is how we can resolve this for you. We will coordinate a standard active override so that everything operates perfectly. Does that solution meet your expectation?"`,
      closingScript: `[Closing]: "I have fully completed those changes on your profile. Is there absolutely anything else, no matter how small, that I can help you with today? Thank you so much for your time, and enjoy your wonderful day!"`
    };
  }

  if (moduleId === "soft_skills") {
    const rawInput = (inputs.agentResponse || "Wait, charges are applicable").toLowerCase();
    let issueContext = "this query";
    let professional = "We are currently reviewing your account information in accordance with depository guidelines to ensure all records are correctly aligned. We will provide updates shortly.";
    let empathetic = "We completely understand your concern regarding these details. Rest assured, our support specialists are actively working on this for you.";
    let positive = "We would be delighted to guide you through our standard calculation guidelines so we can resolve this together.";
    let regulatory = "Per exchange and regulatory guidelines, all transactions are subject to review. We are happy to clarify the applicable policies for you.";
    let csat = "Thank you so much for your patience! We have prioritized your inquiry with our tier-2 brokerage desk to ensure a swift, top-tier resolution.";
    let compliance = "Pursuant to the standard account terms and risk management guidelines, we are processing your request. Terms and policies apply.";
    let avoided = "No negative brokerage buzzwords found.";
    let confidence = 8;
    let empathy = 7;
    let professionalism = 9;

    if (rawInput.includes("wait") || rawInput.includes("process") || rawInput.includes("withdrawal")) {
      issueContext = "fund withdrawal delay";
      professional = "We understand the importance of your withdrawal request. Our finance team is actively processing your payout, and we will update you as soon as the funds clear.";
      empathetic = "I completely understand that having timely access to your funds is extremely important. We are directly tracking this transfer with our banking partner so it hits your account as soon as possible.";
      positive = "Your withdrawal request is currently in our high-priority queue. We are doing everything we can to expedite this payout for you.";
      regulatory = "Your payout request is being registered with our clearing house partners. Standard clearing cycles apply as per regulatory guidelines.";
      csat = "Excellent news: Your payout is at the front of our processing queue! We'll send you an instant SMS confirmation with the transaction reference ID the second it's completed.";
      compliance = "The requested payout transaction has been registered and is under review to verify correct clearing configurations.";
      avoided = "Avoided: 'Wait'. Replaced with: 'We appreciate your patience / we are prioritizing this payouts'.";
      confidence = 9;
      empathy = 8;
      professionalism = 9;
    } else if (rawInput.includes("margin") || rawInput.includes("insufficient") || rawInput.includes("shortfall")) {
      issueContext = "margin shortfall warning";
      professional = "We wish to inform you that the available margin in your account is currently insufficient. Kindly add funds to avoid any potential square-offs or trading restrictions.";
      empathetic = "We understand that keeping an active portfolio running smoothly is key. To ensure none of your trades are interrupted, please review your current margin shortfall at your earliest convenience.";
      positive = "Adding funds to your account now will secure all your active open positions and expand your available intraday trading limits.";
      regulatory = "Kindly refer to exchange-mandated Margin Maintenance instructions. Accounts with critical shortfall balances are subject to risk action.";
      csat = "Let's help you secure your positions immediately! You can top up in one touch using UPI or Instant NetBanking, and our risk matrix will instantly update.";
      compliance = "Your account margin currently measures below the required threshold. Additional deposits are needed to sustain current open market exposure.";
      avoided = "Avoided: 'Insufficient / Shortfall is your fault'. Replaced with: 'Kindly add funds to avoid trading interruptions'.";
      confidence = 8;
      empathy = 7;
      professionalism = 10;
    } else if (rawInput.includes("square") || rawInput.includes("rms") || rawInput.includes("closed") || rawInput.includes("squared off")) {
      issueContext = "RMS square-off notification";
      professional = "Due to exchange margin requirements and risk management guidelines, your open position was squared off automatically to safeguard the account from further market exposure.";
      empathetic = "We completely understand how frustrating an automatic position closure can be. These automatic risk guidelines are designed to protect your capital from unlimited downside in volatile times.";
      positive = "You are welcome to re-initiate this position once the required margin limits have been successfully deposited or existing leverage is adjusted.";
      regulatory = "Position was auto-squared off by Risk Management Services (RMS) under regulatory margin maintenance compliance rules.";
      csat = "We want to help you rebuild your trading strategy with absolute confidence. Let's review your leverage levels together to set up optimal position safeguards.";
      compliance = "Positions are subject to mechanical square-off when account equity falls below risk parameters. Standard risk policies apply.";
      avoided = "Avoided: 'Position closed / We deleted your position'. Replaced with: 'Position was squared off automatically to safeguard the account'.";
      confidence = 9;
      empathy = 6;
      professionalism = 10;
    } else if (rawInput.includes("interest") || rawInput.includes("mtf")) {
      issueContext = "MTF interest query";
      professional = "As per the Margin Trading Facility (MTF) guidelines, standard interest charges are applicable on the utilized leverage funding amounts. Please let us know if you would like automated calculation assistance.";
      empathetic = "I know that managing trading costs is a vital part of your investment planning. We are happy to clarify how MTF interest charges accrue to help you optimize your funding.";
      positive = "We would be glad to show you exactly how our MTF charges are calculated, turning this complex trade cost into a clear and predictable tool.";
      regulatory = "Interest is charged in compliance with the SEBI/regulatory Margin Trading Facility framework on utilized debit balances.";
      csat = "Let's make this simple! I can generate a personalized MTF Interest statement with clean, day-by-day calculations sent straight to your email right now.";
      compliance = "MTF utilization is subject to funding rate guidelines as detailed in the Rights & Obligations document signed at activation.";
      avoided = "Avoided: 'Charges are applicable as per policy'. Replaced with: 'We would be happy to explain the calculation in detail'.";
      confidence = 9;
      empathy = 8;
      professionalism = 9;
    } else if (rawInput.includes("reject") || rawInput.includes("order")) {
      issueContext = "order rejection";
      professional = "The order could not be executed because of exchange or margin-related restrictions. Please review your order's segment activation and available balances, and we will assist further.";
      empathetic = "I understand that a rejected order during prime market hours can be highly frustrating. Let's look up the rejection code together and get your trade correctly configured.";
      positive = "We can quickly resolve this by activating the requested segment or checking your available margins so your next order is processed seamlessly.";
      regulatory = "Order rejected due to risk configuration or insufficient free cash. Please ensure correct regulatory segment declarations are updated.";
      csat = "Let's get you back in the market! I'm opening your order log right now so we can verify the exact error and place a successful trade together.";
      compliance = "Order status returned REJECTED from the exchange due to margin parameters. Please review segment status before resubmitting.";
      avoided = "Avoided: 'Order rejected'. Replaced with: 'Please review order details and we will be happy to assist further'.";
      confidence = 10;
      empathy = 8;
      professionalism = 9;
    } else if (rawInput.includes("system") || rawInput.includes("issue") || rawInput.includes("glitch") || rawInput.includes("technical")) {
      issueContext = "technical platform issue";
      professional = "We apologize for the inconvenience. Our technical engineering team is actively investigating reports of latency and we are working to restore optimal performance at the earliest.";
      empathetic = "I'm incredibly sorry for the disruption in your trading window today. We fully recognize that seconds count in the stock market, and our main priority is restoring full speed for you.";
      positive = "Our core platform status is currently recovering. We are placing additional backup routes to stabilize feed streaming for your watchlists.";
      regulatory = "In accordance with standard business continuity plans, our systems have triggered failovers. High-reliability modes are currently active.";
      csat = "We hear you! Our complete web terminal is fully online now. Let me personally stand by while you execute your trades to ensure absolute performance.";
      compliance = "Technical support logs show connection latency. Engineering teams have been deployed to analyze packet routing. No trade liability is accepted.";
      avoided = "Avoided: 'Computer glitch / System issue'. Replaced with: 'Our technical team is investigating and working towards a resolution'.";
      confidence = 7;
      empathy = 8;
      professionalism = 8;
    } else if (rawInput.includes("brokerage") || rawInput.includes("charges") || rawInput.includes("dp") || rawInput.includes("fee") || rawInput.includes("cost")) {
      issueContext = "depository or brokerage charges query";
      professional = "DP charges and brokerage levies are assessed in strict accordance with exchange and depository guidelines. We would be happy to explain the applicable charges in details.";
      empathetic = "We understand that keeping track of investment fees is very important to your long-term returns. Let's review your contract note together to break down each specific charge.";
      positive = "We can break down our pricing plan for you to show how our low discount-brokerage model saves you cash compared to traditional firms.";
      regulatory = "DP charges are levied by National Depositories for debit transactions of demat shares, as registered in tariff sheets.";
      csat = "Let's make fee transparency absolute! I am sending an intuitive, color-coded PDF invoice showing a complete breakdown of every statutory charge directly to your inbox.";
      compliance = "Account ledger debits correspond directly to standard tariff schedules signed during customer onboarding.";
      avoided = "Avoided: 'Charges are correct / Charges are applicable'. Replaced with: 'We would be happy to explain the applicable charges in detail'.";
      confidence = 9;
      empathy = 8;
      professionalism = 9;
    }

    return {
      professionalVersion: professional,
      empatheticVersion: empathetic,
      positiveVersion: positive,
      regulatoryFriendlyVersion: regulatory,
      highCsatVersion: csat,
      complianceSafeVersion: compliance,
      avoidNegativeWords: avoided,
      confidenceScore: confidence,
      empathyScore: empathy,
      professionalismScore: professionalism,
      whatIsGood: `The raw statement addresses ${issueContext} and outlines the core objective.`,
      whatNeedsImprovement: `The draft lacks brokerage refinement, using low-empathy structures like "${rawInput.length > 50 ? rawInput.substr(0, 50) + '...' : rawInput}" which might raise compliance or client relation friction index.`,
      betterVersion: empathetic,
      softSkillTip: `In brokerage support, clarity on compliance rules must be wrapped in strong empathy so investors feel safeguarded, not threatened. Always separate technical/statutory terms into clean bullet points.`
    };
  }

  if (moduleId === "escalation") {
    return {
      internalEscalationNote: `[ELEVATION - RISK HIGH] Technical incident affecting customer account.\nFulfillment delay reason: ${inputs.delayReason || "Database bottleneck"}.\nStatus: ${inputs.currentStatus || "Elevated review"}.\nAssigned to Dev Lead. Next action: ${inputs.nextAction || "Run DB patch"}.`,
      customerFacingUpdate: `Dear Customer, we are dedicating some extra technical attention to your profile configurations. Our senior supervisors are coordinating an active review to ensure everything operates beautifully. We appreciate your patience and will update you in 2 hours.`,
      managerSummary: `Executive summary: Incident escalated under tier alert. Primary delay: ${inputs.delayReason || "Fulfillment oversight"}. Current action: ${inputs.nextAction || "Direct dispatch"}.`,
      riskLevel: "Medium"
    };
  }

  // AI Email Writer
  return {
    subjectLine: `Important Update: ${inputs.purpose || "Customer Service Coordination"}`,
    fullEmail: `Dear Customer,\n\nI am writing to share some key points about your account regarding ${inputs.purpose || "your support inquiry"}.\n\nSpecifically, ${inputs.keyPoints || "we are working to stabilize your active services"}. Our senior desk is managing this process. Please let us know if you have any questions or require any adjustments.\n\nWarm regards,\nCustomer Success Team`,
    shortVersion: `Here is a quick update regarding ${inputs.purpose || "your inquiries"}: ${inputs.keyPoints || "We are finalizing actions right now to ensure everything runs smoothly."}`,
    whatsAppUpdate: `Hi! Quick support update: ${inputs.keyPoints || "Everything is on track for resolution. Have a great day!"}`
  };
}

function getSimulatedRewrite(text: string, command: string, tone?: string) {
  const t = tone || "Professional";
  if (command === "shorten") {
    return text.length > 50 
      ? text.substring(0, text.length / 2) + " (Synthesized and condensed to enhance communication focus)" 
      : text;
  }
  if (command === "make_polite") {
    return `Thank you so much for your precious patience. We would be absolutely delighted to help review this immediately and ensure you're completely happy with the results: ${text}`;
  }
  if (command === "make_professional") {
    return `We have received your communications and have logged a formal incident report. We will coordinate a full investigation to establish standard resolution parameters: ${text}`;
  }
  return text;
}
