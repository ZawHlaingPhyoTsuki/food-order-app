import { Elysia } from "elysia";

import { tables } from "./tables";
import { menuItems } from "./menu-items";
import { menuCategory } from "./menu-category";
import { restaurantAuth } from "./auth";
import { profile } from "./profile";
import { kitchen } from "./kitchen";
import { restaurantOrders } from "./orders";

export const restaurant = new Elysia({ prefix: "/api/restaurant" })
  .use(restaurantAuth) // /api/restaurant/auth
  .use(menuCategory) // /api/restaurant/:org/menu-category
  .use(menuItems) // /api/restaurant/:org/menu
  .use(tables) // /api/restaurant/:org/tables
  .use(profile) // /api/restaurant/:org/profile
  .use(kitchen) // /api/restaurant/:org/kitchen
  .use(restaurantOrders); // /api/restaurant/:org/orders
