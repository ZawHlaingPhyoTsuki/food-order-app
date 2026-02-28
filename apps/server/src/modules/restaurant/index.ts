import { Elysia } from "elysia";

// // Import sub-modules
// import { tables } from "./tables";
import { menuItems } from "./menu-items";
import { menuCategory } from "./menu-category";
import { restaurantAuth } from "./auth";
// import { profile } from './profile'
// import { kitchen } from './kitchen'
// import { orders } from './orders'

export const restaurant = new Elysia({ prefix: "/api/restaurant" })
  //   // Mount sub-modules
  .use(restaurantAuth) // /api/restaurant/auth
  .use(menuCategory) // /api/restaurant/:org/menu-category
  .use(menuItems); // /api/restaurant/:org/menu
// .use(tables) // /api/restaurant/tables
//   .use(profile)   // /api/restaurant/profile
//   .use(kitchen)   // /api/restaurant/kitchen
//   .use(orders)    // /api/restaurant/orders
