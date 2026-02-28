import { Elysia, t } from "elysia";
import { MenuCategoryService } from "./service";
import { MenuCategoryModel } from "./model";

export const menuCategory = new Elysia({
  prefix: "/:organizationId/menu-category",
  tags: ["menu-category"],
})
  // Get all categories
  .get("/", async ({ params }) => {
    return await MenuCategoryService.getAll(params.organizationId);
  })

  // Get single category with items
  .get(
    "/:id",
    async ({ params }) => {
      return await MenuCategoryService.getById(
        params.id,
        params.organizationId,
      );
    },
    {
      params: t.Object({
        organizationId: t.String(),
        id: t.String(),
      }),
    },
  )

  // Create category
  .post(
    "/",
    async ({ params, body }) => {
      return await MenuCategoryService.create(params.organizationId, body);
    },
    {
      body: MenuCategoryModel.createBody,
      response: {
        200: MenuCategoryModel.categoryResponse,
      },
    },
  )

  // Update category
  .patch(
    "/:id",
    async ({ params, body }) => {
      return await MenuCategoryService.update(
        params.id,
        params.organizationId,
        body,
      );
    },
    {
      params: t.Object({
        organizationId: t.String(),
        id: t.String(),
      }),
      body: MenuCategoryModel.updateBody,
    },
  )

  // Delete category
  .delete(
    "/:id",
    async ({ params }) => {
      return await MenuCategoryService.delete(params.id, params.organizationId);
    },
    {
      params: t.Object({
        organizationId: t.String(),
        id: t.String(),
      }),
      response: {
        200: MenuCategoryModel.successResponse,
      },
    },
  )

  // Reorder categories
  .post(
    "/reorder",
    async ({ params, body }) => {
      return await MenuCategoryService.reorder(
        params.organizationId,
        body.categoryIds,
      );
    },
    {
      body: MenuCategoryModel.reorderBody,
      response: {
        200: MenuCategoryModel.successResponse,
      },
    },
  )

  // Toggle active status
  .patch(
    "/:id/toggle",
    async ({ params }) => {
      return await MenuCategoryService.toggleActive(
        params.id,
        params.organizationId,
      );
    },
    {
      params: t.Object({
        organizationId: t.String(),
        id: t.String(),
      }),
    },
  );
