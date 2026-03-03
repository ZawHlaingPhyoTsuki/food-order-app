import { prisma } from "@/libs/prisma";
import { status } from "elysia";
import type { ProfileModel } from "./model";

export abstract class ProfileService {
  /**
   * Get organization profile
   */
  static async getProfile(organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tables: true,
            menuItems: true,
            menuCategories: true,
            orders: true,
          },
        },
      },
    });

    if (!org) {
      throw status(404, "Organization not found");
    }

    return org;
  }

  /**
   * Update organization profile
   */
  static async updateProfile(
    organizationId: string,
    data: ProfileModel["updateBody"],
  ) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw status(404, "Organization not found");
    }

    return await prisma.organization.update({
      where: { id: organizationId },
      data,
    });
  }

  /**
   * Get organization dashboard stats
   */
  static async getDashboardStats(organizationId: string) {
    const [
      totalTables,
      occupiedTables,
      totalMenuItems,
      totalOrders,
      todayOrders,
      pendingOrders,
      preparingOrders,
    ] = await Promise.all([
      prisma.table.count({ where: { organizationId } }),
      prisma.table.count({
        where: { organizationId, status: "OCCUPIED" },
      }),
      prisma.menuItem.count({
        where: { organizationId, isAvailable: true },
      }),
      prisma.order.count({ where: { organizationId } }),
      prisma.order.count({
        where: {
          organizationId,
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.order.count({
        where: { organizationId, status: "PENDING" },
      }),
      prisma.order.count({
        where: { organizationId, status: "PREPARING" },
      }),
    ]);

    return {
      tables: { total: totalTables, occupied: occupiedTables },
      menu: { totalItems: totalMenuItems },
      orders: {
        total: totalOrders,
        today: todayOrders,
        pending: pendingOrders,
        preparing: preparingOrders,
      },
    };
  }
}
