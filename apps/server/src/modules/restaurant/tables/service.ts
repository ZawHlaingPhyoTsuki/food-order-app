import { prisma } from "@/libs/prisma";
import { redis } from "@/libs/redis";
import { generateTableUrl } from "@/utils/qr";
import { status } from "elysia";
import type { TableModel } from "./model";

export abstract class TableService {
  /**
   * Get all tables for an organization
   */
  static async getAll(organizationId: string) {
    const tables = await prisma.table.findMany({
      where: { organizationId },
      orderBy: { tableNumber: "asc" },
      include: {
        organization: {
          select: { slug: true },
        },
      },
    });

    return tables.map((table) => ({
      ...table,
      qrUrl: generateTableUrl(table.organization.slug, table.tableToken),
    }));
  }

  /**
   * Get a single table
   */
  static async getById(tableId: string, organizationId: string) {
    const table = await prisma.table.findFirst({
      where: { id: tableId, organizationId },
      include: {
        organization: { select: { slug: true } },
        _count: { select: { orders: true } },
      },
    });

    if (!table) {
      throw status(404, "Table not found");
    }

    return {
      ...table,
      qrUrl: generateTableUrl(table.organization.slug, table.tableToken),
    };
  }

  /**
   * Create a new table
   */
  static async create(
    organizationId: string,
    data: TableModel["createBody"],
  ) {
    // Check duplicate table number
    const existing = await prisma.table.findUnique({
      where: {
        organizationId_tableNumber: {
          organizationId,
          tableNumber: data.tableNumber,
        },
      },
    });

    if (existing) {
      throw status(400, "Table number already exists");
    }

    const table = await prisma.table.create({
      data: {
        organizationId,
        tableNumber: data.tableNumber,
      },
      include: {
        organization: { select: { slug: true } },
      },
    });

    const qrUrl = generateTableUrl(table.organization.slug, table.tableToken);

    return {
      success: true,
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
        tableToken: table.tableToken,
        status: table.status,
        qrUrl,
      },
    };
  }

  /**
   * Update a table
   */
  static async update(
    tableId: string,
    organizationId: string,
    data: TableModel["updateBody"],
  ) {
    const existing = await prisma.table.findFirst({
      where: { id: tableId, organizationId },
    });

    if (!existing) {
      throw status(404, "Table not found");
    }

    // If changing table number, check for duplicates
    if (data.tableNumber && data.tableNumber !== existing.tableNumber) {
      const duplicate = await prisma.table.findUnique({
        where: {
          organizationId_tableNumber: {
            organizationId,
            tableNumber: data.tableNumber,
          },
        },
      });

      if (duplicate) {
        throw status(400, "Table number already exists");
      }
    }

    return await prisma.table.update({
      where: { id: tableId },
      data,
    });
  }

  /**
   * Delete a table
   */
  static async delete(tableId: string, organizationId: string) {
    const table = await prisma.table.findFirst({
      where: { id: tableId, organizationId },
    });

    if (!table) {
      throw status(404, "Table not found");
    }

    // Clear Redis session if exists
    await redis.del(`session:${table.tableToken}`);

    await prisma.table.delete({
      where: { id: tableId },
    });

    return { success: true, message: "Table deleted successfully" };
  }

  /**
   * Regenerate QR token for a table
   */
  static async regenerateQR(tableId: string, organizationId: string) {
    const table = await prisma.table.findFirst({
      where: { id: tableId, organizationId },
    });

    if (!table) {
      throw status(404, "Table not found");
    }

    // Clear old Redis session
    await redis.del(`session:${table.tableToken}`);

    const newToken = crypto.randomUUID();
    const updated = await prisma.table.update({
      where: { id: tableId },
      data: { tableToken: newToken },
      include: { organization: { select: { slug: true } } },
    });

    const qrUrl = generateTableUrl(
      updated.organization.slug,
      updated.tableToken,
    );

    return {
      success: true,
      newToken: updated.tableToken,
      qrUrl,
    };
  }

  /**
   * Clear a table (end dining session)
   */
  static async clearTable(tableId: string, organizationId: string) {
    const table = await prisma.table.findFirst({
      where: { id: tableId, organizationId },
    });

    if (!table) {
      throw status(404, "Table not found");
    }

    // Clear Redis session
    await redis.del(`session:${table.tableToken}`);

    await prisma.table.update({
      where: { id: tableId },
      data: { status: "FREE" },
    });

    return { success: true, message: "Table cleared successfully" };
  }
}
