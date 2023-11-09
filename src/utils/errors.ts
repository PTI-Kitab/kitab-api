import { t } from "elysia";
import type { Responses } from "@/utils/responses";

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
