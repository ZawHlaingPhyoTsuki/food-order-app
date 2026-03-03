import { Elysia, t } from "elysia";
import { ProfileService } from "./service";
import { ProfileModel } from "./model";
import { ownerPlugin } from "@/plugins/owner";

export const profile = new Elysia({
  prefix: "/:organizationId/profile",
  tags: ["profile"],
})
  .use(ownerPlugin)

  // Get organization profile
  .get(
    "/",
    async ({ params }) => {
      return await ProfileService.getProfile(params.organizationId);
    },
    {
      owner: true,
    },
  )

  // Update organization profile
  .patch(
    "/",
    async ({ params, body }) => {
      return await ProfileService.updateProfile(params.organizationId, body);
    },
    {
      owner: true,
      body: ProfileModel.updateBody,
    },
  )

  // Get dashboard stats
  .get(
    "/stats",
    async ({ params }) => {
      return await ProfileService.getDashboardStats(params.organizationId);
    },
    {
      owner: true,
    },
  );
