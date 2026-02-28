import { t, type UnwrapSchema } from "elysia";

export const RestaurantAuthModel = {
  // Register
  registerBody: t.Object({
    name: t.String({ minLength: 2, maxLength: 100 }),
    description: t.Optional(t.String({ maxLength: 500 })),
    phone: t.Optional(
      t.String({
        pattern: "^[0-9+\\-\\s()]+$", // Allow international format
        minLength: 8,
        maxLength: 20,
      }),
    ),
    address: t.Optional(t.String({ maxLength: 200 })),
    city: t.Optional(t.String({ maxLength: 100 })),
    country: t.String({
      default: "TH",
      minLength: 2,
      maxLength: 2, // ISO country code
    }),
    currency: t.String({
      default: "THB",
      minLength: 3,
      maxLength: 3, // ISO currency code
    }),
    defaultLanguage: t.String({
      default: "th",
      enum: ["en", "th", "mm", "sh"], // Supported languages
    }),
  }),

  // Response
  registerResponse: t.Object({
    success: t.Boolean(),
    message: t.String(),
    organization: t.Object({
      id: t.String(),
      name: t.String(),
      slug: t.String(),
      status: t.String(),
      createdAt: t.Date(),
    }),
  }),

  errorResponse: t.Object({
    success: t.Literal(false),
    error: t.String(),
  }),
} as const;

export type RestaurantAuthModel = {
  [K in keyof typeof RestaurantAuthModel]: UnwrapSchema<
    (typeof RestaurantAuthModel)[K]
  >;
};
