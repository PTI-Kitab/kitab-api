import { Elysia, t } from "elysia";

import { ThrowErrorResponse } from "@/utils/errors";
import {
  successResponse,
  errorResponse,
  createdResponse,
} from "@/utils/responses";
import jwtPlugin from "@/plugins/jwt.plugin";

const uploadGambarHandler = new Elysia({ prefix: "/upload" }).guard({}, (app) =>
  app
    // .use(jwtPlugin)

    .post(
      "/",
      async ({ body }) => {
        const result = [];
        for (const file of body.files) {
          const fileName = `${crypto.randomUUID()}.${file.name
            .split(".")
            .pop()}`;

          await Bun.write(`./public/${fileName}`, file);

          result.push(`/public/${fileName}`);
        }

        return successResponse(200, result);
      },
      {
        body: t.Object({
          files: t.Files({
            minItems: 1,
            maxItems: 5,
            error: "File is not valid",
            maxSize: 3 * 1024 * 1024, // 5MB
            type: ["image/png", "image/jpeg", "image/webp"],
          }),
        }),
      }
    )
);

export default uploadGambarHandler;
