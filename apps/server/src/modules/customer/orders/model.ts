import { t, type UnwrapSchema } from "elysia";

export const CustomerOrderModel = {
  placeOrderBody: t.Object({
    tableToken: t.String(),
    items: t.Array(
      t.Object({
        menuItemId: t.String(),
        quantity: t.Number({ minimum: 1, maximum: 99 }),
        specialRequest: t.Optional(t.String({ maxLength: 200 })),
      }),
      { minItems: 1 },
    ),
    notes: t.Optional(t.String({ maxLength: 500 })),
  }),

  orderStatusParams: t.Object({
    orderId: t.String(),
  }),

  errorResponse: t.Object({
    error: t.String(),
  }),
} as const;

export type CustomerOrderModel = {
  [K in keyof typeof CustomerOrderModel]: UnwrapSchema<
    (typeof CustomerOrderModel)[K]
  >;
};