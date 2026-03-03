import { Elysia, t } from "elysia";
import { CustomerMenuService } from "./service";

export const customerMenu = new Elysia({
  prefix: "/menu",
  tags: ["customer-menu"],
})

  // Get full menu for a restaurant (public)
  .get(
    "/:orgSlug",
    async ({ params }) => {
      return await CustomerMenuService.getMenu(params.orgSlug);
    },
    {
      params: t.Object({
        orgSlug: t.String(),
      }),
    },
  )

  // Get single menu item detail
  .get(
    "/:orgSlug/item/:itemId",
    async ({ params }) => {
      return await CustomerMenuService.getMenuItem(
        params.orgSlug,
        params.itemId,
      );
    },
    {
      params: t.Object({
        orgSlug: t.String(),
        itemId: t.String(),
      }),
    },
  );