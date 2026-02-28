// import { prisma } from "@/libs/prisma";
// import Elysia from "elysia";

// export const tables = new Elysia({ prefix: "/tables" })
//   // Get all tables of the restaurant

//   .get("/", async () => {
//     // owner: { organizationId: string; organizationSlug: string }
//     const tables = await prisma.table.findMany({
//       where: { organizationId: "testing" },
//       orderBy: { createdAt: "desc" },
//     });
//     return tables;
//   });
