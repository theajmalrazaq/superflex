import * as z from "zod/mini";

export const themeModeSchema = z.enum(["light", "dark"]);

export const customBackgroundSchema = z.object({
  enabled: z.boolean(),
  url: z.string(),
});

export const navOrderSchema = z.array(z.string());

export const sidebarLinkSchema = z.object({
  href: z.string(),
  text: z.string(),
  path: z.optional(z.string()),
});

export const sidebarLinksSchema = z.array(sidebarLinkSchema);

export const persistedPreferencesSchema = z.object({
  navOrder: navOrderSchema,
});
