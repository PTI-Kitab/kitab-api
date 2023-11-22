import { Elysia, t } from "elysia";
import verifyJwt from "@/plugins/verifyJwt.plugins";
import { createdResponse, successResponse } from "@/utils/responses";
import { ThrowErrorResponse } from "@/utils/errors";

import { KostDto } from "@/models/kost.model";
import { kamarDto } from "@/models/kamar.model";

const kostManagerHandler = new Elysia({ prefix: "/kostManager" })
  // for admin and pemilik only
  .guard({}, (app) =>
    app
      .use(verifyJwt)
      .onBeforeHandle(({ user }) => {
        if (user.role !== "admin" && user.role !== "pemilik") {
          throw new ThrowErrorResponse(403, "Forbidden");
        }
      })
      // get all listing kostan
      .get(
        "/",
        async ({ db, user }) => {
          const kostListing = await db.kost.findMany({
            where: {
              pemilikId: user.id,
            },
            select: {
              id: true,
              namaKost: true,
              // pemilikId: true,
              GambarKost: {
                select: {
                  image: true,
                },
                take: 1,
              },
            },
          });

          const data = kostListing.map((kost) => ({
            ...kost,
            GambarKost: `${process.env.APP_URL}/public/${kost.GambarKost[0].image}`,
          }));

          return successResponse(200, data);
        },
        {
          detail: {
            tags: ["KostManager"],
            description: "Get all kost listing",
          },
        }
      )

      .get(
        "/:id",
        async ({ db, user, params }) => {
          const kost = await db.kost.findFirst({
            where: {
              AND: {
                id: params.id,
                pemilikId: user.id,
              },
            },
            include: {
              GambarKost: true,
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
          };

          return successResponse(200, data);
        },
        {
          params: t.Object({
            id: t.Numeric({
              error: "ID harus berupa angka",
            }),
          }),
          detail: {
            tags: ["KostManager"],
            description: "Get kost detail",
          },
        }
      )

      .post(
        "/",
        async ({ db, user, body }) => {
          const kost = await db.kost.create({
            data: {
              ...body,
              GambarKost: {
                create: body.GambarKost.map((gambar) => ({
                  image: gambar,
                })),
              },
              pemilikId: user.id,
            },
          });

          return createdResponse(kost);
        },
        {
          body: KostDto,
          detail: {
            tags: ["KostManager"],
            description: "Create kost",
          },
        }
      )

      .put(
        "/:id",
        async ({ db, user, body, params }) => {
          const kost = await db.kost.findFirst({
            where: {
              AND: {
                id: params.id,
                pemilikId: user.id,
              },
            },
            include: {
              GambarKost: true,
            },
          });

          if (!kost) {
            throw new ThrowErrorResponse(404, "Kost not found");
          }

          // assume if the body has gambarKost, if the data is unchanged, the url will be the same. But if theres a new image, it will be added to the database. If the url is not in the body.gambarKost, it will be deleted from the database
          if (body.GambarKost) {
            const gambarKost = await db.gambarKost.findMany({
              where: {
                kostId: params.id,
              },
            });

            const gambarKostUrl = gambarKost.map((gambar) => gambar.image);

            const newGambarKost = body.GambarKost.filter(
              (gambar) => !gambarKostUrl.includes(gambar)
            );

            const deletedGambarKost = gambarKostUrl.filter(
              (gambar) => !(body.GambarKost ?? []).includes(gambar)
            );

            if (newGambarKost.length > 0) {
              await db.gambarKost.createMany({
                data: newGambarKost.map((gambar) => ({
                  image: gambar,
                  kostId: params.id,
                })),
              });
            }

            if (deletedGambarKost.length > 0) {
              await db.gambarKost.deleteMany({
                where: {
                  image: {
                    in: deletedGambarKost,
                  },
                },
              });
            }
          }

          const updatedKost = await db.kost.update({
            where: {
              id: params.id,
            },
            data: { ...body, GambarKost: undefined },
            include: {
              GambarKost: true,
            },
          });

          const data = {
            ...updatedKost,
            GambarKost: updatedKost.GambarKost.map(
              (gambar) => `${process.env.APP_URL}/public/${gambar.image}`
            ),
          };

          return successResponse(200, data);
        },
        {
          body: t.Partial(KostDto),
          params: t.Object({
            id: t.Numeric({
              error: "ID harus berupa angka",
            }),
          }),
          detail: {
            tags: ["KostManager"],
            description: "Update kost",
          },
        }
      )
      .delete(
        "/:id",
        async ({ db, user, params }) => {
          const kost = await db.kost.findFirst({
            where: {
              AND: {
                id: params.id,
                pemilikId: user.id,
              },
            },
          });

          if (!kost) {
            throw new ThrowErrorResponse(404, "Kost not found");
          }

          const deletedKost = await db.kost.delete({
            where: {
              id: params.id,
            },
          });

          return successResponse(200, deletedKost);
        },
        {
          params: t.Object({
            id: t.Numeric({
              error: "ID harus berupa angka",
            }),
          }),
          detail: {
            tags: ["KostManager"],
            description: "Delete kost",
          },
        }
      )
      .get(
        "/:id/kamar",
        async ({ db, user, params }) => {
          const kost = await db.kost.findFirst({
            where: {
              AND: {
                id: params.id,
                pemilikId: user.id,
              },
            },
          });

          if (!kost) {
            throw new ThrowErrorResponse(404, "Kost not found");
          }

          const kamar = await db.kamar.findMany({
            where: {
              kostId: params.id,
            },
            select: {
              id: true,
              kostId: true,
              namaKamar: true,
              harga: true,
              ukuran: true,
              gender: true,
              createdAt: true,
              updatedAt: true,
              GambarKamar: {
                select: {
                  image: true,
                },
                take: 1,
              },
            },
          });

          const data = kamar.map((kamar) => ({
            ...kamar,
            GambarKamar: `${process.env.APP_URL}/public/${kamar.GambarKamar[0].image}`,
          }));

          return successResponse(200, data);
        },
        {
          params: t.Object({
            id: t.Numeric({
              error: "ID harus berupa angka",
            }),
          }),
          detail: {
            tags: ["KostManager"],
            description: "Get all kamar listing",
          },
        }
      )
      .get(
        "/:id/kamar/:idKamar",
        async ({ db, user, params }) => {
          const kost = await db.kost.findFirst({
            where: {
              AND: {
                id: params.id,
                pemilikId: user.id,
              },
            },
          });

          if (!kost) {
            throw new ThrowErrorResponse(404, "Kost not found");
          }

          const kamar = await db.kamar.findFirst({
            where: {
              AND: {
                id: params.idKamar,
                kostId: params.id,
              },
            },
            select: {
              id: true,
              kostId: true,
              namaKamar: true,
              description: true,
              harga: true,
              fasilitas: true,
              ukuran: true,
              capacity: true,
              gender: true,
              updatedAt: true,
              GambarKamar: true,
            },
          });

          if (!kamar) {
            throw new ThrowErrorResponse(404, "Kamar not found");
          }

          const data = {
            ...kamar,
            GambarKamar: kamar.GambarKamar.map(
              (gambar) => `${process.env.APP_URL}/public/${gambar.image}`
            ),
          };

          return successResponse(200, data);
        },
        {
          params: t.Object({
            id: t.Numeric({
              error: "ID harus berupa angka",
            }),
            idKamar: t.Numeric({
              error: "ID harus berupa angka",
            }),
          }),
          detail: {
            tags: ["KostManager"],
            description: "Get kamar detail",
          },
        }
      )
      .post(
        "/:id/kamar",
        async ({ db, user, params, body }) => {
          const kost = await db.kost.findFirst({
            where: {
              AND: {
                id: params.id,
                pemilikId: user.id,
              },
            },
          });

          if (!kost) {
            throw new ThrowErrorResponse(404, "Kost not found");
          }

          const kamar = await db.kamar.create({
            data: {
              ...body,
              GambarKamar: {
                create: body.GambarKamar.map((gambar) => ({
                  image: gambar,
                })),
              },
              kostId: params.id,
            },

            select: {
              id: true,
              kostId: true,
              namaKamar: true,
              description: true,
              harga: true,
              fasilitas: true,
              ukuran: true,
              capacity: true,
              gender: true,
              updatedAt: true,
              GambarKamar: true,
            },
          });

          const data = {
            ...kamar,
            GambarKamar: kamar.GambarKamar.map(
              (gambar) => `${process.env.APP_URL}/public/${gambar.image}`
            ),
          };

          return createdResponse(data);
        },
        {
          params: t.Object({
            id: t.Numeric({
              error: "ID harus berupa angka",
            }),
          }),
          body: kamarDto,
          detail: {
            tags: ["KostManager"],
            description: "Create kamar",
          },
        }
      )
      .put(
        "/:id/kamar/:idKamar",
        async ({ db, user, params, body }) => {
          const kost = await db.kost.findFirst({
            where: {
              AND: {
                id: params.id,
                pemilikId: user.id,
              },
            },
          });

          if (!kost) {
            throw new ThrowErrorResponse(404, "Kost not found");
          }

          const kamar = await db.kamar.findFirst({
            where: {
              AND: {
                id: params.idKamar,
                kostId: params.id,
              },
            },
          });

          if (!kamar) {
            throw new ThrowErrorResponse(404, "Kamar not found");
          }

          // assume if the body has gambarKamar, if the data is unchanged, the url will be the same. But if theres a new image, it will be added to the database. If the url is not in the body.gambarKamar, it will be deleted from the database
          if (body.GambarKamar) {
            const gambarKamar = await db.gambarKamar.findMany({
              where: {
                kamarId: params.idKamar,
              },
            });

            const gambarKamarUrl = gambarKamar.map((gambar) => gambar.image);

            const newGambarKamar = body.GambarKamar.filter(
              (gambar) => !gambarKamarUrl.includes(gambar)
            );

            const deletedGambarKamar = gambarKamarUrl.filter(
              (gambar) => !(body.GambarKamar ?? []).includes(gambar)
            );

            if (newGambarKamar.length > 0) {
              await db.gambarKamar.createMany({
                data: newGambarKamar.map((gambar) => ({
                  image: gambar,
                  kamarId: params.idKamar,
                })),
              });
            }

            if (deletedGambarKamar.length > 0) {
              await db.gambarKamar.deleteMany({
                where: {
                  image: {
                    in: deletedGambarKamar,
                  },
                },
              });
            }
          }

          const updatedKamar = await db.kamar.update({
            where: {
              id: params.idKamar,
            },
            data: { ...body, GambarKamar: undefined },
            select: {
              id: true,
              kostId: true,
              namaKamar: true,
              description: true,
              harga: true,
              fasilitas: true,
              ukuran: true,
              capacity: true,
              gender: true,
              updatedAt: true,
              GambarKamar: true,
            },
          });

          const data = {
            ...updatedKamar,
            GambarKamar: updatedKamar.GambarKamar.map(
              (gambar) => `${process.env.APP_URL}/public/${gambar.image}`
            ),
          };

          return successResponse(200, data);
        },
        {
          params: t.Object({
            id: t.Numeric({
              error: "ID harus berupa angka",
            }),
            idKamar: t.Numeric({
              error: "ID harus berupa angka",
            }),
          }),
          body: t.Partial(kamarDto),
          detail: {
            tags: ["KostManager"],
            description: "Update kamar",
          },
        }
      )
      .delete(
        "/:id/kamar/:idKamar",
        async ({ db, user, params }) => {
          const kost = await db.kost.findFirst({
            where: {
              AND: {
                id: params.id,
                pemilikId: user.id,
              },
            },
          });

          if (!kost) {
            throw new ThrowErrorResponse(404, "Kost not found");
          }

          const kamar = await db.kamar.findFirst({
            where: {
              AND: {
                id: params.idKamar,
                kostId: params.id,
              },
            },
          });

          if (!kamar) {
            throw new ThrowErrorResponse(404, "Kamar not found");
          }

          const deletedKamar = await db.kamar.delete({
            where: {
              id: params.idKamar,
            },
          });

          return successResponse(200, deletedKamar);
        },
        {
          params: t.Object({
            id: t.Numeric({
              error: "ID harus berupa angka",
            }),
            idKamar: t.Numeric({
              error: "ID harus berupa angka",
            }),
          }),
          detail: {
            tags: ["KostManager"],
            description: "Delete kamar",
          },
        }
      )
      .get(
        "/billing/:kostId",
        async ({ db, params, query }) => {
          const billing = await db.booking.findMany({
            where: {
              kamar: {
                kostId: params.kostId,
              },
              createdAt: {
                gte: new Date(
                  query.year ?? new Date().getFullYear(),
                  query.month ?? new Date().getMonth() - 1,
                  1
                ).toISOString(),
                lte: new Date(
                  query.year ?? new Date().getMonth(),
                  query.month ?? new Date().getMonth(),
                  0
                ).toISOString(),
              },
            },
            select: {
              id: true,
              status: true,
              kamar: {
                select: {
                  namaKamar: true,
                },
              },
              client: {
                select: {
                  firstName: true,
                  lastName: true,
                  noHp: true,
                },
              },
              Payment: true,
            },
          });

          return successResponse(200, billing);
        },
        {
          params: t.Object({
            kostId: t.Numeric({
              error: "ID harus berupa angka",
            }),
          }),
          query: t.Object({
            month: t.Numeric({
              error: "Bulan harus berupa angka",
            }),
            year: t.Numeric({
              error: "Tahun harus berupa angka",
            }),
          }),

          detail: {
            tags: ["KostManager"],
            description: "Get all billing",
          },
        }
      )
  );

export default kostManagerHandler;
