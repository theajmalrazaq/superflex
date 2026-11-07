import { describe, expect, it } from "vitest";
import { parseEmailDraftContent, parseEmailDraftUrl } from "../../src/components/GmailComposer";

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
      introText: "",
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
      introText: "Here is a draft for you:",
    });
  });

  it("rejects plain email addresses without draft parameters", () => {
    expect(parseEmailDraftUrl("mailto:student@nu.edu.pk")).toBeNull();
    expect(parseEmailDraftUrl("mailto:teacher@cfd.nu.edu.pk")).toBeNull();

    const profileText = `Here's a summary of your information:
• Name: Ajmal Razaq
• Roll Number: 23F-0524
• Email: f230524@cfd.nu.edu.pk
• Mobile No: 0306-7107353`;
    expect(parseEmailDraftContent(profileText)).toBeNull();
  });
});
