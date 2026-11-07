import { resolveFacultyImageUrl } from "./teacherImage";
import { extractEmailAddresses, mailtoAddresses } from "./emailAddress";
import type { Teacher, FacultyPage } from "../types/teacher";

import { emailAddressSchema } from "../schemas/common";
import { teacherSchema } from "../schemas/teacher";

export const extractFacultyEmail = (text: string): string => extractEmailAddresses(text)[0] || "";

export const parseFacultyPages = (pages: FacultyPage[] = []): Teacher[] => {
  const teachers = new Map<string, Teacher>();

  pages.forEach(({ url, html }) => {
    if (!html) return;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const baseHref = doc.querySelector("base[href]")?.getAttribute("href") || undefined;
    const cards = doc.querySelectorAll<HTMLElement>(
      ".facultyCard, .faculty-card, .faculty-member, .team-member, .staff-card, .unitech-teacher, .gdlr-core-personnel-list, .card, article",
    );

    cards.forEach((card) => {
      const emailLink = card.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');
      const email = (
        mailtoAddresses(emailLink?.getAttribute("href") || "")[0] ||
        extractFacultyEmail(card.textContent) ||
        ""
      ).trim();
      const heading = card.querySelector<HTMLElement>(
        "h1, h2, h3, h4, h5, h6, .name, .faculty-name",
      );
      const image = card.querySelector<HTMLImageElement>("img");
      const name = (heading?.textContent || image?.alt || "").replace(/\s+/g, " ").trim();
      if (!name || name.length > 100 || /faculty|department|staff/i.test(name)) return;

      const validatedEmail = emailAddressSchema.safeParse(email);
      const normalizedEmail = validatedEmail.success ? validatedEmail.data : "";
      const identity = normalizedEmail.toLowerCase() || name.toLowerCase();
      if (teachers.has(identity)) return;
      const designation =
        [...card.querySelectorAll<HTMLElement>("p, h6, .designation, .position, small")]
          .map((element) => element.textContent.replace(/\s+/g, " ").trim())
          .find((text) => text && text !== email && text.length < 140) || "Faculty member";
      const teacher = teacherSchema.safeParse({
        id: identity,
        name,
        email: normalizedEmail,
        designation,
        image:
          [
            image?.getAttribute("data-src"),
            image?.getAttribute("data-lazy-src"),
            image?.getAttribute("src"),
          ]
            .map((src) => resolveFacultyImageUrl(src || "", url, baseHref))
            .find(Boolean) || "",
        source: url,
      });
      if (teacher.success) teachers.set(identity, teacher.data);
    });
  });

  return [...teachers.values()].sort((a, b) => a.name.localeCompare(b.name));
};
