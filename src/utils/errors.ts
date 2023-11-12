import Elysia, { t } from "elysia";
import { errorResponse, type Responses } from "@/utils/responses";

export const errors = {
  response: {
    400: t.Object({
      code: t.Number(),
      reason: t.String(),
      message: t.String(),
    }),
    401: t.Object({
      code: t.Number(),
      reason: t.String(),
      message: t.String(),
    }),
    403: t.Object({
      code: t.Number(),
      reason: t.String(),
      message: t.String(),
    }),
    404: t.Object({
      code: t.Number(),
      reason: t.String(),
      message: t.String(),
    }),
    422: t.Object({
      code: t.Number(),
      reason: t.String(),
      message: t.String(),
    }),
    500: t.Object({
      code: t.Number(),
      reason: t.String(),
      message: t.String(),
    }),
  },
};

export class ThrowErrorResponse extends Error {
  constructor(public code: Responses, public message: string) {
    super(message);
  }
}

export const errorHandler = new Elysia() // register error handler
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

    set.status = Number(code) ?? 500;
    return errorResponse(Number(code) ?? 500, error.message);
  });
