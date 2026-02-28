import { auth } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import Elysia from "elysia";

export const adminPlugin = new Elysia({ name: "admin" }).macro({
  admin: {
    resolve: async function session({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });

      if (!session) return status(401, "Unauthorized - no session");

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          role: true,
        },
      });

      if (!user) return status(404, "Not Found - User not found");

      if (user.role !== "SUPER_ADMIN")
        return status(403, "Forbidden - Not an admin");

      return {
        user: {
          ...session.user,
          role: user.role,
        },
        session: session.session,
      };
    },
  },
});
