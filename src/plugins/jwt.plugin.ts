import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import ENV from "@/utils/env";

const jwtPlugin = new Elysia().use(
  jwt({
    name: "jwt",
    secret: ENV.APP_JWT_SECRET,
    exp: "7d",
  })
);

export default jwtPlugin;
