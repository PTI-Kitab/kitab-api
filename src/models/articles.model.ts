import { t } from "elysia";

const Articles = t.Object({
  id: t.Number({
    error: "Id tidak valid",
  }),
  title: t.String({
    minLength: 3,
    maxLength: 255,
    error: "Title minimal 3 karakter, maksimal 255 karakter",
  }),
  content: t.String({
    minLength: 3,
    // maxLength: 255,
    error: "Content minimal 3 karakter.",
  }),
  createdAt: t.Date({
    error: "Tanggal createdAt tidak valid",
  }),
  updatedAt: t.Date({
    error: "Tanggal updatedAt tidak valid",
  }),
});

export const ArticlesDto = t.Pick(Articles, ["title", "content"]);
