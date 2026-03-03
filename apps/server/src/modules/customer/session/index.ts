import { Elysia, t } from "elysia";
import { SessionService } from "./service";
import { SessionModel } from "./model";

export const customerSession = new Elysia({
  prefix: "/session",
  tags: ["customer-session"],
})

  // Validate QR and create/get session
  .post(
    "/:orgSlug/:tableToken",
    async ({ params }) => {
      return await SessionService.validateAndCreateSession(
        params.orgSlug,
        params.tableToken,
      );
    },
    {
      params: SessionModel.validateParams,
    },
  )

  // Get current session
  .get(
    "/:tableToken",
    async ({ params }) => {
      return await SessionService.getSession(params.tableToken);
    },
    {
      params: t.Object({
        tableToken: t.String(),
      }),
    },
  )

  // End session
  .post(
    "/:tableToken/end",
    async ({ params }) => {
      return await SessionService.endSession(params.tableToken);
    },
    {
      params: t.Object({
        tableToken: t.String(),
      }),
    },
  );