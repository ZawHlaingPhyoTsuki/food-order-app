import { prisma } from "@/libs/prisma";
import { redis } from "@/libs/redis";
import { status } from "elysia";
import type { OrderStatus } from "@/generated/prisma/enums";

export abstract class RestaurantOrderService {
  /**
   * Get all orders for organization with filtering and pagination
   */
  static async getAll(
    organizationId: string,
    statusFilter?: OrderStatus,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          organizationId,
          ...(statusFilter && { status: statusFilter }),
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              menuItem: {
                select: { name: true, nameEn: true, nameTh: true },
              },
            },
          },
          table: {
            select: { tableNumber: true },
          },
        },
      }),
      prisma.order.count({
        where: {
          organizationId,
          ...(statusFilter && { status: statusFilter }),
        },
      }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get single order
   */
  static async getById(orderId: string, organizationId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                nameEn: true,
                nameTh: true,
                image: true,
              },
            },
          },
        },
        table: {
          select: { tableNumber: true, status: true },
        },
      },
    });

    if (!order) {
      throw status(404, "Order not found");
    }

    return order;
  }

  /**
   * Update order status
   */
  static async updateStatus(
    orderId: string,
    organizationId: string,
    newStatus: OrderStatus,
  ) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId },
    });

    if (!order) {
      throw status(404, "Order not found");
    }

    const updateData: Record<string, unknown> = { status: newStatus };

    if (newStatus === "SERVED") {
      updateData.servedAt = new Date();
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            menuItem: { select: { name: true } },
          },
        },
        table: { select: { tableNumber: true } },
      },
    });

    // Update Redis order cache
    await redis.set(`order:${orderId}`, JSON.stringify(updated), { ex: 300 });

    // Remove from kitchen queue if served/paid/cancelled
    if (["SERVED", "PAID", "CANCELLED"].includes(newStatus)) {
      await redis.zrem(`kitchen:${organizationId}`, orderId);
    }

    return updated;
  }

  /**
   * Mark order as paid
   */
  static async markPaid(
    orderId: string,
    organizationId: string,
    paymentMethod: string,
  ) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId },
    });

    if (!order) {
      throw status(404, "Order not found");
    }

    if (order.isPaid) {
      throw status(400, "Order is already paid");
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        isPaid: true,
        paidAt: new Date(),
        paymentMethod,
      },
    });

    // Remove from kitchen queue
    await redis.zrem(`kitchen:${organizationId}`, orderId);

    // Clear order cache
    await redis.del(`order:${orderId}`);

    return updated;
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(orderId: string, organizationId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId },
    });

    if (!order) {
      throw status(404, "Order not found");
    }

    if (order.status === "PAID") {
      throw status(400, "Cannot cancel a paid order");
    }

    if (order.status === "CANCELLED") {
      throw status(400, "Order is already cancelled");
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    // Remove from kitchen queue and cache
    await redis.zrem(`kitchen:${organizationId}`, orderId);
    await redis.del(`order:${orderId}`);

    return updated;
  }

  /**
   * Get today's order summary
   */
  static async getTodaySummary(organizationId: string) {
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const [orders, revenue] = await Promise.all([
      prisma.order.groupBy({
        by: ["status"],
        where: {
          organizationId,
          createdAt: { gte: todayStart },
        },
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          organizationId,
          createdAt: { gte: todayStart },
          isPaid: true,
        },
        _sum: { total: true },
      }),
    ]);

    return {
      orders: orders.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      totalRevenue: revenue._sum.total || 0,
    };
  }
}
