import { Elysia, t } from "elysia";
import { KitchenService } from "./service";
import { ownerPlugin } from "@/plugins/owner";

export const kitchen = new Elysia({
  prefix: "/:organizationId/kitchen",
  tags: ["kitchen"],
})
  .use(ownerPlugin)

  // Get kitchen queue
  .get(
    "/queue",
    async ({ params }) => {
      return await KitchenService.getQueue(params.organizationId);
    },
    { owner: true },
  )

  // Get status counts
  .get(
    "/counts",
    async ({ params }) => {
      return await KitchenService.getStatusCounts(params.organizationId);
    },
    { owner: true },
  )

  // Advance order to next status
  .post(
    "/advance/:id",
    async ({ params }) => {
      return await KitchenService.advanceOrder(
        params.id,
        params.organizationId,
      );
    },
    {
      owner: true,
      params: t.Object({
        organizationId: t.String(),
        id: t.String(),
      }),
    },
  );