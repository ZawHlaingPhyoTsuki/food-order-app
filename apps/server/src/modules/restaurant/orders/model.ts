import { t, type UnwrapSchema } from "elysia";

export const RestaurantOrderModel = {
  ordersQuery: t.Object({
    status: t.Optional(
      t.Union([
        t.Literal("PENDING"),
        t.Literal("PREPARING"),
        t.Literal("READY"),
        t.Literal("SERVED"),
        t.Literal("PAID"),
        t.Literal("CANCELLED"),
      ]),
    ),
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  }),

  updateStatusBody: t.Object({
    status: t.Union([
      t.Literal("PENDING"),
      t.Literal("PREPARING"),
      t.Literal("READY"),
      t.Literal("SERVED"),
      t.Literal("PAID"),
      t.Literal("CANCELLED"),
    ]),
  }),

  markPaidBody: t.Object({
    paymentMethod: t.String({ default: "cash" }),
  }),

  successResponse: t.Object({
    success: t.Boolean(),
    message: t.Optional(t.String()),
  }),
} as const;

export type RestaurantOrderModel = {
  [K in keyof typeof RestaurantOrderModel]: UnwrapSchema<
    (typeof RestaurantOrderModel)[K]
  >;
};
