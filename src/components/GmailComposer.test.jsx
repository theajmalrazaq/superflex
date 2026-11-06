import { describe, expect, it } from "vitest";
import { parseEmailDraftContent, parseEmailDraftUrl } from "./GmailComposer";

describe("parseEmailDraftUrl", () => {
  it("extracts an AI-generated Gmail draft", () => {
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: "teacher@nu.edu.pk",
      su: "Assignment extension request",
      body: "Dear Professor,\n\nMay I request an extension?",
    });

    expect(parseEmailDraftUrl(`https://mail.google.com/mail/?${params}`)).toEqual({
      to: "teacher@nu.edu.pk",
      subject: "Assignment extension request",
      body: "Dear Professor,\n\nMay I request an extension?",
    });
  });

  it("supports mailto drafts and rejects incomplete streaming links", () => {
    expect(
      parseEmailDraftUrl(
        "mailto:teacher@nu.edu.pk?subject=Meeting%20request&body=Can%20we%20meet%3F",
      ),
    ).toEqual({
      to: "teacher@nu.edu.pk",
      subject: "Meeting request",
      body: "Can we meet?",
    });
    expect(parseEmailDraftUrl("#")).toBeNull();
  });

  it("extracts a draft from a completed AI response", () => {
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: "teacher@nu.edu.pk",
      su: "Apology for lateness",
      body: "Dear Professor,\n\nPlease accept my apology.",
    });
    const response = `Here is your draft.\n\n[Open Draft in Gmail](https://mail.google.com/mail/?${params})`;

    expect(parseEmailDraftContent(response)).toEqual({
      to: "teacher@nu.edu.pk",
      subject: "Apology for lateness",
      body: "Dear Professor,\n\nPlease accept my apology.",
    });
  });

  it("uses the visible email body when the generated Gmail link omits it", () => {
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: "teacher@nu.edu.pk",
      su: "Apology for lateness",
    });
    const response = `Here is a draft for you:

**To:** teacher@nu.edu.pk
**Subject:** Apology for lateness

Dear Professor,

Please accept my apology for arriving late to class.

Sincerely,
Ajmal Razaq

You can open this draft directly in Gmail:
[Open Draft in Gmail](https://mail.google.com/mail/?${params})`;

    expect(parseEmailDraftContent(response)).toEqual({
      to: "teacher@nu.edu.pk",
      subject: "Apology for lateness",
      body: "Dear Professor,\n\nPlease accept my apology for arriving late to class.\n\nSincerely,\nAjmal Razaq",
    });
  });
});
