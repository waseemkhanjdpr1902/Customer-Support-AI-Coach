// UI labels and resources translated into English, Hindi (हिन्दी), and Hinglish

export type AppLanguage = 'en' | 'hi' | 'hinglish';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    hi: string;
    hinglish: string;
  };
}

export const UI_TRANSLATIONS: TranslationDictionary = {
  // Navigation & Headers
  home: {
    en: "Home",
    hi: "मुख्य पृष्ठ",
    hinglish: "Home Screen"
  },
  tools: {
    en: "Practice Playgrounds",
    hi: "अभ्यास प्लेग्राउंड्स",
    hinglish: "Practice Playgrounds"
  },
  learning: {
    en: "Learning Center",
    hi: "शिक्षण केंद्र",
    hinglish: "Learning Center"
  },
  phrase_bank: {
    en: "Phrase Library",
    hi: "वाक्यांश लाइब्रेरी",
    hinglish: "Phrase Bank"
  },
  tips: {
    en: "Communication Tips",
    hi: "संचार टिप्स",
    hinglish: "Communication Tips"
  },
  review: {
    en: "Manager Audits",
    hi: "प्रबंधक ऑडिट",
    hinglish: "Manager Audits"
  },
  sandbox_status: {
    en: "Sandbox Training Active",
    hi: "सैंडबॉक्स प्रशिक्षण सक्रिय है",
    hinglish: "Sandbox Training Active"
  },

  // Titles & Subtitles
  learning_title: {
    en: "Team Knowledge & Learning Center",
    hi: "टीम ज्ञान एवं शिक्षण केंद्र",
    hinglish: "Team Knowledge & Learning Center (Seekhein aur Behtar Karein)"
  },
  learning_desc: {
    en: "Access high-impact templates, de-escalation checklists, verbal phone frameworks, and our positive phrase bank.",
    hi: "उच्च-प्रभाव वाले ईमेल टेम्पलेट्स, डी-एस्केलेशन चेकलिस्ट, फोन के तरीके और हमारी सकारात्मक वाक्यांश बैंक देखें।",
    hinglish: "High-impact email templates, de-escalation checklists, phone handbooks aur positive phrase bank access karein."
  },
  all_resources: {
    en: "All Resources",
    hi: "सभी शिक्षण सामग्री",
    hinglish: "All Resources"
  },
  phrase_bank_tab: {
    en: "Positive Phrase Bank",
    hi: "सकारात्मक वाक्यांश बैंक",
    hinglish: "Positive Phrase Bank (Achhi Phrasing)"
  },
  email_tab: {
    en: "Email Phrasing",
    hi: "ईमेल वाक्यांश",
    hinglish: "Email Phrasing"
  },
  complaint_tab: {
    en: "Complaint Checklists",
    hi: "शिकायत चेकलिस्ट",
    hinglish: "Complaint Checklists"
  },
  phone_tab: {
    en: "Phone Handbooks",
    hi: "फ़ोन हैंडबुक",
    hinglish: "Phone Handbooks (Call Scripts)"
  },
  escalation_tab: {
    en: "Incident Escalation",
    hi: "घटना एस्केलेशन",
    hinglish: "Incident Escalation Tips"
  },

  // Common UI actions
  search_phrases_placeholder: {
    en: "Search 120+ specialized phrases...",
    hi: "120+ विशेष वाक्यांश खोजें...",
    hinglish: "125+ customer handling phrases search karein..."
  },
  all_segments: {
    en: "All Segments",
    hi: "सभी श्रेणियां",
    hinglish: "All Segments"
  },
  phrases_count: {
    en: "Phrases Available",
    hi: "वाक्यांश उपलब्ध",
    hinglish: "Phrases Available"
  },
  no_matching_phrases: {
    en: "No matching phrases found. Try adjusting your query.",
    hi: "कोई मेल खाने वाला वाक्यांश नहीं मिला। कृपया पुनः प्रयास करें।",
    hinglish: "Koi phrase nahi mila. Dusra keyword try karein."
  },
  copied: {
    en: "Copied",
    hi: "कॉपी किया",
    hinglish: "Copy Ho Gaya"
  },
  copy: {
    en: "Copy",
    hi: "कॉपी करें",
    hinglish: "Copy Karein"
  },
  draft_to_avoid: {
    en: "Draft (To avoid):",
    hi: "कमजोर वाक्यांश (इससे बचें):",
    hinglish: "Avoid Phrasing (Avoid karein):"
  },
  coached_recommended: {
    en: "Coached (Recommended):",
    hi: "सुधारित वाक्यांश (अनुशंसित):",
    hinglish: "Coached Version (Aise bole):"
  },
  tip: {
    en: "Tip:",
    hi: "टिप:",
    hinglish: "Tip:"
  },
  quick_tip_title: {
    en: "Active Empathy Calibration",
    hi: "सक्रिय सहानुभूति अंशांकन",
    hinglish: "Active Empathy Training"
  },
  quick_tip_body: {
    en: "Coaching parameters operate best under a growth mindset model. When practice runs generate lower Empathy scores (e.g. 2/10), do not panic! Use the Modifier Actions in the output workspace to instantly shorten, reformat, or make drafts more polite with a single click.",
    hi: "कोचिंग पैरामीटर विकास की मानसिकता के तहत सबसे अच्छा काम करते हैं। यदि सहानुभूति स्कोर कम आता है (जैसे 2/10), तो घबराएं नहीं! हमारे संशोधक बटनों का उपयोग करके तुरंत टेक्स्ट को छोटा, विनम्र या अधिक स्पष्ट बना सकते हैं।",
    hinglish: "Agar practice run mein Empathy Score kam (jaise 2/10) aaye, toh ghabraiye mat! Content ko polite, short ya tone change karne ke liye single-click Modifier Actions ka use karein."
  },

  // Interactive Coach Tool labels
  coach_headline: {
    en: "Interactive AI Coaching Studio",
    hi: "इंटरैक्टिव एआई कोचिंग स्टूडियो",
    hinglish: "Interactive AI Coaching Studio"
  },
  coach_desc: {
    en: "Choose a support channel module, select standard templates or insert customer scenarios, specify desired tone, and run the real-time AI de-escalation engine.",
    hi: "एक ग्राहक सहायता चैनल चुनें, मानक परिदृश्य दर्ज करें, अपनी इच्छित टोन स्पष्ट करें, और वास्तविक समय एइआर-एस्केलेशन इंजन चलाएं।",
    hinglish: "Apna complaint module choose karein, user details fill karein, perfect tone select karke AI Coaching run karein."
  },
  back_to_playgrounds: {
    en: "← Back to Practice Playgrounds",
    hi: "← मुख्य अभ्यास कार्यशाला पर वापस जाएं",
    hinglish: "← Back to Practice Playgrounds"
  },
  select_tone: {
    en: "Select Target Communication Tone Structure",
    hi: "लक्षित संचार टोन संरचना का चयन करें",
    hinglish: "Sahi Tone select karein"
  },
  run_coach: {
    en: "Run Real-time AI Support Coach",
    hi: "वास्तविक समय एआई सहायता कोच चलाएं",
    hinglish: "Run AI support Coach"
  },
  coaching_active: {
    en: "Coordinating with AI Engine...",
    hi: "एआई इंजन के साथ समन्वय हो रहा है...",
    hinglish: "AI Engine se communicate ho raha hai..."
  },
  coaching_insights: {
    en: "AI Coaching Feedback & Insights Workspace",
    hi: "एआई कोचिंग फीडबैक और अंतर्दृष्टि कार्यक्षेत्र",
    hinglish: "AI Coaching Feedback & Insights"
  },
  coaching_insights_desc: {
    en: "Review optimized support versions, metrics analysis, core rules checks, and instant rewrite modifiers below.",
    hi: "नीचे अनुकूलित सहायता संस्करण, मीट्रिक विश्लेषण, मुख्य नियम जांच और तत्काल पुनर्लेखन संशोधक देखें।",
    hinglish: "Rewritten drafts, metrics analysis aur instant modifiers neeche check karein."
  },
  empathy_score: {
    en: "Empathy Calibration",
    hi: "सहानुभूति अंशांकन",
    hinglish: "Empathy Score"
  },
  professionalism_score: {
    en: "Professional Tone Audit",
    hi: "व्यावसायिक टोन ऑडिट",
    hinglish: "Professionalism Score"
  },
  regulatory_score: {
    en: "Regulatory Compliance Risk Check",
    hi: "नियामक अनुपालन जोखिम जांच",
    hinglish: "Compliance & Safety"
  },
  compliance_checked: {
    en: "SEBI Compliance Certified",
    hi: "सेबी अनुपालन प्रमाणित",
    hinglish: "SEBI Compliance Certified"
  },
  coaching_observations: {
    en: "Coaching Observations & Feedback",
    hi: "कोचिंग अवलोकन और प्रतिक्रिया",
    hinglish: "Coaching Observations & Feedback"
  },
  what_is_great: {
    en: "What was handled nicely",
    hi: "क्या बात अच्छी तरह से संभाली गई",
    hinglish: "Aapke draft ki achhi baatein"
  },
  what_to_improve: {
    en: "Opportunities for improvement",
    hi: "सुधार के लिए संभावित क्षेत्र",
    hinglish: "Kahan behtar kiya ja sakta hai"
  },
  active_learning_badge: {
    en: "Standard Policy Approved",
    hi: "मानक नीति स्वीकृत",
    hinglish: "Standard Policy Approved"
  },
  save_to_performance: {
    en: "Save Practice Session to Performance History Log",
    hi: "अभ्यास सत्र को प्रदर्शन इतिहास लॉग में सहेजें",
    hinglish: "Session ko Performance History mein save karein"
  },
  modifier_actions: {
    en: "Interactive Post-Generation Modifier Actions",
    hi: "इंटरैक्टिव पोस्ट-जेनरेशन संशोधक क्रियाएं",
    hinglish: "Instant Text Modifier Shortcuts"
  },
  modifier_desc: {
    en: "Need further modifications? Use these direct actions to rebuild the output based on quick performance guidelines.",
    hi: "क्या आप और बदलाव चाहते हैं? त्वरित प्रदर्शन दिशानिर्देशों के आधार पर परिणाम को फिर से तैयार करने के लिए सीधे इन कमांड्स का उपयोग करें।",
    hinglish: "Kuch aur edits chahiye? Dynamic updates ke liye in standard shortcuts ka use karein:"
  },
  modifier_shorten: {
    en: "Make Extremely Concise",
    hi: "संक्षिप्त और छोटा बनाएं",
    hinglish: "Chota / Short Karein"
  },
  modifier_polite: {
    en: "Inject Warmth & Politeness",
    hi: "अधिक विनम्रता और आत्मीयता जोड़ें",
    hinglish: "Polite & Warm bnaein"
  },
  modifier_simple: {
    en: "Simplify Financial Jargon",
    hi: "वित्तीय तकनीकी शब्दों को सरल बनाएं",
    hinglish: "Simple Words (No Jargon)"
  },
  modifier_professional: {
    en: "Boost Corporate Formal Tone",
    hi: "कॉर्पोरेट औपचारिक टोन बढ़ाएं",
    hinglish: "Professional Tone Boost"
  }
};

// Map of standard positive brokerage phrases to their Hindi and Hinglish counterparts
interface PhraseTranslation {
  hi: string;
  hinglish: string;
}

export const PHRASE_TRANSLATIONS: Record<string, PhraseTranslation> = {
  "Thank you for your patience.": {
    hi: "आपके धैर्य के लिए बहुत-बहुत धन्यवाद।",
    hinglish: "Aapke patience ke liye bahut-bahut thank you."
  },
  "Here are the available alternatives.": {
    hi: "यहाँ उपलब्ध वैकल्पिक उपाय दिए गए हैं।",
    hinglish: "Yeh rahe aapke liye available options/alternatives."
  },
  "We understand your concern and are reviewing the matter.": {
    hi: "हम आपकी चिंता को समझते हैं और इस मामले की पूरी समीक्षा कर रहे हैं।",
    hinglish: "Hum aapki concern samajhte hain aur is matter ko closely review kar rahe hain."
  },
  "Our technical team is working towards resolution.": {
    hi: "हमारी तकनीकी टीम इस समस्या के समाधान के लिए तत्परता से काम कर रही है।",
    hinglish: "Hamari technical team issue ko jald se jald solve karne ke liye kaam kar rahi hai."
  },
  "Charges are levied as per exchange and depository guidelines.": {
    hi: "शुल्क एक्सचेंज और डिपॉजिटरी (CDSL/NSDL) के कड़े नियमों के अनुसार ही लगाए जाते हैं।",
    hinglish: "Charges exchange aur depository guidelines ke rules ke mutabik hi lagaye jaate hain."
  },
  "Position was squared off as per risk management policy.": {
    hi: "आपदा नियंत्रण और जोखिम प्रबंधन नीति के अनुसार पोजीशन को स्क्वायर-ऑफ किया गया था।",
    hinglish: "Risk management policy ke safety rules ke mutabik trading position ko square-off kiya gaya tha."
  },
  "We are happy to assist in executing your trade. Please review your order parameters before confirming.": {
    hi: "हम आपका ट्रेड पूरा करने में खुश हैं। कृपया सबमिट करने से पहले अपने ऑर्डर के विवरण की दोबारा जांच कर लें।",
    hinglish: "Hum aapka trade execute karne ke liye ready hain. Please double check karne ke baad hi order confirm karein."
  },
  "The order is verified with the exchange and is currently pending fulfillment.": {
    hi: "एक्सचेंज द्वारा आपके आर्डर को सत्यापित कर लिया गया है और यह वर्तमान में निष्पादन के लिए लंबित है।",
    hinglish: "Aapka order exchange se verify ho gaya hai aur abhi execution ke liye pending hai."
  },
  "Let's review your order log to verify the exact price execution details.": {
    hi: "ट्रेड से जुड़े मूल्य निष्पादन के सटीक विवरण की जांच के लिए आइए आपके आर्डर लॉग की समीक्षा करें।",
    hinglish: "Sahi price execution check karne ke liye aaiye aapka order log ek baar check kar lete hain."
  },
  "To modify your price trigger, you can update the open limit order directly from your order book.": {
    hi: "अपने प्राइस ट्रिगर को बदलने के लिए आप सीधे अपनी आर्डर बुक से लंबित लिमिट आर्डर को संशोधित कर सकते हैं।",
    hinglish: "Price trigger change karne ke liye aap order book se open limit order ko directly modify kar sakte hain."
  },
  "We are investigating the execution latency on this contract note with our clearing desk.": {
    hi: "हम अपने क्लियरिंग डेस्क के साथ इस कॉन्ट्रैक्ट नोट पर आई थोड़ी देरी के कारणों की जांच कर रहे हैं।",
    hinglish: "Hum clearing desk ke sath is contract note ke transaction delay ko verify kar rahe hain."
  },
  "Would you like to review our brokerage slabs for equity delivery transactions?": {
    hi: "क्या आप इक्विटी डिलीवरी लेनदेन के लिए हमारे ब्रोकरेज स्लैब की समीक्षा करना चाहेंगे?",
    hinglish: "Kya aap equity delivery transactions ke brokerage slabs check karna chahenge?"
  },
  "Positions are monitored in real-time by our Risk Management Services to safeguard account equity.": {
    hi: "खाते की सुरक्षा के लिए हमारी जोखिम प्रबंधन टीम (RMS) वास्तविक समय में सभी खुली पोजीशनों की निगरानी करती है।",
    hinglish: "Account balance protect karne ke liye hamari Risk Management Services (RMS) real-time mein positions track karti hai."
  },
  "To avoid automated square-off, please maintain the exchange-mandated maintenance amount.": {
    hi: "स्वचालित स्क्वायर-ऑफ से बचने के लिए, कृपया एक्सचेंज द्वारा निर्धारित आवश्यक न्यूनतम मार्जिन बनाए रखें।",
    hinglish: "Auto square-off se bachne ke liye please account mein required minimum margin balance maintain rakhein."
  },
  "We are happy to explain the risk parameters used for calculating your intraday multipliers.": {
    hi: "इंट्राडे मल्टीप्लायर्स की गणना के लिए उपयोग किए जाने वाले जोखिम मानकों को समझाने में हमें प्रसन्नता होगी।",
    hinglish: "Intraday multiplier calculation ke rules ko expand karke samajhane mein hume khushi hogi."
  },
  "The auto-liquidation was activated in accordance with standard risk management parameters to limit exposure.": {
    hi: "नुकसान को सीमित करने के लिए मानक जोखिम प्रबंधन नीति (RMS) के तहत आटो-लिक्विडेशन सक्रिय किया गया था।",
    hinglish: "Loss control karne ke liye rules ke hisab se automatic liquidation/square-off activate ho gaya tha."
  },
  "Risk rules are applied uniformly at market opening to secure client accounts.": {
    hi: "ग्राहक खातों की पूर्ण सुरक्षा सुनिश्चित करने के लिए बाजार खुलने पर जोखिम नियम समान रूप से लागू किए जाते हैं।",
    hinglish: "Clients ke accounts ko safe rakhne ke liye market opening par risk rules sabhi par apply hote hain."
  },
  "The ledger shows a margin shortfall. Kindly deposit funds to restore full trading limits.": {
    hi: "आपके खाते में मार्जिन की कमी दिख रही है। पूर्ण ट्रेडिंग सीमा बहाल करने के लिए कृपया तुरंत फंड जमा करें।",
    hinglish: "Ledger mein margin shortcut dikh raha hai. Trading start karne ke liye kripya fund deposit karein."
  },
  "Depositing collateral shares is another secure way to cover your margin deficit.": {
    hi: "मार्जिन कमी को पूरा करने के लिए कोलेटरल शेयर जमा करना एक अन्य सुरक्षित विकल्प है।",
    hinglish: "Margin shortfall ko recover karne ke liye collateral shares pledge karna bhi ek safe option hai."
  },
  "UPI or Netbanking deposits will reflect instantly, clearing any margin shortfall in real time.": {
    hi: "यूपीआई या नेटबैंकिंग द्वारा किया गया भुगतान तुरंत दिखाई देगा, जिससे आवश्यक मार्जिन वास्तविक समय में पूरा हो जाएगा।",
    hinglish: "UPI ya Netbanking se deposit kiya gaya amount turant add ho jayega aur margin clear ho jayega."
  },
  "Payouts requested during stock market hours are processed within our standard 24-hour cycle.": {
    hi: "बाजार के समय मांगे गए निकासी अनुरोधों को हमारे मानक 24 घंटे के चक्र के भीतर संसाधित किया जाता है।",
    hinglish: "Market hours ke dauran withdrawal requests standard 24-hours ke andar account mein credit ho jaati hain."
  },
  "Your requested funds have successfully entered our bank processing queue.": {
    hi: "आपके द्वारा अनुरोधित राशि सफलतापूर्वक हमारे बैंक प्रसंस्करण कतार में दर्ज हो गई है।",
    hinglish: "Aapka requested money hamare bank processing queue mein successfully chala gaya hai."
  },
  "We recognize the priority of this payout and are coordinating with our banking partner for quick credit.": {
    hi: "हम इस भुगतान की प्राथमिकता को समझते हैं और त्वरित क्रेडिट के लिए अपने बैंकिंग भागीदार के साथ समन्वय कर रहे हैं।",
    hinglish: "Hum is payout ki priority samajhte hain aur bank ke sath cooperate karke fast credit karwa rahe hain."
  },
  "Your cleared ledger balance is fully available for payout; let me guide you to initiate it.": {
    hi: "आपका शुद्ध लेजर बैलेंस पूर्ण निकासी के लिए उपलब्ध है; आइए इसे शुरू करने के लिए मैं आपका मार्गदर्शन करता हूँ।",
    hinglish: "Aapka clear ledger balance full payout ke liye available hai, aaiye iska process dekhte hain."
  },
  "To withdraw your funds, please verify that you have no open F&O intraday exposures today.": {
    hi: "फंड निकालने के लिए कृपया सुनिश्चित करें कि आज आपके पास कोई भी खुला इंट्राडे (F&O) पोजीशन नहीं है।",
    hinglish: "Funds withdraw karne se pehle please check kar lein ki aapka koi intraday F&O limit active na ho."
  },
  "Pledging your holding allows you to utilize margin benefits while retaining ownership.": {
    hi: "होल्डिंग्स को गिरवी रखने (Pledge) से आप मालिकाना हक खोए बिना अतिरिक्त मार्जिन का लाभ उठा सकते हैं।",
    hinglish: "Stocks pledge karne se aap ownership banaye rakhkar bhi extra margin limit pa sakte hain."
  },
  "Your unpledge request is received; shares will return to your free demat pool tomorrow.": {
    hi: "आपका अनप्लेज अनुरोध प्राप्त हो गया है; गिरवी रखे गए शेयर कल आपके फ्री डीमैट पूल में वापस आ जाएंगे।",
    hinglish: "Aapka unpledge request mill gaya hai; shares kal tak wapas demat account mein transfer ho jayenge."
  },
  "Demat Account Maintenance Charges (AMC) are collected quarterly to cover registry security.": {
    hi: "डिजिटल रजिस्टर सुरक्षा बनाए रखने के लिए डीमैट खाता रखरखाव शुल्क (AMC) त्रैमासिक रूप से लिया जाता है।",
    hinglish: "Demat Registry security ke liye Account Maintenance Charges (AMC) quarterly collect kiye jaate hain."
  },
  "Our engineering team has resolved the feed latency and all streaming quotes are fully synced.": {
    hi: "हमारी तकनीकी टीम ने लाइव डेटा देरी को दूर कर दिया है और सभी स्ट्रीमिंग भाव अब पूरी तरह से समयानुसार हैं।",
    hinglish: "Technical team ne live feed delay solve kar diya hai, ab sabhi rates bilkul real-time mein aa rahe hain."
  },
  "If standard channels do not satisfy you, our Compliance Officer details are publicly available.": {
    hi: "यदि सामान्य सहायता चैनल आपको संतुष्ट नहीं करते हैं, तो हमारे अनुपालन अधिकारी (Compliance Officer) का विवरण सार्वजनिक रूप से उपलब्ध है।",
    hinglish: "Agar standard support se aap satisfied nahi hain, toh hamare Compliance Officer ke details publicly available hain."
  },
  "Your dispute is logged and we are processing immediate compensation reviews if system lag is found.": {
    hi: "आपका विवाद दर्ज कर लिया गया है, और यदि कोइ तकनीकी खराबी पाई जाती है, तो हम तत्काल क्षतिपूर्ति की समीक्षा कर रहे हैं।",
    hinglish: "Aapka dispute register kar liya gaya hai, system lag verify hote hi hum compensatory review shuru karenge."
  }
};

// Falls back to direct translate if exact match or translates intelligently
export function translateText(text: string, lang: AppLanguage): string {
  if (lang === 'en') return text;
  
  // Exact match lookups
  const cleaned = text.trim().replace(/^“|”$/g, "");
  for (const [eng, trans] of Object.entries(PHRASE_TRANSLATIONS)) {
    if (eng.toLowerCase() === cleaned.toLowerCase() || cleaned.toLowerCase().includes(eng.toLowerCase())) {
      const wrapper = text.startsWith("“") ? "“" : "";
      const endWrapper = text.endsWith("”") ? "”" : "";
      return `${wrapper}${trans[lang]}${endWrapper}`;
    }
  }

  // Dynamic Stock Market Brokerage Terms Lexicon Replacements (Intelligent Hindi/Hinglish translations on-the-fly)
  if (lang === 'hi') {
    let result = text;
    result = result.replace(/available margin/gi, "उपलब्ध मार्जिन");
    result = result.replace(/portfolio/gi, "पोर्टफोलियो");
    result = result.replace(/insufficient/gi, "अपर्याप्त");
    result = result.replace(/original/gi, "मूल");
    result = result.replace(/better/gi, "बेहतर");
    result = result.replace(/explanation/gi, "स्पष्टीकरण");
    result = result.replace(/please wait/gi, "कृपया प्रतीक्षा करें");
    result = result.replace(/under process/gi, "प्रक्रियाधीन है");
    result = result.replace(/system issue/gi, "सिस्टम तकनीकी समस्या");
    result = result.replace(/patience/gi, "धैर्य");
    result = result.replace(/regulatory/gi, "नियामक नियमों");
    result = result.replace(/compliance/gi, "अनुपालन");
    result = result.replace(/refund/gi, "रिफंड (पैसे वापसी)");
    result = result.replace(/withdrawal/gi, "निकासी");
    result = result.replace(/charges/gi, "शुल्क");
    result = result.replace(/squared off/gi, "स्क्वायर-ऑफ (बंद)");
    return result;
  }

  if (lang === 'hinglish') {
    let result = text;
    result = result.replace(/available margin in your account is currently insufficient/gi, "Aapke account mein available margin abhi insufficient hai");
    result = result.replace(/Your request is under process. Please wait./gi, "Aapka request process ho raha hai. Thoda wait karein.");
    result = result.replace(/Thank you for your patience./gi, "Aapke patience ke liye dhanyawad.");
    result = result.replace(/Our technical team is working towards resolution./gi, "Hamari technical team issue ko handle kar rahi hai aur jaldi solve karegi.");
    return result;
  }

  return text;
}
