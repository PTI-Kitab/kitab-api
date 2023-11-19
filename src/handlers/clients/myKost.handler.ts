import { Elysia, t } from "elysia";
import verifyJwt from "@/plugins/verifyJwt.plugins";
import { successResponse } from "@/utils/responses";
import { ThrowErrorResponse } from "@/utils/errors";
import { midtransPayment } from "@/services/midtrans";
import { MidtransDto } from "@/models/midtrans.model";

// agak bingung buat ini, bisa buat handle kost kostan, booking kosan, juga bisa payment
const myKostHandler = new Elysia({ prefix: "/myKost" }).guard(
  {
    detail: {
      tags: ["My Kost"],
    },
  },
  (app) =>
    app
      .use(verifyJwt)
      .onBeforeHandle(({ user }) => {
        if (user.role !== "client") {
          throw new ThrowErrorResponse(403, "You don't have access");
        }
      })
      .get("/booking", async ({ db, user }) => {
        const booking = await db.booking.findMany({
          where: {
            clientId: user.id,
          },
          select: {
            id: true,
            kamar: {
              select: {
                id: true,
                namaKamar: true,
                harga: true,
              },
            },
            Payment: {
              select: {
                id: true,
                status: true,
                paidDate: true,
              },
            },
            checkIn: true,
            checkOut: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return successResponse(200, booking);
      })

      .get(
        "/booking/:id",
        async ({ db, user, params }) => {
          const booking = await db.booking.findFirst({
            where: {
              id: params.id,
              clientId: user.id,
            },
            include: {
              kamar: {
                select: {
                  id: true,
                  namaKamar: true,
                  harga: true,
                  GambarKamar: {
                    select: {
                      image: true,
                    },
                    take: 1,
                  },
                  gender: true,
                },
              },
              Payment: {
                select: {
                  id: true,
                  status: true,
                  paidDate: true,
                },
                orderBy: {
                  createdAt: "desc",
                },
                take: 1,
              },
            },
          });

          if (!booking) {
            throw new ThrowErrorResponse(404, "Booking not found");
          }

          const data = {
            ...booking,
            kamar: {
              ...booking.kamar,
              GambarKamar: `${process.env.APP_URL}/public/${booking.kamar.GambarKamar[0].image}`,
            },
          };

          return successResponse(200, data);
        },
        {
          params: t.Object({
            id: t.Numeric(),
          }),
        }
      )

      .delete(
        "/booking/:id",
        async ({ db, user, params }) => {
          const booking = await db.booking.findFirst({
            where: {
              id: params.id,
              clientId: user.id,
            },
          });

          if (!booking) {
            throw new ThrowErrorResponse(404, "Booking not found");
          }

          await db.booking.update({
            where: {
              id: params.id,
            },
            data: {
              status: "canceled",
            },
          });

          return successResponse(200, "Booking cancelled");
        },
        {
          params: t.Object({
            id: t.Numeric(),
          }),
        }
      )

      // init monthly payment
      .put(
        "/booking/:id/payment",
        async ({ db, user, params }) => {
          const booking = await db.booking.findFirst({
            where: {
              id: params.id,
              clientId: user.id,
              // status: "pending",
            },
            include: {
              client: true,
              kamar: true,
              Payment: {
                select: {
                  id: true,
                  status: true,
                  paidDate: true,
                  createdAt: true,
                },
                orderBy: {
                  createdAt: "desc",
                },
                take: 1,
              },
            },
          });

          if (!booking) {
            throw new ThrowErrorResponse(404, "No such booking");
          }

          const now = new Date();
          const orderId = `booking-${
            booking.id
          }-bulan-${now.getMonth()}-${now.getFullYear()}`;

          // handle first time payment
          if (!booking.Payment.length) {
            const midtrans = await midtransPayment({
              orderId: orderId,
              grossAmount: booking.kamar.harga,
              curtomerDetails: {
                first_name: booking.client.firstName,
                last_name: booking.client.lastName ?? "",
                email: booking.client.email,
                phone: booking.client.noHp,
              },
            });

            const payment = await db.payment.create({
              data: {
                id: orderId,
                bookingId: booking.id,
                status: false,
                paidDate: null,
              },
            });

            return successResponse(200, { payment, midtrans });
          }

          // handle monthly payment, check if month is already paid
          const lastPayment = booking.Payment[0];

          // if theres pending payment
          if (!lastPayment.status) {
            const midtrans = await midtransPayment({
              orderId: orderId,
              grossAmount: booking.kamar.harga,
              curtomerDetails: {
                first_name: booking.client.firstName,
                last_name: booking.client.lastName ?? "",
                email: booking.client.email,
                phone: booking.client.noHp,
              },
            });

            return successResponse(200, { payment: lastPayment, midtrans });
          }

          const lastPaymentMonth = lastPayment.createdAt.getMonth();
          const nowMonth = new Date().getMonth();

          if (nowMonth === lastPaymentMonth) {
            throw new ThrowErrorResponse(400, "This month is already paid");
          }

          const midtrans = await midtransPayment({
            orderId: orderId,
            grossAmount: booking.kamar.harga,
            curtomerDetails: {
              first_name: booking.client.firstName,
              last_name: booking.client.lastName ?? "",
              email: booking.client.email,
              phone: booking.client.noHp,
            },
          });

          const payment = await db.payment.create({
            data: {
              id: orderId,
              bookingId: booking.id,
              status: false,
              paidDate: null,
            },
          });

          return successResponse(200, { payment, midtrans });
        },
        {
          params: t.Object({
            id: t.Numeric(),
          }),
        }
      )

      .post(
        "/booking/:id/payment/callback",
        async ({ db, body }) => {
          if (body.transaction_status !== "settlement") {
            throw new ThrowErrorResponse(400, "Payment not settled");
          }

          const payment = await db.payment.findFirst({
            where: {
              id: body.order_id,
            },
            include: {
              booking: true,
            },
          });

          if (!payment) {
            throw new ThrowErrorResponse(404, "No such payment");
          }

          await db.payment.update({
            where: {
              id: body.order_id,
            },
            data: {
              status: true,
              paidDate: new Date(),
            },
          });

          // check if this month and year is the checkout date
          const now = new Date();
          const checkout = payment.booking.checkOut;

          if (
            now.getMonth() === checkout.getMonth() &&
            now.getFullYear() === checkout.getFullYear()
          ) {
            await db.booking.update({
              where: {
                id: payment.bookingId,
              },
              data: {
                status: "done",
              },
            });
          }

          // update booking status to confirmed
          await db.booking.update({
            where: {
              id: payment.bookingId,
            },
            data: {
              status: "confirmed",
            },
          });

          const booking = await db.booking.findFirst({
            where: {
              id: payment.bookingId,
            },
            include: {
              kamar: {
                select: {
                  kost: {
                    select: {
                      pemilikId: true,
                    },
                  },
                  harga: true,
                },
              },
            },
          });

          await db.pemilik.update({
            where: {
              id: booking?.kamar.kost.pemilikId,
            },
            data: {
              balance: {
                increment: booking?.kamar.harga! - booking?.kamar.harga! * 0.1, // 10% fee
              },
            },
          });

          return successResponse(200, "Payment settled");
        },
        {
          params: t.Object({
            id: t.Numeric(),
          }),
          body: MidtransDto,
        }
      )
);

export default myKostHandler;
