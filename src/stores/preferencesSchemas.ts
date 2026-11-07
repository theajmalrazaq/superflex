import * as z from "zod/mini";
import { optionalHttpUrlSchema } from "../schemas/common";

export const themeModeSchema = z.enum(["light", "dark"]);
export const customBackgroundSchema = z
  .object({
    enabled: z.boolean(),
    url: optionalHttpUrlSchema,
  })
  .check(z.refine((background) => !background.enabled || background.url !== ""));
export const sidebarLinkSchema = z.object({
  href: z.string(),
  text: z.string(),
  path: z.optional(z.string()),
});
export const sidebarLinksSchema = z.array(sidebarLinkSchema);
export const persistedPreferencesSchema = z.object({
  themeMode: z.optional(themeModeSchema),
  customBackground: z.optional(customBackgroundSchema),
  aiEnabled: z.optional(z.boolean()),
});
export type ThemeMode = z.infer<typeof themeModeSchema>;
export type CustomBackground = z.infer<typeof customBackgroundSchema>;
