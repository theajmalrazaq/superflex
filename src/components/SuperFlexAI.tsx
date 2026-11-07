import { useTeacherStore } from "../stores/teacherStore";
import { usePreferencesStore } from "../stores/preferencesStore";
import type { AiContext } from "../utils/userDataStorage";

import { streamEventSchema, type ExtensionResponse as RuntimeResponse } from "../schemas/gemini";

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
  Zap,
  Mail,
  Info,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import GmailComposer from "./GmailComposer";
import { parseEmailDraftContent, parseEmailDraftUrl } from "../utils/emailDraft";
import { sendExtensionMessage } from "../utils/extensionApi";
import { getActiveStudentId } from "../utils/studentIdentity";
import { useProfileImage } from "../hooks/useProfileImage";
import { buildGeminiPayload } from "../utils/aiPrompt";
import {
  deleteAiMessages,
  getAiContext,
  getAiMessages,
  setAiMessages,
} from "../utils/userDataStorage";

const OctopusIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="currentColor"
    className={className}
  >
    <path
      fill="currentColor"
      d="M4 11H3v1h1Zm0 0h1V8h1v3h1V8h1V7H3v1h1Zm-4 0h2v-1H0Zm2-1h1V8H2Zm5 2h1v-1H7ZM2 7h1V2H2Zm6 3h1V8H8Zm1 1h2v-1H9ZM4 6h1V4H4Zm2 0h1V4H6ZM3 2h5V1H3Zm5 5h1V2H8Zm0 0"
    />
  </svg>
);

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

const MarkdownRenderer = ({ content, isStreaming = false, onOpenEmailComposer = undefined }) => {
  const markdown = typeof content === "string" ? content : "";

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="my-3 w-full overflow-x-auto sf-data-table-wrapper rounded-[14px] border border-black/[0.06] bg-[#fafafa] dark:border-white/[0.1] dark:bg-white/[0.04]">
              <table className="sf-data-table w-full border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-foreground/10 bg-foreground/[0.02] text-[11px] font-bold text-foreground/50">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-foreground/60">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-foreground/5 px-3.5 py-2.5 text-foreground/80 last:border-b-0">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-foreground/[0.02]">{children}</tr>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-foreground/20 pl-3 text-xs leading-relaxed text-foreground/80">
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
            <div className="group relative my-2.5 overflow-hidden rounded-[14px] border border-black/10 bg-[#161821] text-xs font-mono text-[#cdd6f4] shadow-sm dark:border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] text-white/50">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Snippet</span>
                <button
                  type="button"
                  onClick={(e) => {
                    const codeEl = e.currentTarget
                      .closest(".group")
                      ?.querySelector<HTMLElement>("code");
                    if (codeEl) navigator.clipboard.writeText(codeEl.innerText || "");
                  }}
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  title="Copy code"
                >
                  <Copy size={11} />
                  <span>Copy</span>
                </button>
              </div>
              <pre
                className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-[#cdd6f4]"
                {...props}
              >
                {children}
              </pre>
            </div>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock =
              (className || "").includes("language-") ||
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
                className="inline rounded-md border border-[#230052]/15 bg-[#230052]/[0.08] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#230052] align-baseline dark:border-[#a855f7]/25 dark:bg-[#a855f7]/15 dark:text-[#c4b5fd]"
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
            <p className="my-1.5 text-xs leading-relaxed text-foreground/90 sm:text-sm">
              {children}
            </p>
          ),
          a: ({ href, children }) => {
            const hasDraftQuery = (urlStr) => {
              if (!urlStr) return false;
              return (
                urlStr.includes("mail.google.com/mail/") ||
                (urlStr.startsWith("mailto:") &&
                  (urlStr.includes("subject=") || urlStr.includes("body=")))
              );
            };

            const isDraftAction = href && (href === "#" || hasDraftQuery(href));

            if (isDraftAction) {
              const isPreparing = href === "#";
              const labelText =
                (typeof children === "string" && children.trim()) ||
                (Array.isArray(children) && children.filter(Boolean).length > 0
                  ? children
                  : isPreparing
                    ? "Preparing email draft..."
                    : "Review email draft");

              return (
                <a
                  href={isPreparing ? undefined : href}
                  onClick={(event) => {
                    event.preventDefault();
                    if (isPreparing) return;
                    const draft = parseEmailDraftUrl(href);
                    if (draft) onOpenEmailComposer?.(draft);
                  }}
                  className={`inline-flex items-center gap-1.5 font-bold text-[#230052] dark:text-[#93c5fd] underline decoration-[#230052]/40 dark:decoration-white/40 underline-offset-2 hover:decoration-[#230052] dark:hover:decoration-white ${
                    isPreparing ? "opacity-70 cursor-wait no-underline" : ""
                  }`}
                >
                  <Mail size={14} className={`shrink-0 ${isPreparing ? "animate-pulse" : ""}`} />
                  <span>{labelText}</span>
                </a>
              );
            }

            const isEmail = Boolean(href && href.startsWith("mailto:"));
            return (
              <a
                href={href}
                target={isEmail ? undefined : "_blank"}
                rel={isEmail ? undefined : "noreferrer"}
                className="font-medium text-[#230052] dark:text-[#93c5fd] underline decoration-[#230052]/40 dark:decoration-white/40 underline-offset-2 hover:decoration-[#230052] dark:hover:decoration-white"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block h-3.5 w-1.5 ml-1 bg-[#230052] dark:bg-white animate-pulse align-middle rounded-xs" />
      )}
    </div>
  );
};

const SuperFlexAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamPortRef = useRef(null);
  const requestInProgressRef = useRef(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [dataContext, setDataContext] = useState<AiContext>({
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

  const [permissionStatus, setPermissionStatus] = useState("pending");
  const [studentId, setStudentId] = useState(getActiveStudentId);
  const aiEnabled = usePreferencesStore((state) => state.aiEnabled);
  const teacherSelections = useTeacherStore((state) => state.selections);
  const [activeModel, setActiveModel] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [emailDraft, setEmailDraft] = useState(null);
  const [dismissedDrafts, setDismissedDrafts] = useState({});
  const userImage = useProfileImage();
  const scrollRef = useRef(null);
  const activeRequestIdRef = useRef(null);

  const runtimeMessage = (message) =>
    new Promise<RuntimeResponse>((resolve) => {
      sendExtensionMessage(message, (response, error) =>
        resolve(
          error ? { error: error.message } : response || { error: "Extension connection failed." },
        ),
      );
    });

  const openSecureKeySettings = () => {
    setShowAiSettings(false);
    setApiKeyInput("");
    setKeyError("");
    setShowKeyModal(true);
  };

  const saveApiKey = async (event) => {
    event.preventDefault();
    if (!event?.nativeEvent?.isTrusted || !apiKeyInput.trim() || isConnecting) return;
    setIsConnecting(true);
    setKeyError("");
    const result = await runtimeMessage({
      type: "SUPERFLEX_AI_SAVE_KEY",
      apiKey: apiKeyInput.trim(),
    });
    setIsConnecting(false);
    if (result.error) {
      setKeyError(result.error);
      return;
    }
    setHasApiKey(true);
    setActiveModel(result.model || null);
    setAvailableModels(result.availableModels || []);
    setApiKeyInput("");
    setShowKeyModal(false);
    window.dispatchEvent(new CustomEvent("superflex-ai-key-updated"));
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
    const loadPermission = () => {
      runtimeMessage({ type: "SUPERFLEX_AI_PERMISSION_GET" }).then((result) =>
        setPermissionStatus(result?.status || "denied"),
      );
    };
    loadPermission();
    const identityChanged = () => {
      window.superflex_ai_context = null;
      setStudentId(getActiveStudentId());
      setDataContext({});
      setMessages([]);
      setPermissionStatus("pending");
      loadPermission();
    };
    window.addEventListener("superflex-student-identity-changed", identityChanged);
    window.addEventListener("superflex-permission-updated", loadPermission);
    return () => {
      window.removeEventListener("superflex-student-identity-changed", identityChanged);
      window.removeEventListener("superflex-permission-updated", loadPermission);
    };
  }, []);

  useEffect(() => {
    const fetchConfig = () => {
      runtimeMessage({ type: "SUPERFLEX_AI_CONFIG" }).then((result) => {
        if (!result || result.error) return;
        setHasApiKey(Boolean(result.configured));
        setActiveModel(result.model || null);
        setAvailableModels(result.availableModels || []);
      });
    };

    fetchConfig();

    const handleKeyUpdate = () => fetchConfig();
    const handleToggleAi = () => {
      setIsOpen((prev) => !prev);
      setShowAiSettings(false);
    };

    window.addEventListener("superflex-ai-key-updated", handleKeyUpdate);
    window.addEventListener("superflex-toggle-ai", handleToggleAi);
    return () => {
      window.removeEventListener("superflex-ai-key-updated", handleKeyUpdate);
      window.removeEventListener("superflex-toggle-ai", handleToggleAi);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadPersistedAiData = async () => {
      try {
        const [savedContext, savedMessages] = await Promise.all([getAiContext(), getAiMessages()]);
        if (!active) return;
        const context = {
          ...(window.superflex_ai_context || savedContext),
          teachers: useTeacherStore.getState().selections,
          rollNumber: studentId,
        };
        window.superflex_ai_context = context;
        setDataContext((current) => ({ ...current, ...context }));
        setMessages(savedMessages);
      } catch (error) {
        console.error("Failed to load AI data from storage", error);
      }
    };
    loadPersistedAiData();

    const handleDataUpdate = (e) => {
      const newData = e.detail;
      setDataContext((prev) => {
        const updated = { ...prev, ...newData };
        window.superflex_ai_context = updated;
        return updated;
      });
    };

    window.addEventListener("superflex-data-updated", handleDataUpdate);

    return () => {
      active = false;
      window.removeEventListener("superflex-data-updated", handleDataUpdate);
    };
  }, [permissionStatus, studentId]);



  useEffect(() => {
    if (messages.length > 0) {
      setAiMessages(messages, studentId).catch((error) =>
        console.error("Failed to save AI chat history", error),
      );
    }
  }, [messages, studentId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (txt, event) => {
    if (!event?.nativeEvent?.isTrusted) return;
    const textToSend = txt || input;
    if (!textToSend.trim() || isLoading || requestInProgressRef.current) return;

    if (permissionStatus !== "granted") {
      setIsOpen(false);
      return;
    }
    if (!studentId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Open the Home page first so SuperFlex can identify your student account, then try again.",
        },
      ]);
      return;
    }

    requestInProgressRef.current = true;
    const userMessage = textToSend.trim();
    const assistantMessageIndex = messages.length + 1;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setIsStreaming(true);

    const requestId = crypto.randomUUID();
    activeRequestIdRef.current = requestId;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      if (!hasApiKey || !activeModel) {
        throw new Error("Connect your Google Gemini API key to activate Octopus.");
      }
      const currentTeachers = teacherSelections;

      const currentRollNumber = dataContext.rollNumber || studentId;

      const payload = buildGeminiPayload({
        question: userMessage,
        dataContext: {
          ...dataContext,
          teachers: currentTeachers,
          rollNumber: currentRollNumber,
        },
        history: messages,
      });

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

        streamPort.onMessage.addListener((rawMessage) => {
          const parsed = streamEventSchema.safeParse(rawMessage);
          if (!parsed.success) {
            streamPort.disconnect();
            resolve(false);
            return;
          }
          const msg = parsed.data;
          if (activeRequestIdRef.current !== requestId) return;

          if (msg.type === "CHUNK") {
            accumulatedText = msg.fullText;
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = { role: "assistant", content: accumulatedText };
              return next;
            });
          } else if (msg.type === "DONE") {
            const completedText =
              msg.fullText || accumulatedText || "Gemini returned an empty response.";
            if (msg.modelSwitched && msg.model) {
              setActiveModel(msg.model);
            }
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                role: "assistant",
                content: completedText,
                switchedModel: msg.modelSwitched && msg.model ? msg.model.name : undefined,
              };
              return next;
            });
            const draft = parseEmailDraftContent(completedText);
            if (draft) setEmailDraft({ ...draft, messageIndex: assistantMessageIndex });
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
        const completedText = result.text || "Gemini returned an empty response.";
        setMessages((prev) => {
          const withoutPending = prev.slice(0, -1);
          return [
            ...withoutPending,
            {
              role: "assistant",
              content: completedText,
              switchedModel: result.modelSwitched && result.model ? result.model.name : undefined,
            },
          ];
        });
        const draft = parseEmailDraftContent(completedText);
        if (draft) setEmailDraft({ ...draft, messageIndex: assistantMessageIndex });
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
        requestInProgressRef.current = false;
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
      requestInProgressRef.current = false;
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

  const handlePermission = async (status, event) => {
    if (!event?.nativeEvent?.isTrusted) return;
    const result = await runtimeMessage({ type: "SUPERFLEX_AI_PERMISSION_SET", status });
    if (!result?.status) return;
    setPermissionStatus(result.status);
    window.dispatchEvent(new CustomEvent("superflex-permission-updated"));
  };

  const clearChat = async () => {
    await deleteAiMessages(studentId);
    setMessages([]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setShowAiSettings(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hasAttendance = Boolean(
    dataContext?.attendance &&
    (Array.isArray(dataContext.attendance)
      ? dataContext.attendance.length > 0
      : Object.keys(dataContext.attendance).length > 0),
  );
  const hasMarks = Boolean(
    dataContext?.marks &&
    (Array.isArray(dataContext.marks)
      ? dataContext.marks.length > 0
      : Object.keys(dataContext.marks).length > 0),
  );
  const hasTranscript = Boolean(
    dataContext?.transcript &&
    (Array.isArray(dataContext.transcript)
      ? dataContext.transcript.length > 0
      : Object.keys(dataContext.transcript).length > 0),
  );
  const hasProfile = Boolean(
    dataContext?.studentName ||
    dataContext?.personalInfo ||
    dataContext?.universityInfo ||
    dataContext?.profileSections,
  );

  const syncCards = [
    {
      id: "attendance",
      label: "Attendance 80%",
      active: hasAttendance,
      icon: Clock,
      description: "Leaves buffer & 80% rule",
      badge: hasAttendance
        ? Array.isArray(dataContext.attendance)
          ? `${dataContext.attendance.length} Courses`
          : "Synced"
        : "Not Synced",
      prompt:
        "What is my attendance status and how many leaves do I have left in each course under the 80% rule?",
    },
    {
      id: "marks",
      label: "Marks Analytics",
      active: hasMarks,
      icon: BarChart,
      description: "Assessments & scores",
      badge: hasMarks
        ? Array.isArray(dataContext.marks)
          ? `${dataContext.marks.length} Courses`
          : "Synced"
        : "Not Synced",
      prompt: "Analyze my current marks performance across all courses.",
    },
    {
      id: "transcript",
      label: "Transcript & GPA",
      active: hasTranscript,
      icon: GraduationCap,
      description: "CGPA, SGPA & credit hours",
      badge: hasTranscript ? "Synced" : "Not Synced",
      prompt: "Summarize my transcript GPA and cleared credits history.",
    },
    {
      id: "personalInfo",
      label: "Personal Info",
      active: hasProfile,
      icon: User,
      description: "Profile & campus records",
      badge: hasProfile ? "Synced" : "Not Synced",
      prompt: "Tell me about my student profile based on the synced data.",
    },
  ];

  if (!aiEnabled) return null;

  return (
    <>
      {showKeyModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="gemini-key-title"
            className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 text-foreground shadow-2xl dark:border-white/15 dark:bg-[#101014]"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="gemini-key-title" className="text-lg font-bold">
                  Connect Gemini API key
                </h2>
                <p className="mt-1 text-sm text-foreground/60">
                  Your key is verified and saved in this extension's local storage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                aria-label="Close"
                className="rounded-full p-2 text-foreground/60 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="mb-4 inline-flex text-sm font-semibold text-[#230052] hover:underline dark:text-white"
            >
              Get a free Gemini API key ↗
            </a>
            <form onSubmit={saveApiKey} className="space-y-3">
              <input
                type="password"
                autoComplete="off"
                autoFocus
                value={apiKeyInput}
                onChange={(event) => {
                  setApiKeyInput(event.target.value);
                  setKeyError("");
                }}
                placeholder="Paste Gemini API key"
                aria-label="Gemini API key"
                className="min-h-12 w-full rounded-xl border border-black/10 bg-slate-50 px-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#230052]/30 dark:border-white/10 dark:bg-white/[0.06]"
              />
              {keyError && (
                <p role="alert" className="text-sm text-rose-500">
                  {keyError}
                </p>
              )}
              <button
                type="submit"
                disabled={!apiKeyInput.trim() || isConnecting}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#230052] px-4 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-[#0a192f]"
              >
                {isConnecting ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" /> Verifying…
                  </>
                ) : (
                  "Verify and save key"
                )}
              </button>
            </form>
          </section>
        </div>
      )}
      {}
      {isOpen && (
        <div
          onClick={() => {
            setIsOpen(false);
            setShowAiSettings(false);
          }}
          className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {}
      <div
        className={`fixed bottom-[78px] left-1/2 -translate-x-1/2 z-[999] w-[min(520px,calc(100dvw-2rem))] pointer-events-auto lg:bottom-6 lg:w-[min(520px,calc(100vw-2rem))] ${
          isOpen ? "block" : "hidden lg:block"
        }`}
      >
        {}
        {isOpen && (
          <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-[min(720px,calc(100dvw-2rem))] max-h-[min(540px,calc(100dvh-160px))] flex flex-col rounded-[22px] border border-black/[0.08] bg-white/95 p-4 shadow-2xl backdrop-blur-2xl dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] animate-in fade-in slide-in-from-bottom-3 duration-200 overflow-hidden sm:mb-3.5 sm:w-[min(720px,calc(100vw-2rem))] sm:rounded-[24px] sm:p-5">
            {}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-black/[0.06] dark:border-white/[0.08] shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] shadow-xs">
                  <OctopusIcon size={14} />
                </div>
                <span className="font-bold text-sm tracking-tight text-foreground">Octopus</span>
                {activeModel && (
                  <span className="rounded-full bg-[#230052]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#230052] dark:bg-white/10 dark:text-white">
                    {activeModel.name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={clearChat}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/50 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                    title="Clear conversation"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowAiSettings(false);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-foreground/60 hover:text-foreground dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/70 dark:hover:text-white transition-colors"
                  title="Close card"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 scrollbar-hide">
              {permissionStatus !== "granted" ? (
                <div className="flex flex-col gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] sm:rounded-2xl">
                      <Shield size={20} />
                    </div>
                    <div>
                      <span className="block font-bold text-foreground text-sm">
                        Let the Octopus In? 👀
                      </span>
                      <span className="text-xs text-foreground/60 leading-relaxed">
                        Allow Octopus to access your portal data to help with marks, attendance, and
                        academic questions.
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        handlePermission("denied", event);
                        setIsOpen(false);
                      }}
                      className="rounded-full px-4 py-1.5 text-xs font-semibold text-foreground/60 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={(event) => handlePermission("granted", event)}
                      className="rounded-full bg-[#230052] px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#370c72] dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/80"
                    >
                      Enable Octopus
                    </button>
                  </div>
                </div>
              ) : !hasApiKey ? (
                <div className="flex flex-col gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] sm:rounded-2xl">
                      <KeyRound size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-bold text-foreground text-sm">
                        Give the Octopus a Brain. 🧠
                      </span>
                      <span className="text-xs text-foreground/60">
                        Connect your Gemini API key and unlock your academic survival assistant.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openSecureKeySettings}
                    className="self-start rounded-xl bg-[#230052] px-4 py-2 text-xs font-bold text-white hover:bg-[#370c72] dark:bg-white dark:text-[#0a192f]"
                  >
                    Add Gemini API key
                  </button>
                  <div className="flex items-center justify-between text-[11px]">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#230052] dark:text-white hover:underline"
                    >
                      Get free Gemini API key ↗
                    </a>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-2 px-2 text-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] shadow-sm">
                    <OctopusIcon size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-foreground tracking-tight">
                    Bol Bhai, Kya Scene Hai? 🐙
                  </h4>
                  <p className="mt-0.5 text-xs text-foreground/60 max-w-sm">
                    Ask Octopus anything about your marks, attendance, GPA, or teachers.
                  </p>

                  {}
                  <div className="mt-3 flex w-full snap-x snap-mandatory gap-2 overflow-x-auto pb-1 text-left scrollbar-hide sm:mt-3.5 sm:grid sm:grid-cols-4 sm:pb-0">
                    {syncCards.map((card) => {
                      const Icon = card.icon;
                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={
                            card.active ? (event) => handleSend(card.prompt, event) : undefined
                          }
                          disabled={!card.active}
                          title={
                            card.active
                              ? `Ask: "${card.prompt}"`
                              : `Visit ${card.label} page to sync data into Octopus`
                          }
                          className={`group relative flex min-w-[144px] shrink-0 snap-start flex-col justify-between rounded-xl border p-2.5 text-left transition-all duration-200 sm:min-w-0 sm:rounded-2xl ${
                            card.active
                              ? "cursor-pointer border-black/[0.08] bg-slate-50/80 hover:bg-slate-100/90 hover:border-black/20 hover:-translate-y-0.5 active:scale-[0.99] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:hover:border-white/20 shadow-xs"
                              : "cursor-not-allowed border-black/[0.04] bg-slate-100/40 opacity-45 grayscale dark:border-white/[0.04] dark:bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                                card.active
                                  ? "bg-[#230052]/10 text-[#230052] dark:bg-white/10 dark:text-white"
                                  : "bg-black/5 text-foreground/40 dark:bg-white/5 dark:text-white/40"
                              }`}
                            >
                              <Icon size={16} />
                            </div>
                            <span
                              className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                card.active
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-black/5 text-foreground/40 dark:bg-white/5 dark:text-white/40"
                              }`}
                            >
                              {card.active && (
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              )}
                              {card.badge}
                            </span>
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-foreground tracking-tight">
                              {card.label}
                            </h5>
                            <p className="mt-0.5 text-[11px] text-foreground/60 leading-snug line-clamp-1">
                              {card.active ? card.description : "Visit page to sync"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {}
                  <div className="mt-3 flex w-full flex-nowrap justify-center gap-1.5">
                    {["Who are my course instructors?", "Draft an email to my teacher"].map(
                      (prompt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(event) => handleSend(prompt, event)}
                          className="whitespace-nowrap rounded-full border border-black/[0.08] bg-slate-100/80 px-2.5 py-1 text-[11px] font-semibold text-foreground/80 hover:bg-[#230052] hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white dark:hover:text-[#0a192f] transition-colors"
                        >
                          {prompt}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <div ref={scrollRef} className="space-y-4 py-1">
                  {messages.map((m, i) => {
                    const isUser = m.role === "user";
                    return (
                      <div
                        key={i}
                        className={`flex ${
                          isUser ? "justify-end" : "justify-start"
                        } items-start gap-2.5 animate-in fade-in duration-200`}
                      >
                        <div
                          className={`relative group leading-relaxed ${
                            isUser
                              ? "max-w-[85%] rounded-[16px] rounded-br-xs bg-[#230052] text-white px-4 py-2.5 shadow-sm text-xs sm:text-sm font-medium dark:bg-white dark:text-[#0a192f]"
                              : "w-full text-foreground py-1 text-xs sm:text-sm"
                          }`}
                        >
                          {!isUser && (
                            <div className="flex items-center justify-between mb-1 text-[10px] text-foreground/50">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground">Octopus</span>
                                {activeModel && (
                                  <span className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-[9px] font-medium text-foreground/70">
                                    {activeModel.name}
                                  </span>
                                )}
                              </div>
                              {m.content && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyMessage(i, m.content)}
                                  title="Copy response"
                                  className="flex items-center gap-1 text-[10px] font-semibold text-foreground/40 hover:text-foreground transition-colors"
                                >
                                  {copiedIdx === i ? (
                                    <>
                                      <Check size={11} className="text-emerald-500" />
                                      <span className="text-emerald-500 font-bold">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={11} />
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
                            <div className="flex items-center gap-2 py-2 text-xs font-medium text-foreground/70">
                              <LoaderCircle
                                size={15}
                                className="animate-spin text-[#230052] dark:text-white"
                              />
                              <span>Processing your academic trauma...</span>
                            </div>
                          ) : (
                            <>
                              {(() => {
                                const isThisStreaming = isStreaming && i === messages.length - 1;
                                const detectedDraft = parseEmailDraftContent(m.content);
                                const activeDraft =
                                  emailDraft?.messageIndex === i ? emailDraft : detectedDraft;
                                const isDismissed = dismissedDrafts[i];

                                if (activeDraft && !isDismissed) {
                                  return (
                                    <>
                                      {activeDraft.introText ? (
                                        <MarkdownRenderer
                                          content={activeDraft.introText}
                                          isStreaming={false}
                                        />
                                      ) : (
                                        <p className="my-1.5 text-xs leading-relaxed text-foreground/75 sm:text-sm">
                                          {isThisStreaming
                                            ? "Drafting your email to the instructor..."
                                            : "I prepared the email for you. Review or edit it before opening Gmail."}
                                        </p>
                                      )}
                                      <GmailComposer
                                        draft={activeDraft}
                                        status={isThisStreaming ? "streaming" : "reviewing"}
                                        senderName={dataContext.studentName}
                                        onClose={() =>
                                          setDismissedDrafts((prev) => ({ ...prev, [i]: true }))
                                        }
                                      />
                                    </>
                                  );
                                }

                                return (
                                  <MarkdownRenderer
                                    content={
                                      typeof m.content === "string"
                                        ? m.content
                                            .replace(
                                              />?\s*ℹ️?\s*_?Switched to \*\*?(.*?)\*\*? as primary model was under high load\._?/gi,
                                              "",
                                            )
                                            .trimEnd()
                                        : m.content
                                    }
                                    isStreaming={isThisStreaming}
                                    onOpenEmailComposer={(draft) => {
                                      setDismissedDrafts((prev) => {
                                        const next = { ...prev };
                                        delete next[i];
                                        return next;
                                      });
                                      setEmailDraft({ ...draft, messageIndex: i });
                                    }}
                                  />
                                );
                              })()}
                              {(m.switchedModel ||
                                (typeof m.content === "string" &&
                                  /Switched to .* as primary model/i.test(m.content))) && (
                                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-foreground/60 font-normal">
                                  <Info size={13} className="shrink-0 text-foreground/50" />
                                  <span>
                                    Even the AI got overwhelmed. Switching models. (Using{" "}
                                    <strong className="font-semibold text-foreground">
                                      {m.switchedModel ||
                                        m.content.match(
                                          /Switched to \*\*?(.*?)\*\*? as primary model/i,
                                        )?.[1] ||
                                        "backup model"}
                                    </strong>
                                    )
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {isUser && (
                          <div className="h-8 w-8 rounded-full border border-black/[0.08] bg-white shadow-xs flex items-center justify-center shrink-0 overflow-hidden mt-1 dark:border-white/20">
                            <img src={userImage} alt="Me" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {}
        <svg className="absolute w-0 h-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <defs>
            <filter
              id="turbulent-displace"
              colorInterpolationFilters="sRGB"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.05 0.08"
                numOctaves="3"
                result="noise1"
                seed="1"
              />
              <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                <animate
                  attributeName="dy"
                  values="300; 0"
                  dur="4s"
                  repeatCount="indefinite"
                  calcMode="linear"
                />
              </feOffset>

              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.05 0.08"
                numOctaves="3"
                result="noise2"
                seed="2"
              />
              <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                <animate
                  attributeName="dy"
                  values="0; -300"
                  dur="4s"
                  repeatCount="indefinite"
                  calcMode="linear"
                />
              </feOffset>

              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.08 0.05"
                numOctaves="3"
                result="noise3"
                seed="3"
              />
              <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
                <animate
                  attributeName="dx"
                  values="300; 0"
                  dur="4s"
                  repeatCount="indefinite"
                  calcMode="linear"
                />
              </feOffset>

              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.08 0.05"
                numOctaves="3"
                result="noise4"
                seed="4"
              />
              <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
                <animate
                  attributeName="dx"
                  values="0; -300"
                  dur="4s"
                  repeatCount="indefinite"
                  calcMode="linear"
                />
              </feOffset>

              {}
              <feComposite
                in="offsetNoise1"
                in2="offsetNoise2"
                operator="arithmetic"
                k1="0"
                k2="0.5"
                k3="0.5"
                k4="0"
                result="vertNoise"
              />
              <feComposite
                in="offsetNoise3"
                in2="offsetNoise4"
                operator="arithmetic"
                k1="0"
                k2="0.5"
                k3="0.5"
                k4="0"
                result="horizNoise"
              />
              <feComposite
                in="vertNoise"
                in2="horizNoise"
                operator="arithmetic"
                k1="0"
                k2="0.5"
                k3="0.5"
                k4="0"
                result="combinedNoise"
              />

              <feDisplacementMap
                in="SourceGraphic"
                in2="combinedNoise"
                scale="3.5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        {}
        <div className="group relative flex items-center gap-2 rounded-full border border-black/20 bg-white/95 p-1.5 shadow-md shadow-black/5 backdrop-blur-2xl transition-all focus-within:border-black/20 dark:border-white/20 dark:bg-black/95 dark:focus-within:border-white/20">
          {}
          <div
            className="absolute inset-0 rounded-full border-[1.5px] border-black/20 pointer-events-none z-10 dark:border-white/20"
            style={{ filter: isOpen ? "none" : "url(#turbulent-displace)" }}
          />
          {}
          <div className="relative pl-1">
            <button
              type="button"
              onClick={() => setShowAiSettings((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#230052] hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 transition-colors shrink-0"
              title="Octopus Settings & Models"
            >
              <OctopusIcon size={18} />
            </button>

            {showAiSettings && (
              <div className="absolute bottom-full mb-3 left-0 w-[min(360px,calc(100vw-2rem))] rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-2xl backdrop-blur-2xl dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-200">
                {}
                {!hasApiKey && (
                  <div className="border-b border-black/[0.06] pb-3 mb-3 dark:border-white/[0.08]">
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <KeyRound size={14} className="text-[#230052] dark:text-white" /> Gemini API
                        Key
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
                    <button
                      type="button"
                      onClick={openSecureKeySettings}
                      className="rounded-xl bg-[#230052] px-3.5 py-2 text-xs font-bold text-white dark:bg-white dark:text-[#0a192f]"
                    >
                      Add Gemini API key
                    </button>
                  </div>
                )}

                {}
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
                        className={
                          isRefreshingModels ? "animate-spin text-[#230052] dark:text-white" : ""
                        }
                      />
                      Refresh
                    </button>
                  </div>

                  {availableModels.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-hide">
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
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                      isSelected
                                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#0a192f]"
                                        : "bg-[#230052]/10 text-[#230052] dark:bg-white/10 dark:text-white"
                                    }`}
                                  >
                                    Fast
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-[10px] truncate ${isSelected ? "text-white/80 dark:text-[#0a192f]/80" : "text-foreground/50"}`}
                              >
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
                      Connect your Gemini API key in Settings to load available models.
                    </p>
                  )}

                  {hasApiKey && (
                    <div className="mt-2.5 pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-foreground/50">
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Key Connected
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAiSettings(false);
                          window.dispatchEvent(
                            new CustomEvent("superflex-open-global-settings", {
                              detail: { tab: "ai" },
                            }),
                          );
                        }}
                        className="font-semibold text-[#230052] dark:text-white hover:underline"
                      >
                        Manage in Settings ↗
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {}
          <input
            type="text"
            value={input}
            onFocus={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend(undefined, event);
              }
            }}
            placeholder="Ask Octopus..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[#101010] placeholder:text-slate-500 focus:outline-none dark:text-[#f5f6fb] dark:placeholder:text-slate-400 font-medium"
          />

          {}
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
              onClick={(event) => handleSend(undefined, event)}
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#230052] text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 dark:bg-white dark:text-[#0a192f]"
              title="Send message"
            >
              <Send size={15} />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default SuperFlexAI;
