import * as z from "zod/mini";
import { nonEmptyStringSchema } from "./common";

export const reviewSchema = z.object({ name: nonEmptyStringSchema, comment: nonEmptyStringSchema });
export const reviewsSchema = z.array(reviewSchema);
export type Review = z.infer<typeof reviewSchema>;
