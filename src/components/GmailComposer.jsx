import { EmailOutreachComposer } from "agentcomposerui";

export const parseEmailDraftUrl = (href) => {
  if (!href || href === "#") return null;

  try {
    const baseUrl =
      typeof window === "undefined" ? "https://flexstudent.nu.edu.pk" : window.location.origin;
    const url = new URL(href, baseUrl);
    const isMailto = url.protocol === "mailto:";
    const to = isMailto ? decodeURIComponent(url.pathname) : url.searchParams.get("to") || "";
    const subject = url.searchParams.get(isMailto ? "subject" : "su") || "";
    const body = url.searchParams.get("body") || "";

    // A mailto without subject or body is just an email contact link, not a draft!
    if (isMailto && !subject && !body) return null;
    if (!to && !subject && !body) return null;

    return {
      to,
      subject,
      body,
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
  const toIndex = lines.findIndex((line) => /^To\s*:/i.test(cleanLine(line)));
  const toLine = toIndex >= 0 ? lines[toIndex] : undefined;
  const plainTo = cleanLine(toLine || "").match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0] || "";

  const subjectIndex = lines.findIndex((line) => /^Subject\s*:/i.test(cleanLine(line)));
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

  // Must have linkedDraft OR (subjectIndex >= 0 && (plainTo || plainSubject || plainBody))
  if (!linkedDraft && (subjectIndex < 0 || (!plainTo && !plainSubject && !plainBody))) {
    return null;
  }

  const firstDraftIndex = [toIndex, subjectIndex].filter((i) => i >= 0).sort((a, b) => a - b)[0];
  const introText =
    firstDraftIndex > 0 ? lines.slice(0, firstDraftIndex).join("\n").trim() : "";

  return {
    to: linkedDraft?.to || plainTo,
    subject: linkedDraft?.subject || plainSubject,
    body: linkedDraft?.body || plainBody,
    introText,
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

export default function GmailComposer({
  draft,
  status = "reviewing",
  senderName,
  onClose,
}) {
  const composerData = {
    to: draft?.to || "",
    subject: draft?.subject || "",
    previewText: "",
    body: draft?.body || "",
    signature: "",
  };

  return (
    <EmailOutreachComposer.Root
      data={composerData}
      status={status}
      senderName={senderName || "Student"}
      senderEmail="Your Gmail account"
      onApprove={(finalDraft) => {
        openDraftInGmail(finalDraft);
        onClose?.();
      }}
      className="superflex-email-composer mt-3 shadow-none"
    >
      <EmailOutreachComposer.Header senderName={senderName || "Student"} />
      <EmailOutreachComposer.Editor showTokens={false} showSubjectAnalyzer={false} />
      <EmailOutreachComposer.Actions>
        <EmailOutreachComposer.ApproveButton label="Open in Gmail" />
      </EmailOutreachComposer.Actions>
    </EmailOutreachComposer.Root>
  );
}
