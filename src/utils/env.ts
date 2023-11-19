const ENV = {
  APP_PORT: +process.env.APP_PORT! || 3000,
  APP_VERSION: process.env.APP_VERSION || "1.0.0",
  APP_FRONTEND_URL: process.env.APP_FRONTEND_URL || "http://localhost:3000",
  APP_JWT_SECRET: process.env.APP_JWT_SECRET || "secret123!",
  APP_JWT_REFRESH_SECRET: process.env.APP_JWT_REFRESH_SECRET || "secret123!",
  NODE_ENV: process.env.NODE_ENV || "development",
  PRISMA_LOG: process.env.PRISMA_LOG || "info",
  PRISMA_CLIENT_LOG: process.env.PRISMA_CLIENT_LOG || "info",
  APP_MIDTRANS_SERVER_KEY: process.env.APP_MIDTRANS_SERVER_KEY || "",
  APP_URL: process.env.APP_URL || "http://localhost:3000",
};

export default ENV;
