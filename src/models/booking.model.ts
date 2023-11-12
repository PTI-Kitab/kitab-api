import { t } from "elysia";

const Booking = t.Object({
  id: t.Number({
    minLength: 1,
    maxLength: 255,
    error: "Id tidak valid",
  }),
  checkIn: t.String({
    format: "date-time",
    error: "Tanggal checkIn tidak valid",
  }),
  checkOut: t.String({
    format: "date-time",
    error: "Tanggal checkOut tidak valid",
  }),
  status: t.Union(
    [t.Literal("pending"), t.Literal("confirmed"), t.Literal("canceled")],
    {
      error: "Status tidak valid",
    }
  ),
  clientId: t.Number({
    error: "Id client minimal 1 karakter, maksimal 255 karakter",
  }),
  kamarId: t.Number({
    error: "Id kamar minimal 1 karakter, maksimal 255 karakter",
  }),
  createdAt: t.String({
    error: "Tanggal createdAt tidak valid",
  }),
  updatedAt: t.String({
    error: "Tanggal updatedAt tidak valid",
  }),
});

export const BookingDto = t.Pick(Booking, ["checkIn", "checkOut"]);
