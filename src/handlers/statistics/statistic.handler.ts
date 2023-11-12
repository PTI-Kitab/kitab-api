import { Elysia, t } from "elysia";
import verifyJwt from "@/plugins/verifyJwt.plugins";
import { createdResponse, successResponse } from "@/utils/responses";
import { ThrowErrorResponse } from "@/utils/errors";

import prisma from "@/services/db";

const statisticHandler = new Elysia({ prefix: "/statistics" })

  .guard({}, (app) =>
    app
      .use(verifyJwt)
      .onBeforeHandle(({ user }) => {
        if (user.role !== "admin") {
          throw new ThrowErrorResponse(403, "Forbidden");
        }
      })

      .get(
        "/",
        async () => {
          const semuaKost = await prisma.kost.count();
          const semuaKamar = await prisma.kamar.count();
          const semuaBooking = await prisma.booking.count();
          const semuaClient = await prisma.client.count();
          const semuaPemilik = await prisma.pemilik.count();

          const bookings = await prisma.booking.findMany({
            where: {
              status: {
                in: ["confirmed", "done"],
              },
              Payment: {
                every: {
                  status: true,
                },
              },
            },
            include: {
              kamar: {
                select: {
                  harga: true,
                },
              },
            },
          });

          let totalCashFlow = 0;
          bookings.forEach((booking) => {
            totalCashFlow += booking.kamar.harga;
          });

          const totalEarning = totalCashFlow * 0.1;

          return successResponse(200, {
            semuaKost,
            semuaKamar,
            semuaBooking,
            semuaClient,
            semuaPemilik,
            totalCashFlow,
            totalEarning,
          });
        },
        {
          detail: {
            tags: ["Statistic"],
            description: "Get statistic kost",
          },
        }
      )
  )

  .guard(
    {},
    (app) =>
      app
        .use(verifyJwt)
        // for admin and pemilik only
        .onBeforeHandle(({ user }) => {
          if (user.role !== "admin" && user.role !== "pemilik") {
            throw new ThrowErrorResponse(403, "Forbidden");
          }
        })

        // statistic kosan
        .get(
          "/kost/:id",
          async ({ db, params }) => {
            const kost = await db.kost.findUnique({
              where: {
                id: params.id,
              },
            });

            if (!kost) {
              throw new ThrowErrorResponse(404, "Kost not found");
            }

            const semuaKamar = await db.kamar.findMany({
              where: {
                kostId: params.id,
              },
            });

            const kamarTerisi = await db.booking.count({
              where: {
                AND: {
                  kamarId: {
                    in: semuaKamar.map((kamar) => kamar.id),
                  },
                  status: "confirmed",
                },
              },
            });

            const kamarKosong = semuaKamar.length - kamarTerisi;

            let totalPendapatan = 0;
            semuaKamar.forEach((kamar) => {
              totalPendapatan += kamar.harga - kamar.harga * 0.1;
            });

            return successResponse(200, {
              semuaKamar: semuaKamar.length,
              kamarKosong,
              kamarTerisi,
              totalPendapatan,
            });
          },
          {
            params: t.Object({
              id: t.Numeric({
                error: "ID harus berupa angka",
              }),
            }),
            detail: {
              tags: ["Statistic"],
              description: "Get statistic kost",
            },
          }
        )

    // admin only
  );

export default statisticHandler;
