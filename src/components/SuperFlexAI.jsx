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
  Check,
  RefreshCw,
  Cpu,
  Copy,
  Sparkles,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Logo } from "./ui/Logo";
import { getExtensionUrl, sendExtensionMessage } from "../utils/extensionApi";
import { buildGeminiPayload } from "../utils/aiPrompt";
import { usePreferencesStore } from "../stores/preferencesStore";

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

// Balances incomplete markdown structures while text is actively streaming
const completeStreamingMarkdown = (text) => {
  if (!text) return "";
  let completed = text;

  // 1. Balance unclosed code blocks (```)
  const codeBlockCount = (completed.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    completed += "\n```";
  } else {
    // 2. Balance unclosed inline code (`) - only when not inside a code block
    const inlineBackticks = (completed.replace(/```[\s\S]*?```/g, "").match(/`/g) || []).length;
    if (inlineBackticks % 2 !== 0) {
      completed += "`";
    }
  }

  // 3. Balance unclosed bold (**)
  const boldCount = (completed.replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`/g, "").match(/\*\*/g) || []).length;
  if (boldCount % 2 !== 0) {
    completed += "**";
  }

  return completed;
};

const MarkdownRenderer = ({ content, isStreaming = false }) => {
  const safeContent = isStreaming ? completeStreamingMarkdown(content) : content;

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="my-3 w-full overflow-x-auto sf-data-table-wrapper rounded-[18px] border border-black/[0.06] bg-[#fafafa] dark:border-white/[0.1] dark:bg-white/[0.04]">
              <table className="sf-data-table w-full border-collapse text-left text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-foreground/10 bg-foreground/[0.02] text-[11px] font-bold text-foreground/50">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-foreground/60">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-b border-foreground/5 px-3.5 py-2.5 text-foreground/80 last:border-b-0">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-foreground/[0.02]">
              {children}
            </tr>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 rounded-r-2xl border-l-4 border-[#230052] bg-[#230052]/[0.06] py-2 pl-3.5 pr-3 text-xs leading-relaxed text-foreground/85 dark:border-white dark:bg-white/[0.06]">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="my-2 list-disc space-y-1 pl-5 text-xs sm:text-sm">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 list-decimal space-y-1 pl-5 text-xs sm:text-sm">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => (
            <h1 className="mb-2 mt-3.5 border-b border-foreground/10 pb-1.5 text-base font-bold tracking-tight text-foreground sm:text-lg">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-3 text-sm font-bold tracking-tight text-foreground sm:text-base">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1.5 mt-2.5 text-xs font-bold text-[#230052] dark:text-white sm:text-sm">
              {children}
            </h3>
          ),
          pre: ({ children, ...props }) => (
            <div className="group relative my-2.5 overflow-hidden rounded-[18px] border border-black/10 bg-[#161821] text-xs font-mono text-[#cdd6f4] shadow-sm dark:border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] text-white/50">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Snippet</span>
                <button
                  type="button"
                  onClick={(e) => {
                    const codeEl = e.currentTarget.closest(".group")?.querySelector("code");
                    if (codeEl) navigator.clipboard.writeText(codeEl.innerText || "");
                  }}
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  title="Copy code"
                >
                  <Copy size={11} />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-[#cdd6f4]" {...props}>
                {children}
              </pre>
            </div>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock =
              /language-/.test(className || "") ||
              (typeof children === "string" && children.includes("\n"));
            if (isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="inline rounded-md border border-black/[0.06] bg-black/[0.04] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#230052] align-baseline dark:border-white/10 dark:bg-white/[0.12] dark:text-[#c4b5fd]"
                {...props}
              >
                {children}
              </code>
            );
          },
          strong: ({ children }) => (
            <strong className="font-bold text-foreground dark:text-white">{children}</strong>
          ),
          p: ({ children }) => (
            <p className="my-1.5 text-xs leading-relaxed text-foreground/90 sm:text-sm">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[#230052] dark:text-[#93c5fd] underline decoration-[#230052]/40 dark:decoration-white/40 underline-offset-2 hover:decoration-[#230052] dark:hover:decoration-white"
            >
              {children}
            </a>
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block h-3.5 w-1.5 ml-1 bg-[#230052] dark:bg-white animate-pulse align-middle rounded-xs" />
      )}
    </div>
  );
};

const StatusCard = ({ label, active, icon: Icon, onClick, description, badge }) => (
  <button
    type="button"
    onClick={active ? onClick : undefined}
    disabled={!active}
    className={`group relative flex flex-col justify-between rounded-[32px] border p-5 sm:p-6 text-left transition-all duration-300 w-full ${
      active
        ? "border-black/[0.06] bg-white text-[#101010] shadow-sm hover:-translate-y-1 hover:shadow-lg dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb]"
        : "border-black/[0.04] bg-white/60 opacity-60 grayscale cursor-not-allowed dark:border-white/[0.06] dark:bg-black/60"
    }`}
  >
    <div className="flex items-center justify-between gap-3 w-full mb-4">
      <div
        className={`flex h-13 w-13 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-[36%] transition-transform group-hover:scale-105 ${
          active
            ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"
            : "bg-black/5 text-foreground/40 dark:bg-white/10 dark:text-white/40"
        }`}
      >
        <Icon size={24} strokeWidth={2} />
      </div>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
          active
            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "border border-black/5 bg-black/5 text-foreground/40 dark:border-white/10 dark:bg-white/5"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500 animate-pulse" : "bg-foreground/30"}`} />
        {badge || (active ? "Synced" : "Visit Page")}
      </span>
    </div>
    <div className="w-full">
      <h4 className="text-base font-bold text-[#101010] dark:text-[#f5f6fb] tracking-tight">{label}</h4>
      <p className="mt-1 text-xs text-[#777780] dark:text-[#9ca3b3] leading-snug line-clamp-2">
        {active ? description : "Visit this page to sync data into AI"}
      </p>
    </div>
  </button>
);

const SuperFlexAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamPortRef = useRef(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [dataContext, setDataContext] = useState({
    attendance: null,
    marks: null,
    studentName: null,
    personalInfo: null,
    universityInfo: null,
    profileSections: null,
    alerts: null,
    transcript: null,
    mcaData: null,
    studyPlan: null,
    lastScanned: null,
    lastSync: null,
  });

  const [permissionStatus, setPermissionStatus] = useState(
    () => localStorage.getItem("superflex_ai_data_permission") || "pending",
  );
  const [activeModel, setActiveModel] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [userImage, setUserImage] = useState(
    () => localStorage.getItem("superflex_user_custom_image") || "/Login/GetImage",
  );
  const scrollRef = useRef(null);
  const activeRequestIdRef = useRef(null);
  const cloudAssetUrl = getExtensionUrl("assets/clouds/cloud-2.webp");
  const customBackground = usePreferencesStore((state) => state.customBackground);
  const setCustomBackground = usePreferencesStore((state) => state.setCustomBackground);

  useEffect(() => {
    const handleCustomBackground = (event) => setCustomBackground(event.detail);
    window.addEventListener("superflex-custom-background-changed", handleCustomBackground);
    return () => window.removeEventListener("superflex-custom-background-changed", handleCustomBackground);
  }, [setCustomBackground]);

  const customUrl = (() => {
    try {
      const parsed = new URL(customBackground?.url || "");
      return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
    } catch {
      return "";
    }
  })();
  const customVideo = /\.(mp4|webm|ogg)(?:$|\?)/i.test(customUrl);

  const runtimeMessage = (message) =>
    new Promise((resolve) => {
      sendExtensionMessage(message, (response, error) =>
        resolve(
          error ? { error: error.message } : response || { error: "Extension connection failed." },
        ),
      );
    });

  const connectGemini = async () => {
    setIsConnecting(true);
    setConnectionError("");
    const result = await runtimeMessage({ type: "SUPERFLEX_AI_SAVE_KEY", apiKey: apiKeyInput });
    setIsConnecting(false);
    if (result.error) {
      setConnectionError(result.error);
      return;
    }
    setHasApiKey(true);
    setActiveModel(result.model || null);
    setAvailableModels(result.availableModels || []);
    setApiKeyInput("");
  };

  const handleSelectModel = async (model) => {
    setActiveModel(model);
    await runtimeMessage({ type: "SUPERFLEX_AI_SELECT_MODEL", model });
  };

  const handleRefreshModels = async () => {
    setIsRefreshingModels(true);
    const result = await runtimeMessage({ type: "SUPERFLEX_AI_REFRESH_MODELS" });
    setIsRefreshingModels(false);
    if (result.models) {
      setAvailableModels(result.models);
      if (!activeModel && result.models.length > 0) {
        setActiveModel(result.models[0]);
      }
    }
  };

  const handleCopyMessage = (index, text) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(index);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  useEffect(() => {
    const handleStorage = () => {
      setUserImage(localStorage.getItem("superflex_user_custom_image") || "/Login/GetImage");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    runtimeMessage({ type: "SUPERFLEX_AI_CONFIG" }).then((result) => {
      if (result.error) return;
      setHasApiKey(result.configured);
      setActiveModel(result.model || null);
      setAvailableModels(result.availableModels || []);
      if (result.warning) setConnectionError(result.warning);
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

    try {
      const savedTeachers = JSON.parse(
        localStorage.getItem("superflex_course_teachers_v1") || "null",
      );
      const savedRollNo = localStorage.getItem("superflex_student_roll_number_v1") || "";
      if (savedTeachers || savedRollNo) {
        setDataContext((prev) => ({
          ...prev,
          ...(savedTeachers ? { teachers: savedTeachers } : {}),
          ...(savedRollNo ? { rollNumber: savedRollNo } : {}),
        }));
      }
    } catch {}

    const handleDataUpdate = (e) => {
      const newData = e.detail;
      setDataContext((prev) => {
        const updated = { ...prev, ...newData };
        window.superflex_ai_context = updated;
        return updated;
      });
    };

    const handleTeachersUpdate = (e) => {
      const nextTeachers = e.detail;
      setDataContext((prev) => ({ ...prev, teachers: nextTeachers }));
    };

    window.addEventListener("superflex-data-updated", handleDataUpdate);
    window.addEventListener("superflex-teachers-updated", handleTeachersUpdate);

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
      window.removeEventListener("superflex-teachers-updated", handleTeachersUpdate);
    };
  }, [permissionStatus]);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("superflex-toggle-ai", handleToggle);
    return () => window.removeEventListener("superflex-toggle-ai", handleToggle);
  }, []);

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
    setIsStreaming(true);

    const requestId = crypto.randomUUID();
    activeRequestIdRef.current = requestId;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      if (!hasApiKey || !activeModel) {
        throw new Error("Connect your Google Gemini API key to activate SuperFlex AI.");
      }
      const currentTeachers =
        dataContext.teachers ||
        (() => {
          try {
            return JSON.parse(localStorage.getItem("superflex_course_teachers_v1") || "null");
          } catch {
            return null;
          }
        })();

      const currentRollNumber =
        dataContext.rollNumber ||
        localStorage.getItem("superflex_student_roll_number_v1") ||
        "";

      const payload = buildGeminiPayload({
        question: userMessage,
        dataContext: {
          ...dataContext,
          teachers: currentTeachers,
          rollNumber: currentRollNumber,
        },
        history: messages,
      });

      // Attempt real-time streaming via Chrome port
      const streamed = await new Promise((resolve) => {
        let streamPort;
        try {
          streamPort = chrome.runtime.connect({ name: "SUPERFLEX_AI_STREAM" });
          streamPortRef.current = streamPort;
        } catch {
          resolve(false);
          return;
        }

        let accumulatedText = "";

        streamPort.onMessage.addListener((msg) => {
          if (activeRequestIdRef.current !== requestId) return;

          if (msg.type === "CHUNK") {
            accumulatedText = msg.fullText;
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = { role: "assistant", content: accumulatedText };
              return next;
            });
          } else if (msg.type === "DONE") {
            if (msg.modelSwitched && msg.model) {
              setActiveModel(msg.model);
            }
            const switchNotice = msg.modelSwitched
              ? `\n\n> ℹ️ _Switched to **${msg.model.name}** as primary model was under high load._`
              : "";
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                role: "assistant",
                content:
                  (msg.fullText || accumulatedText || "Gemini returned an empty response.") +
                  switchNotice,
              };
              return next;
            });
            try {
              streamPort.disconnect();
            } catch {}
            streamPortRef.current = null;
            resolve(true);
          } else if (msg.type === "ERROR") {
            try {
              streamPort.disconnect();
            } catch {}
            streamPortRef.current = null;
            // Fall back to standard request if streaming hit an error
            resolve(false);
          }
        });

        streamPort.onDisconnect.addListener(() => {
          streamPortRef.current = null;
          if (!accumulatedText) {
            resolve(false);
          } else {
            resolve(true);
          }
        });

        streamPort.postMessage({ type: "START", payload });
      });

      // If streaming wasn't successful, fall back to standard runtimeMessage
      if (!streamed && activeRequestIdRef.current === requestId) {
        const result = await runtimeMessage({
          type: "SUPERFLEX_AI_CHAT",
          payload,
        });
        if (activeRequestIdRef.current !== requestId) return;
        if (result.error) throw new Error(result.error);
        if (result.modelSwitched && result.model) {
          setActiveModel(result.model);
        }
        setMessages((prev) => {
          const withoutPending = prev.slice(0, -1);
          const switchNotice = result.modelSwitched
            ? `\n\n> ℹ️ _Switched to **${result.model.name}** as primary model was under high load._`
            : "";
          return [
            ...withoutPending,
            {
              role: "assistant",
              content: (result.text || "Gemini returned an empty response.") + switchNotice,
            },
          ];
        });
      }
    } catch (e) {
      if (activeRequestIdRef.current === requestId) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: `Gemini AI error: ${e.message}` },
        ]);
      }
    } finally {
      if (activeRequestIdRef.current === requestId) {
        activeRequestIdRef.current = null;
        setIsLoading(false);
        setIsStreaming(false);
      }
    }
  };

  const handleInterrupt = () => {
    if (streamPortRef.current) {
      try {
        streamPortRef.current.disconnect();
      } catch {}
      streamPortRef.current = null;
    }
    if (activeRequestIdRef.current) {
      activeRequestIdRef.current = null;
      setIsLoading(false);
      setIsStreaming(false);

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

  const hasMarks = dataContext.marks && dataContext.marks.length > 0;
  const hasAttendance = dataContext.attendance && dataContext.attendance.length > 0;
  const hasTranscript = !!dataContext.transcript;

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[999] group flex items-center gap-2.5 rounded-full border border-black/[0.08] bg-white/90 py-2 pl-2 pr-4 text-xs font-bold text-[#230052] shadow-xl shadow-black/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-white hover:shadow-2xl dark:border-white/[0.14] dark:bg-black/90 dark:text-white dark:hover:bg-black cursor-pointer"
          title="Open SuperFlex AI Assistant"
          aria-label="Open SuperFlex AI Assistant"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-[36%] bg-[#230052] text-white transition-transform duration-300 group-hover:scale-110 dark:bg-white dark:text-[#0a192f]">
            <Sparkles size={14} />
          </span>
          <span className="text-sm font-bold tracking-tight">SuperFlex AI</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex flex-col font-sans text-slate-900 transition-colors duration-300 dark:bg-black dark:text-[#f5f6fb]">
          {/* Ambient backdrop clouds matching PageLayout */}
          <div
            aria-hidden="true"
            className="superflex-account-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden"
          >
            {customBackground?.enabled && customUrl && (customVideo ? (
              <video src={customUrl} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <img src={customUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ))}
            {cloudAssetUrl && (
              <>
                <img
                  src={cloudAssetUrl}
                  alt=""
                  className="superflex-account-cloud absolute -right-10 -top-6 w-72 select-none opacity-80 sm:w-96"
                />
                <img
                  src={cloudAssetUrl}
                  alt=""
                  className="superflex-account-cloud absolute left-[4%] top-32 w-44 -scale-x-100 select-none opacity-70 sm:w-56"
                />
              </>
            )}
          </div>

          {/* Top Header */}
          <header className="relative z-50 flex items-center justify-between border-b border-white/40 bg-white/40 px-6 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
            <div className="flex items-center gap-3">
              <Logo className="h-8 w-auto" style={{ "--accent": "#ffffff", "--foreground": "#ffffff", "--bolt": "#230052" }} />
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/45 px-3 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-black/35">
                <Sparkles size={12} className="text-white" /> AI Copilot
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowAiSettings((visible) => !visible)}
                className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/45 px-4 py-2 text-xs font-bold text-slate-800 backdrop-blur-md transition-all hover:bg-white hover:text-[#230052] hover:shadow-xs dark:border-white/10 dark:bg-black/35 dark:text-white dark:hover:bg-white/15"
                title="Google Gemini model settings"
              >
                <Cpu size={14} className="text-[#230052] dark:text-white" />
                <span className="max-w-[130px] truncate sm:max-w-none">
                  {activeModel ? activeModel.name : hasApiKey ? "Gemini AI" : "Connect Gemini"}
                </span>
              </button>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/45 text-slate-700 backdrop-blur-md transition-colors hover:bg-rose-500 hover:border-rose-500 hover:text-white dark:border-white/10 dark:bg-black/35 dark:text-slate-300 dark:hover:bg-rose-500 dark:hover:text-white"
                  title="Clear chat history"
                >
                  <Trash2 size={15} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/45 text-slate-700 backdrop-blur-md transition-colors hover:bg-white hover:text-[#230052] dark:border-white/10 dark:bg-black/35 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white"
                title="Close AI Assistant"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* Main Chat Workspace */}
          <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
            {messages.length === 0 ? (
              <div className="flex-1 overflow-y-auto px-4 py-8 scrollbar-hide flex flex-col justify-center">
                <div className="mx-auto w-full max-w-4xl text-center animate-in slide-in-from-bottom-6 duration-500 my-auto py-4">
                  <div className="mb-5 relative flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[36%] bg-white text-[#230052] shadow-xl border border-white/40 dark:border-white/10 dark:bg-black dark:text-white">
                      <AnimatedLogo size={42} className="animate-pulse" />
                    </div>
                  </div>

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 mb-1">
                    SuperFlex Academic Intelligence
                  </p>
                  <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    Hi, {dataContext.studentName?.split(" ")[0] || "Student"} 👋
                  </h1>
                  <p className="mx-auto mb-8 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                    SuperFlex AI is synced with your portal. Ask questions about your 80% attendance policy, marks breakdown, teacher emails, or GPA forecast.
                  </p>

                  {/* Status cards matching Home Page widgets */}
                  <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatusCard
                      label="Personal Info"
                      active={!!dataContext.studentName}
                      icon={User}
                      description="Profile & campus records"
                      badge={dataContext.studentName ? "Profile" : "Not Synced"}
                      onClick={() =>
                        handleSend("Tell me about my student profile based on the synced data.")
                      }
                    />
                    <StatusCard
                      label="Marks Analytics"
                      active={hasMarks}
                      icon={BarChart}
                      description="Assessments & scores"
                      badge={hasMarks ? `${dataContext.marks.length} Courses` : "Not Synced"}
                      onClick={() =>
                        handleSend("Analyze my current marks performance across all courses.")
                      }
                    />
                    <StatusCard
                      label="Attendance 80%"
                      active={hasAttendance}
                      icon={Clock}
                      description="Leaves remaining buffer"
                      badge={hasAttendance ? `${dataContext.attendance.length} Courses` : "Not Synced"}
                      onClick={() =>
                        handleSend(
                          "What is my attendance status and how many leaves do I have left in each course under the 80% rule?",
                        )
                      }
                    />
                    <StatusCard
                      label="Transcript & GPA"
                      active={hasTranscript}
                      icon={GraduationCap}
                      description="CGPA, SGPA & cleared credits"
                      badge={hasTranscript ? "Transcript" : "Not Synced"}
                      onClick={() =>
                        handleSend("Summarize my transcript GPA and cleared credits history.")
                      }
                    />
                  </div>

                  {/* Quick suggestion pills */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    {[
                      "Who are my course instructors?",
                      "Draft an email to my teacher",
                      "How many leaves left in each course?",
                      "Summarize my marks across all courses",
                      "What is my current CGPA and credits?",
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="rounded-full border border-white/60 bg-white/45 px-4 py-2 text-xs font-bold text-slate-800 shadow-xs backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[#230052] dark:border-white/10 dark:bg-black/35 dark:text-slate-200 dark:hover:bg-black dark:hover:text-white"
                      >
                        ✨ {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-4xl mx-auto w-full scrollbar-hide"
              >
                {messages.map((m, i) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={i}
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      } items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      {!isUser && (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] mt-1 shadow-xs">
                          <Sparkles size={18} />
                        </div>
                      )}

                      <div
                        className={`relative group leading-relaxed ${
                          isUser
                            ? "max-w-[85%] sm:max-w-[75%] rounded-[24px] rounded-br-sm bg-[#230052] text-white px-5 py-4 shadow-sm text-sm sm:text-base font-medium dark:bg-white dark:text-[#0a192f]"
                            : "w-full max-w-[95%] sm:max-w-[88%] rounded-[32px] border border-black/[0.06] bg-white p-6 sm:p-7 shadow-none dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb]"
                        }`}
                      >
                        {!isUser && (
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/[0.06] dark:border-white/[0.1] text-[11px] text-foreground/50">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground flex items-center gap-1">
                                SuperFlex AI
                              </span>
                              {activeModel && (
                                <span className="rounded-full bg-[#230052]/10 px-2 py-0.5 text-[9px] font-bold text-[#230052] dark:bg-white/10 dark:text-white">
                                  {activeModel.name}
                                </span>
                              )}
                            </div>
                            {m.content && (
                              <button
                                type="button"
                                onClick={() => handleCopyMessage(i, m.content)}
                                title="Copy response"
                                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
                              >
                                {copiedIdx === i ? (
                                  <>
                                    <Check size={12} className="text-emerald-500" />
                                    <span className="text-emerald-500 font-bold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}

                        {isUser ? (
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        ) : !m.content ? (
                          <div className="flex items-center gap-2.5 py-3 text-xs font-medium text-foreground/70">
                            <LoaderCircle size={16} className="animate-spin text-[#230052] dark:text-white" />
                            <span>Thinking and analyzing academic records...</span>
                          </div>
                        ) : (
                          <MarkdownRenderer
                            content={m.content}
                            isStreaming={isStreaming && i === messages.length - 1}
                          />
                        )}
                      </div>

                      {isUser && (
                        <div className="h-11 w-11 rounded-full border-2 border-white/80 bg-white shadow-sm flex items-center justify-center shrink-0 overflow-hidden mt-1 dark:border-white/20">
                          <img src={userImage} alt="Me" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Floating Input Area */}
            <div className="relative z-50 w-full max-w-3xl mx-auto px-4 pb-6 pt-2">
              {permissionStatus !== "granted" ? (
                <div className="flex flex-col gap-3 rounded-[32px] border border-black/[0.06] bg-white p-6 shadow-xl backdrop-blur-2xl dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]">
                      <Shield size={22} />
                    </div>
                    <div>
                      <span className="block font-bold text-foreground text-sm">
                        Enable SuperFlex AI Access?
                      </span>
                      <span className="text-xs text-foreground/60 leading-relaxed">
                        Securely queries your portal data (attendance, marks, transcript) via Google Gemini API.
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        handlePermission("denied");
                        setIsOpen(false);
                      }}
                      className="rounded-full px-4 py-2 text-xs font-semibold text-foreground/60 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePermission("granted")}
                      className="rounded-full bg-[#230052] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-[#370c72] dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/80"
                    >
                      Enable Copilot
                    </button>
                  </div>
                </div>
              ) : !hasApiKey ? (
                <div className="flex flex-col gap-3 rounded-[32px] border border-black/[0.06] bg-white p-6 shadow-xl backdrop-blur-2xl dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]">
                      <KeyRound size={22} />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-bold text-foreground text-sm">
                        Connect Google Gemini AI
                      </span>
                      <span className="text-xs text-foreground/60">
                        Paste your free API key from Google AI Studio (1M token context, 15 RPM).
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Paste Gemini API key (AIzaSy...)"
                      className="min-w-0 flex-1 rounded-xl border border-black/[0.08] bg-slate-50 px-3.5 py-2.5 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-[#230052]/30 dark:border-white/[0.1] dark:bg-white/[0.06]"
                    />
                    <button
                      type="button"
                      onClick={connectGemini}
                      disabled={!apiKeyInput.trim() || isConnecting}
                      className="flex items-center gap-1.5 rounded-xl bg-[#230052] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#370c72] disabled:opacity-50 dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/80"
                    >
                      {isConnecting ? <LoaderCircle size={14} className="animate-spin" /> : "Connect"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#230052] dark:text-white hover:underline"
                    >
                      Get free Gemini API key ↗
                    </a>
                    {connectionError && <span className="text-rose-500 font-medium">{connectionError}</span>}
                  </div>
                </div>
              ) : (
                <div className="group relative flex items-center gap-2 rounded-full border border-white/60 bg-white/85 p-2 shadow-xl backdrop-blur-xl transition-all focus-within:border-white focus-within:ring-4 focus-within:ring-[#230052]/10 dark:border-white/14 dark:bg-black/85 dark:focus-within:border-white/30 dark:focus-within:ring-white/10">
                  {/* Model trigger & popover settings */}
                  <div className="relative pl-1">
                    <button
                      type="button"
                      onClick={() => setShowAiSettings(!showAiSettings)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#230052] hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 transition-colors shrink-0"
                      title="Gemini AI Settings & Models"
                    >
                      <AnimatedLogo size={20} animated={false} />
                    </button>

                    {showAiSettings && (
                      <div className="absolute bottom-full left-0 mb-4 w-[min(380px,calc(100vw-2rem))] rounded-[28px] border border-black/[0.06] bg-white p-4 shadow-2xl backdrop-blur-2xl dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {/* API Key Section */}
                        <div className="border-b border-black/[0.06] pb-3 mb-3 dark:border-white/[0.08]">
                          <div className="mb-2 flex items-center justify-between text-xs font-bold text-foreground">
                            <span className="flex items-center gap-1.5">
                              <KeyRound size={14} className="text-[#230052] dark:text-white" /> Gemini API Key
                            </span>
                            <a
                              href="https://aistudio.google.com/app/apikey"
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-semibold text-[#230052] dark:text-white hover:underline"
                            >
                              Get Free Key ↗
                            </a>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              value={apiKeyInput}
                              onChange={(event) => setApiKeyInput(event.target.value)}
                              placeholder={
                                hasApiKey ? "Enter new key to replace" : "Paste your Gemini API key"
                              }
                              className="min-w-0 flex-1 rounded-xl border border-black/[0.08] bg-slate-50 px-3 py-2 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-[#230052]/30 dark:border-white/[0.1] dark:bg-white/[0.06]"
                            />
                            <button
                              type="button"
                              onClick={connectGemini}
                              disabled={!apiKeyInput.trim() || isConnecting}
                              className="rounded-xl bg-[#230052] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#370c72] disabled:opacity-50 dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/80"
                            >
                              {isConnecting ? (
                                <LoaderCircle size={14} className="animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </button>
                          </div>
                          {connectionError && (
                            <p className="mt-2 text-[11px] text-rose-500 font-medium">
                              {connectionError}
                            </p>
                          )}
                        </div>

                        {/* Model list section */}
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <Cpu size={14} className="text-[#230052] dark:text-white" /> Available Models
                            </span>
                            <button
                              type="button"
                              onClick={handleRefreshModels}
                              disabled={isRefreshingModels || !hasApiKey}
                              title="Refresh available models from Google AI Studio"
                              className="flex items-center gap-1 text-[10px] font-semibold text-foreground/60 hover:text-foreground transition-colors disabled:opacity-40"
                            >
                              <RefreshCw
                                size={11}
                                className={isRefreshingModels ? "animate-spin text-[#230052] dark:text-white" : ""}
                              />
                              Refresh
                            </button>
                          </div>

                          {availableModels.length > 0 ? (
                            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 scrollbar-hide">
                              {availableModels.map((m) => {
                                const isSelected = activeModel?.id === m.id;
                                return (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => handleSelectModel(m)}
                                    className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl border transition-all ${
                                      isSelected
                                        ? "bg-[#230052] text-white font-bold border-transparent shadow-sm dark:bg-white dark:text-[#0a192f]"
                                        : "bg-slate-50 hover:bg-slate-100 border-black/[0.04] text-foreground/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-white/[0.05]"
                                    }`}
                                  >
                                    <div className="min-w-0 flex-1 pr-2">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold truncate">{m.name}</span>
                                        {m.isFlash && (
                                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                            isSelected
                                              ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#0a192f]"
                                              : "bg-[#230052]/10 text-[#230052] dark:bg-white/10 dark:text-white"
                                          }`}>
                                            Fast
                                          </span>
                                        )}
                                      </div>
                                      <p className={`text-[10px] truncate ${isSelected ? "text-white/80 dark:text-[#0a192f]/80" : "text-foreground/50"}`}>
                                        {m.contextWindow
                                          ? `${Math.round(m.contextWindow / 1000)}k context limit`
                                          : "Free-tier supported"}
                                      </p>
                                    </div>
                                    {isSelected ? (
                                      <div className="w-5 h-5 rounded-full bg-white text-[#230052] flex items-center justify-center shrink-0 dark:bg-[#0a192f] dark:text-white">
                                        <Check size={12} strokeWidth={3} />
                                      </div>
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border border-foreground/20 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          ) : activeModel ? (
                            <div className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-slate-50 p-3 dark:border-white/[0.1] dark:bg-white/[0.04]">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-foreground">
                                  {activeModel.name}
                                </p>
                                <p className="text-[10px] font-medium text-foreground/50">
                                  Active Model ·{" "}
                                  {activeModel.contextWindow
                                    ? `${Math.round(activeModel.contextWindow / 1000)}k context`
                                    : "Free-tier"}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="px-3 py-4 text-center text-xs text-foreground/50">
                              Connect your Gemini API key above to load available models.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input field */}
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask anything about your courses, marks, or attendance..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-[#101010] placeholder:text-slate-500 focus:outline-none dark:text-[#f5f6fb] dark:placeholder:text-slate-400 font-medium"
                  />

                  {/* Send or Stop Button */}
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={handleInterrupt}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
                      title="Stop response"
                    >
                      <Square size={14} fill="currentColor" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSend()}
                      disabled={!input.trim()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#230052] text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 dark:bg-white dark:text-[#0a192f]"
                      title="Send message"
                    >
                      <Send size={15} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default SuperFlexAI;
