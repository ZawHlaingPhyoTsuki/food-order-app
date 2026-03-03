import { Elysia } from "elysia";
import { customerSession } from "./session";
import { customerMenu } from "./menu";
import { customerOrders } from "./orders";

export const customer = new Elysia({ prefix: "/api/customer" })
  .use(customerSession)
  .use(customerMenu)
  .use(customerOrders);