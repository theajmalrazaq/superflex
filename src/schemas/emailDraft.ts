import * as z from "zod/mini";
import { emailAddressSchema } from "./common";

export const emailDraftSchema = z
  .object({
    to: z
      .string()
      .check(
        z.refine(
          (value) =>
            !value ||
            value
              .split(/[,;]/)
              .every((address) => emailAddressSchema.safeParse(address.trim()).success),
        ),
      ),
    subject: z.string(),
    body: z.string(),
  })
  .check(z.refine((draft) => !!(draft.to || draft.subject.trim() || draft.body.trim())));
export type EmailDraft = z.infer<typeof emailDraftSchema>;
