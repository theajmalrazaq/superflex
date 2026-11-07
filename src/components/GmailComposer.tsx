import { EmailOutreachComposer } from "agentcomposerui";
import type { EmailDraft } from "../schemas/emailDraft";

interface GmailComposerProps {
  draft: Partial<EmailDraft>;
  status?: React.ComponentProps<typeof EmailOutreachComposer.Root>["status"];
  senderName?: string;
  onClose?: () => void;
}

const openDraftInGmail = (draft: EmailDraft & { signature?: string }) => {
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
}: GmailComposerProps) {
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
