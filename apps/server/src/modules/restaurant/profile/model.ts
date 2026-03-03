import { t, type UnwrapSchema } from "elysia";

export const ProfileModel = {
  updateBody: t.Partial(
    t.Object({
      name: t.String({ minLength: 2, maxLength: 100 }),
      description: t.Optional(t.String({ maxLength: 500 })),
      phone: t.Optional(t.String({ maxLength: 20 })),
      address: t.Optional(t.String({ maxLength: 200 })),
      city: t.Optional(t.String({ maxLength: 100 })),
      currency: t.Optional(t.String({ minLength: 3, maxLength: 3 })),
      defaultLanguage: t.Optional(t.String()),
      logo: t.Optional(t.String()),
    }),
  ),

  successResponse: t.Object({
    success: t.Boolean(),
    message: t.Optional(t.String()),
  }),
} as const;

export type ProfileModel = {
  [K in keyof typeof ProfileModel]: UnwrapSchema<(typeof ProfileModel)[K]>;
};
