import { describe, expect, it } from "vitest";
import { parseEmailDraftContent, parseEmailDraftUrl } from "../../src/utils/emailDraft";

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

describe("structured Markdown draft parsing", () => {
  it("accepts reference links, formatting in labels, and balanced parentheses in URLs", () => {
    const url =
      "https://mail.google.com/mail/?to=o%27connor%2Badvice%40nu.edu.pk&su=Meeting&body=Discuss%20(course)%20today";
    expect(
      parseEmailDraftContent(`[**Review** this draft][draft]\n\n[draft]: ${url}`),
    ).toMatchObject({
      to: "o'connor+advice@nu.edu.pk",
      subject: "Meeting",
      body: "Discuss (course) today",
    });
    expect(parseEmailDraftContent(`[Review](<${url}>)`)).toMatchObject({
      body: "Discuss (course) today",
    });
  });

  it("supports account-specific Gmail URLs and multiple recipients", () => {
    expect(
      parseEmailDraftUrl(
        "https://mail.google.com/mail/u/1/?to=one%40nu.edu.pk,two%40nu.edu.pk&su=Hello",
      ),
    ).toMatchObject({ to: "one@nu.edu.pk,two@nu.edu.pk", subject: "Hello" });
  });

  it("rejects lookalike hosts, unsupported schemes and malformed recipients", () => {
    for (const url of [
      "https://example.com/?to=teacher@nu.edu.pk&su=Hello",
      "https://mail.google.com.evil.test/mail/?su=Hello",
      "https://user:pass@mail.google.com/mail/?su=Hello",
      "http://mail.google.com/mail/?su=Hello",
      "javascript:alert(1)",
      "mailto:not-an-email?subject=Hello",
    ])
      expect(parseEmailDraftUrl(url)).toBeNull();
  });

  it("ignores example drafts in fenced code", () => {
    expect(
      parseEmailDraftContent("```text\nTo: teacher@nu.edu.pk\nSubject: Example\nBody\n```"),
    ).toBeNull();
    expect(
      parseEmailDraftContent("`[Draft](https://mail.google.com/mail/?su=Example)`"),
    ).toBeNull();
    expect(
      parseEmailDraftContent("> ```text\n> To: teacher@nu.edu.pk\n> Subject: Example\n> ```"),
    ).toBeNull();
  });
});
