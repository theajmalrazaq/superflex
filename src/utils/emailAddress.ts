import { emailAddressSchema } from "../schemas/common";

export function extractEmailAddresses(text: string): string[] {
  const addresses = text.split(/[\s<>()[\],;:]+/).flatMap((candidate) => {
    const parsed = emailAddressSchema.safeParse(candidate);
    return parsed.success ? [parsed.data] : [];
  });
  return [...new Set(addresses)];
}

export function mailtoAddresses(href: string): string[] {
  try {
    const url = new URL(href);
    return url.protocol === "mailto:"
      ? extractEmailAddresses(decodeURIComponent(url.pathname))
      : [];
  } catch {
    return [];
  }
}
