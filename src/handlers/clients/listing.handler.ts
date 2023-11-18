import { Elysia, t } from "elysia";
import verifyJwt from "@/plugins/verifyJwt.plugins";
import { createdResponse, successResponse } from "@/utils/responses";
import { ThrowErrorResponse } from "@/utils/errors";
import prisma from "@/services/db";

const listingHandler = new Elysia({ prefix: "/listings" })
  .decorate("db", prisma)
  .get(
    "/",
    async ({ db, query }) => {
      const listingKamar = await db.kamar.findMany({
        where: {
          namaKamar: {
            search: query.search,
          },
        },
        select: {
          id: true,
          namaKamar: true,
          harga: true,
          ukuran: true,
          gender: true,
          capacity: true,
          kost: {
            select: {
              id: true,
              namaKost: true,
              alamat: true,
            },
          },
          GambarKamar: {
            select: {
              image: true,
            },
          },
        },
        skip: query.page ? (query.page - 1) * 5 : undefined,
        take: 5,
      });

      const data = listingKamar.map((kamar) => ({
        ...kamar,
        GambarKamar: kamar.GambarKamar.map(
          (gambar) => `/public/${gambar.image}`
        ),
      }));

      return successResponse(200, data);
    },
    {
      query: t.Partial(
        t.Object({
          search: t.String({
            error: "Search must be string",
          }),
          page: t.Numeric({
            error: "Page must be numeric",
          }),
        })
      ),
      detail: {
        tags: ["Listings"],
        description: "Get all listings",
      },
    }
  );

export default listingHandler;
