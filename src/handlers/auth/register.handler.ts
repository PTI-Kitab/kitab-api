import { Elysia, t } from "elysia";
import prisma from "@/services/db";
import { password as pwUtil } from "bun";

import { ThrowErrorResponse } from "@/utils/errors";
import { createdResponse } from "@/utils/responses";
import { registerDto } from "@/models/users.model";

const registerHandler = new Elysia({ prefix: "/register" })
  .decorate("db", prisma)

  .post(
    "/client",
    async ({ body, db }) => {
      const client = await db.client.findUnique({
        where: {
          email: body.email,
        },
      });

      if (client) {
        throw new ThrowErrorResponse(
          400,
          `Email ${body.email} sudah terdaftar sebelumnya`
        );
      }

      const newClient = await db.client.create({
        data: {
          ...body,
          password: await pwUtil.hash(body.password),
        },
        select: {
          id: true,
          email: true,
        },
      });

      return createdResponse(newClient);
    },
    {
      body: registerDto,
      detail: {
        tags: ["Auth"],
        description: "Register client baru",
      },
    }
  )

  .post(
    "/pemilik",
    async ({ body, db }) => {
      const pemilik = await db.pemilik.findUnique({
        where: {
          email: body.email,
        },
      });

      if (pemilik) {
        throw new ThrowErrorResponse(
          400,
          `Email ${body.email} sudah terdaftar menjadi pemilik sebelumnya`
        );
      }

      const newPemilik = await db.pemilik.create({
        data: {
          ...body,
          password: await pwUtil.hash(body.password),
        },
        select: {
          id: true,
          email: true,
        },
      });

      return createdResponse(newPemilik);
    },
    {
      body: registerDto,
      detail: {
        tags: ["Auth"],
        description: "Register pemilik baru",
      },
    }
  );

export default registerHandler;
