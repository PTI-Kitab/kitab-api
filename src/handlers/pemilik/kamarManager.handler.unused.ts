import { Elysia, t } from "elysia";
import verifyJwt from "@/plugins/verifyJwt.plugins";
import { createdResponse, successResponse } from "@/utils/responses";
import { ThrowErrorResponse } from "@/utils/errors";
import prisma from "@/services/db";

import { kamarDto } from "@/models/kamar.model";

const kamarManagerHandler = new Elysia({ prefix: "/roomManager" })
  // for admin and pemilik only
  .guard({}, (app) =>
    app
      .use(verifyJwt)
      .onBeforeHandle(({ user }) => {
        if (user.role !== "pemilik" && user.role !== "admin") {
          throw new ThrowErrorResponse(403, "Forbidden");
        }
      })
      .get(
        "/kamar/:id",
        async ({ db, params }) => {
          const room = await db.kamar.findUnique({
            where: {
              id: params.id,
            },
            select: {
              id: true,
              kostId: true,
              namaKamar: true,
              description: true,
              harga: true,
              fasilitas: true,
              ukuran: true,
              gender: true,
              updatedAt: true,
              GambarKamar: true,
            },
          });

          if (!room) {
            throw new ThrowErrorResponse(404, "Room not found");
          }

          return successResponse(200, room);
        },
        {
          params: t.Object({
            id: t.Numeric({
              error: "ID harus berupa angka",
            }),
          }),
          detail: {
            description: "Get room by id",
          },
        }
      )
      .post("/kamar/", async ({ db }) => {}, {
        body: kamarDto,
        detail: {
          tags: ["RoomManager"],
          description: "Create new room",
        },
      })
  );
