import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

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

// Unified AI Client with Gemini-First, Groq-Second, OpenAI-Third Fallback Retry Logic
async function generateAIResponse(prompt: string, systemPrompt: string, requireJson: boolean = false): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const hasGemini = geminiKey && geminiKey !== "MY_GEMINI_API_KEY" && geminiKey.trim() !== "";
  const hasGroq = groqKey && groqKey !== "MY_GROQ_API_KEY" && groqKey.trim() !== "";
  const hasOpenAI = openaiKey && openaiKey !== "MY_OPENAI_API_KEY" && openaiKey.trim() !== "";

  if (!hasGemini && !hasGroq && !hasOpenAI) {
    throw new Error("NO_KEYS_TRIGGER_SIMULATION");
  }

  let responseText = "";
  let providerUsed = "";

  // 1. Try Gemini first
  if (hasGemini) {
    try {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.85,
          responseMimeType: requireJson ? "application/json" : undefined,
        }
      });

      if (response && response.text) {
        responseText = response.text;
        providerUsed = "Gemini";
      } else {
        console.warn(`[AI SERVICE] Gemini returned an empty response text.`);
      }
    } catch (geminiError: any) {
      console.warn(`[AI SERVICE] Primary Gemini service failed. Error: ${geminiError.message}`);
    }
  }

  // 2. Try Groq second
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
          temperature: 0.85,
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
      console.warn(`[AI SERVICE] Secondary Groq service failed. Error: ${groqError.message}`);
    }
  }

  // 3. Try OpenAI third
  if (!responseText && hasOpenAI) {
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
      console.error(`[AI SERVICE] Fallback OpenAI service failed. Error: ${openaiError.message}`);
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
  const { moduleId, inputs, tone, language } = req.body;

  if (!moduleId || !inputs) {
    return res.status(400).json({ error: "Missing moduleId or input options" });
  }

  // Check if standard keys are configured
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const hasKeys = (geminiKey && geminiKey !== "MY_GEMINI_API_KEY" && geminiKey.trim() !== "") ||
                  (openaiKey && openaiKey !== "MY_OPENAI_API_KEY" && openaiKey.trim() !== "") ||
                  (groqKey && groqKey !== "MY_GROQ_API_KEY" && groqKey.trim() !== "");

  if (!hasKeys) {
    // Generate helpful, rich simulated fallback response instantly
    const result = getSimulatedCoachFallback(moduleId, inputs, tone || "Professional", language || "en");
    return res.json(result);
  }

  try {
    let systemInstruction = "";
    let promptText = "";

    switch (moduleId) {
      case "email_coach":
        systemInstruction = `You are a Senior Customer Support AI Coach specializing in stock market and financial services team coaching in English.
        
Your job is to draft or improve customer support emails based on the user's instructions.
You must automatically detect the context, type of query (e.g. KYC, demat, closure, unauthorized trade), and customer sentiment.

STRICT COMPLIANCE DIRECTIVE:
1. Do NOT promise profit or make investment predictions under any circumstances.
2. Do NOT give investment advice or guarantee returns.
3. Use compliant, professional language.
4. If there is unauthorized trade, fraud, legal, financial loss, or regulatory complaint, you MUST trigger an escalated path or recommend immediate supervisor review.

Respond strictly using a reliable JSON object matching this schema structures:
{
  "detectedInputType": "Customer Query" | "Agent Reply / Email Draft",
  "customerSentiment": "Calm" | "Frustrated" | "Angry",
  "priorityLevel": "Low" | "Medium" | "High",
  "recommendedTone": "E.g. Professional & Empathetic",
  "subjectLine": "A compelling, clear, optimized support email subject line.",
  "finalEmailDraft": "The complete improved or drafted customer-facing email.",
  "shortVersion": "A condensed, concise 3-sentence version of the email draft.",
  "moreEmpatheticVersion": "The email draft rewritten in an exceptionally compassionate, understanding, and supportive tone.",
  "moreProfessionalVersion": "The email draft rewritten in high-level business formal compliance-safe wording.",
  "keyImprovementsMade": "Bullet list explaining key changes made to tone, structure, and clarity, and why they help.",
  "wordsPhrasesToAvoid": "Bullet list of raw, low-empathy, or non-compliant phrases to avoid and their replacements."
}`;

        promptText = `Email Task Goal: "${inputs.emailTask}" (e.g., Improve Existing Email, Write New Customer Reply, Write Internal Escalation Email, etc.)
Input Core Text: "${inputs.emailInputText}"
Desired Tone Goal: "${tone}"

Analyze, detect context, align with stock market compliance rules, and generate the response in the requested language: "${language}".
Respond ONLY with raw JSON matching the schema of email_coach. No conversational preambles or markdown backticks outside.`;
        break;

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

      case "universal_coach":
        systemInstruction = `You are a Senior Customer Support AI Coach specializing in stock market and financial services team coaching in English.

Your job is NOT to provide the same output every time. Maintain high creativity, use high temperature (0.85+ vibe), and always formulate rich, diverse phrasing. Avoid generic templates, never repeat past phrases, and if raw texts are similar, provide different layouts. Use varied sentence structures.

You must strictly identify the input type (Customer Query vs Agent Reply / Email Draft) and evaluate customer sentiment (Calm, Frustrated, or Angry) and Priority (Low, Medium, High).

STRICT COMPLIANCE DIRECTIVE:
For stock market, trading, or financial services related queries, you MUST:
1. Avoid promising profits or making investment predictions under any circumstances.
2. Always use compliant language.
3. Never provide investment advice.
4. You must integrate professional compliance-safe phrasing naturally when relevant, such as:
   - "Based on the information available..."
   - "We request you to..."
   - "We understand your concern..."
   - "Our team will review..."
   - "Please note that market-related investments are subject to audits or risks."

If Customer Sentiment is Angry, you must construct an 'angrySentimentHandling' block with de-escalation, immediate action, ownership, and next-steps statements.

If the Input is an Agent Email Draft, you must analyze its soft skills quality, compute scores (0-100) for Professionalism, Empathy, Clarity, Grammar, Ownership, and Overall scores, then provide Strengths, Areas to Improve, and Suggested Better Phrases.

Your output MUST be a strict, raw JSON object matching the requested schema. No additional conversational wrapper, markdown-backticks, or explanations outside the JSON structure.`;
        
        promptText = `Incoming Input Text from Sandbox:
"${inputs.textToAnalyze || ''}"

Target Tone Style Context: "${tone || 'Professional'}"

Analyze the text and populate the following JSON schema strictly. Ensure that your output values are formulated strictly in English.

Return ONLY a JSON object styled exactly like this:
{
  "inputType": "Customer Query" | "Agent Reply / Email Draft",
  "customerSentiment": "Calm" | "Frustrated" | "Angry",
  "priority": "Low" | "Medium" | "High",
  "variations": {
    "professional": {
      "tone": "Formal and business-like.",
      "bestUseCase": "Brief context when to use.",
      "response": "The complete full draft..."
    },
    "empathetic": {
      "tone": "Show understanding and reassurance.",
      "bestUseCase": "Brief context when to use.",
      "response": "The complete full draft..."
    },
    "polite": {
      "tone": "Simple and courteous.",
      "bestUseCase": "Brief context when to use.",
      "response": "The complete full draft..."
    },
    "firm": {
      "tone": "Set expectations clearly without sounding rude.",
      "bestUseCase": "Brief context when to use.",
      "response": "The complete full draft..."
    },
    "apology": {
      "tone": "Accept inconvenience and maintain trust.",
      "bestUseCase": "Brief context when to use.",
      "response": "The complete full draft..."
    },
    "escalation": {
      "tone": "Suitable when issue requires another team or higher authority.",
      "bestUseCase": "Brief context when to use.",
      "response": "The complete full draft..."
    }
  },
  "emailAnalysis": {
    "professionalismScore": 85,
    "empathyScore": 75,
    "clarityScore": 80,
    "grammarScore": 90,
    "ownershipScore": 70,
    "overallScore": 80,
    "strengths": "Detailed markdown bullet points listing core strengths.",
    "areasToImprove": "Detailed markdown bullet points listing soft-skill errors.",
    "suggestedBetterPhrases": "Recommended compliance-certified replacements for tricky words used in the input."
  },
  "angrySentimentHandling": {
    "customerEmotion": "Description of client emotion",
    "urgencyLevel": "Level",
    "riskLevel": "Risk rating",
    "suggestedTone": "Suggested tone to adopt",
    "deEscalationResponse": "Calming opening acknowledgment statement.",
    "immediateActionStatement": "Action-oriented bypass or bypass protocol announcement.",
    "ownershipStatement": "Strict supervisor/personal responsibility statement.",
    "nextStepStatement": "Clear follow-on task with direct completion deadline."
  },
  "coachingTips": {
    "communicationImprovement": "Soft skill improvement paragraph.",
    "softSkillsImprovement": "De-escalation or compliant communication paragraph.",
    "whatSeniorManagerWrites": "Polished high-level statement that a senior manager would write.",
    "whatNotToWrite": "What phrases the agent must never write to customers."
  }
}`;
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

    let finalSystemInstruction = systemInstruction;
    const selectedLang = language || "en";
    if (selectedLang === "hi") {
      finalSystemInstruction += " STRICT REQUIREMENT: Your entire generated response (all text fields including explanation, feedback, tip, etc.) MUST be written in beautiful, authentic, grammatical Hindi language (using Devanagari script). Keep formatting clean.";
    } else if (selectedLang === "hinglish") {
      finalSystemInstruction += " STRICT REQUIREMENT: Your entire generated response (all text fields including explanation, feedback, tip, etc.) MUST be written in natural conversational Hinglish (Hindi written phonetically in clean English alphabets using standard loanwords like 'payout', 'charges', 'delay', 'verify', 'account').";
    }

    const responseText = await generateAIResponse(promptText, finalSystemInstruction, true);
    const parsedResponse = parseCleanJson(responseText);
    return res.json(parsedResponse);

  } catch (error: any) {
    console.error("AI Coach generate content error:", error);
    // Graceful fallback to rich simulated mockup on dual fail
    const fallbackResponse = getSimulatedCoachFallback(moduleId, inputs, tone || "Professional", language || "en");
    return res.json(fallbackResponse);
  }
});


// Call AI model to modify/rewrite existing output with commands like 'shorten', 'polite', 'professional' or custom commands!
app.post("/api/coach/rewrite", async (req, res) => {
  const { originalText, command, tone, language } = req.body;

  if (!originalText || !command) {
    return res.status(400).json({ error: "Original text and rewrite action/command are required." });
  }

  // Check if standard keys are configured
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const hasKeys = (geminiKey && geminiKey !== "MY_GEMINI_API_KEY" && geminiKey.trim() !== "") ||
                  (openaiKey && openaiKey !== "MY_OPENAI_API_KEY" && openaiKey.trim() !== "") ||
                  (groqKey && groqKey !== "MY_GROQ_API_KEY" && groqKey.trim() !== "");

  if (!hasKeys) {
    const backupText = getSimulatedRewrite(originalText, command, tone, language || "en");
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

    const selectedLang = language || "en";
    if (selectedLang === "hi") {
      instruction += " STRICT REQUIREMENT: Translate and write the output exclusively in authentic Hindi using Devanagari script.";
    } else if (selectedLang === "hinglish") {
      instruction += " STRICT REQUIREMENT: Translate and write the output exclusively in conversational phonetical Hinglish (mix of Hindi & English in Latin/English alphabet).";
    }

    const promptText = `Original Text: "${originalText}"\nDesired Tone Context: "${tone || 'Professional'}"\n\n${instruction}\n\nReturn ONLY the modified rewritten paragraph, with no extra framing or preamble.`;

    const rewritten = await generateAIResponse(promptText, "You are a customer support tone rewriter.", false);
    res.json({ rewrittenText: rewritten.trim() });

  } catch (err: any) {
    console.error("AI rewrite API error:", err);
    res.json({
      rewrittenText: getSimulatedRewrite(originalText, command, tone, language || "en")
    });
  }
});


// Helper functions for mock fallback if Gemini is not authorized or key is missing
function getSimulatedCoachFallback(moduleId: string, inputs: any, tone: string, language: string = 'en') {
  const t = tone || "Professional";
  
  if (language === 'hi') {
    if (moduleId === "email_coach") {
      const rawText = inputs.emailInputText || "";
      const task = inputs.emailTask || "Improve Existing Email";
      const textLower = rawText.toLowerCase();

      let topic = "डीमैट खाता और केवाईसी विवरण";
      let isEscalationTrigger = false;

      if (textLower.includes("demat") || textLower.includes("dmat")) {
        topic = "डीमैट खाता और होल्डिंग्स";
      } else if (textLower.includes("trading") || textLower.includes("trade")) {
        topic = "ट्रेडिंग खाता सक्रियण (Activation)";
      } else if (textLower.includes("payout") || textLower.includes("withdrawal") || textLower.includes("funds")) {
        topic = "फंड्स निकासी पेआउट सेटलमेंट";
      } else if (textLower.includes("unauthorized") || textLower.includes("loss") || textLower.includes("fraud")) {
        topic = "अनाधिकृत लेनदेन सुरक्षा ऑडिट";
        isEscalationTrigger = true;
      }

      let customerSentiment = "शांतिपूर्ण (Calm)";
      if (textLower.includes("useless") || textLower.includes("worst") || textLower.includes("cheat") || textLower.includes("angry") || textLower.includes("unauthorized")) {
        customerSentiment = "क्रोधित (Angry)";
      }

      return {
        detectedInputType: textLower.includes("dear") || textLower.includes("sincerely") ? "एजेंट ड्राफ्ट (Agent Draft)" : "ग्राहक प्रश्न (Customer Query)",
        customerSentiment,
        priorityLevel: isEscalationTrigger ? "उच्च (High)" : "मध्यम (Medium)",
        recommendedTone: "विनम्र एवं अनुपालन-सुरक्षित (Polite & Compliance Safe)",
        subjectLine: `डीमैट अकाउंट ${topic} समाधान संदर्भ संख्या: #${Math.floor(100000 + Math.random() * 900000)}`,
        finalEmailDraft: `प्रिय निवेशक,\n\nआपके ${topic} के संबंध में अनुरोध प्राप्त हुआ है। हम स्पष्ट करना चाहते हैं कि सेबी (SEBI) और विनियामक दिशानिर्देशों के तहत आपके फंड और होल्डिंग्स पूरी तरह से सुरक्षित हैं।\n\nकृपया ध्यान दें कि शेयर बाज़ार निवेश जोखिमों के अधीन हैं, और हम किसी भी तरह के निश्चित लाभ (guaranteed profits) का वादा नहीं करते हैं। आपके अनुरोध का तुरंत निस्तारण हमारे वरिष्ठ अधिकारियों द्वारा निष्पादित किया जा रहा है।\n\nसादर,\nक्लाइंट ऑपरेशन्स टीम`,
        shortVersion: `प्रिय निवेशक, आपके ${topic} पर हमारी कंप्लायंस टीम काम कर रही है। कृपया सुनिश्चित करें कि लेनदेन मानकों के अनुसार है, हम जल्द अपडेट साझा करेंगे।`,
        moreEmpatheticVersion: `प्रिय निवेशक,\n\nहम आपके ${topic} को लेकर आपकी चिंता को पूरी तरह समझ सकते हैं। हम आपकी सहायता के लिए सदैव तत्पर हैं और आपके खाते के समाधान के लिए विशेष ध्यान दे रहे हैं। धन्यवाद आपके धैर्य के लिए।`,
        moreProfessionalVersion: `विषय: ${topic} के संबंध में विवरण ऑडिट।\n\nविनियामक मानकों (Regulatory Standards) के तहत डीमैट और रिस्क ऑडिट का कार्य प्रक्रिया में है। हम बिना किसी बाह्य प्रभाव के निष्पक्ष जांच संपन्न करेंगे।`,
        keyImprovementsMade: `1. **विनियामक अनुपालन**: बाज़ार जोखिमों और सेबी गाइडलाइन्स के तहत सही अनुपालन वाक्य शामिल किए।\n2. **सहानुभूतिपूर्ण शब्दावली**: ग्राहक की हताशा को स्वीकार कर भरोसेमंद भरोसा दिलाया।`,
        wordsPhrasesToAvoid: `* "वेट करो" -> "हम त्वरित समाधान के लिए तत्पर हैं"\n* "गारंटीड मुनाफ़ा" -> "शेयर बाज़ार निवेश जोखिम के अधीन है"`
      };
    }

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
    if (moduleId === "email_coach") {
      const rawText = inputs.emailInputText || "";
      const task = inputs.emailTask || "Improve Existing Email";
      const textLower = rawText.toLowerCase();

      let topic = "Demat account and KYC verification query";
      let isEscalationTrigger = false;

      if (textLower.includes("demat") || textLower.includes("dmat")) {
        topic = "Demat Account holding and shares portfolio";
      } else if (textLower.includes("trading") || textLower.includes("trade")) {
        topic = "Trading account active state";
      } else if (textLower.includes("payout") || textLower.includes("withdrawal") || textLower.includes("funds")) {
        topic = "Funds withdrawal payout transactions";
      } else if (textLower.includes("unauthorized") || textLower.includes("loss") || textLower.includes("fraud")) {
        topic = "Unauthorized trading and risk audit security";
        isEscalationTrigger = true;
      }

      let customerSentiment = "Calm";
      if (textLower.includes("useless") || textLower.includes("worst") || textLower.includes("cheat") || textLower.includes("angry") || textLower.includes("unauthorized")) {
        customerSentiment = "Angry";
      }

      return {
        detectedInputType: textLower.includes("dear") || textLower.includes("sincerely") ? "Agent Email Draft" : "Customer Query",
        customerSentiment,
        priorityLevel: isEscalationTrigger ? "High " : "Medium",
        recommendedTone: "Empathetic, Polite & SEBI compliant",
        subjectLine: `Sincere Update: Aapke ${topic} query ke regarding Ref #${Math.floor(100000 + Math.random() * 900000)}`,
        finalEmailDraft: `Dear Investor,\n\nAapke ${topic} inquiry ke regarding humne detail review start kiya hai. Hum assure karna chahte hain ki standard SEBI exchange rules and depository guidelines ke tehet aapke funds dynamic mode me completely safe hain.\n\nPlease note ki brokerage market investments are subject to risk parameters, aur hum koi guaranteed return ya profits promise nahi karte. Hamari compliance and backend risk management desk aapke file ko manual check karke verify kar rahe hain taaki issue super fast sort out ho sake.\n\nWarm regards,\nClient Operations Support Desk`,
        shortVersion: `Dear Investor, aapke ${topic} report par hamari compliance audit desk task review kar rahi hai. Regulatory safety checks secure hote hi clearance code update diya jayega.`,
        moreEmpatheticVersion: `Dear Partner,\n\nHum completely samajh sakte hain ki aap is ${topic} delay ko lekar kitne frustrated hain. Hum dil se appreciate karte hain aapke patience ko. Aapki security hamari absolute preference hai, isliye hum is transfers ko priority tracking guidelines me handle kar rahe hain.`,
        moreProfessionalVersion: `Subject: Standard Audit Notification for ${topic}.\n\nPursuant to brokerage regulatory guidelines, your portfolio ledger is currently in verification audit. The finalized incident reports and settlement statements will be shared legally in standard working hours.`,
        keyImprovementsMade: `1. **Compliance Disclosure Integration**: "No profit promise" and "Market risk" disclosures gracefully include kiye bina rudeness ke.\n2. **Clear Milestones**: Customer ko process aur compliance check ke progress ke steps specify kiye simple Hinglish language me.`,
        wordsPhrasesToAvoid: `* "Wait karo" -> "We are actively resolving it under priority checks"\n* "Profit ki guarantee hai" -> "Investments are subject to audit and risk regulations"`
      };
    }

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
  if (moduleId === "email_coach") {
    const rawText = inputs.emailInputText || "";
    const task = inputs.emailTask || "Improve Existing Email";
    const textLower = rawText.toLowerCase();

    // Context / Keyword detection
    let topic = "account status";
    let isEscalationTrigger = false;

    if (textLower.includes("demat") || textLower.includes("dmat")) {
      topic = "Demat Account and Portfolio Holdings";
    } else if (textLower.includes("trading")) {
      topic = "Trading Account Activation";
    } else if (textLower.includes("kyc") || textLower.includes("pan") || textLower.includes("aadhaar")) {
      topic = "KYC Re-verification and Document Onboarding";
    } else if (textLower.includes("closure") || textLower.includes("close")) {
      topic = "Account Closure Request and Transfer Protocol";
    } else if (textLower.includes("payout") || textLower.includes("withdrawal") || textLower.includes("funds")) {
      topic = "Funds Withdrawal Payout Settlement";
    } else if (textLower.includes("margin") || textLower.includes("pledge") || textLower.includes("collateral")) {
      topic = "Margin Shortfall & Collateral Pledging";
    } else if (textLower.includes("cdsl") || textLower.includes("nsdl") || textLower.includes("rta")) {
      topic = "Depositories (CDSL/NSDL) and Registrar holdings transfer";
    } else if (textLower.includes("dividend")) {
      topic = "Corporate Dividend Disbursements";
    } else if (textLower.includes("unauthorized") || textLower.includes("loss") || textLower.includes("fraud") || textLower.includes("legal") || textLower.includes("regulatory") || textLower.includes("sebi")) {
      topic = "Security Dispute / Unauthorized Transaction Audit Inquiry";
      isEscalationTrigger = true;
    }

    // Sentiment detection
    let customerSentiment = "Calm";
    if (textLower.includes("useless") || textLower.includes("worst") || textLower.includes("cheat") || textLower.includes("angry") || textLower.includes("fraud") || textLower.includes("delay") || textLower.includes("!!") || textLower.includes("loss") || textLower.includes("unauthorized")) {
      customerSentiment = "Angry";
    } else if (textLower.includes("waiting") || textLower.includes("please help") || textLower.includes("stuck") || textLower.includes("error")) {
      customerSentiment = "Frustrated";
    }

    // Priority level
    let priorityLevel = "Medium";
    if (isEscalationTrigger || customerSentiment === "Angry") {
      priorityLevel = "High";
    } else if (textLower.length < 15 && textLower.length > 0) {
      priorityLevel = "Low";
    }

    // Tone recommendation
    let recommendedTone = "Professional & Empathetic";
    if (isEscalationTrigger) {
      recommendedTone = "Formal Regulatory-Compliant / Escalated Focus";
    } else if (customerSentiment === "Angry") {
      recommendedTone = "High Empathy & Ownership";
    }

    // Constructing subject line
    let subjectLine = `Update regarding your ${topic} : Case Ref #${Math.floor(100000 + Math.random() * 900000)}`;
    if (task.includes("Escalation")) {
      subjectLine = `[ESCALATION ALERT - URGENT] Technical / Compliance Audit - ${topic}`;
    } else if (task.includes("Apology")) {
      subjectLine = `Sincere Apology & Resolution: Your ${topic}`;
    }

    // Final Email Draft based on Task
    let finalEmailDraft = "";
    let shortVersion = "";
    let moreEmpatheticVersion = "";
    let moreProfessionalVersion = "";
    
    if (isEscalationTrigger) {
      finalEmailDraft = `Dear Client,\n\nWe understand your concern regarding the unauthorized transaction activity mentioned in your report: "${rawText.substring(0, 80)}...". Please note that as a registered stock broker, we take all regulatory and security parameters with absolute seriousness.\n\nBased on your audit submission, we have locked your trading terminal temporarily to prevent any further operations and have initiated an immediate forensic review with our Risk Management desk and the respective Depository. We must clarify that we do not promise profits or provide unilateral guarantees, but we are conducting a complete investigation in compliance with regulatory rules.\n\nYour case has been escalated to Tier-3 support, and a senior incident officer will reach out to you within 2 hours with formal updates.\n\nSincerely,\nCompliance & Risk Operations Lead`;
    } else if (task.includes("Escalation")) {
      finalEmailDraft = `Dear Team,\n\nWe have received an escalation requirement regarding a customer's ${topic} query:\n"${rawText.substring(0, 100)}". \n\nPlease note that standard settlement parameters are being reviewed. Engineering must log into clearing logs and confirm. Standard SEBI compliance boundaries prevent us from making any absolute guarantees, but we request the desk to run manual database validations.\n\nWarm regards,\nLead Operations Coordinator`;
    } else if (task.includes("Apology")) {
      finalEmailDraft = `Dear Investor,\n\nPlease accept our sincere and unreserved apologies for the delay and distress you have experienced regarding your ${topic}. We understand how crucial timely updates are for your investment management. \n\nWe have reviewed your request: "${rawText.substring(0, 80)}...", and our clearing desk has applied manual adjustments to expedite processing. Please be assured that we are taking concrete steps to resolve this, and we thank you for your patience as we make this right.\n\nWarm regards,\nSupervisor, Executive Client Relations`;
    } else {
      finalEmailDraft = `Dear Client,\n\nThank you for reaching out to us regarding your query on "${rawText.substring(0, 150)}". We understand your concern and want to assist you directly.\n\nBased on the information available, we verify that your request regarding ${topic} is currently processing under standard guidelines. Please note that market-related investments are subject to risk parameters, and we do not provide unilateral investment advice or promise guaranteed returns. Our team is actively reviewing your portfolio configurations to ensure a seamless experience.\n\nSincerely,\nClient Relations Team`;
    }

    shortVersion = `Dear Client, we are actively processing your request regarding your ${topic}. We verify that safety checks are being executed under standard compliance guidelines. We do not provide investment returns advice, but we are prioritizing your resolution.`;
    
    moreEmpatheticVersion = `Dear Investor,\n\nWe genuinely hear you, and we fully understand how stressful waiting on your ${topic} can be. We appreciate you sharing your details: "${rawText.substring(0, 80)}...". Please rest assured your capital and personal details are fully safe. We are closely monitoring this settlement from our end and will personally make sure this is updated for you as quickly as possible. Thank you for standing by us.`;

    moreProfessionalVersion = `Dear Customer,\n\nWe refer to your query regarding the ${topic} of your account ("${rawText.substring(0, 80)}"). Based on the information available, your file is being reviewed in strict accordance with exchange guidelines. Please note that all market investments carry associated risks, and we do not issue guaranteed assertions. We will share formal status reports upon completion of our compliance review.`;

    const keyImprovements = `1. **Client-Centric Validation**: Replaced any defensive/rigid sentences with polite, supportive validation of user concerns.\n2. **Compliance Framework Alignment**: Added necessary disclosures (no profit promising, no investment advice) smoothly to protect both agent and firm.\n3. **Clarity on Next-Steps**: Provided direct, actionable guidance on timelines instead of vague words like 'Wait for some time'.`;

    const wordsToAvoid = `* "Wait / Delay" -> Replaced with: "We are actively monitoring/prioritizing your settlement"\n* "Not possible / Rules say so" -> Replaced with: "In accordance with standard regulatory reviews..."\n* "Promise / Guarantee returns" -> Replaced with: "Investments are subject to market risks/safety protocols"`;

    return {
      detectedInputType: rawText.includes("Dear") || rawText.includes("Sincerely") ? "Agent Reply / Email Draft" : "Customer Query",
      customerSentiment,
      priorityLevel,
      recommendedTone,
      subjectLine,
      finalEmailDraft,
      shortVersion,
      moreEmpatheticVersion,
      moreProfessionalVersion,
      keyImprovementsMade: keyImprovements,
      wordsPhrasesToAvoid: wordsToAvoid
    };
  }

  // Pure English Fallbacks
  if (moduleId === "email_improvement") {
    let emailText = "";
    const toneLower = t.toLowerCase();

    if (toneLower === "empathetic" || toneLower === "empathy") {
      emailText = `Dear Customer,\n\nWe want to start by thanking you for bringing this up, and we genuinely understand how challenging this must be for you. We know that waiting or dealing with issues regarding ${inputs.issueType || "this transaction"} can be incredibly frustrating. Please rest assured we are working directly alongside our supervisor team to handle this with the utmost care and resolve it as quickly as possible. Your peace of mind means everything to us.\n\nWarmest regards,\nYour Customer Support Team`;
    } else if (toneLower === "polite") {
      emailText = `Dear Customer,\n\nThank you so much for your patience. It is our absolute pleasure to assist you with your inquiries regarding ${inputs.issueType || "this transaction"}. Our team is currently reviewing your request with our department supervisor to ensure a smooth, delightful resolution. Please feel free to reach out to us at any time if you have any questions.\n\nWith warm wishes,\nCustomer Care Team`;
    } else if (toneLower === "firm") {
      emailText = `Dear Customer,\n\nThank you for contacting us regarding ${inputs.issueType || "this transaction"}. We wish to clarify that our operations are carried out in strict compliance with our service guidelines and established regulatory frameworks. Our supervisor team is conducting a formal audit of your request. Please note that all transactions must satisfy standard compliance thresholds prior to any manual release.\n\nSincerely,\nCompliance Security Desk`;
    } else if (toneLower === "apology") {
      emailText = `Dear Customer,\n\nPlease accept our sincere and unreserved apologies for the delay and frustration regarding ${inputs.issueType || "this transaction"}. We completely understand your disappointment and take full responsibility for this communication break. Our supervisors have taken immediate intervention to apply the necessary adjustments manually to ensure no further delay occurs.\n\nSincerely,\nCustomer Relations Supervisor`;
    } else if (toneLower === "escalation") {
      emailText = `Dear Customer,\n\nWe have initiated high-priority escalation protocols regarding your ${inputs.issueType || "transaction status"}. Your concern has been elevated directly to our senior supervisory desk. We are conducting an active technical audit to resolve the bottleneck and will share the final resolution details within 2 hours.\n\nRespectfully yours,\nSenior Lead Incident Coordinator`;
    } else { // Professional
      emailText = `Dear Customer,\n\nThank you for sharing your concerns regarding ${inputs.issueType || "this transaction"}. We have received your inquiry and are currently reviewing your account details in accordance with our standard service guidelines. Our supervisor team is investigating the matter and will proceed with the appropriate adjustments as soon as the review is complete.\n\nSincerely,\nOperations Support Team`;
    }

    return {
      improvedEmail: emailText,
      explanationOfImprovements: `Adjusted tone to be fully ${t}. Removed aggressive constraints and blamed framing. Highlighted team coordination and support avenues over static policies to preserve relationship trust.`,
      betterSubjectLine: `Update regarding your recent concern: ${inputs.issueType || "Support Ticket"}`
    };
  }

  if (moduleId === "complaint_handling") {
    let replyText = "";
    let apologyLine = `Please accept our sincere apologies for the clear distress and waste of your valuable time.`;
    const toneLower = t.toLowerCase();

    if (toneLower === "empathetic" || toneLower === "empathy") {
      replyText = `Dear Client,\n\nWe hear you loud and clear, and we genuinely feel your frustration. Your experience with our ${inputs.issueType || "service"} fell far short of what you deserve, and your disappointment is completely valid. To address this immediately, we are initiating a dedicated remedy: ${inputs.resolution || "immediate technical sweep"}. Please rest assured we are standing by you to make things right.\n\nSincerely,\nClient Experience Team`;
    } else if (toneLower === "polite") {
      replyText = `Dear Client,\n\nThank you so much for contacting us regarding your experience. We truly appreciate you bringing this matter to our attention. We are delighted to assist in resolving this right away, and we are initiating the following remedy for you: ${inputs.resolution || "immediate technical sweep"}. We hope you have a pleasant rest of your day.\n\nBest regards,\nCustomer Delight Representative`;
    } else if (toneLower === "firm") {
      replyText = `Dear Client,\n\nWe have received your complaint regarding the ${inputs.issueType || "service"}. While we understand your concerns, we must state that our operations are governed strictly by our standard terms and conditions. As a final resolution, we are authorizing the following standard remedy: ${inputs.resolution || "immediate technical sweep"}. Please note that further modifications to this resolution will not be possible.\n\nSincerely,\nCorporate Compliance Team`;
    } else if (toneLower === "apology") {
      replyText = `Dear Client,\n\nPlease accept our deepest and most sincere apologies for the critical disturbance regarding our ${inputs.issueType || "service"}. We know we let you down, and we take full responsibility for this failure. To correct this immediately, we have authorized: ${inputs.resolution || "immediate technical sweep"}. We are taking training steps to prevent any repetition.\n\nSincerest regards,\nCustomer Success Supervisor`;
    } else if (toneLower === "escalation") {
      replyText = `Dear Client,\n\nWe have registered your complaint and classified it as a high-incident case under our corporate escalation policy. Your ticket has been dispatched directly to the Office of the Director. We are initiating high-level active remedies: ${inputs.resolution || "immediate technical sweep"}. A dedicated coordinator will follow up with you in 12 hours.\n\nSincerely,\nExecutive Incident Director`;
    } else { // Professional
      replyText = `Dear Client,\n\nThank you for detailing your experience with our ${inputs.issueType || "service"}. We have logged your feedback regarding the issue. To address this situation, we are initiating the following formal resolution steps: ${inputs.resolution || "immediate technical sweep"}. This case is being tracked to ensure all performance standards are met.\n\nSincerely,\nOperations Support Manager`;
    }

    return {
      empatheticReply: replyText,
      apologyLine: apologyLine,
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

    // Check if the input contains email markers to identify type
    const isDraft = rawText.includes("Dear") || rawText.includes("Hi") || rawText.includes("@") || rawText.includes("Sincerely") || rawText?.length > 150;
    const isAngry = textLower.includes("useless") || textLower.includes("cheat") || textLower.includes("worst") || textLower.includes("fraud") || textLower.includes("angry");

    let inputType = isDraft ? "Agent Reply / Email Draft" : "Customer Query";
    let customerSentiment = isAngry ? "Angry" : "Frustrated";
    let priority = isAngry ? "High" : "Medium";

    // Detect Topic context
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
