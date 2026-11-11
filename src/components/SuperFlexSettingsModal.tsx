import { optionalEmailSchema } from "../schemas/common";
import { usePreferencesStore } from "../stores/preferencesStore";
import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  GraduationCap,
  Search,
  UserRound,
  X,
  KeyRound,
  Sparkles,
  ExternalLink,
  LoaderCircle,
  Cpu,
  Bot,
  Sliders,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import BottomSheet, {
  BottomSheetClose,
  BottomSheetDescription,
  BottomSheetTitle,
} from "./ui/BottomSheet";
import { sendExtensionMessage } from "../utils/extensionApi";
import {
  saveCredentials,
  clearSavedCredentials,
  getCredentialMetadata,
} from "../utils/credentialStorage";
import TeacherAvatar from "./TeacherAvatar";
import { createManualTeacher, filterTeachers } from "../utils/teacherSelection";

function SuperFlexSettingsForm({
  open,
  mode = "settings",
  initialTab = "teachers",
  courses = [],
  campus,
  teachers = [],
  loadingTeachers = false,
  errorTeachers = false,
  selections = {},
  onSelectTeacher,
  onSave,
  onClose,
  onRetryTeachers,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [step, setStep] = useState(() => (initialTab === "ai" ? 2 : 1));
  const [courseIndex, setCourseIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [showManual, setShowManual] = useState(false);
  const manualEmailValid = optionalEmailSchema.safeParse(manualEmail.trim()).success;

  const aiEnabled = usePreferencesStore((state) => state.aiEnabled);
  const setAiEnabled = usePreferencesStore((state) => state.setAiEnabled);
  const [permissionStatus, setPermissionStatus] = useState("pending");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [activeModel, setActiveModel] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [savedCreds, setSavedCreds] = useState(null);
  const [autofillUser, setAutofillUser] = useState("");
  const [autofillPass, setAutofillPass] = useState("");
  const [autofillSaving, setAutofillSaving] = useState(false);
  const [autofillSuccess, setAutofillSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      sendExtensionMessage({ type: "SUPERFLEX_AI_PERMISSION_GET" }, (result) => {
        setPermissionStatus(result?.status || "denied");
      });

      sendExtensionMessage({ type: "SUPERFLEX_AI_CONFIG" }, (response) => {
        if (response && !response.error) {
          setHasApiKey(Boolean(response.configured));
          setActiveModel(response.model || null);
        }
      });

      getCredentialMetadata().then((metadata) => {
        setSavedCreds(metadata.hasCredentials ? metadata : null);
      });
    }
  }, [open, initialTab]);

  const activeCourse = (courses || [])[courseIndex] || null;
  const dockEnabled = aiEnabled;
  const filteredTeachers = useMemo(() => filterTeachers(teachers, query), [teachers, query]);

  const handleToggleAi = (enabled, event) => {
    if (!event?.nativeEvent?.isTrusted) return;
    setAiEnabled(enabled);
  };

  const handleConnectGemini = (event) => {
    if (!event?.nativeEvent?.isTrusted) return;
    if (!apiKeyInput.trim()) return;
    setIsConnecting(true);
    setSaveError("");
    setSaveSuccess(false);

    sendExtensionMessage(
      { type: "SUPERFLEX_AI_SAVE_KEY", apiKey: apiKeyInput.trim() },
      (response, error) => {
        setIsConnecting(false);
        if (error || response?.error) {
          setSaveError(error?.message || response?.error || "Failed to verify Gemini API Key.");
          return;
        }
        setHasApiKey(true);
        setActiveModel(response?.model || null);
        setSaveSuccess(true);
        setApiKeyInput("");
        window.dispatchEvent(new CustomEvent("superflex-ai-key-updated"));
      },
    );
  };

  const addManualTeacher = () => {
    const teacher = createManualTeacher(manualName, manualEmail);
    if (!teacher || !activeCourse) return;
    onSelectTeacher(activeCourse.id, teacher);
    setManualName("");
    setManualEmail("");
    setShowManual(false);
  };

  const currentTab = mode === "setup" ? (step === 1 ? "teachers" : "ai") : activeTab;

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex shrink-0 justify-center pt-3.5 pb-1">
        <span className="h-1.5 w-14 rounded-full bg-[#ded9e5] dark:bg-white/20" />
      </div>

      <BottomSheetClose asChild>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close setup modal"
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 transition-colors sm:right-5 sm:top-5"
        >
          <X size={18} />
        </button>
      </BottomSheetClose>

      {}
      <header className="flex shrink-0 flex-col items-center px-6 pb-3.5 pt-1.5 text-center sm:px-8 sm:pb-4 sm:pt-2">
        <div className="mb-2.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#230052] text-white shadow-xs dark:bg-white dark:text-[#101027] sm:h-11 sm:w-11 sm:rounded-2xl">
          {currentTab === "teachers" ? (
            <GraduationCap size={18} className="sm:h-5 sm:w-5" />
          ) : currentTab === "autofill" ? (
            <KeyRound size={18} className="sm:h-5 sm:w-5" />
          ) : (
            <Bot size={18} className="sm:h-5 sm:w-5" />
          )}
        </div>

        <BottomSheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-xl">
          {mode === "setup"
            ? step === 1
              ? "Select Your Course Instructors"
              : "Set Up Octopus AI Assistant"
            : currentTab === "autofill"
              ? "FLEX Login Auto-Fill"
              : currentTab === "ai"
                ? "Octopus AI Settings"
                : "Course Faculty Settings"}
        </BottomSheetTitle>

        <BottomSheetDescription className="mt-1 hidden text-xs text-slate-500 dark:text-slate-400 sm:block sm:max-w-md">
          {mode === "setup"
            ? step === 1
              ? "Select instructors to personalize attendance reviews, grades, and email drafts."
              : "Configure your academic AI companion for leave tracking and smart suggestions."
            : activeTab === "autofill"
              ? "Securely manage your encrypted Roll No and password for 1-click auto-fill."
              : "Manage your course instructors, AI permissions, and API key preferences."}
        </BottomSheetDescription>

        {/* Tab switch / step breadcrumbs */}
        {mode === "settings" ? (
          <div className="mt-3 inline-flex max-w-full items-center gap-1 rounded-full border border-black/[0.08] bg-slate-100/80 p-1 dark:border-white/10 dark:bg-white/[0.06] sm:gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("teachers")}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold transition-all sm:px-4 sm:py-1.5 sm:text-xs ${
                activeTab === "teachers"
                  ? "bg-[#230052] text-white shadow-xs dark:bg-white dark:text-[#0a192f]"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <GraduationCap size={13} />
              Course Faculty
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold transition-all sm:px-4 sm:py-1.5 sm:text-xs ${
                activeTab === "ai"
                  ? "bg-[#230052] text-white shadow-xs dark:bg-white dark:text-[#0a192f]"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <Bot size={13} />
              Octopus AI
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("autofill")}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold transition-all sm:px-4 sm:py-1.5 sm:text-xs ${
                activeTab === "autofill"
                  ? "bg-[#230052] text-white shadow-xs dark:bg-white dark:text-[#0a192f]"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <KeyRound size={13} />
              Auto-Fill
            </button>
          </div>
        ) : (
          <div className="mt-3.5 flex items-center gap-2">
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                step === 1
                  ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {step > 1 && <Check size={12} strokeWidth={3} />} 1. Teachers
            </span>
            <span className="text-foreground/30">→</span>
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                step === 2
                  ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"
                  : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-white/50"
              }`}
            >
              2. Octopus AI
            </span>
          </div>
        )}
      </header>

      {/* Scrollable content body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 sm:px-8 sm:py-5">
        {currentTab === "teachers" && (
          <div className="space-y-3.5 sm:space-y-4">
            {/* Faculty Directory Info & Progress */}
            <div className="flex items-center justify-between gap-2 text-xs text-foreground/60">
              <span className="font-semibold text-foreground">
                {campus?.name || "Campus"} Faculty Directory
              </span>
              <span className="shrink-0">
                {Object.keys(selections).length} of {courses.length} assigned
              </span>
            </div>

            {/* Course Chips */}
            {courses.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {courses.map((course, index) => {
                  const chosen = selections[course.id];
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => {
                        setCourseIndex(index);
                        setQuery("");
                      }}
                      className={`flex min-w-0 max-w-[180px] shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                        index === courseIndex
                          ? "bg-[#230052] text-white dark:bg-white dark:text-[#101027]"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[.08] dark:text-slate-300 dark:hover:bg-white/15"
                      }`}
                    >
                      {chosen && <Check size={11} strokeWidth={3} />}
                      <span className="truncate">{course.id}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="py-2 text-center text-xs text-foreground/50">
                Course list is syncing from portal...
              </p>
            )}

            {/* Active Course & Assigned Instructor Bar */}
            {activeCourse && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-slate-50/90 px-3.5 py-2.5 text-xs dark:border-white/[0.08] dark:bg-white/[0.04]">
                <div className="min-w-0 flex items-center gap-1.5">
                  <span className="truncate font-bold text-foreground">
                    {activeCourse.id}: {activeCourse.title}
                  </span>
                </div>
                <div className="max-w-[46%] shrink-0 truncate text-right text-[11px]">
                  {selections[activeCourse.id]?.name ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {selections[activeCourse.id].name}
                    </span>
                  ) : (
                    <span className="font-medium text-amber-600 dark:text-amber-400">Not assigned yet</span>
                  )}
                </div>
              </div>
            )}

            {/* Search Input */}
            <label className="flex min-h-10 items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-2 focus-within:border-[#230052] dark:border-white/15 dark:focus-within:border-white">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search teacher by name or designation..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400 dark:text-white"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </label>

            {/* Teacher Selection List (clean, low-noise rows) */}
            <div className="max-h-[280px] space-y-2 overflow-y-auto py-0.5 scrollbar-hide sm:max-h-[340px]">
              {loadingTeachers ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-slate-400">
                  <LoaderCircle
                    size={20}
                    className="animate-spin text-[#230052] dark:text-white mb-2"
                  />
                  Loading {campus?.name || "campus"} faculty records...
                </div>
              ) : errorTeachers ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-rose-500">
                  <p>Failed to load campus faculty list.</p>
                  {onRetryTeachers && (
                    <button
                      type="button"
                      onClick={onRetryTeachers}
                      className="mt-2 text-xs font-bold underline"
                    >
                      Retry loading faculty
                    </button>
                  )}
                </div>
              ) : filteredTeachers.length > 0 ? (
                filteredTeachers.slice(0, 50).map((teacher) => {
                  const selectedTeacher = activeCourse ? selections[activeCourse.id] : null;
                  const isSelected =
                    selectedTeacher?.email && teacher.email
                      ? selectedTeacher.email.toLowerCase() === teacher.email.toLowerCase()
                      : selectedTeacher?.id === teacher.id &&
                        selectedTeacher?.source === teacher.source;

                  return (
                    <button
                      key={`${teacher.source}:${teacher.id || teacher.email || teacher.name}`}
                      type="button"
                      onClick={() => activeCourse && onSelectTeacher(activeCourse.id, teacher)}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all sm:px-3.5 sm:py-2.5 ${
                        isSelected
                          ? "border border-[#230052] bg-[#230052]/[0.06] shadow-xs dark:border-white/30 dark:bg-white/[0.10]"
                          : "border border-black/[0.04] bg-white/40 hover:bg-black/[0.03] dark:border-white/[0.05] dark:bg-white/[0.02] dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <TeacherAvatar
                        teacher={teacher}
                        size="xs"
                        className="h-8 w-8 rounded-lg sm:h-9 sm:w-9 sm:rounded-xl"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="truncate text-xs font-bold text-foreground">
                          {teacher.name}
                        </p>
                        {teacher.designation ? (
                          <p className="truncate text-[10px] text-foreground/50 sm:text-[11px]">
                            {teacher.designation}
                          </p>
                        ) : null}
                      </div>
                      {isSelected ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] shrink-0">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-white/20 shrink-0 group-hover:border-[#230052] dark:group-hover:border-white" />
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="py-6 text-center text-xs text-slate-400">
                  No instructors matched "{query}".
                </p>
              )}
            </div>
            {filteredTeachers.length > 50 && (
              <p className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Showing 50 of {filteredTeachers.length} matches. Refine your search to see more.
              </p>
            )}

            {/* Can't find your teacher (clean collapsible form) */}
            <div className="pt-1 pb-1">
              {!showManual ? (
                <button
                  type="button"
                  onClick={() => setShowManual(true)}
                  className="inline-flex items-center py-1 text-xs font-semibold text-[#230052] hover:underline dark:text-purple-300"
                >
                  + Can't find your teacher? Add manually
                </button>
              ) : (
                <div className="rounded-xl border border-dashed border-black/10 p-3.5 text-xs dark:border-white/15 sm:p-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-foreground">Add Custom Instructor</p>
                    <button
                      type="button"
                      onClick={() => setShowManual(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="Teacher Name"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#230052] dark:border-white/15 dark:bg-white/5 dark:focus:border-white"
                    />
                    <input
                      type="email"
                      value={manualEmail}
                      aria-invalid={!manualEmailValid}
                      title={
                        manualEmailValid ? undefined : "Enter a valid email address or leave it blank"
                      }
                      onChange={(e) => setManualEmail(e.target.value)}
                      placeholder="Email (optional)"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#230052] dark:border-white/15 dark:bg-white/5 dark:focus:border-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addManualTeacher}
                    disabled={!manualName.trim() || !activeCourse || !manualEmailValid}
                    className="mt-2.5 rounded-lg bg-[#230052] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#370c72] disabled:opacity-40 dark:bg-white dark:text-[#0a192f]"
                  >
                    Save Instructor
                  </button>
                  {!manualEmailValid && (
                    <p role="status" className="mt-1.5 text-[11px] text-rose-500">
                      Enter a valid email address or leave it blank.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {currentTab === "ai" && (
          <div className="space-y-4">
            {}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/[0.08] bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04] sm:gap-4 sm:p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] shadow-xs shrink-0">
                  <Bot size={20} />
                </div>
                <div className="min-w-0">
                  <span className="block text-sm font-bold text-foreground">
                    Enable Octopus AI Assistant
                  </span>
                  <span className="block text-xs text-foreground/60 leading-relaxed">
                    AI calculations for 80% attendance leaves, grade forecasting, and teacher
                    emails.
                  </span>
                </div>
              </div>

              {}
              <button
                type="button"
                role="switch"
                aria-checked={dockEnabled}
                onClick={(event) => handleToggleAi(!dockEnabled, event)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  dockEnabled ? "bg-[#230052] dark:bg-white" : "bg-slate-300 dark:bg-white/20"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out dark:bg-[#0a192f] ${
                    dockEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-foreground/60" role="status">
              {permissionStatus === "granted"
                ? "Academic data permission is enabled for AI requests."
                : "Academic data permission is not enabled. You can still configure your Gemini key; Octopus will ask before using academic data."}
            </p>

            {dockEnabled ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                {}
                <div className="rounded-2xl border border-sky-400/30 bg-sky-500/[0.07] p-4 dark:border-sky-400/20 dark:bg-sky-500/[0.05] sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                        <KeyRound size={14} className="text-sky-600 dark:text-sky-400" />
                        1. Get Free Google Gemini API Key
                      </span>
                      <p className="mt-1 text-[11px] text-sky-900/70 dark:text-sky-300/70 leading-relaxed">
                        Official Gemini free-tier key from Google AI Studio. No credit card
                        required.
                      </p>
                    </div>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 flex items-center gap-1 rounded-full bg-sky-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-600 transition-colors shadow-xs"
                    >
                      Get Free Key ↗
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-foreground">
                    <span>2. Connect Gemini API Key</span>
                    {hasApiKey && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Key Connected {activeModel ? `(${activeModel.name})` : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2.5">
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => {
                        setApiKeyInput(e.target.value);
                        setSaveError("");
                        setSaveSuccess(false);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && apiKeyInput.trim() && !isConnecting) {
                          event.preventDefault();
                          handleConnectGemini(event);
                        }
                      }}
                      placeholder={
                        hasApiKey
                          ? "Enter new key to replace existing"
                          : "Paste Gemini API key (AIzaSy...)"
                      }
                      className="min-h-11 flex-1 min-w-0 rounded-xl border border-black/[0.08] bg-slate-50 px-3.5 py-2.5 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-[#230052]/30 dark:border-white/[0.1] dark:bg-white/[0.06]"
                    />
                    <button
                      type="button"
                      onClick={(event) => handleConnectGemini(event)}
                      disabled={!apiKeyInput.trim() || isConnecting}
                      className="min-h-11 flex items-center gap-1.5 rounded-xl bg-[#230052] px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#370c72] disabled:opacity-50 dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/80 shrink-0"
                    >
                      {isConnecting ? (
                        <LoaderCircle size={14} className="animate-spin" />
                      ) : (
                        "Save Key"
                      )}
                    </button>
                  </div>
                  {saveError && (
                    <p className="text-[11px] font-medium text-rose-500">{saveError}</p>
                  )}
                  {saveSuccess && (
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      ✓ Gemini API Key verified and saved successfully!
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-slate-100/60 p-3.5 text-[11px] leading-relaxed text-foreground/60 dark:bg-white/[0.03]">
                  <strong>Privacy Note:</strong> Your API key is stored locally inside your browser
                  and never leaves your device. Data is processed directly through Google's official
                  Gemini API.
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-foreground/60 dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
                Octopus AI is currently disabled. The floating chat dock will remain hidden on all
                portal pages.
              </div>
            )}
          </div>
        )}

        {}
        {currentTab === "autofill" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-black/[0.08] bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">FLEX Login Auto-Fill</h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck size={11} />
                      AES-GCM 256-bit
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/60">
                    Saves your Roll No & password securely in local extension storage so you can
                    easily Auto-Fill on future logins.
                  </p>
                </div>
              </div>
            </div>

            {savedCreds ? (
              <div className="space-y-4 rounded-2xl border border-black/[0.08] bg-white p-4 dark:border-white/10 dark:bg-black sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                      Active Credentials
                    </p>
                    <p className="mt-1 text-base font-bold text-foreground">
                      {savedCreds.maskedUsername || savedCreds.username}
                    </p>
                    <p className="mt-0.5 text-xs text-foreground/50">
                      Password: <span className="font-mono tracking-widest">••••••••••••</span>
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Check size={12} strokeWidth={3} />
                    Auto-Fill Active
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-4 dark:border-white/[0.08]">
                  <p className="text-xs text-foreground/50">
                    Credentials are encrypted and never leave this browser.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      await clearSavedCredentials();
                      setSavedCreds(null);
                    }}
                    className="rounded-full bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 transition-colors cursor-pointer"
                  >
                    Clear Credentials
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-2xl border border-black/[0.08] bg-white p-4 dark:border-white/10 dark:bg-black sm:p-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                    Save Credentials Manually
                  </h4>
                  <p className="mt-1 text-xs text-foreground/50">
                    Or check "Remember Me" next time you sign into FLEX.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-foreground/70 uppercase">
                      Roll Number / Username
                    </label>
                    <input
                      type="text"
                      value={autofillUser}
                      onChange={(e) => setAutofillUser(e.target.value)}
                      placeholder="e.g. 21K-1234"
                      className="w-full rounded-xl border border-black/[0.1] bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-foreground outline-hidden focus:border-[#230052] dark:border-white/10 dark:bg-white/[0.05]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-foreground/70 uppercase">
                      Password
                    </label>
                    <input
                      type="password"
                      value={autofillPass}
                      onChange={(e) => setAutofillPass(e.target.value)}
                      placeholder="FLEX Password"
                      className="w-full rounded-xl border border-black/[0.1] bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-foreground outline-hidden focus:border-[#230052] dark:border-white/10 dark:bg-white/[0.05]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <p className="text-[11px] text-foreground/50">
                    Stored in Chrome's sandboxed local extension storage.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!autofillUser.trim() || !autofillPass) return;
                      setAutofillSaving(true);
                      const saved = await saveCredentials(autofillUser.trim(), autofillPass);
                      const metadata = await getCredentialMetadata();
                      setSavedCreds(saved ? metadata : null);
                      setAutofillSaving(false);
                      setAutofillSuccess(saved);
                      setAutofillUser("");
                      setAutofillPass("");
                      setTimeout(() => setAutofillSuccess(false), 3000);
                    }}
                    disabled={!autofillUser.trim() || !autofillPass || autofillSaving}
                    className="flex items-center gap-1.5 rounded-full bg-[#230052] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#370c72] disabled:opacity-50 dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/80 cursor-pointer"
                  >
                    <ShieldCheck size={13} />
                    {autofillSaving ? "Encrypting..." : "Save Credentials"}
                  </button>
                </div>

                {autofillSuccess && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    ✓ Credentials encrypted and saved successfully!
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {}
      <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-black/[0.06] px-6 py-3.5 sm:px-8 sm:py-4 dark:border-white/[0.08]">
        {mode === "setup" ? (
          <>
            {step === 1 ? (
              <div className="flex items-center gap-3">
                {courseIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCourseIndex((i) => Math.max(0, i - 1));
                      setQuery("");
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-foreground/70 hover:text-foreground cursor-pointer"
                  >
                    <ArrowLeft size={13} /> Prev Course
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  {Object.keys(selections).length > 0 ? "Skip to Octopus AI" : "Skip Teachers"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs font-bold text-foreground/70 hover:text-foreground cursor-pointer"
              >
                <ArrowLeft size={13} /> Back to Teachers
              </button>
            )}

            {step === 1 ? (
              <div className="flex items-center gap-2">
                {courseIndex < courses.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCourseIndex((i) => Math.min(courses.length - 1, i + 1));
                      setQuery("");
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-[#230052] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-[#370c72] dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/80 shadow-xs cursor-pointer"
                  >
                    Next Course <ArrowRight size={13} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 rounded-full bg-[#230052] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-[#370c72] dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/80 shadow-xs cursor-pointer"
                  >
                    Next: Octopus AI <ArrowRight size={13} />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onSave}
                className="flex items-center gap-1.5 rounded-full bg-[#230052] px-6 py-2 text-xs font-bold text-white transition-all hover:bg-[#370c72] dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/80 shadow-xs cursor-pointer"
              >
                Complete Setup & Launch
              </button>
            )}
          </>
        ) : (
          <div className="flex w-full items-center justify-between gap-3">
            {currentTab === "teachers" && courses.length > 1 ? (
              <div className="flex items-center gap-3">
                {courseIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCourseIndex((i) => Math.max(0, i - 1));
                      setQuery("");
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-foreground/70 hover:text-foreground cursor-pointer"
                  >
                    <ArrowLeft size={13} /> Prev
                  </button>
                )}
                {courseIndex < courses.length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCourseIndex((i) => Math.min(courses.length - 1, i + 1));
                      setQuery("");
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-slate-100 px-4 py-2 text-xs font-bold text-foreground hover:bg-slate-200 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20 cursor-pointer"
                  >
                    Next Course <ArrowRight size={13} />
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#230052] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-[#370c72] dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/80 cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </footer>
    </BottomSheet>
  );
}

export default function SuperFlexSettingsModal(
  props: React.ComponentProps<typeof SuperFlexSettingsForm>,
) {
  return props.open ? (
    <SuperFlexSettingsForm key={props.initialTab || "teachers"} {...props} />
  ) : null;
}
