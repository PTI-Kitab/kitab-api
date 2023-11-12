import { Elysia, t } from "elysia";
import verifyJwt from "@/plugins/verifyJwt.plugins";
import { successResponse } from "@/utils/responses";
import { password as pwUtil } from "bun";

import { Client, registerDto } from "@/models/users.model";

const userHandler = new Elysia({ prefix: "/users" }).guard({}, (app) =>
  app
    .use(verifyJwt)
    .get(
      "/profile",
      ({ user }) => {
        return successResponse(200, user);
      },
      {
        detail: {
          tags: ["User"],
          description: "Get profile user",
        },
      }
    )

    .put(
      "/profile",
      async ({ user, db, body }) => {
        const hashedPassword = body.password
          ? await pwUtil.hash(body.password)
          : undefined;

        if (user.role === "admin") {
          const updatedUser = await db.admin.update({
            where: {
              id: user.id,
            },
            data: { ...body, password: hashedPassword },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              noHp: true,
              gender: true,
              updatedAt: true,
            },
          });

          return successResponse(200, updatedUser);
        }

        if (user.role === "pemilik") {
          const updatedUser = await db.pemilik.update({
            where: {
              id: user.id,
            },
            data: { ...body, password: hashedPassword },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              noHp: true,
              gender: true,
              updatedAt: true,
            },
          });

          return successResponse(200, updatedUser);
        }

        const updatedUser = await db.client.update({
          where: {
            id: user.id,
          },
          data: { ...body, password: hashedPassword },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            noHp: true,
            gender: true,
            updatedAt: true,
          },
        });

        return successResponse(200, updatedUser);
      },
      {
        body: t.Partial(registerDto),
        detail: {
          tags: ["User"],
          description: "Update profile user",
        },
      }
    )
);

export default userHandler;
