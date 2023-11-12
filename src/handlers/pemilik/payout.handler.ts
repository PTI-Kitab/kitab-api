import { Elysia, t } from "elysia";
import verifyJwt from "@/plugins/verifyJwt.plugins";
import { createdResponse, successResponse } from "@/utils/responses";
import { ThrowErrorResponse } from "@/utils/errors";

const payoutHandler = new Elysia({ prefix: "/payout" }).guard({}, (app) =>
  app
    .use(verifyJwt)
    .onBeforeHandle(({ user }) => {
      if (user.role !== "pemilik") {
        throw new ThrowErrorResponse(403, "You don't have access");
      }
    })
    .post(
      "/",
      async ({ db, user }) => {
        const pemilik = await db.pemilik.findUnique({
          where: {
            id: user.id,
          },
        });

        if (!pemilik) {
          throw new ThrowErrorResponse(404, "Pemilik not found");
        }

        await db.pemilik.update({
          where: {
            id: user.id,
          },
          data: {
            balance: 0,
          },
        });

        return createdResponse("Payout success");
      },
      {
        detail: {
          tags: ["Payout"],
        },
      }
    )
);

export default payoutHandler;
