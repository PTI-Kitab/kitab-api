import { Elysia, t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { ThrowErrorResponse } from "@/utils/errors";
import jwtPlugin from "./jwt.plugin";
import prisma from "@/services/db";

const verifyJwt = new Elysia()
  .use(jwtPlugin)
  .decorate("db", prisma)
  .use(bearer())
  .derive(async ({ bearer, jwt, db }) => {
    if (!bearer) {
      throw new ThrowErrorResponse(401, "Bearer token not found");
    }

    try {
      const jwtPayload = await jwt.verify(bearer);
      if (!jwtPayload) {
        throw new ThrowErrorResponse(401, "Unauthorized");
      }

      if (jwtPayload.role === "admin") {
        const admin = await db.admin.findUnique({
          where: {
            id: Number(jwtPayload.id),
          },
        });

        if (!admin) {
          throw new ThrowErrorResponse(401, "Unauthorized");
        }

        return {
          user: {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            gender: admin.gender,
            email: admin.email,
            noHp: admin.noHp,
            role: "admin",
          },
        };
      }

      if (jwtPayload.role === "pemilik") {
        const pemilik = await db.pemilik.findUnique({
          where: {
            id: Number(jwtPayload.id),
          },
        });

        if (!pemilik) {
          throw new ThrowErrorResponse(401, "Unauthorized");
        }

        return {
          user: {
            id: pemilik.id,
            firstName: pemilik.firstName,
            lastName: pemilik.lastName,
            gender: pemilik.gender,
            balance: pemilik.balance,
            email: pemilik.email,
            noHp: pemilik.noHp,
            role: "pemilik",
          },
        };
      }

      if (jwtPayload.role === "client") {
        const client = await db.client.findUnique({
          where: {
            id: Number(jwtPayload.id),
          },
        });

        if (!client) {
          throw new ThrowErrorResponse(401, "Unauthorized");
        }

        return {
          user: {
            id: client.id,
            email: client.email,
            firstName: client.firstName,
            lastName: client.lastName,
            gender: client.gender,
            noHp: client.noHp,
            role: "client",
          },
        };
      }

      throw new ThrowErrorResponse(401, "Unauthorized");
    } catch (err) {
      throw new ThrowErrorResponse(401, "Unauthorized");
    }
  });

export default verifyJwt;
