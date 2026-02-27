import { cors } from "@elysiajs/cors";
import { env } from "@food-order-app/env/server";
import { Elysia } from "elysia";
import { betterAuth } from "./plugins/auth";
import { todos } from "./modules/todos";

const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .use(betterAuth)
  .get("/health", () => ({ text: "API is healthy" }))
  .use(todos)
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });

export type App = typeof app;
