const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

const normalizeImageUrl = (src, pageUrl) => {
  if (!src || /^(data:|javascript:)/i.test(src)) return "";
  try {
    return new URL(src, pageUrl).href;
  } catch {
    return "";
  }
};

export const parseFacultyPages = (pages = []) => {
  const teachers = new Map();

  pages.forEach(({ url, html }) => {
    if (!html) return;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const cards = doc.querySelectorAll(
      ".facultyCard, .faculty-card, .faculty-member, .team-member, .staff-card, .unitech-teacher, .gdlr-core-personnel-list, .card, article",
    );

    cards.forEach((card) => {
      const emailLink = card.querySelector('a[href^="mailto:"]');
      const email = (
        emailLink?.getAttribute("href")?.replace(/^mailto:/i, "") ||
        card.textContent.match(EMAIL_PATTERN)?.[0] ||
        ""
      ).trim();
      const heading = card.querySelector("h1, h2, h3, h4, h5, h6, .name, .faculty-name");
      const image = card.querySelector("img");
      const name = (heading?.textContent || image?.alt || "").replace(/\s+/g, " ").trim();
      if (!name || name.length > 100 || /faculty|department|staff/i.test(name)) return;

      const identity = email.toLowerCase() || name.toLowerCase();
      if (teachers.has(identity)) return;
      const designation =
        [...card.querySelectorAll("p, h6, .designation, .position, small")]
          .map((element) => element.textContent.replace(/\s+/g, " ").trim())
          .find((text) => text && text !== email && text.length < 140) || "Faculty member";
      teachers.set(identity, {
        id: identity,
        name,
        email,
        designation,
        image: normalizeImageUrl(
          image?.getAttribute("src") || image?.getAttribute("data-src"),
          url,
        ),
        source: url,
      });
    });
  });

  return [...teachers.values()].sort((a, b) => a.name.localeCompare(b.name));
};
