import { t, type UnwrapSchema } from "elysia";

export const KitchenModel = {
  successResponse: t.Object({
    success: t.Boolean(),
    message: t.Optional(t.String()),
  }),
} as const;

export type KitchenModel = {
  [K in keyof typeof KitchenModel]: UnwrapSchema<(typeof KitchenModel)[K]>;
};