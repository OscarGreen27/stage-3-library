import { z } from "zod/v4";

export const BookDtoSchema = z.object({
  title: z.string(),
  year: z.coerce.number(),
  author: z.string(),
  pages: z.coerce.number(),
  isbn: z.coerce.number(),
  description: z.string(),
  cover: z.string().optional(),
});

export type BookDto = z.infer<typeof BookDtoSchema>;
