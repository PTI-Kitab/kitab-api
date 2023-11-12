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
import jwtPlugin from "@/plugins/jwt.plugin";

const loginHandler = new Elysia()
  .decorate("db", prisma)
  .use(jwtPlugin)
  .post(
    "/login",
    async ({ body, db, jwt }) => {
      const admin = await db.admin.findUnique({
        where: {
          email: body.email,
        },
      });

      if (admin) {
        const isPasswordValid = await pwUtil.verify(
          body.password,
          admin.password
        );

        if (!isPasswordValid) {
          throw new ThrowErrorResponse(400, "Password is invalid");
        }

        const token = await jwt.sign({
          id: admin.id.toString(),
          email: admin.email,
          role: "admin",
        });

        return successResponse(200, {
          id: admin.id,
          email: admin.email,
          role: "admin",
          token,
        });
      }

      const pemilik = await db.pemilik.findUnique({
        where: {
          email: body.email,
        },
      });

      if (pemilik) {
        const isPasswordValid = await pwUtil.verify(
          body.password,
          pemilik.password
        );

        if (!isPasswordValid) {
          throw new ThrowErrorResponse(400, "Password is invalid");
        }

        const token = await jwt.sign({
          id: pemilik.id.toString(),
          email: pemilik.email,
          role: "pemilik",
        });

        return successResponse(200, {
          id: pemilik.id,
          email: pemilik.email,
          role: "pemilik",
          token,
        });
      }

      const client = await db.client.findUnique({
        where: {
          email: body.email,
        },
      });

      if (!client) {
        throw new ThrowErrorResponse(
          400,
          `User with email ${body.email}, not found`
        );
      }

      const isPasswordValid = await pwUtil.verify(
        body.password,
        client.password
      );

      if (!isPasswordValid) {
        throw new ThrowErrorResponse(400, "Password is invalid");
      }

      const token = await jwt.sign({
        id: client.id.toString(),
        email: client.email,
        role: "client",
      });

      return successResponse(200, {
        id: client.id,
        email: client.email,
        role: "client",
        token,
      });
    },
    {
      body: loginDto,
      detail: {
        tags: ["Auth"],
        description: "Login user",
      },
    }
  );

export default loginHandler;
