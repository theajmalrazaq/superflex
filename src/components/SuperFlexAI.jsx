import React, { useState, useEffect, useRef } from "react";
import { Send, X, User, Trash2, Shield, Zap, TrendingUp, Search } from "lucide-react";
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
    studentCms: null,
    universityInfo: null,
    personalInfo: null,
    alerts: [],
    transcript: null,
    mcaData: null,
    studyPlan: null,
    feeHistory: null,
    lastScanned: null,
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [permissionStatus, setPermissionStatus] = useState(
    () => localStorage.getItem("superflex_ai_data_permission") || "pending",
  );
  const scrollRef = useRef(null);

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
              "Hi! I'm your SuperFlex AI assistant. I have fresh access to your marks, attendance, academic history, and degree roadmap. How can I help you today?",
          },
        ]);
      }
    }

    return () => {
      window.removeEventListener("superflex-data-updated", handleDataUpdate);
    };
  }, [permissionStatus]);

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
    let responseText = "";

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const responseHandler = (e) => {
      const { id, text, error, done } = e.detail;
      if (id !== requestId) return;

      if (error) {
        document.removeEventListener("superflex-ai-response", responseHandler);
        setIsLoading(false);

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
          const others = prev.slice(0, -1);
          return [...others, { role: "assistant", content: errorMsg }];
        });
        return;
      }

      if (text) {
        responseText += text;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          const others = prev.slice(0, -1);
          return [...others, { ...last, content: responseText }];
        });
      }

      if (done) {
        document.removeEventListener("superflex-ai-response", responseHandler);
        setIsLoading(false);
      }
    };

    document.addEventListener("superflex-ai-response", responseHandler);

    try {
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
          marks:
            dataContext.marks && dataContext.marks.length > 0
              ? dataContext.marks
              : "Not scanned yet (Visit Home)",
          attendance:
            dataContext.attendance && dataContext.attendance.length > 0
              ? dataContext.attendance
              : "Not scanned yet (Visit Home)",
        },
        academicHistory: {
          transcript:
            dataContext.transcript || "Not scanned yet (Visit Transcript)",
          mcaData:
            dataContext.mcaData || "Not scanned yet (Visit Transcript)",
          studyPlan:
            dataContext.studyPlan || "Not scanned yet (Visit Study Plan)",
        },
        systemAlerts: dataContext.alerts || [],
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
      }

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

        5. RELATIVE GRADING THRESHOLDS (MCA Data):
        ${JSON.stringify(academicData.academicHistory.mcaData, null, 2)}
        
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
        5. If marks or attendance are missing, ask them to visit Home or use the "Smart Scan" tool.
        6. If transcript or MCA data is missing, explicitly tell them: "Could you please visit the Transcript page for a moment? I need to sync your academic history and grading curves from there to ensure accurate data without risking a session timeout."
        7. If study plan is missing, ask them to visit the Tentative Study Plan page or hit "Smart Scan".
        8. RELATIVE GRADING LOGIC: Use "RELATIVE GRADING THRESHOLDS" (MCA Data) to predict grades. For example, if a course has MCA 55, look up the "55" key in MCA data to see the marks required for each grade.
        9. GPA PREDICTOR / SANDBOX MODE: You have the ability to simulate future CGPA. When a user asks about their future CGPA, use their current Transcript (CGPA/Total Credits) and their Study Plan (future courses/credits) to calculate projected outcomes. Assume standard grades (e.g., A, B) if they don't specify.
        10. Be concise, friendly, and casually professional. Speak naturally but avoid excessive slang or overly formal language.
        11. Format performance data in clean Markdown tables when answering.
      `;

      document.dispatchEvent(
        new CustomEvent("superflex-ai-query", {
          detail: {
            id: requestId,
            prompt: prompt,
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

  const runSmartScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);

    const paths = [
      { name: "Attendance", url: "/Student/StudentAttendance" },
      { name: "Marks", url: "/Student/StudentMarks" },
      { name: "Study Plan", url: "/Student/TentativeStudyPlan" },
      { name: "Fees", url: "/ConsolidatedFeeReport" },
    ];

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Initiating **Smart Scan**. I'm silently vacuuming your academic records into my memory... 🚀",
      },
    ]);

    const newCtx = { ...window.superflex_ai_context };

    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        setScanProgress(((i + 1) / paths.length) * 100);
        try {
            const res = await fetch(path.url);
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            if (path.name === "Attendance") {
                const courses = [];
                doc.querySelectorAll(".tab-pane").forEach(pane => {
                    const title = pane.querySelector("h5")?.textContent.trim().replace(/\(.*\)/, "").trim();
                    const records = [];
                    pane.querySelectorAll("tbody tr").forEach(row => {
                        const cols = row.querySelectorAll("td");
                        if (cols.length >= 4) records.push({ status: cols[3]?.textContent.trim() });
                    });
                    courses.push({ title, records, absent: records.filter(r => r.status.includes("A")).length });
                });
                newCtx.attendance = courses;
            } else if (path.name === "Marks") {
                const courses = [];
                doc.querySelectorAll(".tab-pane").forEach(pane => {
                    const title = pane.querySelector("h5")?.textContent.trim().replace(/\(.*\)/, "").trim();
                    courses.push({ id: pane.id, title });
                });
                newCtx.marks = courses;
            } else if (path.name === "Study Plan") {
                const sems = [];
                doc.querySelectorAll(".col-md-6").forEach(col => {
                    const title = col.querySelector("h4")?.textContent.trim();
                    if (title) sems.push({ title });
                });
                newCtx.studyPlan = sems;
            } else if (path.name === "Fees") {
                const txs = [];
                doc.querySelectorAll("#FeeReport tbody tr").forEach(tr => {
                    const td = tr.querySelectorAll("td");
                    if (td.length >= 10) txs.push({ amount: td[5].textContent.trim() });
                });
                newCtx.feeHistory = txs;
            }
        } catch (e) {
            console.error(`Sync failed for ${path.name}`, e);
        }
        await new Promise(r => setTimeout(r, 600));
    }

    newCtx.lastScanned = new Date().toISOString();
    window.superflex_ai_context = newCtx;
    setDataContext(newCtx);
    window.dispatchEvent(new CustomEvent("superflex-data-updated", { detail: newCtx }));

    setIsScanning(false);
    setScanProgress(100);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "✅ **Scan Complete!** I now have a full cache of your marks, attendance, and plans. How can I help you achieve that 4.0?",
      },
    ]);
  };

  const handlePermission = (status) => {
    setPermissionStatus(status);
    localStorage.setItem("superflex_ai_data_permission", status);

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
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-24 md:w-[420px] h-[65vh] md:h-[650px] md:max-h-[80vh] bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/10 rounded-3xl md:rounded-[2rem] flex flex-col z-[9999] overflow-hidden animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 ease-out shadow-2xl shadow-black/50">
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
              <button
                onClick={runSmartScan}
                disabled={isScanning}
                title="Smart Scan Entire Portal"
                className={`p-2.5 rounded-xl text-zinc-400 hover:text-[#a098ff] transition-all bg-white/5 border border-white/5 active:scale-95 ${isScanning ? "animate-pulse" : ""}`}
              >
                <Zap size={18} fill={isScanning ? "#a098ff" : "none"} />
              </button>
            </div>
          </div>

          {isScanning && (
            <div className="h-1 bg-zinc-900 w-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#a098ff] to-[#ec4899] transition-all duration-500 shadow-[0_0_10px_#a098ff]"
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
                      m.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex items-center gap-3 py-2 px-1">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-[#a098ff] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-[#a098ff] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-[#a098ff] rounded-full animate-bounce"></div>
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
                <div className="w-10 h-10 rounded-full bg-[#a098ff]/10 flex items-center justify-center text-[#a098ff]">
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
                  className="flex-1 bg-[#a098ff] hover:bg-[#a098ff]/90 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
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
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a098ff]/50 focus:ring-4 focus:ring-[#a098ff]/5 transition-all pr-14 disabled:opacity-50 disabled:cursor-not-allowed"
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
