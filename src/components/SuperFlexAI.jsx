import React, { useState, useEffect, useRef } from "react";
import { Send, X, User, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
        <style>{`@keyframes splash{0%{transform:scale(.2);opacity:.8}80%{transform:scale(1.2);opacity:0}to{transform:scale(2.2);opacity:0}}`}</style>
        <path
          fill="#a098ff"
          d="M13.295 10.769l2.552-5.787-7.979 7.28 3.254.225-3.353 6.362 8.485-7.388-2.959-.692z"
          style={{
            animation: "splash 1.5s cubic-bezier(.165,.84,.44,1) infinite both",
            transformOrigin: "center center",
          }}
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
    studentCms: null,
    universityInfo: null,
    personalInfo: null,
    alerts: [],
    transcript: null,
    studyPlan: null,
    lastScanned: null,
  });

  const scrollRef = useRef(null);

  useEffect(() => {
    const loadContext = () => {
      const savedContext = localStorage.getItem("superflex_ai_context");
      if (savedContext) {
        try {
          const parsed = JSON.parse(savedContext);
          setDataContext((prev) => ({ ...prev, ...parsed }));
        } catch (e) {}
      }
    };

    loadContext();
    window.addEventListener("storage", loadContext);

    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Hi! I'm your SuperFlex AI assistant. I have access to your marks, attendance, academic history, and degree roadmap. How can I help you today?",
        },
      ]);
    }

    return () => {
      window.removeEventListener("storage", loadContext);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("superflex_ai_context", JSON.stringify(dataContext));
  }, [dataContext]);

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

    try {
      if (typeof window.puter === "undefined") {
        throw new Error(
          "Puter.js library not found. Please refresh or check your connection.",
        );
      }

      const isSignedIn = await window.puter.auth.isSignedIn();
      if (!isSignedIn) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "It looks like you're not signed in to Puter. I need a secure connection to process your academic data. Please sign in to Puter when the popup appears to continue our chat!",
          },
        ]);
        setIsLoading(false);

        await window.puter.auth.signIn();
        return;
      }

      const chatHistory = messages
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");

      const academicData = {
        student: {
          name: dataContext.studentName,
          cmsId: dataContext.studentCms,
          program: dataContext.universityInfo?.Degree,
          section: dataContext.universityInfo?.Section,
        },
        currentPerformance: {
          marks: dataContext.marks || "Not scanned yet (Visit Home)",
          attendance: dataContext.attendance || "Not scanned yet (Visit Home)",
        },
        academicHistory: {
          transcript:
            dataContext.transcript || "Not scanned yet (Visit Transcript)",
          studyPlan:
            dataContext.studyPlan || "Not scanned yet (Visit Study Plan)",
        },
        systemAlerts: dataContext.alerts || [],
      };

      const prompt = `
        You are "SuperFlex AI", the intelligent academic advisor for SuperFlex (a premium student portal).
        
        ### STUDENT PROFILE
        - Name: ${academicData.student.name || "Student"}
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
        
        ### CONVERSATION HISTORY
        ${chatHistory}
        
        ### CURRENT INTERACTION
        - Current Page: ${window.location.pathname}
        - User Question: ${userMessage}
        
        ### OPERATIONAL GUIDELINES:
        1. Analyze "CURRENT SEMESTER MARKS" for assessment-level queries (quizzes, assignments, mids).
        2. Use "ATTENDANCE ANALYTICS" (including detailed day-by-day logs) to warn about the 80% threshold and help identify exactly which dates the student was away.
        3. Use "ACADEMIC TRANSCRIPT" for CGPA/SGPA and history questions.
        4. Use "DEGREE ROADMAP" for graduation, core courses, and remaining credits.
        5. If marks or attendance are missing, ask them to visit Home.
        6. If transcript data is missing, explicitly tell them: "I need you to hop onto the Transcript page for a sec so I can sync your academic history without getting us logged out. It's for the bestie vibes and session stability."
        7. If study plan is missing, ask them to visit the Tentative Study Plan page.
        8. Be concise, friendly, and Gen-Z savvy (e.g., using "bestie", "cooked", "locked in", "clutch", "fr fr").
        9. Format performance data in clean Markdown tables when answering.
      `;

      const response = await window.puter.ai.chat(prompt, {
        model: "gemini-2.0-flash",
        stream: true,
      });

      let fullResponse = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      for await (const part of response) {
        if (part?.text) {
          fullResponse += part.text;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            const others = prev.slice(0, -1);
            return [...others, { ...last, content: fullResponse }];
          });
        }
      }
    } catch (e) {
      console.error("AI Error:", e);
      let errorMsg =
        "Sorry, I encountered an error while connecting to Gemini.";

      if (e.code === "auth_canceled") {
        errorMsg =
          "Authentication was canceled. I need you to sign in to Puter so I can safely process your request. Want to try again?";
      } else if (e.message?.includes("401")) {
        errorMsg =
          "Session expired or unauthorized. Please sign in to Puter to continue.";
      } else {
        errorMsg += " " + (e.message || "Unknown error");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMsg,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
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
          @keyframes gradient-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
           .markdown-body table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 12px;
          }
          .markdown-body th, .markdown-body td {
            border: 1px solid rgba(255,255,255,0.1);
            padding: 8px;
            text-align: left;
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
              animation: "gradient-spin 3s linear infinite",
            }}
          ></div>
        )}

        {!isOpen && (
          <div className="absolute -inset-[1px] rounded-full z-0 overflow-hidden">
            <div
              className="absolute inset-[-100%] animate-[gradient-spin_3s_linear_infinite]"
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
        <div className="fixed bottom-24 right-6 w-[95vw] md:w-[420px] h-[650px] max-h-[80vh] bg-[#0c0c0c]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex flex-col z-[9999] overflow-hidden animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 ease-out">
          <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#a098ff] to-transparent opacity-50"></div>
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
              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-2.5 hover:bg-rose-500/20 rounded-xl text-zinc-400 hover:text-rose-400 transition-all bg-white/5 border border-white/5 active:scale-95"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

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
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm relative ${
                    m.role === "user"
                      ? "bg-[#a098ff] text-white rounded-tr-none"
                      : "bg-zinc-900/50 backdrop-blur-md text-zinc-200 border border-white/10 rounded-tl-none"
                  }`}
                >
                  <div
                    className={`flex items-center gap-1.5 mb-2 opacity-80 text-[9px] font-black uppercase tracking-widest ${m.role === "user" ? "justify-end text-white" : "text-[#a098ff]"}`}
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
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-zinc-900/50 backdrop-blur-md px-4 py-3 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <AnimatedLogo
                      size={12}
                      animated={false}
                      className="animate-pulse"
                    />
                    <AnimatedLogo
                      size={12}
                      animated={false}
                      className="animate-pulse [animation-delay:200ms]"
                    />
                    <AnimatedLogo
                      size={12}
                      animated={false}
                      className="animate-pulse [animation-delay:400ms]"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Analyzing Context...
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white/5 border-t border-white/10 backdrop-blur-xl">
            <div className="relative flex items-center group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask your SuperFlex advisor..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a098ff]/50 focus:ring-4 focus:ring-[#a098ff]/5 transition-all pr-14"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2.5 p-2.5 text-white bg-[#a098ff] hover:bg-[#a098ff]/80 rounded-xl disabled:opacity-30 disabled:grayscale transition-all  active:scale-95"
              >
                <Send size={18} />
              </button>
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
