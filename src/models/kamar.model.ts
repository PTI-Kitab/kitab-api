import { t } from "elysia";

const kamar = t.Object({
  id: t.Number({
    error: "Id kamar tidak valid",
  }),
  namaKamar: t.String({
    minLength: 3,
    maxLength: 255,
    error: "Nama kamar minimal 3 karakter, maksimal 255 karakter",
  }),
  description: t.String({
    minLength: 3,
    // maxLength: 255,
    error: "Deskripsi kamar minimal 3 karakter",
  }),
  harga: t.Number({
    error: "Harga kamar harus berupa angka rupiah",
  }),
  fasilitas: t.String({
    minLength: 3,
    // maxLength: 255,
    error: "Fasilitas kamar minimal 3 karakter",
  }),
  ukuran: t.String({
    minLength: 3,
    maxLength: 255,
    error: "Ukuran kamar minimal 3 karakter, maksimal 255 karakter",
  }),
  capacity: t.Number({
    error: "Kapasitas kamar kost tidak valid",
  }),
  gender: t.Union(
    [t.Literal("pria"), t.Literal("wanita"), t.Literal("campur")],
    {
      error: "Data tidak valid",
    }
  ),
  GambarKamar: t.Array(
    t.String({
      error: "Url gambar minimal 3 karakter, maksimal 255 karakter",
    })
  ),
  kostId: t.Number({
    minLength: 1,
    maxLength: 255,
    error: "Id kamar minimal 1 karakter, maksimal 255 karakter",
  }),
  createdAt: t.Date({
    error: "Tanggal createdAt tidak valid",
  }),
  updatedAt: t.Date({
    error: "Tanggal updatedAt tidak valid",
  }),
});

export const kamarDto = t.Pick(kamar, [
  "namaKamar",
  "description",
  "harga",
  "fasilitas",
  "ukuran",
  "capacity",
  "gender",
  "GambarKamar",
]);
