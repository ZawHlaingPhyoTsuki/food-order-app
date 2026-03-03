import { Elysia, t } from "elysia";
import { TableService } from "./service";
import { TableModel } from "./model";
import { ownerPlugin } from "@/plugins/owner";

export const tables = new Elysia({
  prefix: "/:organizationId/tables",
  tags: ["tables"],
})
  .use(ownerPlugin)

  // Get all tables
  .get(
    "/",
    async ({ params }) => {
      return await TableService.getAll(params.organizationId);
    },
    {
      owner: true,
    },
  )

  // Get single table
  .get(
    "/:id",
    async ({ params }) => {
      return await TableService.getById(params.id, params.organizationId);
    },
    {
      owner: true,
      params: t.Object({
        organizationId: t.String(),
        id: t.String(),
      }),
    },
  )

  // Create table
  .post(
    "/",
    async ({ params, body }) => {
      return await TableService.create(params.organizationId, body);
    },
    {
      owner: true,
      body: TableModel.createBody,
    },
  )

  // Update table
  .patch(
    "/:id",
    async ({ params, body }) => {
      return await TableService.update(
        params.id,
        params.organizationId,
        body,
      );
    },
    {
      owner: true,
      params: t.Object({
        organizationId: t.String(),
        id: t.String(),
      }),
      body: TableModel.updateBody,
    },
  )

  // Delete table
  .delete(
    "/:id",
    async ({ params }) => {
      return await TableService.delete(params.id, params.organizationId);
    },
    {
      owner: true,
      params: t.Object({
        organizationId: t.String(),
        id: t.String(),
      }),
      response: {
        200: TableModel.successResponse,
      },
    },
  )

  // Regenerate QR token
  .post(
    "/:id/regenerate-qr",
    async ({ params }) => {
      return await TableService.regenerateQR(
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
  )

  // Clear table (end session)
  .post(
    "/:id/clear",
    async ({ params }) => {
      return await TableService.clearTable(
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
      response: {
        200: TableModel.successResponse,
      },
    },
  );
