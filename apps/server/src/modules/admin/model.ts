import { t, type UnwrapSchema } from "elysia";
import { OrganizationPlain } from "@/generated/prismabox/Organization";
import { UserPlain } from "@/generated/prismabox/User";

export const AdminModel = {
  // Query parameters
  organizationsQuery: t.Object({
    status: t.Optional(
      t.Union([
        t.Literal("PENDING"),
        t.Literal("ACTIVE"),
        t.Literal("SUSPENDED"),
        t.Literal("REJECTED"),
      ]),
    ),
    page: t.Optional(
      t.Number({
        minimum: 1,
        default: 1,
      }),
    ),
    limit: t.Optional(
      t.Number({
        minimum: 1,
        maximum: 100,
        default: 20,
      }),
    ),
  }),

  // Request bodies
  approveBody: t.Object({
    approvedBy: t.Optional(t.String()), // Admin user ID (optional, can get from session)
  }),

  rejectBody: t.Object({
    reason: t.String({ minLength: 10, maxLength: 500 }),
  }),

  // Responses
  organizationResponse: OrganizationPlain,

  organizationListResponse: t.Object({
    data: t.Array(OrganizationPlain),
    pagination: t.Object({
      page: t.Number(),
      limit: t.Number(),
      total: t.Number(),
      totalPages: t.Number(),
      hasNext: t.Boolean(),
      hasPrev: t.Boolean(),
    }),
  }),

  userResponse: UserPlain,

  errorResponse: t.Object({
    error: t.String(),
  }),

  successResponse: t.Object({
    success: t.Boolean(),
    message: t.String(),
  }),
} as const;

export type AdminModel = {
  [K in keyof typeof AdminModel]: UnwrapSchema<(typeof AdminModel)[K]>;
};
