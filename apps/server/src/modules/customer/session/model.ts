import { t, type UnwrapSchema } from "elysia";

export const SessionModel = {
  validateParams: t.Object({
    orgSlug: t.String(),
    tableToken: t.String(),
  }),

  sessionResponse: t.Object({
    sessionId: t.String(),
    tableId: t.String(),
    tableNumber: t.String(),
    organizationId: t.String(),
    organizationName: t.String(),
  }),

  errorResponse: t.Object({
    error: t.String(),
  }),
} as const;

export type SessionModel = {
  [K in keyof typeof SessionModel]: UnwrapSchema<(typeof SessionModel)[K]>;
};