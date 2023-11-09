import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import ENV from "@/utils/env";
import prisma from "@/services/db";
import { password as pwUtil } from "bun";

import { ThrowErrorResponse } from "@/utils/errors";
import {
  successResponse,
  errorResponse,
  createdResponse,
} from "@/utils/responses";
import { loginDto, registerDto } from "@/models/users.model";

const registerHandler = new Elysia({ prefix: "/register" })
  .decorate("db", prisma)

  .post(
    "/client",
    async ({ body, db }) => {
      try {
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
      } catch (err) {
        console.error(err);
        throw new ThrowErrorResponse(500, "Internal Server Error");
      }
    },
    {
      body: registerDto,
    }
  )

  .post(
    "/pemilik",
    async ({ body, db }) => {
      try {
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
      } catch (err) {
        console.error(err);
        throw new ThrowErrorResponse(500, "Internal Server Error");
      }
    },
    {
      body: registerDto,
    }
  );

export default registerHandler;
