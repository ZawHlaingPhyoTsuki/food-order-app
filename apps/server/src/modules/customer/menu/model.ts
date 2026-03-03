import { t, type UnwrapSchema } from "elysia";

export const CustomerMenuModel = {
  menuParams: t.Object({
    orgSlug: t.String(),
  }),

  errorResponse: t.Object({
    error: t.String(),
  }),
} as const;

export type CustomerMenuModel = {
  [K in keyof typeof CustomerMenuModel]: UnwrapSchema<
    (typeof CustomerMenuModel)[K]
  >;
};