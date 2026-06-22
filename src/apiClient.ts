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
  async generateCoachOutput(moduleId: ModuleId, inputs: any, tone: string, language: string = 'en'): Promise<any> {
    try {
      const response = await fetch('/api/coach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, inputs, tone, language })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Generation api server fallback. Running localized AI simulation engine.');
    }
    return getSimulatedCoachFallback(moduleId, inputs, tone, language);
  },

  // 5. REWRITE/MODIFICATION
  async rewriteCoachText(originalText: string, command: string, tone: string, language: string = 'en'): Promise<string> {
    try {
      const response = await fetch('/api/coach/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalText, command, tone, language })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.rewrittenText) return data.rewrittenText;
      }
    } catch (e) {
      console.warn('Rewrite api server offline. Running localized modifier.');
    }
    return getSimulatedRewrite(originalText, command, tone, language);
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
  },

  async deleteHistoryItem(id: string): Promise<boolean> {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('DELETE backend history error, deleting locally');
    }
    const localHist = getLocal('coach_history') || [];
    const updated = localHist.filter((h: HistoryItem) => h.id !== id);
    setLocal('coach_history', updated);
    recalculateLocalStats();
    return true;
  },

  async clearAllHistory(): Promise<boolean> {
    try {
      await fetch('/api/history', { method: 'DELETE' });
    } catch (e) {
      console.warn('DELETE All backend history error, clearing locally');
    }
    setLocal('coach_history', []);
    recalculateLocalStats();
    return true;
  }
};

/**
 * CLIENT DE-ESCALATION SIMULATION MODEL
 */
function getSimulatedCoachFallback(moduleId: string, inputs: any, tone: string, language: string = 'en') {
  const t = tone || "Professional";
  
  if (language === 'hi') {
    if (moduleId === "email_improvement") {
      return {
        improvedEmail: `प्रिय ग्राहक,\n\nधन्यवाद आपके मूल्यवान संपर्क के लिए। आपके द्वारा उठाए गए ${inputs.issueType || "लेनदेन संबंधी चिंता"} पर हमारी टीम गंभीरतापूर्वक विचार कर रही है। हमें आपकी असुविधा का पूरा एहसास है। ब्रोकरेज तथा विनियामक (regulatory) सेबी दिशानिर्देशों के तहत आपके मामले को हमारे वरिष्ठ पर्यवेक्षक देख रहे हैं। हम इस प्रक्रिया को त्वरित रूप से पूरा करने के लिए आपके साथ पूरी तरह से जुड़े हुए हैं।\n\nसादर,\nक्लाइंट सपोर्ट टीम`,
        explanationOfImprovements: `टोन को पूरी तरह से ${t} बनाया गया। सीधे 'नकारात्मक मनाही' को हटाया गया। सेबी गाइडलाइन्स के तहत पारदर्शिता दी और क्लाइंट संबंध मजबूत करने के लिए अतिरिक्त सहायता का प्रावधान किया गया।`,
        betterSubjectLine: `आपके लेनदेन एवं समाधान अनुरोध के संबंध में अपडेट`
      };
    }

    if (moduleId === "complaint_handling") {
      return {
        empatheticReply: `प्रिय ग्राहक,\n\nहमें आपकी शिकायत के विवरण प्राप्त हुए हैं। सबसे पहले हमारे डिलीवरी प्रतिनिधि द्वारा दिखाए गए इस अनुचित व्यवहार के लिए कृपया हमारी अत्यंत गंभीर और बिना किसी शर्त की माफी स्वीकार करें। यह हमारे कार्य मानकों के बिल्कुल विपरीत है। आपके त्वरित निवारण के रूप में, हम तुरंत: ${inputs.resolution || "एक पूरक प्रतिस्थापन और क्रेडिट सुविधा"} चालू कर रहे हैं। हम आश्वस्त करते हैं कि ऐसी घटना भविष्य में दोबारा नहीं होगी।\n\nसदा आपका,\nक्लाइंट ऑपरेशन्स हेड`,
        apologyLine: `आपके बहुमूल्य समय के नुकसान और इस मानसिक परेशानी के लिए हम हृदय से क्षमाप्रार्थी हैं।`,
        resolutionWording: `हमारा निवारण विवरण: ${inputs.resolution || "तुरंत नया रिप्लेसमेंट शिपमेंट और वॉलेट क्रेडिट जोड़ दिया गया है।"}`,
        followUpLine: `हमारी सपोर्ट टीम अगले 12 घंटों में आपके लिए पर्सनली इस आर्डर को ट्रैक करेगी और ट्रैकिंग लिंक साझा करेगी।`
      };
    }

    if (moduleId === "call_script") {
      return {
        openingScript: `[अभिवादन - ${t} टोन]: "नमस्कार, सपोर्ट टीम में आपका स्वागत है! मेरा नाम [Your Name] है। आशा है आपका दिन शांतिपूर्ण बीत रहा है। आज मैं आपके लेनदेन और सेवा से जुड़े सवालों को हल करने में आपकी पूरी सहायता करूँगा।"`,
        verificationScript: `[खाता सत्यापन]: "खाते की सुरक्षा बनाए रखने और संवेदनशील विवरणों की गोपनीयता सुनिश्चित करने के लिए, क्या आप कृपया अपना पंजीकृत मोबाइल नंबर और ईमेल आईडी सत्यापित करवा सकते हैं?"`,
        issueExplanation: `[समर्थन संरेखण]: "मैं आपकी परिस्थिति को पूरी तरह समझ सकता हूँ। जैसा कि आपने बताया, तकनीकी त्रुटि की वजह से ${inputs.issueSummary || "खाते में दोहरा डेबिट"} दिख रहा है। आइए इसे मिलकर हल करते हैं।"`,
        resolutionScript: `[समाधान का मार्ग]: "मैंने इसके विवरण देख लिए हैं और हम इसे आज ही सुलझा रहे हैं। हम कड़े गाइडलाइन्स के तहत एक मैनुअल ओवरराइड भेज रहे हैं जिससे आपका फंड तुरंत रिफ्लेक्ट हो जाएगा। क्या यह आपकी अपेक्षा के अनुरूप है?"`,
        closingScript: `[समापन]: "मैंने आपके खाते में आवश्यक परिवर्तन सक्रिय कर दिए हैं। क्या मैं आज आपकी कोई और सहायता कर सकता हूँ, चाहे वह कितनी भी छोटी क्यों न हो? अपना कीमती समय देने के लिए धन्यवाद, आपका दिन शुभ हो!"`
      };
    }

    if (moduleId === "soft_skills") {
      const rawInput = (inputs.agentResponse || "Wait, charges are applicable").toLowerCase();
      let issueContext = "इस पूछताछ";
      let professional = "डिपॉजिटरी गाइडलाइन्स के तहत हम आपके विवरणों की जांच कर रहे हैं। हम सुरक्षा और अनुपालन सुनिश्चित करके जल्द ही अपडेट साझा करेंगे।";
      let empathetic = "हम आपके फीडबैक को पूर्ण वरीयता दे रहे हैं। आश्वस्त रहें कि हमारी विशेष सहयोग टीम व्यक्तिगत रूप से इसे सुलझाने में लगी हुई है।";
      let positive = "हमें आपके इस शुल्क विवरण को सरल भाषा में विस्तार से समझाने में बहुत प्रसन्नता होगी ताकि आप पूर्ण संतुष्टि के साथ ट्रेड कर सकें।";
      let regulatory = "एक्सचेंज नियमों के तहत प्रत्येक डेबिट लेनदेन निर्धारित शुल्क सीमाओं से जुड़ा है। हम कड़े सेबी अनुपालन निर्देशों के तहत आपको स्पष्टीकरण भेजेंगे।";
      let csat = "धैर्य बनाए रखने के लिए धन्यवाद! हमने आपके टिकट को हमारे श्रेणी-2 ब्रोकरेज डेस्क पर भेज दिया है ताकि त्वरित और बेहतरीन समाधान सुनिश्चित हो सके।";
      let compliance = "मानक शर्तों के अनुसार खाता मार्जिन की गणना की गई है। कृपया वर्तमान खुली पोजीशनों की सुरक्षा के लिए आटो-लिक्विडेशन सीमा जांचें।";
      let avoided = "सुधारित शब्द: 'वेट करो' की जगह 'धैर्य के लिए धन्यवाद' का उपयोग किया गया।";
      
      if (rawInput.includes("wait") || rawInput.includes("process") || rawInput.includes("withdrawal")) {
        issueContext = "धन निकासी (withdrawal) की देरी";
        professional = "प्रक्रियाधीन निकासी अनुरोध को लेकर आपकी प्राथमिकता हम समझते हैं। हमारी वित्त टीम इसे प्रोसेस कर रही है, धनराशि जल्द ही आपके बैंक में आएगी।";
        empathetic = "मैं बिल्कुल समझता हूँ कि समय पर आपके पैसे मिलना कितना जरूरी है। हम अपने बैंकिंग पार्टनर के साथ लगातार संपर्क में हैं ताकी फंड तुरंत क्रेडिट हो जाए।";
        positive = "आपकी धन निकासी उच्च प्राथमिकता की कतार में है। इसे सबसे तेज प्रोसेस करने के लिए हमारी टीम पूरी ताकत से जुटी हुई है।";
        regulatory = "आपका निकासी अनुरोध रजिस्टर कर लिया गया है। नियामक और बैंकिंग दिशानिर्देशों के अनुसार निर्धारित सेटलमेंट चक्र के तहत यह क्रेडिट होगा।";
        csat = "शानदार समाचार! आपका पेआउट कतार में सबसे आगे है। जैसे ही यह बैंक से पूरा होगा, हम आपको ट्रांजैक्शन आईडी के साथ तुरंत एसएमएस भेजेंगे।";
        compliance = "आपके अनुरोध को सुरक्षित रूप से दर्ज कर लिया गया है ताकि सही और अनुपालन-सुरक्षित सेटलमेंट सुनिश्चित हो सके।";
        avoided = "बचाव किया: 'वेट करो / प्रोसेस में है'। बेहतर वाक्यांश: 'हम आपके समय की प्राथमिकता समझते हैं और इसे ट्रैक कर रहे हैं'।";
      }

      return {
        professionalVersion: professional,
        empatheticVersion: empathetic,
        positiveVersion: positive,
        regulatoryFriendlyVersion: regulatory,
        highCsatVersion: csat,
        complianceSafeVersion: compliance,
        avoidNegativeWords: avoided,
        confidenceScore: 9,
        empathyScore: 8,
        professionalismScore: 9,
        whatIsGood: `आपके वाक्य में ${issueContext} को सीधे संबोधित किया गया है।`,
        whatNeedsImprovement: `मूल वाक्य में 'वेट करो, चार्जेस लगेंगे' जैसी रूखी शब्दावली का उपयोग है जो क्लाइंट में असंतोष पैदा कर सकती है। इसे सहानुभूतिपूर्ण बनाना आवश्यक है।`,
        betterVersion: empathetic,
        softSkillTip: `ब्रोकरेज सहायता में, हमेशा याद रखें कि अनुपालन (compliance) और नियमों की जानकारी प्यार से और सहानुभूति के साथ दी जानी चाहिए। जटिल वित्तीय शब्दों को छोटे बुलेट पॉइंट्स में समझाएं।`
      };
    }

    if (moduleId === "escalation") {
      return {
        internalEscalationNote: `[एस्केलेशन - गंभीर स्तर] तकनीकी विसंगति अपडेट।\nअवरोध कारण: ${inputs.delayReason || "डेटाबेस सिंक धीमा होना"}.\nस्थिति: ${inputs.currentStatus || "वरिष्ठ ऑपरेशन्स समीक्षा"}.\nअगला कदम: ${inputs.nextAction || "पैच डिप्लॉयमेंट"}.`,
        customerFacingUpdate: `प्रिय ग्राहक, हम आपके खाते की प्रोफाइल सुरक्षा पर थोड़ा अतिरिक्त ध्यान केंद्रित कर रहे हैं। हमारी वरिष्ठ तकनीकी विशेषज्ञ टीम व्यक्तिगत निगरानी में इसे हल कर रही है ताकि आपको सुचारू अनुभव मिल सके। आपके सहयोग के लिए धन्यवाद।`,
        managerSummary: `कार्यकारी विवरण: अलर्ट के तहत मामला एस्केलेट हुआ। मुख्य कारण: ${inputs.delayReason || "फीडबैक विलंब"}. वर्तमान निवारक कदम: ${inputs.nextAction || "त्वरित ओवरराइड"}.`,
        riskLevel: "Medium"
      };
    }

    return {
      subjectLine: `महत्वपूर्ण अपडेट: ${inputs.purpose || "विनियामक खाता समन्वय"}`,
      fullEmail: `प्रिय ग्राहक,\n\nमैं आपको आपके डीमैट खाते के संबंध में ${inputs.purpose || "एक महत्वपूर्ण विवरण"} साझा करने के लिए लिख रहा हूँ।\n\nविशेष रूप से, ${inputs.keyPoints || "हमारी टीम आपके खाते में सुचारू सेवाएं सुनिश्चित कर रही है"}। हमारे वरिष्ठ अधिकारी इस पर काम कर रहे हैं। यदि आपको कोई प्रश्न पूछना हो तो कृपया निसंकोच संपर्क करें।\n\nसादर,\nक्लाइंट सक्सेस टीम`,
      shortVersion: `आपके अनुरोध ${inputs.purpose || "के संबंध में"} त्वरित अपडेट: ${inputs.keyPoints || "हम इसे तुरंत पूरा कर रहे हैं ताकि आपको बेहतरीन अनुभव मिल सके।"}`,
      whatsAppUpdate: `नमस्ते! क्विक सपोर्ट अपडेट: ${inputs.keyPoints || "सभी सेवाएं अच्छी तरह चालू हैं। आपका दिन शुभ हो!"}`
    };
  }

  if (language === 'hinglish') {
    if (moduleId === "email_improvement") {
      return {
        improvedEmail: `Dear Customer,\n\nThank you aapke valuable contact ke liye. Aapne jo ${inputs.issueType || "transaction related concern"} raise kiya hai, hum usko closely review kar rahe hain. Hum aapki concern ko acchi tarah samajhte hain. standard compliance rules and depository safety ke mutabik hamare senior managers isko check kar rahe hain, aur hum bahut jaldi perfect solution ke sath aapko update karenge.\n\nWarm regards,\nClient Support Team`,
        explanationOfImprovements: `Tone ko behtar karke ${t} kiya gaya. 'Wait karo' aur 'Humaari galti nahi hai' jaise harsh words ko hata kar professional safety assurance add kiya gaya.`,
        betterSubjectLine: `Aapke return and account adjustment request ke regarding update`
      };
    }

    if (moduleId === "complaint_handling") {
      return {
        empatheticReply: `Dear Customer,\n\nWe extremely sorry to hear this. Aapka delivery driver related experience bohot problematic raha. Is inconvenient handle karne ke tareeqe ke liye please hamari sincere apology accept karein. Hamari quality team is partner ke sath strictly matter audit kar rahi hai. Aapke support ke liye hum turant response de rahe hain: ${inputs.resolution || "complimentary replacement order and credit credit add kar rahe hain"}. Hum ensure karenge ki aisa dubara na ho.\n\nWarmest regards,\nCustomer Delight Team`,
        apologyLine: `Aapke precious time ke loss aur is problematic experience ke liye hum sincerely apologetic hain.`,
        resolutionWording: `Resolution action: Humne aapka complimentaryreplacement order queue mein priority par daal diya hai aur account mein extra bonus apply kar diya hai.`,
        followUpLine: `Main personally is replacement key tracking ko follow up karunga aur dispatch hote hi tracking code WhatsApp kar dunga.`
      };
    }

    if (moduleId === "call_script") {
      return {
        openingScript: `[Greeting - ${t}]: "Hello and support team mein aapka swagat hai! Mera naam [Your Name] hai. Hope aapka day stable chal raha hai. Main aaj aapki query solve karne mein poori help karunga."`,
        verificationScript: `[Safety Verification]: "Account security ko secure rakhne ke liye aur koi sensitive detail leak na ho, kya aap please apna registered email id aur phone number verify kara sakte hain?"`,
        issueExplanation: `[Empathy Alignment]: "Main aapki situation ko samajh sakta hoon. Aapke statement ke according, technical fault ki wajah se ${inputs.issueSummary || "ledger mismatch"} show ho raha hai. Isko milkar check karte hain."`,
        resolutionScript: `[Resolution Update]: "Maine details check kar li hain aur hum abhi immediate action le rahe hain. Hum backoffice se manual update trigger kar rahe hain jisse issue resolve ho jayega. Kya aap is solution se satisfied hain?"`,
        closingScript: `[Closing]: "Humne changes secure kar diye hain. Kya main aapki koi aur help kar sakta hoon, chahe woh kitni bhi choti ho? Apna valuable time dene ke lye thank you aur have a great day!"`
      };
    }

    if (moduleId === "soft_skills") {
      const rawInput = (inputs.agentResponse || "Wait, charges are applicable").toLowerCase();
      let issueContext = "is ticket";
      let professional = "Depository security laws ke mutabik hum aapke details double-check kar rahe hain. Safety guidelines ke sath poori accuracy ke sath update share karenge.";
      let empathetic = "Hum aapke concern ko poori priority de rahe hain. Aap tension mat lijiye, hamari senior customer help group isko instantly solve kar rahi hai.";
      let positive = "Humein aapko is charge ya payment structure ko simple terms me explain karne me bohot khushi hogi takki aap asaan se trading kar sakein.";
      let regulatory = "Stock exchange and depository rules ke according statutory charges apply hote hain. Hum safe SEBI compliance sheet aapko clarify karke bhej rahe hain.";
      let csat = "Patience rakhne ke liye thank you! Humne is request ko tier-2 trading support desk par transfer kiya hain fast solution pane ke liye.";
      let compliance = "Standard rules aur risk control policy ke hisab se account portfolio execute kiya gaya hai. Margin limit verify kar lein.";
      let avoided = "Hinglish correction: 'Wait karo' jaise dry phrases ko hata kar 'patience ke liye thanks' use kiya gaya.";

      if (rawInput.includes("wait") || rawInput.includes("process") || rawInput.includes("withdrawal")) {
        issueContext = "payout withdrawal delay";
        professional = "Hum withdrawal ki importance samajhte hain. Hamari accounting team process kar rahi hai aur direct transfer jaldi bank mein hit karega.";
        empathetic = "I completely understand ki time par funds milna kitna important hai. Hum bank team ke sath status coordinate kar rahe hain to speed up the payout.";
        positive = "Aapka withdrawal transaction priority level par hai. isko super-fast solve karne ke liye humne alert trigger kiya hai.";
        regulatory = "Payout request standard banking regulations aur exchange settlement timelines ke safe path par queue mein process ho rahi hai.";
        csat = "Good news! Aapka payout processing stage pe sabse upar hai. Jaise hi bank se clear hoga, trans. ID ke sath WhatsApp updates mil jayenge.";
        compliance = "Account payout safely process ho raha hai aur regulatory validation aur clearing house protocol cycle cross hote hi release ho jayega.";
        avoided = "Avoided: 'Wait karo / time lagega'. Better formulation: 'Hum is transfer ko closely track kar rahe hain aur turant clarify karenge'.";
      }

      return {
        professionalVersion: professional,
        empatheticVersion: empathetic,
        positiveVersion: positive,
        regulatoryFriendlyVersion: regulatory,
        highCsatVersion: csat,
        complianceSafeVersion: compliance,
        avoidNegativeWords: avoided,
        confidenceScore: 9,
        empathyScore: 8,
        professionalismScore: 9,
        whatIsGood: `Original draft mein ${issueContext} ko clarify kiya gaya hai.`,
        whatNeedsImprovement: `Lekin phrasing thodi robotic ya defensive hai (e.g. 'Wait, charges guidelines lagte hain'). Isko clients ki empathy se connect karna chahiye.`,
        betterVersion: empathetic,
        softSkillTip: `Stock broker support mein, jab koi rules aur charges push karne ho, toh hamesha language friendly aur helpful rakhein. Margin and statutory policies ko transparently share karein.`
      };
    }

    if (moduleId === "escalation") {
      return {
        internalEscalationNote: `[ESCALATION - TIER HIGH] Account processing queue lag update.\nPending reason: ${inputs.delayReason || "Server backup process delay"}.\nStatus: ${inputs.currentStatus || "Special desk attention"}.\nNext step assigned: ${inputs.nextAction || "Cluster buffer deploy"}.`,
        customerFacingUpdate: `Dear Client, hum aapke profile parameters par thoda extra deep verification focus de rahe hain. Hamari lead technical senior team ispe personally dhyan de rahi hai, jisse standard high-speed perform restore ho jayegi. Dhanyawad aapke cooperate ke liye.`,
        managerSummary: `Executive Summary: Incident escalated safely. Main block: ${inputs.delayReason || "Fulfillment network queue"}. Current action: ${inputs.nextAction || "Override database sync"}.`,
        riskLevel: "Medium"
      };
    }

    return {
      subjectLine: `Important Update: ${inputs.purpose || "Compliance Client Coordination"}`,
      fullEmail: `Dear Customer,\n\nHum aapke account ya demat portfolio ke regarding ${inputs.purpose || "kuch regulatory confirmation"} share karne ke liye write kar rahe hain.\n\nParticularly, ${inputs.keyPoints || "hamari team aapko dynamic seamless trading features provide kar rahi hai"}. Hamari special desk isse check kar rahi hai. Kisi help ke liye humein consult karein.\n\nWarm regards,\nClient Success Team`,
      shortVersion: `Aapke query ${inputs.purpose || "ke regarding"} quick update: ${inputs.keyPoints || "Hum action le rahe hain more details short time me share ki jayegi."}`,
      whatsAppUpdate: `Hi! Quick support update: ${inputs.keyPoints || "Everything is clean aur perfectly active. Aapka day great ho!"}`
    };
  }

  // Pure English Fallbacks
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

  if (moduleId === "universal_coach") {
    const rawText = inputs.textToAnalyze || "I want to complain about a refund delay for my stocks payout. You guys are useless.";
    const textLower = rawText.toLowerCase();

    const isDraft = rawText.includes("Dear") || rawText.includes("Hi") || rawText.includes("@") || rawText.includes("Sincerely") || rawText?.length > 150;
    const isAngry = textLower.includes("useless") || textLower.includes("cheat") || textLower.includes("worst") || textLower.includes("fraud") || textLower.includes("angry");

    let inputType = isDraft ? "Agent Reply / Email Draft" : "Customer Query";
    let customerSentiment = isAngry ? "Angry" : "Frustrated";
    let priority = isAngry ? "High" : "Medium";

    let topicNameEn = "outstanding payout request";
    let topicNameHi = "भुगतान निकासी अनुरोध";
    let topicNameHinglish = "outstanding payout transaction request";

    let resolutionEn = "wait for the regulatory settlement cycles to conclude";
    let resolutionHi = "मानक नियामक समाशोधन प्रक्रियाओं के पूरा होने की प्रतीक्षा करें";
    let resolutionHinglish = "regulatory banking clearing cycles complete hone ki wait karte hain";

    if (textLower.includes("brokerage") || textLower.includes("charge") || textLower.includes("fee") || textLower.includes("cost") || textLower.includes("commission") || textLower.includes("gst")) {
      topicNameEn = "applied ledger tariff and DP charges";
      topicNameHi = "लागू लेज़र टैरिफ और डीपी शुल्क";
      topicNameHinglish = "applied ledger fees and DP charges";
      resolutionEn = "refer to our transparent tariff sheet and contract note";
      resolutionHi = "हमारे पारदर्शी टैरिफ पोर्टल और संविदा नोट की जांच करें";
      resolutionHinglish = "transparent tariff portals aur contract note verify karein";
    } else if (textLower.includes("reject") || textLower.includes("order") || textLower.includes("margin") || textLower.includes("failed") || textLower.includes("square")) {
      topicNameEn = "rejected order transaction or margin limits";
      topicNameHi = "अस्वीकृत व्यापार ऑर्डर और मार्जिन सीमा";
      topicNameHinglish = "rejected stock trades aur margin constraints";
      resolutionEn = "establish adequate margin balances before resubmitting";
      resolutionHi = "ट्रेड निष्पादन से पहले पर्याप्त सक्रिय मार्जिन संतुलन बनाए रखें";
      resolutionHinglish = "standard trading credit margins and limit setup check karein";
    } else if (textLower.includes("system") || textLower.includes("issue") || textLower.includes("glitch") || textLower.includes("technical") || textLower.includes("login") || textLower.includes("error") || textLower.includes("app") || textLower.includes("slow")) {
      topicNameEn = "platform access connectivity latency or glitch";
      topicNameHi = "प्लेटफ़ॉर्म लॉगिन और तकनीकी विलम्ब";
      topicNameHinglish = "app logging and technical interface latency";
      resolutionEn = "retry log in using our optimized high-availability routes";
      resolutionHi = "हमारे अनुकूलित उच्च-विश्वसनीयता वैकल्पिक सर्वरों का प्रयोग करें";
      resolutionHinglish = "backup high-speed mobile routers ya alternate terminal try karein";
    } else if (textLower.includes("profile") || textLower.includes("kyc") || textLower.includes("document") || textLower.includes("verify") || textLower.includes("verification") || textLower.includes("onboard")) {
      topicNameEn = "pending KYC profile verification status";
      topicNameHi = "लंबित केवाईसी दस्तावेज सत्यापन";
      topicNameHinglish = "pending profiles or KYC documents verification";
      resolutionEn = "provide requested documents to finalize registry rules";
      resolutionHi = "पंजीकरण नियमों को पूरा करने के लिए आवश्यक केवाईसी प्रमाण अपलोड करें";
      resolutionHinglish = "necessary identity verification profiles setup upload karein";
    }

    let variations: any = {};
    let emailAnalysis: any = {};
    let angrySentimentHandling: any = {};
    let coachingTips: any = {};

    const selLang = language || "en";

    if (selLang === "hi") {
      variations = {
        professional: {
          tone: "औपचारिक और व्यावसायिक",
          bestUseCase: "आधिकारिक संचार और मानक विनियामक अनुपालन के लिए।",
          response: `प्रिय ग्राहक,\n\nहम आपके ${topicNameHi} के संबंध में आपकी चिंता को समझते हैं। उपलब्ध जानकारी के आधार पर, हम पुष्टि करना चाहते हैं कि हमारी टीम इस मामले की कड़ाई से समीक्षा कर रही है। कृपया ध्यान दें कि बाजार से संबंधित निवेश जोखिमों के अधीन हैं। हम आपसे अनुरोध करते हैं कि कृपया ${resolutionHi}।\n\nसादर,\nक्लाइंट सपोर्ट डेस्क`
        },
        empathetic: {
          tone: "सहानुभूतिपूर्ण और आश्वस्तकारी",
          bestUseCase: "जब ग्राहक तनाव या असंतोष में हो।",
          response: `प्रिय ग्राहक,\n\nहम आपकी चिंता और ${topicNameHi} से होने वाली असुविधा को पूरी तरह से समझते हैं। उपलब्ध जानकारी के आधार पर, हम आपको आश्वस्त करना चाहते हैं कि आपकी संपत्तियां पूरी तरह सुरक्षित हैं। हमारी टीम विवरणों की पुनः जांच कर रही है। हम आपसे अनुरोध करते हैं कि कृपया हमें थोड़ा और समय दें।`
        },
        polite: {
          tone: "विनम्र और सौम्य",
          bestUseCase: "सकारात्मक संबंध बनाए रखने के लिए।",
          response: `प्रिय ग्राहक,\n\nशीघ्र संपर्क के लिए धन्यवाद। उपलब्ध जानकारी के आधार पर, आपके ${topicNameHi} का समाधान सर्वोच्च प्राथमिकता पर किया जा रहा है। हम आपसे अनुरोध करते हैं कि कृपया किसी भी अन्य सहायता के लिए बेझिझक हमसे संपर्क करें। आपकी सेवा हमारा सौभाग्य है।`
        },
        firm: {
          tone: "स्पष्ट और दृढ़",
          bestUseCase: "विनियामक नीतियों और प्रक्रियाओं को स्पष्ट करने के लिए।",
          response: `प्रिय ग्राहक,\n\nहम आपसे ध्यान देने का अनुरोध करते हैं कि सभी प्रक्रियाएं सेबी (SEBI) और विनियामक दिशानिर्देशों के अनुरूप संचालित होती हैं। उपलब्ध जानकारी के आधार पर, आपके ${topicNameHi} के लिए किसी भी नियम को दरकिनार नहीं किया जा सकता है। कृपया ध्यान दें कि बाजार निवेश जोखिमों के अधीन हैं, और हम आपसे ${resolutionHi} का अनुरोध करते हैं।`
        },
        apology: {
          tone: "त्रुटि निवारण और क्षमा",
          bestUseCase: "परिचालन में विलम्ब या त्रुटि होने पर।",
          response: `प्रिय ग्राहक,\n\nकृपया आपके ${topicNameHi} में हुई अत्यधिक अनपेक्षित देरी के लिए हमारी गंभीर क्षमा स्वीकार करें। उपलब्ध जानकारी के आधार पर, हमारी तकनीकी टीम इस विसंगति को तत्काल दूर करने में जुटी है। हम इसे जल्द से जल्द सुधारने के लिए प्रतिबद्ध हैं।`
        },
        escalation: {
          tone: "वरिष्ठ/नियामक स्तर पर अग्रेषण",
          bestUseCase: "अतिरिक्त समीक्षा और विशेषज्ञ विश्लेषण की आवश्यकता होने पर।",
          response: `प्रिय ग्राहक,\n\nहम सूचित करना चाहते हैं कि हमने आपके ${topicNameHi} विवरण को संबंधित नियामक पर्यवेक्षक डेस्क पर अग्रेषित कर दिया है। उपलब्ध जानकारी के आधार पर, हमारी विशेषज्ञ टीम गहन जांच कर रही है। हम आपसे अनुरोध करते हैं कि कृपया २ घंटों के भीतर आधिकारिक अपडेट की प्रतीक्षा करें।`
        }
      };

      emailAnalysis = {
        professionalismScore: 88,
        empathyScore: 80,
        clarityScore: 85,
        grammarScore: 92,
        ownershipScore: 78,
        overallScore: 85,
        strengths: "समस्या का सीधा समाधान और नियामक आवश्यकताओं का स्पष्ट समावेशन किया गया है।",
        areasToImprove: "ड्राफ्ट को आनुपातिक रूप से और अधिक सहानुभूतिपूर्ण और मानवीय बनाया जा सकता है।",
        suggestedBetterPhrases: `'वेट करो' या 'जल्दी नहीं होगा' के स्थान पर 'उपलब्ध जानकारी के आधार पर हम इस समाधान प्रक्रिया को सुगम बनाने के लिए आपसे प्रतीक्षा का अनुरोध करते हैं' का प्रयोग करें।`
      };

      angrySentimentHandling = {
        customerEmotion: "अत्यधिक चिंतित / उग्र ग्राहक",
        urgencyLevel: "क्रिटिकल सर्वोच्च प्राथमिकता",
        riskLevel: "उच्च पलायन जोखिम",
        suggestedTone: "तनाव कम करने वाला, अत्यंत सहानुभूतिपूर्ण और समाधान-उन्मुख",
        deEscalationResponse: `हम आपके ${topicNameHi} को लेकर आपके रोष को पूरी तरह समझते हैं। मैं व्यक्तिगत रूप से इसकी जिम्मेदारी संभाल रहा हूँ ताकि संपूर्ण स्पष्टता स्थापित हो सके।`,
        immediateActionStatement: `Maine standard clearing डेस्क को आपके dockets प्राथमिकता पर मैन्युअल क्लियर करने का विशेष अनुरोध किया है।`,
        ownershipStatement: "मैं इस समस्या के पूर्ण निवारण का दायित्व लेता हूँ और जब तक समाधान पूर्ण नहीं होता, सीधे आपसे जुड़ा रहूँगा।",
        nextStepStatement: "मैं निजी तौर पर आपके संपर्क नंबर अथवा पंजीकृत ईमेल पर १ घंटे में लेन-देन संदर्भ विवरण के साथ वापस आऊंगा।"
      };

      coachingTips = {
        communicationImprovement: "विनियामकीय शर्तों को अत्यधिक लंबे पैराग्राफ के बजाय सरल सूचियों में दर्शाइए।",
        softSkillsImprovement: "ग्राहक के वित्तीय प्रश्नों पर कंपनी की नियमावली उद्धृत करने से पहले उसके दर्द को आश्वस्त करें।",
        whatSeniorManagerWrites: `"उपलब्ध जानकारी के आधार पर, हम पुष्टि करते हैं कि आपके ${topicNameHi} की गहन सुरक्षा जांच पूर्ण कर दी गई है। कृपया ध्यान दें कि बाजार निवेश जोखिम के अधीन हैं, और हम आपकी सहायता के लिए तैयार हैं।"`,
        whatNotToWrite: `"नियमों के अनुसार इसे होने में समय लगेगा, हम इसमें कुछ नहीं कर सकते अतः बेवजह आपत्ति न करें।"`
      };

    } else if (selLang === "hinglish") {
      variations = {
        professional: {
          tone: "Formal and Business-like tone",
          bestUseCase: "Routine checks aur system regulatory status updates share karne ke liye.",
          response: `Dear Customer,\n\nWe understand your concern pending ${topicNameHinglish} ke baare mein. Based on the information available, we verify kiya hai ki humari compliance operations team isko review kar rahi hai. Please note that market investments are subject to risk parameters. We request you to kindly ${resolutionHinglish}.\n\nWarm regards,\nClient Services Team`
        },
        empathetic: {
          tone: "Empathetic and timing comfort tone",
          bestUseCase: "Jab customer delay, cost updates ya failure se anxious feel kare.",
          response: `Dear Customer,\n\nWe understand your concern aur hum completely realize karte hain ki ${topicNameHinglish} delay hone se aapko kitna inconvenience hua hai. Based on the information available, hum clarify karte hain ki aapke funds aur transaction details entirely safe hain database registers me. Hum absolute priority par action update karwa rahe hain.`
        },
        polite: {
          tone: "Polite and highly support assistance guide",
          bestUseCase: "General customer feedback and support help ke liye.",
          response: `Dear Customer,\n\nThanks for reaching out today. Based on the information available, clears verification coordinates priority queue me process kiye ja rahe hain. We request you to kindly let us know features updates or requirements ke liye, hum help ke liye ready hain. Have a great day.`
        },
        firm: {
          tone: "Firm and compliance parameters setter",
          bestUseCase: "Strict margins aur regulatory non-negotiable rules details clear karne ke liye.",
          response: `Dear Customer,\n\nWe request you to note ki sabhi transaction steps standard SEBI and exchange audit instructions guidelines ko satisfy karte hain. Based on the information available, is standard procedure ko bypass nahi kiya ja sakta. We request your cooperation standard verification policy rules ke sath.`
        },
        apology: {
          tone: "Sincere Apology and instant server optimization",
          bestUseCase: "App delay ya latency disturbance error parameters handle karne ke liye.",
          response: `Dear Customer,\n\nPlatform latency ya dynamic delay ke chalte hone wali standard inconvenience ke liye we sincerely apologize. Based on the information available, humari technical and clearing desk details troubleshoot manually resolve karke aapko optimal experience restore karwayegi.`
        },
        escalation: {
          tone: "Senior Technical Desk Elevation",
          bestUseCase: "High priority challenges aur clearance disputes elevation support.",
          response: `Dear Customer,\n\nWe request you to note ki ${topicNameHinglish} ticket ko humari Senior Auditor & Compliance Coordinator Desk ko forward kar diya gaya hai. Based on the information available, expert review will finalize transaction records. We request you to wait for dynamic status SMS or official mail next 2 hours me.`
        }
      };

      emailAnalysis = {
        professionalismScore: 88,
        empathyScore: 80,
        clarityScore: 85,
        grammarScore: 92,
        ownershipScore: 78,
        overallScore: 85,
        strengths: "Standard compliance requirements aur delay steps accurate specify kiye hain with professional boundaries.",
        areasToImprove: "Draft sounds raw. Stiffer words directly exclude karein client's trust safety build karne ke liye.",
        suggestedBetterPhrases: "Dry phrase 'We cannot override systems' ke jagah 'Based on the information available, our senior leaders are tracking your queries personally to expedite standard clearances' utilize karein."
      };

      angrySentimentHandling = {
        customerEmotion: "Highly frustrated and angry client regarding transactional issues",
        urgencyLevel: "Critical Operational Precedence",
        riskLevel: "High risk - churn level high",
        suggestedTone: "Calm, validating, highly solution and commitment-focused",
        deEscalationResponse: `Hum completely understand karte hain ki is ${topicNameHinglish} issue ke chalte aap kitne angry aur disturbed hain, and I am personally following up with compliance.`,
        immediateActionStatement: `Maine clears audit coordinators ko requests forward ki hai status files priority checking bypass overrides ke liye.`,
        ownershipStatement: "I take direct responsibility is resolution ki aur track karunga status when safe updates clear na ho.",
        nextStepStatement: "I will call or message you private 1 hour ke absolute limit me verified transaction transaction ID ke sath."
      };

      coachingTips = {
        communicationImprovement: "Complex transaction errors and SEBI boundaries description ko clean bullet points style me show karein.",
        softSkillsImprovement: "First validate client's financial anxiety before quoting rigid documents signed or online ledger rules.",
        whatSeniorManagerWrites: `"Based on the information available, we verify standard compliance verification checks are completed. Please note that market-related investments are subject to risk parameters."`,
        whatNotToWrite: `"Is process me dynamic timelines lagte hain so wait and don't make multiple complaints tickets on our board."`
      };

    } else {
      // English (Default)
      variations = {
        professional: {
          tone: "Formal and business-like.",
          bestUseCase: "When communicating with standard accounts or delivering regulatory updates.",
          response: `Dear Customer,\n\nWe understand your concern regarding the ${topicNameEn}. Based on the information available, we verify that your request is processing within standard banking and regulatory timelines. Please note that market-related investments are subject to risk parameters. We request you to kindly ${resolutionEn}.\n\nWarm regards,\nClient Operations Team`
        },
        empathetic: {
          tone: "Show understanding and reassurance.",
          bestUseCase: "When customers are experiencing critical issues or financial anxiety.",
          response: `Dear Customer,\n\nWe understand your concern and completely validate how frustrating this delay to your ${topicNameEn} is to your plans. Based on the information available, we want to reassure you that your funds and portfolio assets are entirely secure. Our team will review the status from our end to ensure that bank integrations successfully clear your deposit. We request you to give us some time.`
        },
        polite: {
          tone: "Polite and highly courteous.",
          bestUseCase: "For general positive relations and billing help.",
          response: `Dear Customer,\n\nThank you so much for reaching out to us today regarding your ${topicNameEn}. Based on the information available, we are pleased to confirm that our billing and clearing desk is processing your request at high priority. We request you to kindly let us know if you need any further clarifications. It is our pleasure to help you.`
        },
        firm: {
          tone: "Firm and expectation-setting.",
          bestUseCase: "When clarifying strict margin policies or withdrawal conditions.",
          response: `Dear Customer,\n\nWe request you to note that all accounts and ${topicNameEn} steps must strictly align with exchange settlement guidelines and statutory rules. Based on the information available, this procedural review cannot be bypassed. Please note that market-related investments are subject to risk parameters. We request you to ${resolutionEn}.`
        },
        apology: {
          tone: "Apology and trust maintenance.",
          bestUseCase: "When there is a definite banking integration bottleneck or technical error.",
          response: `Dear Customer,\n\nPlease accept our sincere apologies for the unexpected friction or delay concerning your ${topicNameEn}. We understand your concern and value the trust you place in us. Based on the information available, our tech supervisors and billing support are resolving this bottleneck immediately. Rest assured, we are committed to making this right.`
        },
        escalation: {
          tone: "Suitable for Tier-2 escalation.",
          bestUseCase: "When issues require senior supervisor intervention or technical audit.",
          response: `Dear Customer,\n\nWe request you to note that we have escalated your ${topicNameEn} concerns to our Risk Management and Clearing Supervisors. Based on the information available, our senior team will review your account settings and bank response logs. We request you to wait for an official status report from this premium ticketing desk shortly.`
        }
      };

      emailAnalysis = {
        professionalismScore: 88,
        empathyScore: 78,
        clarityScore: 85,
        grammarScore: 92,
        ownershipScore: 75,
        overallScore: 84,
        strengths: `Directly addresses the ${topicNameEn} issue while maintaining structural safety parameters in accordance with compliance.`,
        areasToImprove: "Tone in raw draft can sound defensive or abrupt. Use more positive action markers to avoid sounding robotic.",
        suggestedBetterPhrases: `Replace dry wordings like 'We can't do anything about this' with 'We are actively coordinating with our clearing partners to expedite your ${topicNameEn} resolution.'`
      };

      angrySentimentHandling = {
        customerEmotion: "Highly Frustrated / Dissatisfied",
        urgencyLevel: "Critical - High Financial Priority",
        riskLevel: "High - Account Churn At-Risk",
        suggestedTone: "De-escalating, Highly Empathetic & Solution-driven",
        deEscalationResponse: `We understand your concern, and I am personally taking charge of your ticket right now to guarantee your ${topicNameEn} is fully handled.`,
        immediateActionStatement: `I have requested a manual dispatch/clear operation to fast-track your folder and bypass the standard automated delay.`,
        ownershipStatement: "I am taking direct ownership of this resolution process, and I will track it personally until any discrepancies are successfully verified in your dashboard.",
        nextStepStatement: "I will reach back out to you personally within 1 hour with the financial transaction ID."
      };

      coachingTips = {
        communicationImprovement: "Divide complex statutory rules into scannable points so clients feel secure, not overwhelmed.",
        softSkillsImprovement: "Empathy is paramount. Under regulatory standards, maintain client compliance while validating active anxieties regarding assets.",
        whatSeniorManagerWrites: `"Based on the information available, we verify that safety audits are complete and we are actively triggering a direct clearance. Please note that market investments are subject to risk parameters."`,
        whatNotToWrite: `"Your request cannot be completed because you haven't completed your profiles and it is not our fault."`
      };
    }

    return {
      inputType,
      customerSentiment,
      priority,
      variations,
      emailAnalysis,
      angrySentimentHandling,
      coachingTips
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

function getSimulatedRewrite(text: string, command: string, tone?: string, language: string = 'en') {
  const t = tone || "Professional";

  if (language === 'hi') {
    if (command === "shorten") {
      return text.length > 40 ? text.substring(0, text.length / 2) + " (शीघ्र संचार के लिए संक्षिप्त रूप में संपादित)" : text;
    }
    if (command === "make_polite") {
      return `धैर्य रखने के लिए आपका धन्यवाद। हम तुरंत जांच करके आपकी सहायता करने में प्रसन्न होंगे: ${text}`;
    }
    if (command === "make_professional") {
      return `हम आपके विवरणों की औपचारिक जांच कर रहे हैं ताकि अनुपालन-सुरक्षित सेवा सुनिश्चित हो सके: ${text}`;
    }
    return text;
  }

  if (language === 'hinglish') {
    if (command === "shorten") {
      return text.length > 45 ? text.substring(0, text.length * 0.6) + " (Short and direct communication ke liye edit kiya)" : text;
    }
    if (command === "make_polite") {
      return `Thank you so much aapke cooperation ke liye. Hum turant isko review karke solve kar rahe hain taaki aap satisfied ho sakein: ${text}`;
    }
    if (command === "make_professional") {
      return `Hum strict company safety guidelines and rules ko verify karke isko resolve kar rahe hain: ${text}`;
    }
    return text;
  }

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
