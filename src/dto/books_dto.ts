import { z } from "zod/v4";

export const BookDtoSchema = z.object({
  title: z.string(),
  year: z.number().int().positive(), //z.coerce.number(),
  authors: z.array(z.number().int().positive()),
  pages: z.number().int().positive(),
  isbn: z.number().int().positive(),
  description: z.string(),
  cover: z.string().optional(),
});

export type BookDto = z.infer<typeof BookDtoSchema>;
