import { Elysia, t } from "elysia";
import verifyJwt from "@/plugins/verifyJwt.plugins";
import { createdResponse, successResponse } from "@/utils/responses";
import { ThrowErrorResponse } from "@/utils/errors";
import prisma from "@/services/db";
import { BookingDto } from "@/models/booking.model";

const clientKostHandler = new Elysia({ prefix: "/client" }).guard({}, (app) =>
  app
    // .use(verifyJwt)
    .decorate("db", prisma)
    .get(
      "/kost/:id",
      async ({ db, params }) => {
        const kost = await db.kost.findFirst({
          where: {
            id: params.id,
          },
          include: {
            GambarKost: true,
            Kamar: {
              include: {
                GambarKamar: {
                  select: {
                    image: true,
                  },
                },
              },
            },
            pemilik: {
              select: {
                firstName: true,
                lastName: true,
                noHp: true,
                email: true,
              },
            },
          },
        });

        if (!kost) {
          throw new ThrowErrorResponse(404, "Kost not found");
        }

        const data = {
          ...kost,
          GambarKost: kost.GambarKost.map(
            (gambar) => `${process.env.APP_URL}/public/${gambar.image}`
          ),
          Kamar: kost.Kamar.map((kamar) => ({
            ...kamar,
            GambarKamar: kamar.GambarKamar.map(
              (gambar) => `${process.env.APP_URL}/public/${gambar.image}`
            ),
          })),
        };

        return successResponse(200, data);
      },
      {
        params: t.Object({
          id: t.Numeric(),
        }),
        detail: {
          tags: ["Kost"],
          description: "Get kost by id",
        },
      }
    )

    .get(
      "/kost/:id/kamar",
      async ({ db, params }) => {
        const kost = await db.kost.findFirst({
          where: {
            id: params.id,
          },
        });

        if (!kost) {
          throw new ThrowErrorResponse(404, "Kost not found");
        }

        const kamar = await db.kamar.findMany({
          include: {
            _count: {
              select: {
                Booking: {
                  where: {
                    OR: [{ status: "pending" }, { status: "confirmed" }],
                  },
                },
              },
            },
            GambarKamar: true,
          },
        });

        if (!kamar) {
          throw new ThrowErrorResponse(404, "Kamar not found");
        }

        const data = kamar.map((kamar) => ({
          ...kamar,
          occupancy: kamar._count.Booking,
          _count: undefined,
          GambarKamar: kamar.GambarKamar.map(
            (gambar) => `${process.env.APP_URL}/public/${gambar.image}`
          ),
        }));

        return successResponse(200, data);
      },
      {
        params: t.Object({
          id: t.Numeric({
            error: "Id must be a number",
          }),
        }),
        query: t.Partial(
          t.Object({
            page: t.Numeric({
              error: "Page must be a number",
            }),
          })
        ),
        detail: {
          tags: ["Kost"],
          description: "Get kamar by kost id",
        },
      }
    )

    .get(
      "/kost/:id/kamar/:kamarId",
      async ({ db, params, query }) => {
        const kost = await db.kost.findFirst({
          where: {
            id: params.id,
          },
        });

        if (!kost) {
          throw new ThrowErrorResponse(404, "Kost not found");
        }

        const kamar = await db.kamar.findFirst({
          where: {
            kostId: params.kamarId,
          },
          include: {
            _count: {
              select: {
                Booking: {
                  where: {
                    OR: [{ status: "pending" }, { status: "confirmed" }],
                  },
                },
              },
            },
            GambarKamar: true,
          },
          skip: query.page ? (query.page - 1) * 5 : undefined,
          take: 5,
        });

        if (!kamar) {
          throw new ThrowErrorResponse(404, "Kamar not found");
        }

        const data = {
          ...kamar,
          occupancy: kamar._count.Booking,
          _count: undefined,
          GambarKamar: kamar.GambarKamar.map(
            (gambar) => `${process.env.APP_URL}/public/${gambar.image}`
          ),
        };

        return successResponse(200, data);
      },
      {
        query: t.Partial(
          t.Object({
            page: t.Numeric({
              error: "Page must be a number",
            }),
          })
        ),
        params: t.Object({
          id: t.Numeric({
            error: "Id must be a number",
          }),
          kamarId: t.Numeric({
            error: "Kamar id must be a number",
          }),
        }),
        detail: {
          tags: ["Kost"],
          description: "Get kamar by kost id",
        },
      }
    )

    .guard({}, (app) =>
      app.use(verifyJwt).post(
        "/kost/:id/kamar/:kamarId",
        async ({ db, user, params, body }) => {
          const kost = await db.kost.findFirst({
            where: {
              id: params.id,
            },
          });

          if (!kost) {
            throw new ThrowErrorResponse(404, "Kost not found");
          }

          const kamar = await db.kamar.findFirst({
            where: {
              id: params.kamarId,
            },
          });

          if (!kamar) {
            throw new ThrowErrorResponse(404, "Kamar not found");
          }

          const booking = await db.booking.create({
            data: {
              checkIn: body.checkIn,
              checkOut: body.checkOut,
              clientId: user.id,
              kamarId: kamar.id,
              status: "pending",
            },
          });

          return createdResponse(booking);
        },
        {
          query: t.Partial(
            t.Object({
              page: t.Numeric({
                error: "Page must be a number",
              }),
            })
          ),
          params: t.Object({
            id: t.Numeric({
              error: "Id must be a number",
            }),
            kamarId: t.Numeric({
              error: "Kamar id must be a number",
            }),
          }),
          body: BookingDto,
          detail: {
            tags: ["Kost"],
            description: "Get kamar by kost id",
          },
        }
      )
    )
);

export default clientKostHandler;
