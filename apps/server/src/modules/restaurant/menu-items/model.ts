import { t, type UnwrapSchema } from "elysia";
import { MenuItemPlain, MenuItemPlainInputCreate } from "@/generated/prismabox/MenuItem";

export const MenuItemModel = {
  // Create
  createBody: MenuItemPlainInputCreate,

  // Update
  updateBody: t.Partial(
    t.Object({
      name: t.String(),
      nameEn: t.Optional(t.String()),
      nameTh: t.Optional(t.String()),
      nameMm: t.Optional(t.String()),
      nameSh: t.Optional(t.String()),
      description: t.Optional(t.String()),
      image: t.Optional(t.String()),
      price: t.Number(),
      isAvailable: t.Boolean(),
      isFeatured: t.Boolean(),
      displayOrder: t.Number(),
      categoryId: t.String(),
    }),
  ),

  // Reorder items
  reorderBody: t.Object({
    itemIds: t.Array(t.String()),
  }),

  // Bulk update availability
  bulkAvailabilityBody: t.Object({
    itemIds: t.Array(t.String()),
    isAvailable: t.Boolean(),
  }),

  // Response
  itemResponse: MenuItemPlain,
//   itemResponse: t.Object({
//     id: t.String(),
//     name: t.String(),
//     nameEn: t.Nullable(t.String()),
//     nameTh: t.Nullable(t.String()),
//     nameMm: t.Nullable(t.String()),
//     nameSh: t.Nullable(t.String()),
//     description: t.Nullable(t.String()),
//     image: t.Nullable(t.String()),
//     price: t.Number(),
//     isAvailable: t.Boolean(),
//     isFeatured: t.Boolean(),
//     displayOrder: t.Number(),
//     categoryId: t.String(),
//     organizationId: t.String(),
//     createdAt: t.Date(),
//     updatedAt: t.Date(),
//     category: t.Object({
//       id: t.String(),
//       name: t.String(),
//       nameEn: t.Nullable(t.String()),
//       nameTh: t.Nullable(t.String()),
//       nameMm: t.Nullable(t.String()),
//       nameSh: t.Nullable(t.String()),
//       description: t.Nullable(t.String()),
//       displayOrder: t.Number(),
//       isActive: t.Boolean(),
//       organizationId: t.String(),
//       createdAt: t.Date(),
//       updatedAt: t.Date(),
//     }),
//   }),

  successResponse: t.Object({
    success: t.Boolean(),
    message: t.Optional(t.String()),
  }),
} as const;

export type MenuItemModel = {
  [K in keyof typeof MenuItemModel]: UnwrapSchema<(typeof MenuItemModel)[K]>;
};
