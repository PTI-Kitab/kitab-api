import { t } from "elysia";

const GambarKost = t.Object({
  id: t.Number({
    minLength: 1,
    maxLength: 255,
    error: "Id tidak valid",
  }),
  nama: t.String({
    minLength: 3,
    maxLength: 255,
    error: "Nama Kost minimal 3 karakter, maksimal 255 karakter",
  }),
  image: t.String({
    maxLength: 255,
    format: "uri",
    error: "Link gambar tidak valid",
  }),
  kostID: t.Number({
    minLength: 1,
    maxLength: 255,
    error: "Id kost minimal 1 karakter, maksimal 255 karakter",
  }),
  createdAt: t.Date({
    error: "Tanggal createdAt tidak valid",
  }),
  updatedAt: t.Date({
    error: "Tanggal updatedAt tidak valid",
  }),
});
