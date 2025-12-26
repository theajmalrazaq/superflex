import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  X,
  Trash2,
  Shield,
  Sparkles,
  ChevronDown,
  Square,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart,
  GraduationCap,
  User,
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
    lastSync: null,
  });

  const [permissionStatus, setPermissionStatus] = useState(
    () => localStorage.getItem("superflex_ai_data_permission") || "pending",
  );
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem("superflex_ai_model") || "gpt-4o-mini",
  );
  const [showModelPicker, setShowModelPicker] = useState(false);
  const scrollRef = useRef(null);
  const activeRequestIdRef = useRef(null);

  useEffect(() => {
    // Load initial context from localStorage
    if (!window.superflex_ai_context) {
      try {
        const savedCtx = localStorage.getItem("superflex_ai_context");
        if (savedCtx) {
          const parsed = JSON.parse(savedCtx);
          window.superflex_ai_context = parsed;
          setDataContext(parsed);
        }
      } catch (e) {
        console.error("Failed to load AI context from storage", e);
      }
    } else {
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
    }

    return () => {
      window.removeEventListener("superflex-data-updated", handleDataUpdate);
    };
  }, [permissionStatus]);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("superflex-toggle-ai", handleToggle);
    return () => window.removeEventListener("superflex-toggle-ai", handleToggle);
  }, []);

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

  const handleSend = async (txt) => {
    const textToSend = txt || input;
    if (!textToSend.trim() || isLoading) return;

    if (permissionStatus !== "granted") {
      setIsOpen(false); // Close if they somehow trigger it
      return;
    }

    const userMessage = textToSend.trim();
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
              : "Missing (Visit Marks Page)",
          attendance:
            dataContext.attendance && dataContext.attendance.length > 0
              ? dataContext.attendance
              : "Missing (Visit Attendance Page)",
        },
        academicHistory: {
          transcript:
            dataContext.transcript || "Missing (Visit Transcript Page)",
          mcaData: dataContext.mcaData || "Missing (Visit Transcript Page)",
          studyPlan: dataContext.studyPlan || "Missing (Visit Transcript Page)",
        },
        syncStatus: dataContext.lastSync || {},
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
        You are "SuperFlex AI", the intelligent, human-like academic advisor.
        
        ### PERSONALITY:
        - Empathetic, encouraging, and clear.
        - NO technical jargon or code unless asked.
        
        ### STUDENT PROFILE:
        - Name: ${academicData.student.name}
        
        ### DATA METADATA:
        - Marks Available: ${academicData.currentPerformance.marks !== "Missing" ? "Yes" : "No"}
        - Attendance Available: ${academicData.currentPerformance.attendance !== "Missing" ? "Yes" : "No"}
        - Transcript Available: ${academicData.academicHistory.transcript !== "Missing" ? "Yes" : "No"}

        ### DATA CONTEXT:
        ${JSON.stringify(academicData, null, 2)}
        
        ### CHAT HISTORY:
        ${chatHistory}
        
        ### USER MESSAGE:
        ${userMessage}
        
        Answer helpfuly and concisely. If data is missing (Status: No), ask the user to visit that page to sync it.
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

  const handlePermission = (status) => {
    setPermissionStatus(status);
    localStorage.setItem("superflex_ai_data_permission", status);
    window.dispatchEvent(
      new CustomEvent("superflex-permission-updated", { detail: status }),
    );
    // Don't modify messages immediately for cleaner UI flow in new layout
  };

  const clearChat = () => {
    localStorage.removeItem("superflex_ai_messages");
    setMessages([]);
  };

  const getLastSyncTime = () => {
    if (!dataContext.lastSync) return null;
    const times = Object.values(dataContext.lastSync).map((t) => new Date(t));
    if (times.length === 0) return null;
    const maxTime = new Date(Math.max(...times));
    if (isNaN(maxTime.getTime())) return null;
    
    return maxTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const hasMarks = dataContext.marks && dataContext.marks.length > 0;
  const hasAttendance = dataContext.attendance && dataContext.attendance.length > 0;
  const hasTranscript = !!dataContext.transcript;

  const StatusCard = ({ label, active, icon: Icon, onClick, description }) => (
    <button
      onClick={active ? onClick : undefined}
      disabled={!active}
      className={`relative group p-4 rounded-3xl border flex flex-col items-center justify-center text-center transition-all duration-300 w-full aspect-square ${
        active
          ? "bg-white/5 border-white/10 hover:bg-white/10 shadow-lg shadow-black/20 hover:-translate-y-1 cursor-pointer"
          : "bg-white/5 border-white/5 opacity-50 cursor-not-allowed grayscale"
      }`}
    >
      <div className={`mb-3 p-3 rounded-2xl w-fit transition-transform group-hover:scale-105 ${active ? "bg-x/20 text-x" : "bg-zinc-800 text-zinc-500"}`}>
        <Icon size={26} />
      </div>
      <h4 className="text-white font-bold text-sm mb-1">{label}</h4>
      <p className="text-[10px] text-zinc-400 font-medium leading-tight max-w-[90%]">
        {active ? description : "Visit page to sync"}
      </p>
    </button>
  );

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999]">
         {/* Styles handled globaly */}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-[#0c0c0c] flex flex-col animate-in fade-in duration-300">
           {/* Background Gradient */}
           <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-x/10 blur-[150px] rounded-full opacity-40"></div>
              <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-x/5 blur-[150px] rounded-full opacity-40"></div>
           </div>

          {/* Header */}
          <div className="relative z-50 flex items-center justify-between px-8 py-6">
             <div className="flex items-center gap-3">
                <img 
                  src={chrome.runtime.getURL("assets/logo.svg")} 
                  alt="SuperFlex" 
                  className="w-42" 
                />
             </div>
             
             <div className="flex items-center gap-4">
                <div className="relative">
                  <button 
                    onClick={() => setShowModelPicker(!showModelPicker)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                  >
                     <Sparkles size={16} />
                     <span className="text-xs font-bold uppercase tracking-wider">{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.short}</span>
                     <ChevronDown size={14} />
                  </button>
                   {showModelPicker && (
                      <div className="absolute top-full right-0 mt-3 w-64 bg-[#111] border border-white/10 rounded-2xl overflow-hidden z-[1000] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
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
                              <span className={`text-xs font-bold ${selectedModel === m.id ? "text-white" : "text-zinc-400"}`}>
                                {m.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                   <X size={24} />
                </button>
             </div>
          </div>

          {/* Main Content Area */}
          <div className={`relative z-10 flex-1 flex flex-col ${messages.length === 0 ? "items-center justify-center" : "h-full overflow-hidden"} max-w-5xl mx-auto w-full px-6 pb-32`}>
             
             {messages.length === 0 ? (
               <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-8 duration-700 w-full max-w-3xl">
                  
                  <div className="mb-8 relative">
                     <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl shadow-black/50">
                        <AnimatedLogo size={48} className="animate-pulse" />
                     </div>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    Hi, {dataContext.studentName?.split(" ")[0] || "Student"}
                  </h1>
                  <p className="text-xl text-zinc-400 mb-12 max-w-xl">
                    Ready to assist you with anything you need, from analyzing grades to tracking attendance. Let's get started!
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl px-2 md:px-0">
                     <StatusCard 
                        label="Personal Info" 
                        active={!!dataContext.studentName} 
                        icon={User} 
                        description="View profile summary"
                        onClick={() => handleSend("Tell me about my student profile based on the synced data.")}
                     />
                     <StatusCard 
                        label="Marks" 
                        active={hasMarks} 
                        icon={BarChart} 
                        description="Analyze performance"
                        onClick={() => handleSend("Analyze my current marks performance.")}
                     />
                     <StatusCard 
                        label="Attendance" 
                        active={hasAttendance} 
                        icon={Clock} 
                        description="Check status"
                         onClick={() => handleSend("What is my attendance status?")}
                     />
                     <StatusCard 
                        label="Transcript" 
                        active={hasTranscript} 
                        icon={GraduationCap} 
                        description="View GPA & history"
                         onClick={() => handleSend("Summarize my transcript GPA.")}
                     />
                  </div>
               </div>
             ) : (
                <div 
                   ref={scrollRef}
                   className="w-full h-full overflow-y-auto scrollbar-hide space-y-8 px-4 py-8"
                >
                   {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} items-start gap-3 animate-in fade-in slide-in-from-bottom-4`}>
                         
                         {m.role === "assistant" && (
                            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                               <AnimatedLogo size={16} animated={false} />
                            </div>
                         )}

                         <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 relative group leading-relaxed text-sm md:text-base ${
                            m.role === "user" 
                              ? "bg-x/30 text-white border border-x/20 rounded-tr-sm backdrop-blur-sm" 
                              : "bg-zinc-900 border border-white/10 text-zinc-300 rounded-tl-sm shadow-xl"
                         }`}>
                            <div className="markdown-body">
                              {m.role === "assistant" && !m.content ? (
                                <div className="flex gap-1.5 py-1">
                                  <div className="w-2 h-2 bg-x rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                  <div className="w-2 h-2 bg-x rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                  <div className="w-2 h-2 bg-x rounded-full animate-bounce"></div>
                                </div>
                              ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                              )}
                            </div>
                         </div>

                         {m.role === "user" && (
                            <div className="w-8 h-8 rounded-full bg-x/20 border border-x/10 flex items-center justify-center shrink-0 overflow-hidden mt-1">
                               <img src="login/getimage" alt="Me" className="w-full h-full object-cover" />
                            </div>
                         )}
                      </div>
                   ))}
                </div>
             )}

          </div>

          {/* Floating Input Bar */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
{permissionStatus !== 'granted' ? (
               <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] flex items-center justify-between gap-4 shadow-2xl">
                  <div className="flex items-center gap-3 pl-2">
                     <Shield className="text-x" size={20} />
                     <div className="text-sm">
                        <span className="text-white font-bold block">Enable AI Access?</span>
                        <span className="text-zinc-500 text-xs">Access to academic data is required.</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => handlePermission('granted')}
                        className="px-4 py-2 bg-x hover:bg-x/90 text-white text-xs font-bold rounded-xl transition-colors"
                     >
                        Enable
                     </button>
                      <button 
                        onClick={() => {
                           handlePermission('denied');
                           setIsOpen(false);
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 text-xs font-bold rounded-xl transition-colors"
                     >
                        Reject
                     </button>
                  </div>
               </div>
             ) : (
                <div className="group relative bg-[#1a1a1c]/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl shadow-black/50 transition-all focus-within:bg-[#1a1a1c] focus-within:border-x/30 focus-within:ring-4 focus-within:ring-x/10">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask SuperFlex anything..."
                    className="w-full bg-transparent border-none px-6 py-4 pr-16 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-0"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {messages.length > 0 && (
                        <button onClick={clearChat} className="p-2 text-zinc-600 hover:text-rose-500 transition-colors" title="Clear Chat">
                          <Trash2 size={18} />
                        </button>
                      )}
                      
                      {isLoading ? (
                         <button onClick={handleInterrupt} className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all">
                            <Square size={16} fill="currentColor" />
                         </button>
                      ) : (
                         <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim()}
                            className="p-2 bg-x hover:bg-x/90 text-white rounded-full transition-all disabled:opacity-50 disabled:grayscale"
                         >
                            <Send size={16} />
                         </button>
                      )}
                  </div>
                </div>
             )}
             
             <div className="text-center mt-4">
                <p className="text-[10px] text-zinc-600 font-medium">
                   SuperFlex AI uses local data processing. {getLastSyncTime() ? `Last synced at ${getLastSyncTime()}` : "Data not synced yet."}
                </p>
             </div>
          </div>

        </div>
      )}
    </>
  );
};

export default SuperFlexAI;
