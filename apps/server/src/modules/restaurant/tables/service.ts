// import { prisma } from "@/libs/prisma";
// import { redis } from "@/libs/redis";
// // import { generateQR } from '@/utils/qr'
// import { status } from "elysia";
// import type { TableModel } from "./model";

// export abstract class TableService {
//   static async getAll(organizationId: string) {
//     return await prisma.table.findMany({
//       where: { organizationId },
//       orderBy: { tableNumber: "asc" },
//     });
//   }

//   static async create(organizationId: string, data: TableModel["createBody"]) {
//     // Check duplicate
//     const existing = await prisma.table.findUnique({
//       where: {
//         organizationId_tableNumber: {
//           organizationId,
//           tableNumber: data.tableNumber,
//         },
//       },
//     });

//     if (existing) {
//       throw status(400, "Table number already exists");
//     }

//     // Create table
//     const table = await prisma.table.create({
//       data: {
//         organizationId,
//         tableNumber: data.tableNumber,
//       },
//       include: { organization: true },
//     });

//     // Generate QR code
//     const qrCodeUrl = await generateQR(table.organization.slug, table.tableToken);

//     return {
//       success: true,
//       table: {
//         id: table.id,
//         tableNumber: table.tableNumber,
//         tableToken: table.tableToken,
//         status: table.status,
//       },
//       qrCodeUrl,
//     };
//   }

//   static async update(tableId: string, data: TableModel["updateBody"]) {
//     return await prisma.table.update({
//       where: { id: tableId },
//       data,
//     });
//   }

//   static async delete(tableId: string) {
//     await prisma.table.delete({
//       where: { id: tableId },
//     });

//     return { success: true };
//   }

//   static async regenerateQR(tableId: string) {
//     const newToken = crypto.randomUUID();

//     const table = await prisma.table.update({
//       where: { id: tableId },
//       data: { tableToken: newToken },
//       include: { organization: true },
//     });

//     const qrCodeUrl = await generateQR(table.organization.slug, table.tableToken);

//     return {
//       success: true,
//       newToken: table.tableToken,
//       qrCodeUrl,
//     };
//   }

//   static async clearTable(tableId: string) {
//     const table = await prisma.table.findUnique({
//       where: { id: tableId },
//     });

//     if (!table) {
//       throw status(404, "Table not found");
//     }

//     // Clear Redis session
//     await redis.del(`session:${table.tableToken}`);

//     // Update status
//     await prisma.table.update({
//       where: { id: tableId },
//       data: { status: "FREE" },
//     });

//     return { success: true };
//   }
// }
