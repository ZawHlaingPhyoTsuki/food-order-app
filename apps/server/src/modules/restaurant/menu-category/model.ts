import { t, type UnwrapSchema } from "elysia";
import { MenuCategoryPlain, MenuCategoryPlainInputCreate } from "@/generated/prismabox/MenuCategory";

export const MenuCategoryModel = {
  // Create
  createBody: MenuCategoryPlainInputCreate,

  // Update
  updateBody: t.Partial(
    t.Object({
      name: t.String(),
      nameEn: t.Optional(t.String()),
      nameTh: t.Optional(t.String()),
      nameMm: t.Optional(t.String()),
      nameSh: t.Optional(t.String()),
      description: t.Optional(t.String()),
      displayOrder: t.Number(),
      isActive: t.Boolean(),
    }),
  ),

  // Reorder categories
  reorderBody: t.Object({
    categoryIds: t.Array(t.String()),
  }),

  // Response
  categoryResponse: MenuCategoryPlain,
//   categoryResponse: t.Object({
//     id: t.String(),
//     name: t.String(),
//     nameEn: t.Optional(t.String()),
//     nameTh: t.Optional(t.String()),
//     nameMm: t.Optional(t.String()),
//     nameSh: t.Optional(t.String()),
//     description: t.Optional(t.String()),
//     displayOrder: t.Number(),
//     isActive: t.Boolean(),
//     organizationId: t.String(),
//     createdAt: t.Date(),
//     updatedAt: t.Date(),
//   }),

  successResponse: t.Object({
    success: t.Boolean(),
    message: t.Optional(t.String()),
  }),
} as const;

export type MenuCategoryModel = {
  [K in keyof typeof MenuCategoryModel]: UnwrapSchema<
    (typeof MenuCategoryModel)[K]
  >;
};
