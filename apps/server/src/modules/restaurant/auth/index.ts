import Elysia from "elysia";
import { RestaurantAuthService } from "./service";
import { RestaurantAuthModel } from "./model";
import { authMacro } from "@/libs/auth";

export const restaurantAuth = new Elysia({
  prefix: "/auth",
  tags: ["auth"],
})
  .use(authMacro)

  // Check if user already has an organization
  .get(
    "/status",
    async ({ user }) => {
      return await RestaurantAuthService.checkUserOrganization(user.id);
    },
    {
      auth: true,
    },
  )

  // Register Restaurant
  .post(
    "/register",
    async ({ body, user }) => {
      return await RestaurantAuthService.register(body, user);
    },
    {
      auth: true,
      body: RestaurantAuthModel.registerBody,
      response: {
        200: RestaurantAuthModel.registerResponse,
        400: RestaurantAuthModel.errorResponse,
      },
    },
  );
