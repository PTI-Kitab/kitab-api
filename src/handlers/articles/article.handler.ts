import { Elysia, t } from "elysia";
import verifyJwt from "@/plugins/verifyJwt.plugins";
import { createdResponse, successResponse } from "@/utils/responses";
import { ThrowErrorResponse } from "@/utils/errors";

import { ArticlesDto } from "@/models/articles.model";
import prisma from "@/services/db";

const articleHandler = new Elysia({ prefix: "/articles" })
  .decorate("db", prisma)
  .get(
    "/",
    async ({ db, query }) => {
      const articles = await db.articles.findMany({
        where: {
          title: {
            search: query.search,
          },
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: query.page ? (query.page - 1) * 5 : undefined,
        take: 5,
      });
      return successResponse(200, articles);
    },
    {
      query: t.Partial(
        t.Object({
          search: t.String({
            error: "Search harus berupa string",
          }),
          page: t.Numeric({
            error: "Page harus berupa angka",
          }),
        })
      ),
      detail: {
        tags: ["Article"],
        description: "Get all articles",
      },
    }
  )

  .get(
    "/:id",
    async ({ db, params }) => {
      const article = await db.articles.findUnique({
        where: {
          id: params.id,
        },
      });

      if (!article) {
        throw new ThrowErrorResponse(404, "Article not found");
      }

      return successResponse(200, article);
    },
    {
      params: t.Object({
        id: t.Numeric({
          error: "ID harus berupa angka",
        }),
      }),
      detail: {
        tags: ["Article"],
        description: "Get all articles",
      },
    }
  )

  // guarded for admin only
  .guard({}, (app) =>
    app
      // admin check
      .use(verifyJwt)
      .onBeforeHandle(({ user }) => {
        if (user.role !== "admin") {
          throw new ThrowErrorResponse(403, "You don't have access");
        }
      })

      .post(
        "/",
        async ({ db, body }) => {
          const newArticle = await db.articles.create({
            data: body,
          });

          return createdResponse(newArticle);
        },
        {
          body: ArticlesDto,
          detail: {
            tags: ["Article"],
            description: "Get all articles",
          },
        }
      )

      .put(
        "/:id",
        async ({ db, body, params }) => {
          const checkArticle = await db.articles.findUnique({
            where: {
              id: params.id,
            },
          });

          if (!checkArticle) {
            throw new ThrowErrorResponse(404, "Article not found");
          }

          const updatedArticle = await db.articles.update({
            where: {
              id: params.id,
            },
            data: body,
          });

          return successResponse(200, updatedArticle);
        },
        {
          params: t.Object({
            id: t.Numeric({
              error: "ID harus berupa angka",
            }),
          }),
          body: t.Partial(ArticlesDto),
          detail: {
            tags: ["Article"],
            description: "Get all articles",
          },
        }
      )

      .delete(
        "/:id",
        async ({ db, params }) => {
          const checkArticle = await db.articles.findUnique({
            where: {
              id: params.id,
            },
          });

          if (!checkArticle) {
            throw new ThrowErrorResponse(404, "Article not found");
          }

          await db.articles.delete({
            where: {
              id: params.id,
            },
          });

          return successResponse(200, "Article deleted");
        },
        {
          params: t.Object({
            id: t.Numeric({
              error: "ID harus berupa angka",
            }),
          }),
          detail: {
            tags: ["Article"],
            description: "Get all articles",
          },
        }
      )
  );

export default articleHandler;
