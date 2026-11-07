import { extractEmailAddresses } from "./emailAddress";
import type { Root, Nodes, RootContent } from "mdast";
import { emailDraftSchema, type EmailDraft } from "../schemas/emailDraft";
import { markdownLinks, markdownText, parseMarkdown } from "./markdown";

export function parseEmailDraftUrl(href: unknown): EmailDraft | null {
  if (typeof href !== "string" || !href || href === "#") return null;
  try {
    const url = new URL(href);
    const isMailto = url.protocol === "mailto:";
    const segments = url.pathname.split("/").filter(Boolean);
    const isGmailPath =
      segments[0] === "mail" &&
      (segments.length === 1 ||
        (segments.length === 3 &&
          segments[1] === "u" &&
          !!segments[2] &&
          Array.from(segments[2]).every((char) => "0123456789".includes(char))));
    if (
      !isMailto &&
      !(
        url.protocol === "https:" &&
        url.hostname === "mail.google.com" &&
        !url.port &&
        !url.username &&
        !url.password &&
        isGmailPath
      )
    )
      return null;
    const subject = url.searchParams.get(isMailto ? "subject" : "su") || "";
    const body = url.searchParams.get("body") || "";
    if (isMailto && !subject && !body) return null;
    const parsed = emailDraftSchema.safeParse({
      to: isMailto ? decodeURIComponent(url.pathname) : url.searchParams.get("to") || "",
      subject,
      body,
    });
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function linkedEmailDraft(content: string | Root): EmailDraft | null {
  for (const link of markdownLinks(content)) {
    const draft = parseEmailDraftUrl(link);
    if (draft) return draft;
  }
  return null;
}

function headerValue(line: string, header: string): string | null {
  const text = markdownText(line).trim();
  const colon = text.indexOf(":");
  return colon >= 0 && text.slice(0, colon).trim().toLowerCase() === header
    ? text.slice(colon + 1).trim()
    : null;
}

const plainRecipient = (value: string): string => extractEmailAddresses(value).join(", ");

export function parseEmailDraftContent(
  content: unknown,
): (EmailDraft & { introText: string }) | null {
  if (typeof content !== "string" || !content.trim()) return null;
  const tree = parseMarkdown(content);
  const linkedDraft = linkedEmailDraft(tree);
  const lines = content.split(/\r?\n/);
  const codeLines = new Set<number>();
  function collectCodeLines(node: Nodes) {
    if (node.type === "code" && node.position) {
      for (let line = node.position.start.line - 1; line < node.position.end.line; line++)
        codeLines.add(line);
    }
    if ("children" in node)
      for (const child of node.children) collectCodeLines(child as RootContent);
  }
  collectCodeLines(tree);
  const toIndex = lines.findIndex(
    (line, index) => !codeLines.has(index) && headerValue(line, "to") !== null,
  );
  const subjectIndex = lines.findIndex(
    (line, index) => !codeLines.has(index) && headerValue(line, "subject") !== null,
  );
  const plainTo = toIndex >= 0 ? plainRecipient(headerValue(lines[toIndex], "to") || "") : "";
  const plainSubject = subjectIndex >= 0 ? headerValue(lines[subjectIndex], "subject") || "" : "";
  const bodyLines: string[] = [];
  if (subjectIndex >= 0) {
    for (const line of lines.slice(subjectIndex + 1)) {
      const clean = markdownText(line);
      const lower = clean.toLowerCase();
      const instruction =
        ["you can open", "you can review", "open", "review"].some((prefix) =>
          lower.startsWith(prefix),
        ) &&
        (lower.includes("draft") || lower.includes("gmail"));
      if (linkedEmailDraft(line) || instruction) break;
      bodyLines.push(clean.trimEnd());
    }
  }
  if (!linkedDraft && subjectIndex < 0) return null;
  const parsed = emailDraftSchema.safeParse({
    to: linkedDraft?.to || plainTo,
    subject: linkedDraft?.subject || plainSubject,
    body: linkedDraft?.body || bodyLines.join("\n").trim(),
  });
  if (!parsed.success) return null;
  const firstDraftIndex = Math.min(...[toIndex, subjectIndex].filter((index) => index >= 0));
  return {
    ...parsed.data,
    introText:
      Number.isFinite(firstDraftIndex) && firstDraftIndex > 0
        ? lines.slice(0, firstDraftIndex).join("\n").trim()
        : "",
  };
}
