import { t } from "elysia";

export const Kost = t.Object({
  id: t.Number({
    minLength: 1,
    maxLength: 255,
    error: "Id tidak valid",
  }),
  namaKost: t.String({
    minLength: 3,
    // maxLength: 255,
    error: "Nama Kost minimal 3 karakter",
  }),
  description: t.String({
    maxLength: 255,
    error: "Deskripsi kost maksimal 255 karakter",
  }),
  alamat: t.String({
    maxLength: 255,
    error: "Alamat kost maksimal 255 karakter",
  }),
  latitude: t.String({
    maxLength: 255,
    error: "Latitude kost maksimal 255 karakter",
  }),
  longitude: t.String({
    maxLength: 255,
    error: "Longtitude kost maksimal 255 karakter",
  }),
  pembayaran: t.String({
    maxLength: 255,
    error: "Pembayaran kost maksimal 255",
  }),
  bank: t.Union([
    t.Literal("bca"),
    t.Literal("bni"),
    t.Literal("bri"),
    t.Literal("mandiri"),
  ]),
  GambarKost: t.Array(
    t.String({
      error: "URL gambar tidak valid",
    })
  ),
  pemilikId: t.Number({
    minLength: 1,
    maxLength: 255,
    error: "Id kost minimal 1, maksimal 255",
  }),
  createdAt: t.Date({
    error: "Tanggal createdAt tidak valid",
  }),
  updatedAt: t.Date({
    error: "Tanggal updatedAt tidak valid",
  }),
});

export const KostDto = t.Pick(Kost, [
  "namaKost",
  "description",
  "alamat",
  "latitude",
  "longitude",
  "bank",
  "pembayaran",
  "GambarKost",
]);
