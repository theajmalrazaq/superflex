import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  X,
  Trash2,
  Shield,
  Square,
  Clock,
  BarChart,
  GraduationCap,
  User,
  KeyRound,
  LoaderCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Logo } from "./ui/Logo";
import { sendExtensionMessage } from "../utils/extensionApi";
import { buildGroqMessages } from "../utils/aiPrompt";

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
        fill="var(--accent)"
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
          fill="var(--accent)"
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
    universityInfo: null,
    profileSections: null,
    transcript: null,
    mcaData: null,
    studyPlan: null,
    lastScanned: null,
    lastSync: null,
  });

  const [permissionStatus, setPermissionStatus] = useState(
    () => localStorage.getItem("superflex_ai_data_permission") || "pending",
  );
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem("superflex_ai_model") || "");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [userImage, setUserImage] = useState(
    () => localStorage.getItem("superflex_user_custom_image") || "/Login/GetImage",
  );
  const scrollRef = useRef(null);
  const activeRequestIdRef = useRef(null);
  const runtimeMessage = (message) =>
    new Promise((resolve) => {
      sendExtensionMessage(message, (response, error) =>
        resolve(error ? { error: error.message } : response || { error: "Extension connection failed." }),
      );
    });

  const connectGroqCloud = async () => {
    setIsConnecting(true);
    setConnectionError("");
    const result = await runtimeMessage({ type: "SUPERFLEX_GROQ_SAVE_KEY", apiKey: apiKeyInput });
    setIsConnecting(false);
    if (result.error) {
      setConnectionError(result.error);
      return;
    }
    setHasApiKey(true);
    setAvailableModels(result.models || []);
    setSelectedModel((current) =>
      result.models?.some((model) => model.id === current) ? current : result.models?.[0]?.id || "",
    );
    setApiKeyInput("");
  };

  useEffect(() => {
    const handleStorage = () => {
      setUserImage(localStorage.getItem("superflex_user_custom_image") || "/Login/GetImage");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    runtimeMessage({ type: "SUPERFLEX_GROQ_CONFIG" }).then((result) => {
      if (result.error) return;
      setHasApiKey(result.configured);
      setAvailableModels(result.models || []);
      setSelectedModel((current) =>
        result.models?.some((model) => model.id === current) ? current : result.models?.[0]?.id || "",
      );
    });
  }, []);

  useEffect(() => {
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
    if (selectedModel) localStorage.setItem("superflex_ai_model", selectedModel);
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
      setIsOpen(false);
      return;
    }

    const userMessage = textToSend.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    const requestId = crypto.randomUUID();
    activeRequestIdRef.current = requestId;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    try {
      if (!hasApiKey || !selectedModel) throw new Error("Connect GroqCloud and choose a model first.");
      const result = await runtimeMessage({
        type: "SUPERFLEX_GROQ_CHAT",
        messages: buildGroqMessages({ question: userMessage, dataContext, history: messages }),
        model: selectedModel,
      });
      if (activeRequestIdRef.current !== requestId) return;
      if (result.error) throw new Error(result.error);
      setMessages((prev) => {
        const withoutPending = prev.slice(0, -1);
        return [...withoutPending, { role: "assistant", content: result.text || "GroqCloud returned an empty response." }];
      });
    } catch (e) {
      if (activeRequestIdRef.current === requestId) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: `GroqCloud error: ${e.message}` },
        ]);
      }
    } finally {
      if (activeRequestIdRef.current === requestId) {
        activeRequestIdRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const handleInterrupt = () => {
    if (activeRequestIdRef.current) {
      activeRequestIdRef.current = null;
      setIsLoading(false);

      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === "assistant" && !lastMessage.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    }
  };

  const handlePermission = (status) => {
    setPermissionStatus(status);
    localStorage.setItem("superflex_ai_data_permission", status);
    window.dispatchEvent(new CustomEvent("superflex-permission-updated", { detail: status }));
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

    return maxTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasMarks = dataContext.marks && dataContext.marks.length > 0;
  const hasAttendance = dataContext.attendance && dataContext.attendance.length > 0;
  const hasTranscript = !!dataContext.transcript;

  const StatusCard = ({ label, active, icon: Icon, onClick, description }) => (
    <button
      onClick={active ? onClick : undefined}
      disabled={!active}
      className={`relative group p-3 md:p-4 rounded-2xl md:rounded-3xl border flex flex-col items-center justify-center text-center transition-all duration-300 w-full aspect-[4/3] md:aspect-square ${
        active
          ? "bg-foreground/5 border-foreground/10 hover:bg-foreground/10 hover:-translate-y-1 cursor-pointer"
          : "bg-foreground/5 border-foreground/10 opacity-50 cursor-not-allowed grayscale"
      }`}
    >
      <div
        className={`mb-2 md:mb-3 p-2 md:p-3 rounded-xl md:rounded-2xl w-fit transition-transform group-hover:scale-105 ${active ? "bg-accent/20 text-accent" : "bg-tertiary text-foreground/50"}`}
      >
        <Icon size={20} className="md:w-[26px] md:h-[26px]" />
      </div>
      <h4 className="text-foreground font-bold text-xs md:text-sm mb-0.5 md:mb-1">{label}</h4>
      <p className="text-[9px] md:text-[10px] text-foreground/60 font-medium leading-tight max-w-[90%]">
        {active ? description : "Visit page to sync"}
      </p>
    </button>
  );

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999]">{}</div>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-background flex flex-col animate-in fade-in duration-300">
          <div className="relative z-50 flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-3">
              <Logo className="w-40 h-8" />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowModelPicker((visible) => !visible)}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent hover:bg-accent/20 transition-all text-xs font-bold"
                title="GroqCloud settings"
              >
                <KeyRound size={15} />
                <span className="hidden md:inline">{hasApiKey ? "GroqCloud" : "Connect Groq"}</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2.5 text-foreground/50 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {}
          <div
            className={`relative z-10 flex-1 flex flex-col ${messages.length === 0 ? "items-center justify-center" : "h-full overflow-hidden"} max-w-5xl mx-auto w-full px-6 pb-32`}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-8 duration-700 w-full max-w-3xl">
                <div className="mb-8 relative">
                  <div className="w-24 h-24 rounded-[24px] bg-secondary border border-foreground/10 flex items-center justify-center ">
                    <AnimatedLogo size={48} className="animate-ping" />
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                  Hi, {dataContext.studentName?.split(" ")[0] || "Student"}
                </h1>
                <p className="text-xl text-foreground/60 mb-12 max-w-xl">
                  Ready to assist you with anything you need, from analyzing grades to tracking
                  attendance. Let's get started!
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl px-2 md:px-0">
                  <StatusCard
                    label="Personal Info"
                    active={!!dataContext.studentName}
                    icon={User}
                    description="View profile summary"
                    onClick={() =>
                      handleSend("Tell me about my student profile based on the synced data.")
                    }
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
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} items-start gap-3 animate-in fade-in slide-in-from-bottom-4`}
                  >
                    {m.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-secondary border border-foreground/10 flex items-center justify-center shrink-0 mt-1">
                        <AnimatedLogo size={16} animated={false} />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3.5 relative group leading-relaxed text-sm md:text-base ${
                        m.role === "user"
                          ? "bg-accent/30 text-foreground border border-accent/20 rounded-tr-sm backdrop-blur-sm"
                          : "bg-secondary border border-foreground/10 text-foreground/70 rounded-tl-sm"
                      }`}
                    >
                      <div className="markdown-body">
                        {m.role === "assistant" && !m.content ? (
                          <div className="flex gap-1.5 py-1">
                            <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                          </div>
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                        )}
                      </div>
                    </div>

                    {m.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/10 flex items-center justify-center shrink-0 overflow-hidden mt-1">
                        <img src={userImage} alt="Me" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Floating Input Bar */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
            {permissionStatus !== "granted" ? (
              <div className="bg-secondary/90 backdrop-blur-xl border border-foreground/10 p-4 rounded-[2rem] flex flex-col gap-3">
                <div className="flex items-center gap-3 pl-2">
                  <Shield className="text-accent" size={20} />
                  <div className="text-sm">
                    <span className="text-foreground font-bold block">Enable AI Access?</span>
                <span className="text-foreground/50 text-xs">
                  Chat sends your message and selected academic data to GroqCloud.
                </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePermission("granted")}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-[var(--accent-foreground)] text-xs font-bold rounded-xl transition-colors"
                  >
                    Enable
                  </button>
                  <button
                    onClick={() => {
                      handlePermission("denied");
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 bg-foreground/5 hover:bg-red-500/10 text-foreground/60 hover:text-red-400 text-xs font-bold rounded-xl transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : !hasApiKey ? (
              <div className="bg-secondary/90 backdrop-blur-xl border border-foreground/10 p-4 rounded-[2rem] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 pl-2">
                  <KeyRound className="text-accent" size={20} />
                  <div className="text-sm">
                    <span className="text-foreground font-bold block">Connect GroqCloud</span>
                    <span className="text-foreground/50 text-xs">
                      Add your GroqCloud API key and choose a model available to your account.
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(event) => setApiKeyInput(event.target.value)}
                    placeholder="Paste your GroqCloud API key"
                    className="min-w-0 flex-1 rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                  <button
                    onClick={connectGroqCloud}
                    disabled={!apiKeyInput.trim() || isConnecting}
                    className="flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs font-bold text-[var(--accent-foreground)] disabled:opacity-50"
                  >
                    {isConnecting ? <LoaderCircle size={15} className="animate-spin" /> : "Connect"}
                  </button>
                </div>
                <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="px-2 text-xs font-semibold text-accent hover:underline">
                  Create a GroqCloud API key
                </a>
                {connectionError && <p className="px-2 text-xs text-rose-500">{connectionError}</p>}
              </div>
            ) : (
              <div className="group relative bg-secondary/80 backdrop-blur-2xl border border-foreground/10 rounded-full transition-all focus-within:bg-secondary focus-within:border-accent/30 focus-within:ring-4 focus-within:ring-accent/10 flex items-center">
                <div className="relative pl-3 shrink-0">
                  <button
                    onClick={() => setShowModelPicker(!showModelPicker)}
                    className="w-10 h-10 rounded-full bg-tertiary/50 border border-foreground/10 flex items-center justify-center hover:bg-tertiary transition-colors shrink-0 overflow-hidden group/btn"
                    title="Select Model"
                  >
                    <AnimatedLogo size={20} animated={false} />
                  </button>

                  {showModelPicker && (
                    <div className="absolute bottom-full left-0 mb-4 w-[min(360px,calc(100vw-2rem))] bg-background border border-foreground/10 rounded-2xl overflow-hidden z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="p-3 border-b border-foreground/10 bg-foreground/[0.02]">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-foreground">
                          <KeyRound size={14} className="text-accent" /> GroqCloud API key
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={apiKeyInput}
                            onChange={(event) => setApiKeyInput(event.target.value)}
                            placeholder={hasApiKey ? "Enter a new key to replace" : "Paste your GroqCloud API key"}
                            className="min-w-0 flex-1 rounded-xl border border-foreground/10 bg-background px-3 py-2 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/30"
                          />
                          <button
                            type="button"
                            onClick={connectGroqCloud}
                            disabled={!apiKeyInput.trim() || isConnecting}
                            className="rounded-xl bg-accent px-3 py-2 text-xs font-bold text-[var(--accent-foreground)] disabled:opacity-50"
                          >
                            {isConnecting ? <LoaderCircle size={15} className="animate-spin" /> : "Save"}
                          </button>
                        </div>
                        <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] font-semibold text-accent hover:underline">
                          Create a GroqCloud API key
                        </a>
                        {connectionError && <p className="mt-2 text-[11px] text-rose-500">{connectionError}</p>}
                      </div>
                      <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {availableModels.length ? availableModels.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setSelectedModel(m.id);
                              setShowModelPicker(false);
                            }}
                            className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group/item ${
                              selectedModel === m.id
                                ? "bg-accent/10 border border-accent/20"
                                : "hover:bg-foreground/5 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0 text-accent">
                                <AnimatedLogo size={18} animated={false} />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className={`text-xs font-bold ${selectedModel === m.id ? "text-foreground" : "text-foreground/60"}`}
                                >
                                  {m.name}
                                </span>
                                <span className="text-[10px] text-foreground/40 font-medium">
                                  {m.provider}
                                </span>
                              </div>
                            </div>
                          </button>
                        )) : (
                          <p className="px-3 py-4 text-center text-xs text-foreground/50">
                            Add a GroqCloud API key to load the models available to your account.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask SuperFlex anything..."
                  className="w-full bg-transparent border-none px-4 py-4 pr-16 text-foreground text-sm placeholder:text-foreground/50 focus:outline-none focus:ring-0"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="p-2 text-foreground/40 hover:text-rose-500 transition-colors"
                      title="Clear Chat"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  {isLoading ? (
                    <button
                      onClick={handleInterrupt}
                      className="p-2 bg-rose-500 hover:bg-rose-600 text-foreground rounded-full transition-all"
                    >
                      <Square size={16} fill="currentColor" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim()}
                      className="p-2 bg-accent hover:bg-accent/90 text-[var(--accent-foreground)] rounded-full transition-all disabled:opacity-50 disabled:grayscale"
                    >
                      <Send size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="text-center mt-4">
              <p className="text-[10px] text-foreground/40 font-medium">
                Chats are sent to GroqCloud with your API key. Your key is stored in extension storage.{" "}
                {getLastSyncTime() ? `Last synced at ${getLastSyncTime()}` : "Data not synced yet."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuperFlexAI;
