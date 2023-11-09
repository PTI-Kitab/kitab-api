import { Elysia, t } from "elysia";
import ENV from "@/utils/env";
import { ThrowErrorResponse } from "@/utils/errors";
import { successResponse, errorResponse } from "@/utils/responses";

// handlers
import registerHandler from "./handlers/auth/register.handler";
import loginHandler from "./handlers/auth/login.handler";

const app = new Elysia()
  .get("/", () =>
    successResponse(200, {
      appName: "KITAB running on Elysia",
      message: "Hello world!",
      version: ENV.APP_VERSION,
    })
  )

  // register error handler
  .error({
    respError: ThrowErrorResponse,
  })

  .onError(({ code, error, set }) => {
    console.error(code, error.message);

    if (code === "VALIDATION") {
      set.status = 422;
      return errorResponse(422, error.message);
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return errorResponse(404, error.message);
    }

    if (code === "PARSE") {
      set.status = 400;
      return errorResponse(400, error.message);
    }

    if (Number.isNaN(Number(code))) {
      set.status = 500;
      return errorResponse(500, error.message);
    }

    set.status = Number(code);
    return errorResponse(Number(code), error.message);
  })

  // routes
  .group("/auth", (app) => app.use(registerHandler).use(loginHandler))

  // listen
  .listen(ENV.APP_PORT, (server) => {
    console.log(`[INFO]: 🦊 is running on port ${server.port}`);
  });

export type App = typeof app;
