import React from 'react';
import { 
  Sparkles, CheckCircle2, XCircle, ArrowRight, Lightbulb, 
  Heart, ShieldAlert, MessageCircle, RefreshCw
} from 'lucide-react';

export default function CommunicationTips() {
  const TIPS = [
    {
      id: "tip-1",
      title: "Validate the Customer's Emotion First",
      subtitle: "Connect human-to-human before jumping into the technical steps.",
      desc: "An angry customer is trying to voice a real frustration. Telling them to 'calm down' or starting immediately with a cold, manual list of steps invalidates their feelings and makes them defensive.",
      doText: "“I entirely understand how frustrating it is when a charge looks incorrect. Let's look into the system records together and get this resolved right away for you.”",
      dontText: "“Calm down, there is no need to write in all caps. Our billing logs is fully audited.”",
      reason: "Validation creates immediate relationship trust and lowers diagnostic frustration."
    },
    {
      id: "tip-2",
      title: "Framer Actionable Options (What you CAN do)",
      subtitle: "Focus on available resolutions rather than hard policy rejections.",
      desc: "Instead of hiding behind static service guidelines (e.g. 'refunds are strictly forbidden after 14 days'), guide the user smoothly through what options or alternative credits we can extend.",
      doText: "“While standard purchases outside the 14-day window fall outside our typical refunds, I would love to extend a complimentary 20% discount coupon or swap the items for a better fit.”",
      dontText: "“Our policy says no refunds because you bought it 20 days ago. Sorry but rules are rules.”",
      reason: "It keeps the conversation positive and preserves brand loyalty."
    },
    {
      id: "tip-3",
      title: "Take Proactive Team Ownership",
      subtitle: "Never blame other departments, fulfillment drivers, or technical servers.",
      desc: "To the customer, you are the brand. Saying 'that was the driver's fault' or 'the developer portal went offline' signals lack of cohesion. Take proud ownership and resolve it.",
      doText: "“Please accept our sincere apologies for the careless packaging. We are dispatching an immediate priority replacement container today and have flagged this package for review.”",
      dontText: "“Our shipping partner literally threw the fragile package. You should write a claim on their page.”",
      reason: "Accountability builds long-term authority and consumer confidence."
    },
    {
      id: "tip-4",
      title: "Strip Out Sullen Word Fillers",
      subtitle: "Replace dismissive words with confident, direct service language.",
      desc: "Words like 'unfortunately,' 'obviously,' 'actually,' and 'regrettably' often sound patronizing or defensive in text form. Keep support prose transparent, clean, and helpful.",
      doText: "“I can confirm the reset switch is located directly on the back panel of your device dashboard.”",
      dontText: "“Actually, if you had read the manual, you would see the button is right on the back panel.”",
      reason: "Sullen filler words slow down reading and imply client error."
    }
  ];

  return (
    <div id="comm-tips-section" className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Support Communication Tips</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Master the professional, high-empathy customer phrasing paradigms that convert frustrated users into brand advocates.
        </p>
      </div>

      {/* Top Banner */}
      <div className="p-4 bg-blue-50 border border-blue-105 rounded-sm flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-tight">Phrasing is your primary support superpower</h4>
          <p className="text-xs text-blue-700 leading-relaxed font-normal">
            90% of escalated support tickets can be tracked back to a micro-aggressive tone or defensive phrasing in the initial response. By replacing cold, static policy blockades with supportive, progressive alternatives, team scores improve immediately.
          </p>
        </div>
      </div>

      {/* Grid of Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {TIPS.map((tip, index) => (
          <div key={tip.id} className="bg-white rounded-sm border border-slate-205 p-4.5 space-y-3 shadow-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[9px] font-bold text-blue-600 uppercase font-mono tracking-wider">GUIDELINE {index + 1} OF 4</span>
                <h3 className="text-xs font-bold text-slate-900 mt-0.5">{tip.title}</h3>
                <p className="text-[10px] text-slate-500 italic mt-0.5">{tip.subtitle}</p>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-sm border border-slate-150">
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
            </div>

            <p className="text-xs text-slate-650 leading-relaxed font-normal">
              {tip.desc}
            </p>

            <div className="space-y-2 pt-1">
              {/* Avoid panel */}
              <div className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-sm text-[11px] text-rose-800">
                <div className="flex items-center gap-1 mb-0.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <strong className="text-[9px] uppercase font-bold text-rose-600 tracking-wider">Avoid defensive phrasing:</strong>
                </div>
                <p className="italic leading-normal">{tip.dontText}</p>
              </div>

              {/* Use panel */}
              <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-sm text-[11px] text-emerald-800">
                <div className="flex items-center gap-1 mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <strong className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider">Use empathetic alternatives:</strong>
                </div>
                <p className="font-medium leading-normal">{tip.doText}</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 pl-1 border-l-2 border-slate-200 mt-2 font-mono">
              💡 Why it works: {tip.reason}
            </p>
          </div>
        ))}
      </div>

      {/* Bonus Guidelines Block */}
      <div className="bg-slate-900 text-slate-350 p-5 rounded-sm border border-slate-800">
        <h3 className="text-xs font-bold text-white uppercase tracking-tight mb-2.5">Quick De-escalation Cheat Sheet</h3>
        <ul className="space-y-2 text-xs leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Never argue</strong> with customer facts. Acknowledge their perspective: <em>“I understand how that timeline would make you assume a delivery delay...”</em></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Keep sentence structure short.</strong> Complex legalistic structure looks defensive and slow. Maintain a high readable pace.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Close on a confirmation.</strong> Always seek active customer agreement: <em>“Does shipping that overnight swap sound like a comfortable outcome for you today?”</em></span>
          </li>
        </ul>
      </div>

    </div>
  );
}
