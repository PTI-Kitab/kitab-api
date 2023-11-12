import { t } from "elysia";

const Payment = t.Object({
  id: t.Number({
    error: "Id tidak valid",
  }),
  status: t.Boolean({
    default: false,
  }),
  paidDate: t.Date({ error: "Tanggal tidak valid" }),
  bookingId: t.Number({ error: "Id tidak valid" }),
  createdAt: t.Date({
    error: "Tanggal createdAt tidak valid",
  }),
  updatedAt: t.Date({
    error: "Tanggal updatedAt tidak valid",
  }),
});
