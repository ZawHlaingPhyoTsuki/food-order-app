import { t, type UnwrapSchema } from "elysia";

export const TableModel = {
  createBody: t.Object({
    tableNumber: t.String({ minLength: 1, maxLength: 20 }),
  }),

  updateBody: t.Partial(
    t.Object({
      tableNumber: t.String({ minLength: 1, maxLength: 20 }),
      status: t.Union([
        t.Literal("FREE"),
        t.Literal("OCCUPIED"),
        t.Literal("NEEDS_CLEANING"),
      ]),
    }),
  ),

  tableResponse: t.Object({
    id: t.String(),
    tableNumber: t.String(),
    tableToken: t.String(),
    status: t.String(),
    qrUrl: t.String(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  }),

  createResponse: t.Object({
    success: t.Boolean(),
    table: t.Object({
      id: t.String(),
      tableNumber: t.String(),
      tableToken: t.String(),
      status: t.String(),
      qrUrl: t.String(),
    }),
  }),

  successResponse: t.Object({
    success: t.Boolean(),
    message: t.Optional(t.String()),
  }),
} as const;

export type TableModel = {
  [K in keyof typeof TableModel]: UnwrapSchema<(typeof TableModel)[K]>;
};