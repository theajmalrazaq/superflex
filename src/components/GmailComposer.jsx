import { EmailOutreachComposer } from "agentcomposerui";

export const parseEmailDraftUrl = (href) => {
  if (!href || href === "#") return null;

  try {
    const baseUrl =
      typeof window === "undefined" ? "https://flexstudent.nu.edu.pk" : window.location.origin;
    const url = new URL(href, baseUrl);
    const isMailto = url.protocol === "mailto:";
    return {
      to: isMailto ? decodeURIComponent(url.pathname) : url.searchParams.get("to") || "",
      subject: url.searchParams.get(isMailto ? "subject" : "su") || "",
      body: url.searchParams.get("body") || "",
    };
  } catch {
    return null;
  }
};

export const parseEmailDraftContent = (content) => {
  if (typeof content !== "string" || !content.trim()) return null;

  const markdownLink = content.match(
    /\[[^\]]*\]\((https:\/\/mail\.google\.com\/mail\/\?[^\s)]+|mailto:[^\s)]+)\)/i,
  );
  const bareLink = content.match(
    /(https:\/\/mail\.google\.com\/mail\/\?[^\s<>]+|mailto:[^\s<>]+)/i,
  );
  const href = markdownLink?.[1] || (bareLink?.[1] || "").replace(/[),.;]+$/, "");

  const linkedDraft = parseEmailDraftUrl(href);
  const lines = content.split(/\r?\n/);
  const cleanLine = (line) =>
    line
      .replace(/^\s*>\s?/, "")
      .replace(/\*\*/g, "")
      .trim();
  const subjectIndex = lines.findIndex((line) => /^Subject\s*:/i.test(cleanLine(line)));
  const toLine = lines.find((line) => /^To\s*:/i.test(cleanLine(line)));
  const plainTo = cleanLine(toLine || "").match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0] || "";
  const plainSubject =
    subjectIndex >= 0 ? cleanLine(lines[subjectIndex]).replace(/^Subject\s*:\s*/i, "") : "";

  let plainBody = "";
  if (subjectIndex >= 0) {
    const bodyLines = [];
    for (const line of lines.slice(subjectIndex + 1)) {
      const cleaned = cleanLine(line);
      if (
        /(?:https:\/\/mail\.google\.com\/mail\/|mailto:)/i.test(line) ||
        /^(?:You can )?(?:open|review).*(?:draft|gmail)/i.test(cleaned)
      ) {
        break;
      }
      bodyLines.push(line.replace(/^\s*>\s?/, "").replace(/\*\*/g, "").trimEnd());
    }
    plainBody = bodyLines.join("\n").trim();
  }

  if (!linkedDraft && !plainTo && !plainSubject) return null;

  return {
    to: linkedDraft?.to || plainTo,
    subject: linkedDraft?.subject || plainSubject,
    body: linkedDraft?.body || plainBody,
  };
};

const openDraftInGmail = (draft) => {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: draft.to || "",
    su: draft.subject || "",
    body: `${draft.body || ""}${draft.signature ? `\n\n${draft.signature}` : ""}`,
  });
  window.open(
    `https://mail.google.com/mail/?${params.toString()}`,
    "_blank",
    "noopener,noreferrer",
  );
};

export default function GmailComposer({ draft, senderName, onClose, onRequestRevision }) {
  const composerData = {
    to: draft?.to || "",
    subject: draft?.subject || "",
    previewText: "",
    body: draft?.body || "",
    signature: "",
  };

  return (
    <EmailOutreachComposer
      data={composerData}
      status="reviewing"
      senderName={senderName || "Student"}
      senderEmail="Your Gmail account"
      showTokens={false}
      showSubjectAnalyzer={false}
      approveLabel="Open in Gmail"
      rejectLabel="Ask AI to revise"
      onApprove={(finalDraft) => {
        openDraftInGmail(finalDraft);
        onClose();
      }}
      onReject={(feedback) => {
        onClose();
        onRequestRevision?.(feedback);
      }}
      className="superflex-email-composer mt-3 shadow-none"
    />
  );
}
