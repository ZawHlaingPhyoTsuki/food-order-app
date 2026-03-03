import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { env } from "@food-order-app/env/server";
import { auth, authMacro } from "./libs/auth";

// Import modules
import { todos } from "./modules/todos";
import { admin } from "./modules/admin";
import { restaurant } from "./modules/restaurant";
import { customer } from "./modules/customer";

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
  .use(customer)
  // WebSocket for kitchen live updates
  .ws("/ws/kitchen/:organizationId", {
    open(ws) {
      const { organizationId } = ws.data.params;
      ws.subscribe(`kitchen:${organizationId}`);
      ws.send({ type: "connected", organizationId });
    },
    message(ws, message) {
      // Handle ping/pong for keepalive
      if (message === "ping") {
        ws.send({ type: "pong" });
      }
    },
    close(ws) {
      const { organizationId } = ws.data.params;
      ws.unsubscribe(`kitchen:${organizationId}`);
    },
  })
  // WebSocket for order status updates (customer-facing)
  .ws("/ws/orders/:tableToken", {
    open(ws) {
      const { tableToken } = ws.data.params;
      ws.subscribe(`table:${tableToken}`);
      ws.send({ type: "connected", tableToken });
    },
    message(ws, message) {
      if (message === "ping") {
        ws.send({ type: "pong" });
      }
    },
    close(ws) {
      const { tableToken } = ws.data.params;
      ws.unsubscribe(`table:${tableToken}`);
    },
  })
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });

export type App = typeof app;
