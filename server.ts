import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

// Since we are package type=module, derive standard __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// JSON Local Database filepath
const DB_PATH = path.join(__dirname, "db.json");

// Helper to secure directory and return DB structure
function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    const initialDb = {
      users: [
        { id: "u-1", name: "Alice Vance", email: "alice@team.corp", role: "agent", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
        { id: "u-2", name: "Bob Carter", email: "bob@team.corp", role: "agent", avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" },
        { id: "u-3", name: "Charlie Stone", email: "charlie@team.corp", role: "agent", avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" },
        { id: "u-4", name: "Sarah Jenkins", email: "sarah@team.corp", role: "manager", avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" },
        { id: "u-5", name: "David Miller", email: "david@team.corp", role: "manager", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
      ],
      ai_history: [
        {
          id: "h-1",
          userId: "u-1",
          userName: "Alice Vance",
          moduleId: "email_improvement",
          timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
          tone: "Empathetic",
          inputData: {
            originalEmail: "I know you are mad but we can't refund your money because our policy says 14 days and you bought it 20 days ago. Sorry but rules are rules.",
            issueType: "Refund request outside of return window",
            tone: "Empathetic"
          },
          outputData: {
            improvedEmail: "Thank you for shopping with us. I completely understand how frustrating it can be when a product doesn't meet your expectations, and I wish we could offer a different outcome. Regrettably, because the purchase was made 20 days ago, it falls outside our standard 14-day refund policy window. To help make things right, I would love to extend a 20% discount coupon for your next order or help you find an alternative product which better fits your needs. Please let me know how you would like to proceed.",
            explanationOfImprovements: "Replaced direct, abrupt rejection with supportive validation of the client's frustration. Highlighted the 14-day policy in a respectful tone, and actively offered supportive alternatives (discount coupon or alternative solution) to preserve the client relationship.",
            betterSubjectLine: "Regarding your recent purchase and return request"
          }
        },
        {
          id: "h-2",
          userId: "u-2",
          userName: "Bob Carter",
          moduleId: "complaint_handling",
          timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
          tone: "Apology",
          inputData: {
            complaint: "Your delivery driver literally threw the fragile package at my door, cracking the glass screen inside. This is completely unacceptable!",
            issueType: "Damaged delivery",
            resolution: "Ship immediate glass replacement and supply $15 feedback credit."
          },
          outputData: {
            empatheticReply: "Dear Customer, I am incredibly sorry to hear about how your package was handled and the damage caused to your fragile glass screen. This is certainly not up to our standards, and I fully share your disappointment. I've already arranged to ship an immediate glass replacement today with priority shipping, and I've applied a $15 credit to your account as a gesture of our commitment. We are also reviewing this case directly with our shipping partner to ensure it never happens again.",
            apologyLine: "I express our sincere apologies for the careless handling of your delicate delivery.",
            resolutionWording: "We have prioritized a complimentary glass replacement shipping today and applied a $15 service voucher credit to your profile.",
            followUpLine: "I will personal monitor this delivery, and will send over your new tracking code as soon as it departs our warehouse."
          }
        },
        {
          id: "h-3",
          userId: "u-1",
          userName: "Alice Vance",
          moduleId: "soft_skills",
          timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
          tone: "Polite",
          inputData: {
            agentResponse: "Calm down, there is no need to write in all caps. Read the manual, the reset button is right on the back panel."
          },
          outputData: {
            whatIsGood: "Identification of the correct technical troubleshooting step (locating the reset button on the back panel).",
            whatNeedsImprovement: "Tone is highly defensive and dismissive. Telling a customer to 'calm down' or calling out their formatting (all caps) escalates the tension. The instruction 'read the manual' is cold and feels lazy.",
            betterVersion: "I understand how frustrating it is when a device isn't working as expected. Let's get this resolved for you. On the very back panel of the device, you will find a small reset button. If you press and hold this button for 5 seconds, it should restore the standard settings. Let me know if you run into any trouble finding it!",
            softSkillTip: "Never tell a customer to calm down or instruct them what not to write; it invalidates their voice. Instead, join them on their team to solve the problem.",
            empathyScore: 2,
            professionalismScore: 3
          }
        }
      ],
      manager_reviews: [
        {
          id: "r-1",
          historyId: "h-1",
          reviewerId: "u-4",
          reviewerName: "Sarah Jenkins",
          comment: "Excellent improvement, Alice! You framed the policy beautifully. High empathy and clear options. Keep up this magnificent standard of work.",
          status: "exemplary",
          improvementAreas: ["Policy Framing", "Value Alternatives"],
          timestamp: new Date(Date.now() - 30 * 3600000).toISOString()
        }
      ],
      learning_resources: [
        {
          id: "lr-1",
          category: "email_writing",
          title: "The Art of Professional Retracking (Email Tips)",
          content: "Writing awesome professional customer support emails centers on highlighting what you *can* do, rather than what you *cannot* do. Use active listening markers and maintain strict accountability without sounding overly defensive.",
          items: [
            { original: "You failed to supply the correct order number so I can't process this.", better: "I would be delighted to look into this account for you. Could you please share your order number so I can locate your records?", explanation: "Shifts blame away from the client and focuses on the helpful next steps." },
            { original: "Our policy says you cannot do this or we cancel your profile.", better: "To keep your account completely secure and fully aligned with our service terms, we ask that you verify these details before continuing.", explanation: "Explains standard security standards as beneficial rather than restrictive rules." }
          ]
        },
        {
          id: "lr-2",
          category: "complaint_handling",
          title: "Turning Dissatisfied Clients into Promoters",
          content: "An angry customer is a tremendous opportunity to convert a standard client into a lifetime brand loyalty supporter. Use a structured four-part apology framework: Acknowledge the experience, validate the emotional toll, explain the immediate remedy, and follow up closely.",
          checklist: [
            "Actively listen without interruption or technical jargon defensive behavior.",
            "Begin with an explicit, unreserved apology highlighting client's time and effort.",
            "Outline concrete, direct immediate remedies with strict deadlines.",
            "Provide personal channels or follow-up timelines to guarantee client is made whole."
          ]
        },
        {
          id: "lr-3",
          category: "phrase_bank",
          title: "The Ultimate Positive Customer Phrase Bank",
          content: "Use these recommended positive phrases to rewrite difficult messages and eliminate defensive posture.",
          phrases: [
            { expression: "I would be happy to coordinate that for you right now.", context: "Placing requests on hold or performing updates", category: "positive" },
            { expression: "Let's work together to figure out the best shortcut.", context: "Beginning a complicated diagnostic script", category: "positive" },
            { expression: "You're absolutely correct to expect top-tier quality.", context: "Validating a physical or hardware complaint", category: "positive" },
            { expression: "Why don't we try this immediate solution...", context: "Providing an alternative to 'We can't do that'", category: "positive" },
            { expression: "Let me check with our fulfillment specialists...", context: "Replacing 'I don't know where your driver is'", category: "negative-replacement" },
            { expression: "Your security is our absolute priority, which is why...", context: "Replacing 'That's against our account rules'", category: "negative-replacement" }
          ]
        }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), "utf-8");
  }

  try {
    const rawData = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error reading db file, restoring fallback:", error);
    return { users: [], ai_history: [], manager_reviews: [], learning_resources: [] };
  }
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to local database:", error);
  }
}

// Unified AI Client with OpenAI-First, Groq-Fallback Retry Logic
async function generateAIResponse(prompt: string, systemPrompt: string, requireJson: boolean = false): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const hasOpenAI = openaiKey && openaiKey !== "MY_OPENAI_API_KEY" && openaiKey.trim() !== "";
  const hasGroq = groqKey && groqKey !== "MY_GROQ_API_KEY" && groqKey.trim() !== "";

  if (!hasOpenAI && !hasGroq) {
    throw new Error("NO_KEYS_TRIGGER_SIMULATION");
  }

  let responseText = "";
  let providerUsed = "";

  // 1. Try OpenAI
  if (hasOpenAI) {
    try {
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          response_format: requireJson ? { type: "json_object" } : undefined
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        responseText = data.choices?.[0]?.message?.content || "";
        providerUsed = "OpenAI";
      } else {
        const errorText = await response.text();
        console.warn(`[AI SERVICE] OpenAI returned status ${response.status}: ${errorText}`);
      }
    } catch (openaiError: any) {
      console.warn(`[AI SERVICE] Primary OpenAI service failed. Error: ${openaiError.message}`);
    }
  }

  // 2. Try Groq (if OpenAI failed or wasn't configured, and Groq is)
  if (!responseText && hasGroq) {
    try {
      const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          response_format: requireJson ? { type: "json_object" } : undefined
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        responseText = data.choices?.[0]?.message?.content || "";
        providerUsed = "Groq";
      } else {
        const errorText = await response.text();
        console.warn(`[AI SERVICE] Groq returned status ${response.status}: ${errorText}`);
      }
    } catch (groqError: any) {
      console.error(`[AI SERVICE] Fallback Groq service also failed. Error: ${groqError.message}`);
    }
  }

  if (!responseText) {
    throw new Error("AI service is temporarily unavailable. Please try again after some time.");
  }

  console.log(`[AI SERVICE Completers] Completed via provider: ${providerUsed}`);
  return responseText;
}

// Utility to clean up Markdown-wrapped JSON blocks returned by certain LLMs
function parseCleanJson(text: string): any {
  let clean = text.trim();
  if (clean.startsWith("```json")) {
    clean = clean.substring(7);
  } else if (clean.startsWith("```")) {
    clean = clean.substring(3);
  }
  if (clean.endsWith("```")) {
    clean = clean.substring(0, clean.length - 3);
  }
  return JSON.parse(clean.trim());
}

/// --- API ENDPOINTS ---

// Check API status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Auth / Users
app.get("/api/users", (req, res) => {
  const db = loadDb();
  res.json(db.users);
});

app.post("/api/users/login", (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const db = loadDb();
  let user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Generate a quick random ID and avatar
    const name = email.split("@")[0].split(/[._-]/).map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ");
    const fallbackAvatar = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=150`;
    user = {
      id: "u-" + Math.random().toString(36).substr(2, 9),
      name: name || "Anonymous Team Member",
      email: email,
      role: role || "agent",
      avatarUrl: fallbackAvatar,
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    saveDb(db);
  }

  res.json(user);
});

// AI Coach History
app.get("/api/history", (req, res) => {
  const { userId, role } = req.query;
  const db = loadDb();

  let history = [...db.ai_history];

  // If user is agent, they can only see their own history
  if (role === "agent" && userId) {
    history = history.filter((item: any) => item.userId === userId);
  }

  // Join reviews
  const historyWithReviews = history.map((item: any) => {
    const review = db.manager_reviews.find((r: any) => r.historyId === item.id);
    return { ...item, review };
  });

  // Sort by recent first
  historyWithReviews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json(historyWithReviews);
});

app.post("/api/history", (req, res) => {
  const { userId, userName, moduleId, tone, inputData, outputData } = req.body;
  if (!userId || !moduleId || !outputData) {
    return res.status(400).json({ error: "Missing required history fields" });
  }

  const db = loadDb();
  const newItem = {
    id: "h-" + Math.random().toString(36).substr(2, 9),
    userId,
    userName: userName || "Agent Team Member",
    moduleId,
    timestamp: new Date().toISOString(),
    tone: tone || "Professional",
    inputData,
    outputData
  };

  db.ai_history.push(newItem);
  saveDb(db);

  res.status(201).json(newItem);
});

// Manager Reviews
app.post("/api/reviews", (req, res) => {
  const { historyId, reviewerId, reviewerName, comment, status, improvementAreas } = req.body;
  
  if (!historyId || !reviewerId || !comment || !status) {
    return res.status(400).json({ error: "Missing required review parameters" });
  }

  const db = loadDb();
  
  // Exclude or remove any existing review for this history item to overwrite if needed
  db.manager_reviews = db.manager_reviews.filter((r: any) => r.historyId !== historyId);

  const newReview = {
    id: "r-" + Math.random().toString(36).substr(2, 9),
    historyId,
    reviewerId,
    reviewerName: reviewerName || "Manager Reviewer",
    comment,
    status,
    improvementAreas: improvementAreas || [],
    timestamp: new Date().toISOString()
  };

  db.manager_reviews.push(newReview);
  saveDb(db);

  res.status(201).json(newReview);
});

// Learning Resources
app.get("/api/learning", (req, res) => {
  const db = loadDb();
  res.json(db.learning_resources);
});

app.post("/api/learning", (req, res) => {
  const { category, title, content, items, checklist, phrases } = req.body;
  if (!category || !title || !content) {
    return res.status(400).json({ error: "Category, title, and content are required." });
  }

  const db = loadDb();
  const newResource = {
    id: "lr-" + Math.random().toString(36).substr(2, 9),
    category,
    title,
    content,
    items,
    checklist,
    phrases
  };

  db.learning_resources.push(newResource);
  saveDb(db);

  res.status(201).json(newResource);
});


// Core stats for managers & teams
app.get("/api/stats", (req, res) => {
  const db = loadDb();
  const totalGenerations = db.ai_history.length;
  const reviewedCount = db.manager_reviews.length;
  
  // Calculate average scores (only present on soft_skills outputs)
  let totalEmpathy = 0;
  let totalProfessionalism = 0;
  let skillsCount = 0;

  db.ai_history.forEach((h: any) => {
    if (h.moduleId === "soft_skills" && h.outputData) {
      if (typeof h.outputData.empathyScore === "number") {
        totalEmpathy += h.outputData.empathyScore;
        totalProfessionalism += h.outputData.professionalismScore;
        skillsCount++;
      }
    }
  });

  const avgEmpathy = skillsCount > 0 ? parseFloat((totalEmpathy / skillsCount).toFixed(1)) : 8.2;
  const avgProfessionalism = skillsCount > 0 ? parseFloat((totalProfessionalism / skillsCount).toFixed(1)) : 8.5;

  // Aggregate improvement areas
  const improvementFreq: Record<string, number> = {};
  db.manager_reviews.forEach((r: any) => {
    if (Array.isArray(r.improvementAreas)) {
      r.improvementAreas.forEach((area: string) => {
        improvementFreq[area] = (improvementFreq[area] || 0) + 1;
      });
    }
  });

  const chartData = Object.entries(improvementFreq).map(([name, count]) => ({
    name,
    count
  }));

  res.json({
    totalGenerations,
    reviewedCount,
    pendingReview: Math.max(0, totalGenerations - reviewedCount),
    avgEmpathy,
    avgProfessionalism,
    chartData: chartData.length > 0 ? chartData : [
      { name: "Tone Adjustment", count: 3 },
      { name: "Active Listening", count: 4 },
      { name: "Policy Framing", count: 2 },
      { name: "Clear Next Steps", count: 5 }
    ]
  });
});


// Call AI model generator to coach customer service outputs
app.post("/api/coach/generate", async (req, res) => {
  const { moduleId, inputs, tone } = req.body;

  if (!moduleId || !inputs) {
    return res.status(400).json({ error: "Missing moduleId or input options" });
  }

  // Check if standard keys are configured
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const hasKeys = (openaiKey && openaiKey !== "MY_OPENAI_API_KEY" && openaiKey.trim() !== "") ||
                  (groqKey && groqKey !== "MY_GROQ_API_KEY" && groqKey.trim() !== "");

  if (!hasKeys) {
    // Generate helpful, rich simulated fallback response instantly
    const result = getSimulatedCoachFallback(moduleId, inputs, tone || "Professional");
    return res.json(result);
  }

  try {
    let systemInstruction = "";
    let promptText = "";

    switch (moduleId) {
      case "email_improvement":
        systemInstruction = "You are an expert customer service training coach. Your job is to rewrite rough drafts of support emails to be highly professional, Empathetic, or Polite based on the desired tone, while explaining the coaching corrections made.";
        promptText = `Improve the following support email.
Original Draft: "${inputs.originalEmail}"
Issue Type: "${inputs.issueType}"
Desired Tone: "${tone}"

Rewrite. Respond strictly using JSON matching this schema structure:
{
  "improvedEmail": "The completely rewritten, high-quality, professional support email draft.",
  "explanationOfImprovements": "Detailed coaching description of exactly why this draft is better and what bad phrases were removed.",
  "betterSubjectLine": "A highly clear, optimized, customer-centric email subject line."
}`;
        break;

      case "complaint_handling":
        systemInstruction = "You are an expert customer complaint arbiter. You write replies to angry or dissatisfied customers that diffuse the situation, project empathy, apologize elegantly, and clarify concrete resolutions.";
        promptText = `Write a comprehensive, customer-centric response for this customer complaint.
Complaint: "${inputs.complaint}"
Product/Service Issue: "${inputs.issueType}"
Resolution Available: "${inputs.resolution}"
Tone Style: "${tone}"

Generate. Respond strictly using JSON matching this schema structure:
{
  "empatheticReply": "The complete customer-facing response, acknowledging their perspective, taking ownership, and outlining the remedy.",
  "apologyLine": "A highly sincere, well-crafted standalone apology sentence highlighting the inconvenience.",
  "resolutionWording": "Explicit explanation of standard steps we are taking to resolve their issue outlined clearly.",
  "followUpLine": "A dedicated follow up sentence assuring them we are monitoring the results."
}`;
        break;

      case "call_script":
        systemInstruction = "You are a Customer Experience workflow script writer. You draft clear, ready-to-use verbal phone scripts with natural, customer-focused phrasing.";
        promptText = `Generate a phone call script for our agents.
Call Reason: "${inputs.callReason}"
Customer type: "${inputs.customerType}"
Brief summary: "${inputs.issueSummary}"
Tone style: "${tone}"

Generate script parts. Respond strictly using JSON matching this schema structure:
{
  "openingScript": "Phone greeting, introducing yourself, setting a welcoming and helpful stage.",
  "verificationScript": "Polite verification workflow of secure customer account details.",
  "issueExplanation": "The verbal outline and explanation of the issue to the caller, showing active alignment.",
  "resolutionScript": "Clean explanation of standard steps we are taking to clear the issue, seeking their alignment.",
  "closingScript": "Professional closing greeting assuring further help and offering a lovely farewell."
}`;
        break;

      case "soft_skills":
        systemInstruction = "You are a customer service communication psychologist and coach specializing in stock market brokerages. Analyze agent statements or responses and construct specialized alternative formulations tailored for brokerage customer support teams.";
        promptText = `Analyze the agent's statement below.
Agent Response: "${inputs.agentResponse}"

Rate, audit, and rewrite into specialized brokerage variations. Respond strictly using JSON matching this schema structure:
{
  "professionalVersion": "A highly professional, clear version of the support statement suitable for a verified investor.",
  "empatheticVersion": "An empathetic version that validates the customer's feelings or issue first.",
  "positiveVersion": "A positive-framed alternative highlighting what can be done instead of restrictions.",
  "regulatoryFriendlyVersion": "A version that aligns with financial regulatory requirements (e.g. SEBI, SEC, FINRA) avoiding unapproved advice.",
  "highCsatVersion": "A high-satisfaction version emphasizing speed, clarity, and client delight.",
  "complianceSafeVersion": "A legally compliant safe version that carries zero liability or policy guarantees.",
  "avoidNegativeWords": "Specific feedback on negative words identified (such as 'Wait', 'Not possible', 'System issue', 'Charges are applicable', 'Position closed') and their positive replacements.",
  "confidenceScore": 10,
  "empathyScore": 10,
  "professionalismScore": 10,
  "whatIsGood": "Specific positive aspects of their original statement if any.",
  "whatNeedsImprovement": "Constructive feedback on what makes their formulation defensive, cold, or problematic in a brokerage context.",
  "betterVersion": "The fully rewritten high-empathy customer statement (empathetic version) they should use instead.",
  "softSkillTip": "A practical stock market/brokerage customer interaction tip they can carry into future chats."
}
Note: confidenceScore, empathyScore, and professionalismScore must be numbers between 1 and 10.`;
        break;

      case "escalation":
        systemInstruction = "You are an operations escalation coach. Create internal support notes for senior engineers/managers AND customer-facing delay alerts about an ongoing technical or logistic incident.";
        promptText = `Draft escalation text for this incident.
Issue Summary: "${inputs.issueSummary}"
Delay Reason: "${inputs.delayReason}"
Current Technical Status: "${inputs.currentStatus}"
Next Action: "${inputs.nextAction}"
Tone Style: "${tone}"

Generate notes. Respond strictly using JSON matching this schema structure:
{
  "internalEscalationNote": "Formal, detailed internal engineering/ticketing desk note outlining technical bottlenecks and strict parameters.",
  "customerFacingUpdate": "Empathetic update for the customer explaining the extra attention we are giving their issue without exposing internal details.",
  "managerSummary": "Brief executive bullet point statement of impact, status, and timeline.",
  "riskLevel": "Low"
}
Note: riskLevel must be a string like 'Low', 'Medium', or 'High'.`;
        break;

      case "email_writer":
        systemInstruction = "You are an AI copywriting assistant for customer success. Take short customer notes or instructions and draft several variations of emails and messaging updates.";
        promptText = `Compose a full-stack response based on these goals.
Purposes: "${inputs.purpose}"
Recipient Group/Type: "${inputs.recipientType}"
Key points: "${inputs.keyPoints}"
Tone style: "${tone}"

Generate variations. Respond strictly using JSON matching this schema structure:
{
  "subjectLine": "An engaging, clear professional email subject line.",
  "fullEmail": "The standard comprehensive full-length email layout.",
  "shortVersion": "A concise 3-sentence light variation of the email.",
  "whatsAppUpdate": "A highly concise, mobile-friendly message suitable for WhatsApp or SMS updates."
}`;
        break;
    }

    const responseText = await generateAIResponse(promptText, systemInstruction, true);
    const parsedResponse = parseCleanJson(responseText);
    return res.json(parsedResponse);

  } catch (error: any) {
    console.error("AI Coach generate content error:", error);
    // Graceful fallback to rich simulated mockup on dual fail
    const fallbackResponse = getSimulatedCoachFallback(moduleId, inputs, tone || "Professional");
    return res.json(fallbackResponse);
  }
});


// Call AI model to modify/rewrite existing output with commands like 'shorten', 'polite', 'professional' or custom commands!
app.post("/api/coach/rewrite", async (req, res) => {
  const { originalText, command, tone } = req.body;

  if (!originalText || !command) {
    return res.status(400).json({ error: "Original text and rewrite action/command are required." });
  }

  // Check if standard keys are configured
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const hasKeys = (openaiKey && openaiKey !== "MY_OPENAI_API_KEY" && openaiKey.trim() !== "") ||
                  (groqKey && groqKey !== "MY_GROQ_API_KEY" && groqKey.trim() !== "");

  if (!hasKeys) {
    const backupText = getSimulatedRewrite(originalText, command, tone);
    return res.json({ rewrittenText: backupText });
  }

  try {
    let instruction = "";

    if (command === "shorten") {
      instruction = "Rewrite the text to be extremely concise and direct, keeping all crucial details but cutting descriptive word count by at least 40%.";
    } else if (command === "make_polite") {
      instruction = "Infuse active listening phrases, remove direct negative qualifiers, and make the text highly polite, supportive, and warm.";
    } else if (command === "make_professional") {
      instruction = "Frame the text with standard, polished enterprise parameters, ensuring strict elegance, objective phrasing, and reliable wording.";
    } else {
      // Freeform command
      instruction = `Transform this text according to this command: ${command}`;
    }

    const promptText = `Original Text: "${originalText}"\nDesired Tone Context: "${tone || 'Professional'}"\n\n${instruction}\n\nReturn ONLY the modified rewritten paragraph, with no extra framing or preamble.`;

    const rewritten = await generateAIResponse(promptText, "You are a customer support tone rewriter.", false);
    res.json({ rewrittenText: rewritten.trim() });

  } catch (err: any) {
    console.error("AI rewrite API error:", err);
    res.json({
      rewrittenText: getSimulatedRewrite(originalText, command, tone)
    });
  }
});


// Helper functions for mock fallback if Gemini is not authorized or key is missing
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
    return `[Concise Update]: Improved significantly to maximize readability. Key details are retained, while unnecessary fillers are removed, maintaining a fully refined tone.`;
  }
  if (command === "make_polite") {
    return `Thank you so much for your precious patience. We would be absolutely delighted to help review this immediately and ensure you're completely happy with the results!`;
  }
  if (command === "make_professional") {
    return `We have received your communications and have logged a formal incident report. We will coordinate a full investigation to establish the appropriate resolution parameters.`;
  }
  return `[Rewritten for command '${command}' in ${t} style]: ${text}`;
}

// Vite middleware development setup
async function startServer() {
  // Let load DB generate the JSON file on start
  loadDb();

  // If we are not in production, initialize Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
