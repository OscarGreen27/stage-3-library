import z from "zod/v4";

export const BookEntitySchema = z.object({
  id: z.number(),
  title: z.string(),
  year: z.coerce.number(),
  author: z.string(),
  pages: z.coerce.number(),
  isbn: z.coerce.number(),
  description: z.string(),
  cover: z.string(),
});

export type BookEntity = z.infer<typeof BookEntitySchema>;
