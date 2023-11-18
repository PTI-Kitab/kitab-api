import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import ENV from "@/utils/env";
import { ThrowErrorResponse, errorHandler } from "@/utils/errors";
import { successResponse, errorResponse } from "@/utils/responses";

// handlers
import registerHandler from "@/handlers/auth/register.handler";
import loginHandler from "@/handlers/auth/login.handler";
import userHandler from "@/handlers/users/user.handler";
import articleHandler from "@/handlers/articles/article.handler";
import statisticHandler from "@/handlers/statistics/statistic.handler";
import kostManagerHandler from "@/handlers/pemilik/kostManager.handler";
import clientKostHandler from "@/handlers/clients/kost.handler";
import uploadGambarHandler from "./handlers/gambar/uploadGambar.handler";
import myKostHandler from "./handlers/clients/myKost.handler";
import listingHandler from "./handlers/clients/listing.handler";
import payoutHandler from "./handlers/pemilik/payout.handler";

const app = new Elysia()
  // swagger
  .use(
    swagger({
      autoDarkMode: true,
      documentation: {
        info: {
          title: "KITAB API",
          description: "KITAB API Documentation",
          version: ENV.APP_VERSION,
        },
      },
    })
  )

  // use error handler
  .use(errorHandler)

  // static
  .use(staticPlugin())

  .get("/", () =>
    successResponse(200, {
      appName: "KITAB running on Elysia",
      message: "Hello world!",
      version: ENV.APP_VERSION,
    })
  )

  // routes
  .group("/auth", (app) => app.use(registerHandler).use(loginHandler)) // /auth

  // public
  .use(listingHandler) // /listings

  // client
  .use(clientKostHandler) // /client
  .use(myKostHandler) // /myKost

  // admin
  .use(articleHandler) // /articles
  .use(userHandler) // /users
  .use(statisticHandler) // /statistics

  // pemilik
  .use(kostManagerHandler) // /kostManager
  .use(payoutHandler) // /payout

  .use(uploadGambarHandler) // /upload

  // listen
  .listen(ENV.APP_PORT, (server) => {
    console.log(`[INFO]: 🦊 is running on port ${server.port}`);
  });

export type App = typeof app;
