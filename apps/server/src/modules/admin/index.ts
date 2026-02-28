import Elysia, { t } from "elysia";
import { authMacro } from "@/libs/auth";
import { adminPlugin } from "@/plugins/admin";
import { AdminService } from "./service";
import { AdminModel } from "./model";

export const admin = new Elysia({ prefix: "/api/admin", tags: ["admin"] })
  .use(authMacro)
  .use(adminPlugin)

  // Get platform statistics
  .get(
    "/stats",
    async () => {
      return await AdminService.getPlatformStats();
    },
    {
      admin: true,
    }
  )

  // Get all pending organizations
  .get(
    "/organizations/pending",
    async () => {
      return await AdminService.getPendingOrganizations();
    },
    {
      admin: true,
      response: {
        200: t.Array(AdminModel.organizationResponse),
      },
    }
  )

  // List all organizations with pagination
  .get(
    "/organizations",
    async ({ query }) => {
      return await AdminService.getAllOrganizations(
        query.status,
        query.page,
        query.limit
      );
    },
    {
      admin: true,
      query: AdminModel.organizationsQuery,
      response: {
        200: AdminModel.organizationListResponse,
        500: AdminModel.errorResponse,
      },
    }
  )

  // Get single organization
  .get(
    "/organizations/:id",
    async ({ params }) => {
      return await AdminService.getOrganizationById(params.id);
    },
    {
      admin: true,
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // Approve an organization
  .post(
    "/organizations/:id/approve",
    async ({ params, user }) => {
      return await AdminService.approveOrganization(params.id, user.id);
    },
    {
      admin: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: AdminModel.organizationResponse,
        400: t.String(),
        404: t.String(),
      },
    }
  )

  // Reject an organization
  .post(
    "/organizations/:id/reject",
    async ({ params, body }) => {
      return await AdminService.rejectOrganization(params.id, body.reason);
    },
    {
      admin: true,
      params: t.Object({
        id: t.String(),
      }),
      body: AdminModel.rejectBody,
      response: {
        200: AdminModel.organizationResponse,
        400: t.String(),
        404: t.String(),
      },
    }
  )

  // Suspend an organization
  .post(
    "/organizations/:id/suspend",
    async ({ params, body }) => {
      return await AdminService.suspendOrganization(
        params.id,
        body?.reason
      );
    },
    {
      admin: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        reason: t.Optional(t.String()),
      }),
    }
  )

  // Reactivate a suspended organization
  .post(
    "/organizations/:id/reactivate",
    async ({ params }) => {
      return await AdminService.reactivateOrganization(params.id);
    },
    {
      admin: true,
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // Get admin profile
  .get(
    "/profile",
    async ({ user }) => {
      return await AdminService.getAdminProfile(user.id);
    },
    {
      auth: true,
      response: {
        200: AdminModel.userResponse,
        404: t.String(),
      },
    }
  )

  // Update user role to admin (testing only - remove in production)
  .post(
    "/user/make-admin",
    async ({ user }) => {
      return await AdminService.updateUserRole(user.id, "SUPER_ADMIN");
    },
    {
      auth: true,
      response: {
        200: AdminModel.userResponse,
      },
    }
  );


// ## 📊 API Endpoints Summary
// ```
// GET    /api/admin/stats                          # Platform statistics
// GET    /api/admin/organizations/pending          # Pending approvals
// GET    /api/admin/organizations                  # List all (paginated)
// GET    /api/admin/organizations/:id              # Get single org
// POST   /api/admin/organizations/:id/approve      # Approve org
// POST   /api/admin/organizations/:id/reject       # Reject org (with reason)
// POST   /api/admin/organizations/:id/suspend      # Suspend org
// POST   /api/admin/organizations/:id/reactivate   # Reactivate suspended org
// GET    /api/admin/profile                        # Get admin profile
// POST   /api/admin/user/make-admin                # Make user admin (testing)