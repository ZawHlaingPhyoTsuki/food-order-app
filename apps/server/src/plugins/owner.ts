import { auth } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import Elysia from "elysia";

export const ownerPlugin = new Elysia({ name: "owner" }).macro({
  owner: {
    resolve: async function ({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers });

      if (!session) {
        return status(401, "Unauthorized - no session");
      }

      // Check if user has at least one ACTIVE organization
      const activeOrgCount = await prisma.organization.count({
        where: {
          ownerId: session.user.id,
          status: "ACTIVE",
        },
      });

      if (activeOrgCount === 0) {
        return status(403, "Forbidden - no active organization found");
      }

      const orgs = await prisma.organization.findMany({
        where: {
          ownerId: session.user.id,
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });

      return {
        activeOrganizations: orgs,
      };
    },
  },
});
