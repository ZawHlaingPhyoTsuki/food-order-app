import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { env } from "@food-order-app/env/server";
import { auth, authMacro } from "./libs/auth";

// Import modules
import { todos } from "./modules/todos";
import { admin } from "./modules/admin";
import { restaurant } from "./modules/restaurant";

const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .use(openapi())
  // .mount(auth.handler)
  .use(authMacro)
  .get("/health", () => ({ text: "API is healthy" }))
  // Mount modules
  .use(todos)
  .use(admin)
  .use(restaurant)
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });

export type App = typeof app;
