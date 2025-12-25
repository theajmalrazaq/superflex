import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  X,
  User,
  Trash2,
  Shield,
  Zap,
  TrendingUp,
  Search,
  Sparkles,
  ChevronDown,
  Square,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AVAILABLE_MODELS = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    short: "GPT-4o Mini",
    provider: "OpenAI",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    short: "Gemini 2.0",
    provider: "Google",
  },
  {
    id: "google/gemini-3-pro-preview",
    name: "Gemini 3 Pro",
    short: "Gemini 3",
    provider: "Google",
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    short: "DeepSeek",
    provider: "DeepSeek",
  },
  { id: "grok-2", name: "Grok 2", short: "Grok 2", provider: "xAI" },
];

const AnimatedLogo = ({ size = 24, animated = true, className = "" }) => (
  <div
    className={`relative flex items-center justify-center ${className}`}
    style={{ width: size, height: size }}
  >
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      className="relative z-10"
    >
      <path
        fill="#a098ff"
        d="M13.295 10.769l2.552-5.787-7.979 7.28 3.254.225-3.353 6.362 8.485-7.388-2.959-.692z"
      />
    </svg>
    {animated && (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        fill="none"
        className="absolute inset-0 pointer-events-none"
      >
        <path
          fill="#a098ff"
          className="animate-splash"
          d="M13.295 10.769l2.552-5.787-7.979 7.28 3.254.225-3.353 6.362 8.485-7.388-2.959-.692z"
        />
      </svg>
    )}
  </div>
);

const SuperFlexAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dataContext, setDataContext] = useState({
    attendance: null,
    marks: null,
    studentName: null,
    transcript: null,
    mcaData: null,
    studyPlan: null,
    lastScanned: null,
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [permissionStatus, setPermissionStatus] = useState(
    () => localStorage.getItem("superflex_ai_data_permission") || "pending",
  );
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem("superflex_ai_model") || "gemini-2.0-flash",
  );
  const [showModelPicker, setShowModelPicker] = useState(false);
  const scrollRef = useRef(null);
  const activeRequestIdRef = useRef(null);

  useEffect(() => {
    if (window.superflex_ai_context) {
      setDataContext(window.superflex_ai_context);
    }

    const handleDataUpdate = (e) => {
      const newData = e.detail;
      setDataContext((prev) => {
        const updated = { ...prev, ...newData };
        window.superflex_ai_context = updated;
        return updated;
      });
    };

    window.addEventListener("superflex-data-updated", handleDataUpdate);

    const handleTranscriptSync = (e) => {
      const data = e.detail;
      if (data.isTranscriptSync) {
        setIsScanning(false);
        setScanProgress(100);

        setMessages((prev) => {
          if (prev.some((m) => m.content.includes("✅ **Sync Complete!**")))
            return prev;
          return [
            ...prev,
            {
              role: "assistant",
              content:
                "✅ **Transcript Sync Complete!** I've parsed your entire academic history and the grading curves (MCA). I'm ready to predict your GPA or simulate your 'What-If' scenarios. What's on your mind?",
            },
          ];
        });
      }
    };

    window.addEventListener("superflex-data-updated", handleTranscriptSync);

    const savedMessages = localStorage.getItem("superflex_ai_messages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    } else {
      if (messages.length === 0 && permissionStatus !== "pending") {
        setMessages([
          {
            role: "assistant",
            content:
              "Hi! I'm your SuperFlex AI assistant. I've automatically synced your marks, attendance, and degree roadmap in the background. How can I help you today?",
          },
        ]);
      }
    }

    const handleScanComplete = () => {
      setIsScanning(false);
      setScanProgress(100);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "✅ **Auto-Sync Complete!** I've refreshed your academic records. How can I help you with your subjects?",
        },
      ]);
    };

    window.addEventListener("superflex-scan-complete", handleScanComplete);

    return () => {
      window.removeEventListener("superflex-data-updated", handleDataUpdate);
      window.removeEventListener(
        "superflex-data-updated",
        handleTranscriptSync,
      );
      window.removeEventListener("superflex-scan-complete", handleScanComplete);
    };
  }, [permissionStatus]);

  useEffect(() => {
    localStorage.setItem("superflex_ai_model", selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("superflex_ai_messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    const requestId = crypto.randomUUID();
    activeRequestIdRef.current = requestId;
    let responseText = "";

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const responseHandler = (e) => {
      const { id, text, error, done } = e.detail;
      if (id !== requestId || !activeRequestIdRef.current) {
        document.removeEventListener("superflex-ai-response", responseHandler);
        return;
      }

      if (error) {
        document.removeEventListener("superflex-ai-response", responseHandler);
        setIsLoading(false);
        activeRequestIdRef.current = null;

        let errorMsg = "Sorry, I encountered an error.";
        if (error === "auth_required" || error === "auth_canceled") {
          errorMsg =
            "Please sign in to Puter to continue. A popup should appear.";

          if (error === "auth_required") {
            document.dispatchEvent(new CustomEvent("superflex-auth-trigger"));
          }
        } else {
          errorMsg = `Error: ${error}`;
        }

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant") {
            const others = prev.slice(0, -1);
            return [...others, { role: "assistant", content: errorMsg }];
          }
          return prev;
        });
        return;
      }

      if (text) {
        responseText += text;
        setMessages((prev) => {
          const last = prev[prev.length - 1];

          if (last && last.role === "assistant") {
            const others = prev.slice(0, -1);
            return [...others, { ...last, content: responseText }];
          }
          return prev;
        });
      }

      if (done) {
        document.removeEventListener("superflex-ai-response", responseHandler);
        setIsLoading(false);
        activeRequestIdRef.current = null;
        if (!responseText) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant" && !last.content) {
              return prev.slice(0, -1);
            }
            return prev;
          });
        }
      }
    };

    document.addEventListener("superflex-ai-response", responseHandler);

    try {
      const chatHistory = messages
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");

      const academicData = {
        student: {
          name: dataContext.studentName || "Student",
          cmsId: "REDACTED",
          program: "Unknown",
          section: "Unknown",
        },
        currentPerformance: {
          marks:
            dataContext.marks && dataContext.marks.length > 0
              ? dataContext.marks
              : "Syncing in background...",
          attendance:
            dataContext.attendance && dataContext.attendance.length > 0
              ? dataContext.attendance
              : "Syncing in background...",
        },
        academicHistory: {
          transcript:
            dataContext.transcript || "Missing (Visit Transcript Page)",
          mcaData: dataContext.mcaData || "Missing (Visit Transcript Page)",
          studyPlan: dataContext.studyPlan || "Missing (Visit Transcript Page)",
        },
        systemAlerts: [],
      };

      if (permissionStatus !== "granted") {
        academicData.student = { name: "Student", cmsId: "N/A" };
        academicData.currentPerformance = {
          marks: "Permission denied",
          attendance: "Permission denied",
        };
        academicData.academicHistory = {
          transcript: "Permission denied",
          studyPlan: "Permission denied",
        };
        academicData.systemAlerts = ["Permission denied"];
      }

      const prompt = `
        You are "SuperFlex AI", the intelligent, human-like academic advisor for SuperFlex (a premium student portal). Your goal is to guide students through their academic journey with clarity and empathy.
        
        ### PERSONALITY & TONE:
        - Human-like, empathetic, and encouraging.
        - Casually professional (natural language, not robotic).
        - **NEVER** output raw code snippets (like \`print(x)\`), variable names, or technical jargon unless explicitly asked for it.
        - **NEVER** act like a raw calculator or a command-line interface. 
        - Always explain your calculations in full sentences.
        
        ### STUDENT PROFILE
        - Name: ${academicData.student.name}
        - CMS: ${academicData.student.cmsId || "N/A"}
        - Program: ${academicData.student.program || "Unknown"}
        - Section: ${academicData.student.section || "N/A"}
        
        ### GROUND TRUTH DATA (Structured Context)
        1. CURRENT SEMESTER MARKS:
        ${JSON.stringify(academicData.currentPerformance.marks, null, 2)}
        
        2. ATTENDANCE ANALYTICS:
        ${JSON.stringify(academicData.currentPerformance.attendance, null, 2)}
        
        3. ACADEMIC TRANSCRIPT (Past Semesters):
        ${JSON.stringify(academicData.academicHistory.transcript, null, 2)}
        
        4. DEGREE ROADMAP (Tentative Study Plan):
        ${JSON.stringify(academicData.academicHistory.studyPlan, null, 2)}

        5. RELATIVE GRADING THRESHOLDS (MCA Data):
        ${JSON.stringify(academicData.academicHistory.mcaData, null, 2)}
        
        ### CONVERSATION HISTORY
        ${chatHistory}
        
        ### CURRENT INTERACTION
        - Current Page: ${window.location.pathname}
        - User Question: ${userMessage}
        
        ### OPERATIONAL GUIDELINES:
        1. Analyze "CURRENT SEMESTER MARKS" for assessment-level queries (quizzes, assignments, mids).
        2. **CRITICAL FOR MARKS**: Each category (Assignment, Quiz, etc.) has a "stats" object containing sophisticated metrics: properties like \`weightedAvg\`, \`weightedMin\`, \`weightedMax\`, and \`weightedStdDev\`. Use these to compare the student's performance against the class. Use \`stats.totalObtainedWeighted\` and \`stats.totalWeight\` for grade calculations. DO NOT sum raw marks yourself. 
        3. Use "ATTENDANCE ANALYTICS" (including detailed day-by-day logs) to warn about the 80% threshold and help identify exactly which dates the student was away.
        4. Use "ACADEMIC TRANSCRIPT" for CGPA/SGPA and history questions.
        5. Use "DEGREE ROADMAP" for graduation, core courses, and remaining credits.
        6. If transcript, MCA, or study plan data is missing, explicitly tell them: "Could you please head over to the Transcript page for a split second? I need to grab your academic history and the current grading curves from there to give you accurate predictions."
        7. You no longer need to ask them to visit 'Home' or 'Attendance' pages as those are synced automatically in the stealth background.
        9. RELATIVE GRADING LOGIC: Use "RELATIVE GRADING THRESHOLDS" (MCA Data) to predict grades. For example, if a course has MCA 55, look up the "55" key in MCA data to see the marks required for each grade.
        10. GPA PREDICTOR / SANDBOX MODE: You have the ability to simulate future CGPA. When a user asks about their future CGPA, use their current Transcript (CGPA/Total Credits) and their Study Plan (future courses/credits) to calculate projected outcomes. Assume standard grades (e.g., A, B) if they don't specify.
        11. Be concise, friendly, and casually professional. Speak naturally but avoid excessive slang or overly formal language.
        12. Format performance data in clean Markdown tables when answering.
        13. **OUT-OF-SCOPE QUERIES**: If a user asks a question that is not related to their academics, the SuperFlex portal, or university life, politely decline by saying something like: "I'm primarily focused on your academic success here! I'm sorry, but I can't help with [topic]. Is there anything else about your grades or attendance you'd like to discuss?"
        14. **NO RAW CODE**: Never output raw code snippets (e.g., \`print(2.5)\`) as a response to a general question. Always provide a natural, human-like explanation. If you calculate something, explain the result in a friendly way.
      `;

      document.dispatchEvent(
        new CustomEvent("superflex-ai-query", {
          detail: {
            id: requestId,
            prompt: prompt,
            model: selectedModel,
          },
        }),
      );
    } catch (e) {
      document.removeEventListener("superflex-ai-response", responseHandler);
      console.error("AI Setup Error:", e);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content:
            "Sorry, I encountered an internal error setting up the request.",
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleInterrupt = () => {
    if (activeRequestIdRef.current) {
      document.dispatchEvent(
        new CustomEvent("superflex-ai-interrupt", {
          detail: { id: activeRequestIdRef.current },
        }),
      );
      activeRequestIdRef.current = null;
      setIsLoading(false);

      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (
          lastMessage &&
          lastMessage.role === "assistant" &&
          !lastMessage.content
        ) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    }
  };

  const runSmartScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(10);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "Initiating **Smart Scan**. I'm silently vacuuming your academic records into my memory... 🚀",
      },
    ]);

    window.dispatchEvent(new CustomEvent("superflex-trigger-scan"));

    setTimeout(() => {
      if (isScanning) setScanProgress(50);
    }, 1000);
  };

  const handlePermission = (status) => {
    setPermissionStatus(status);
    localStorage.setItem("superflex_ai_data_permission", status);

    window.dispatchEvent(
      new CustomEvent("superflex-permission-updated", { detail: status }),
    );

    const welcomeMsg =
      status === "granted"
        ? "Thanks! I've connected to your academic data. How can I help you?"
        : "Understood. I will not access your academic data. I can still help you with general questions.";

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: welcomeMsg },
    ]);
  };

  const clearChat = () => {
    localStorage.removeItem("superflex_ai_messages");
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared! How can I help you today?",
      },
    ]);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999]">
        <style>{`
          @keyframes superflex-gradient-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
           .markdown-body table {
            display: block;
            width: 100%;
            overflow-x: auto;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 12px;
          }
          .markdown-body th, .markdown-body td {
            border: 1px solid rgba(255,255,255,0.1);
            padding: 8px;
            text-align: left;
            white-space: nowrap;
          }
          .markdown-body th {
            background: rgba(160,152,255,0.1);
            color: #a098ff;
          }
        `}</style>

        {!isOpen && (
          <div
            className="absolute -inset-[3px] rounded-full opacity-100 blur-[8px] transition-opacity duration-500"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, #a098ff 30%, #ec4899 50%, #a098ff 70%, transparent 100%)",
              animation: "superflex-gradient-spin 3s linear infinite",
            }}
          ></div>
        )}

        {!isOpen && (
          <div className="absolute -inset-[1px] rounded-full z-0 overflow-hidden">
            <div
              className="absolute inset-[-100%] animate-[superflex-gradient-spin_3s_linear_infinite]"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, #a098ff 30%, #ec4899 50%, #a098ff 70%, transparent 100%)",
              }}
            ></div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-[#0c0c0c] border border-white/20  flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10 group overflow-hidden"
        >
          {isOpen ? (
            <X size={24} className="text-white relative z-10" />
          ) : (
            <AnimatedLogo
              size={36}
              className="animate-pulse transition-transform relative z-10"
            />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-24 md:w-[420px] h-[65vh] md:h-[650px] md:max-h-[80vh] bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/10 rounded-3xl md:rounded-[2rem] flex flex-col z-[9999] overflow-hidden animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 ease-out">
          <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-x to-transparent opacity-50"></div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900/50 border border-white/10 flex items-center justify-center relative group overflow-hidden">
                <AnimatedLogo size={32} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg tracking-tight">
                  SuperFlex AI
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative z-50">
                <button
                  onClick={() => setShowModelPicker(!showModelPicker)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 active:scale-95 ${
                    showModelPicker
                      ? "bg-x/20 text-x border-x/20"
                      : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                  title="Change AI Model"
                >
                  <Sparkles size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline-block">
                    {AVAILABLE_MODELS.find((m) => m.id === selectedModel)
                      ?.short || selectedModel}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${showModelPicker ? "rotate-180" : ""}`}
                  />
                </button>

                {showModelPicker && (
                  <div className="absolute top-full right-0 mt-3 w-64 bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden z-[1000] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-white/5 bg-white/5">
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        Select Model
                      </h4>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                      {AVAILABLE_MODELS.map((m, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedModel(m.id);
                            setShowModelPicker(false);
                          }}
                          className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-0.5 group ${
                            selectedModel === m.id
                              ? "bg-x/10 border border-x/20"
                              : "hover:bg-white/5 border border-transparent"
                          }`}
                        >
                          <span
                            className={`text-xs font-bold leading-none ${selectedModel === m.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}
                          >
                            {m.name}
                          </span>
                          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">
                            {m.provider}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-2.5 hover:bg-rose-500/20 rounded-xl text-zinc-400 hover:text-rose-400 transition-all bg-white/5 border border-white/5 active:scale-95"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {isScanning && (
            <div className="h-1 bg-zinc-900 w-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-x to-[#ec4899] transition-all duration-500"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-transparent to-black/20"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-fit px-4 py-3 rounded-2xl text-sm relative ${
                    m.role === "user"
                      ? "bg-x text-white rounded-tr-none"
                      : "bg-zinc-900/50 backdrop-blur-md text-zinc-200 border border-white/10 rounded-tl-none"
                  }`}
                >
                  <div
                    className={`flex items-center gap-1.5 mb-2 opacity-80 text-[9px] font-black uppercase tracking-widest ${m.role === "user" ? "justify-end text-white" : "text-x"}`}
                  >
                    {m.role === "user" ? (
                      <img
                        src="/Login/GetImage"
                        alt="U"
                        className="w-4 h-4 rounded-full object-cover border border-white/20"
                        onError={(e) => {
                          e.target.src =
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect fill="%23fff" width="16" height="16"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23a098ff" font-size="10" font-weight="bold">U</text></svg>';
                        }}
                      />
                    ) : (
                      <AnimatedLogo size={16} animated={false} />
                    )}
                    {m.role === "user"
                      ? dataContext.studentName?.split(" ")[0] || "You"
                      : "SuperFlex AI"}
                  </div>
                  <div className="leading-relaxed prose prose-invert prose-sm font-medium text-white markdown-body">
                    {m.role === "assistant" ? (
                      m.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex items-center gap-3 py-2 px-1">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-x rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-x rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-x rounded-full animate-bounce"></div>
                          </div>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            Thinking...
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {}
          {permissionStatus === "pending" && (
            <div className="flex flex-col gap-3 p-5 bg-zinc-900/50 border border-white/10 rounded-2xl mx-2 my-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-x/10 flex items-center justify-center text-x">
                  <Shield size={20} />
                </div>
                <h3 className="text-white font-bold text-sm">
                  Data Access Request
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                To provide personalized academic advice, SuperFlex AI needs
                access to your marks, attendance, and transcript data. This data
                is processed locally and securely.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handlePermission("granted")}
                  className="flex-1 bg-x hover:bg-x/90 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                >
                  Allow Access
                </button>
                <button
                  onClick={() => handlePermission("denied")}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                >
                  Deny
                </button>
              </div>
            </div>
          )}

          <div className="p-6 bg-white/5 border-t border-white/10 backdrop-blur-xl">
            <div className="relative flex items-center group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  permissionStatus === "pending"
                    ? "Please select an option above..."
                    : "Ask your SuperFlex advisor..."
                }
                disabled={permissionStatus === "pending"}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-x/50 focus:ring-4 focus:ring-x/5 transition-all pr-14 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isLoading ? (
                <button
                  onClick={handleInterrupt}
                  className="absolute right-2.5 p-2.5 text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all active:scale-95 animate-pulse flex items-center justify-center outline-none ring-offset-2 ring-offset-black focus:ring-2 focus:ring-rose-500/50"
                  title="Interrupt Response"
                >
                  <Square size={18} fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2.5 p-2.5 text-white bg-x hover:bg-x/80 rounded-xl disabled:opacity-30 disabled:grayscale transition-all active:scale-95 flex items-center justify-center outline-none ring-offset-2 ring-offset-black focus:ring-2 focus:ring-x/50"
                >
                  <Send size={18} />
                </button>
              )}
            </div>
            <div className="mt-2 text-center">
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                Protected by SuperFlex Stealth Sync
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuperFlexAI;
