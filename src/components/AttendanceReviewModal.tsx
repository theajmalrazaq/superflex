import TeacherAvatar from "./TeacherAvatar";
import React, { useMemo, useState } from "react";
import { Mail, X, Clipboard } from "lucide-react";
import BottomSheet, {
  BottomSheetClose,
  BottomSheetDescription,
  BottomSheetTitle,
} from "./ui/BottomSheet";
import { getActiveStudentId } from "../utils/studentIdentity";

function AttendanceReviewForm({ open, course, record, teacher, onClose }) {
  const [reason, setReason] = useState("");
  const [section, setSection] = useState("");
  const [copied, setCopied] = useState(false);
  const subject = `Attendance review request — ${course?.title || "Course"} — ${record?.date || "Session"}`;

  const body = useMemo(() => {
    const recipient = teacher?.name || "Instructor";
    return `Dear ${recipient},\n\nI’m writing to request a review of my attendance record for ${course?.title || "this course"} on ${record?.date || "the session date"}. The portal currently lists my status as absent.\n\nSection: ${section.trim()}\n\n${reason.trim()}\n\nIf the class records confirm that I attended, could you please update my status to Present? If the absence is correct, please let me know whether there is an appeal or documentation process I should follow.\n\nThank you for your time.\n${getActiveStudentId() || "Student"}`;
  }, [course?.title, record?.date, reason, section, teacher?.name]);

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(
        `To: ${teacher?.email || ""}\nSubject: ${subject}\n\n${body}`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const gmailComposeUrl = teacher?.email
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(teacher.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : "#";

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex shrink-0 justify-center pt-3.5 pb-1">
        <span className="h-1.5 w-14 rounded-full bg-[#ded9e5] dark:bg-white" />
      </div>
      <BottomSheetClose asChild>
        <button
          type="button"
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 sm:right-5 sm:top-5"
        >
          <X size={20} />
        </button>
      </BottomSheetClose>
      <header className="flex shrink-0 flex-col items-center px-6 pb-3.5 pt-1.5 text-center sm:px-8 sm:pb-4 sm:pt-2">
        <span className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#230052] text-white dark:bg-white dark:text-[#101027] sm:h-11 sm:w-11 sm:rounded-[16px]">
          <Mail size={21} />
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#230052]/65 dark:text-white">
          Attendance
        </p>
        <BottomSheetTitle className="mt-1 text-xl font-bold">
          Sir, Main Class Mein Tha. Kasam Se. 😭
        </BottomSheetTitle>
        <BottomSheetDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Attendance issue? Let's write a respectful email before things get worse. ({course?.title}{" "}
          · {record?.date})
        </BottomSheetDescription>
      </header>

      <div className="min-h-0 space-y-3.5 overflow-y-auto px-6 py-4 sm:space-y-4 sm:px-8 sm:py-5">
        {teacher?.email ? (
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-white/[.06] sm:p-4">
            <TeacherAvatar teacher={teacher} size="sm" className="rounded-xl" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{teacher.name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{teacher.email}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
            <p className="font-bold">We Don't Even Have Sir's Email. 💀</p>
            <p className="mt-1 text-xs">
              Select your course instructor first to prepare the email.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent("superflex-open-teacher-settings"));
              }}
              className="mt-2 inline-block font-bold underline"
            >
              Choose teacher
            </button>
          </div>
        )}

        <label className="block text-sm font-semibold">
          Section for this course
          <input
            value={section}
            onChange={(event) => setSection(event.target.value)}
            maxLength={40}
            placeholder="Enter your section for this course"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none focus:border-[#230052] dark:border-white/15 dark:bg-white/[.04] dark:focus:border-white"
          />
        </label>

        <label className="block text-sm font-semibold">
          Reason <span className="font-normal text-slate-500">(use accurate details)</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            maxLength={1200}
            placeholder="Write the reason you want included in the email…"
            className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none focus:border-[#230052] dark:border-white/15 dark:bg-white/[.04] dark:focus:border-white"
          />
        </label>

        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[.05]">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            The Formal Begging Draft.
          </p>
          <p className="mt-1 truncate text-[13px] text-slate-500 dark:text-slate-400">
            Subject: {subject}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {body}
          </p>
        </div>
      </div>

      <footer className="flex shrink-0 items-center gap-2.5 border-t border-slate-100 bg-white/95 px-6 py-3.5 dark:border-white/10 dark:bg-[#090909]/95 sm:px-8 sm:py-4">
        <a
          href={gmailComposeUrl}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!teacher?.email || !section.trim() || reason.trim().length < 8}
          onClick={(event) => {
            if (!teacher?.email || !section.trim() || reason.trim().length < 8)
              event.preventDefault();
          }}
          className={`inline-flex min-h-12 min-w-0 flex-[1.7] items-center justify-center gap-2 rounded-full bg-[#230052] px-3 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-[#101027] ${!teacher?.email || !section.trim() || reason.trim().length < 8 ? "cursor-not-allowed opacity-40" : ""}`}
        >
          <Mail size={16} />
          Open Gmail
        </a>
        <button
          type="button"
          onClick={copyDraft}
          className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/[.06]"
        >
          <Clipboard size={15} />
          {copied ? "Copied" : "Copy draft"}
        </button>
      </footer>
      <p className="shrink-0 px-6 pb-2.5 text-center text-[10px] text-slate-400 sm:px-8">
        Review the draft before sending it from your email app.
      </p>
    </BottomSheet>
  );
}

export default function AttendanceReviewModal(
  props: React.ComponentProps<typeof AttendanceReviewForm>,
) {
  return props.open ? (
    <AttendanceReviewForm key={`${props.course?.id}:${props.record?.date}`} {...props} />
  ) : null;
}
