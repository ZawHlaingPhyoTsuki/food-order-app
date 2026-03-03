import { prisma } from "@/libs/prisma";
import { redis } from "@/libs/redis";
import { status } from "elysia";
import type { CustomerOrderModel } from "./model";

const ORDER_CACHE_TTL = 300; // 5 minutes

export abstract class CustomerOrderService {
  /**
   * Place a new order
   * Core order flow: validate -> save to DB -> push to Redis kitchen queue -> cache
   */
  static async placeOrder(body: CustomerOrderModel["placeOrderBody"]) {
    const { tableToken, items, notes } = body;

    // 1. Validate session exists
    const sessionKey = "session:" + tableToken;
    const session = await redis.get<{
      sessionId: string;
      tableId: string;
      organizationId: string;
    }>(sessionKey);

    if (!session) {
      throw status(400, "No active session. Please scan the QR code again.");
    }

    // 2. Validate all menu items exist and are available
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        organizationId: session.organizationId,
        isAvailable: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw status(400, "Some menu items are not available");
    }

    // 3. Calculate pricing
    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));
    let subtotal = 0;

    const orderItems = items.map((item) => {
      const menuItem = menuItemMap.get(item.menuItemId)!;
      const totalPrice = menuItem.price * item.quantity;
      subtotal += totalPrice;

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice,
        specialRequest: item.specialRequest,
      };
    });

    // Simple tax calculation (7% VAT for Thailand)
    const taxAmount = Math.round(subtotal * 0.07);
    const serviceAmount = 0;
    const total = subtotal + taxAmount + serviceAmount;

    // 4. Generate order number (sequential per org per day)
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const todayOrderCount = await prisma.order.count({
      where: {
        organizationId: session.organizationId,
        createdAt: { gte: todayStart },
      },
    });
    const orderNumber = todayOrderCount + 1;

    // 5. Create order in database
    const order = await prisma.order.create({
      data: {
        sessionId: session.sessionId,
        tableToken,
        tableId: session.tableId,
        organizationId: session.organizationId,
        status: "PENDING",
        orderNumber,
        subtotal,
        taxAmount,
        serviceAmount,
        total,
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: { name: true, nameEn: true, nameTh: true, image: true },
            },
          },
        },
        table: { select: { tableNumber: true } },
      },
    });

    // 6. Push to Redis kitchen queue (ZSET scored by timestamp)
    await redis.zadd("kitchen:" + session.organizationId, {
      score: Date.now(),
      member: order.id,
    });

    // 7. Cache the order
    await redis.set("order:" + order.id, JSON.stringify(order), {
      ex: ORDER_CACHE_TTL,
    });

    // 8. Refresh session TTL
    await redis.expire(sessionKey, 1800);

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        items: order.items,
        createdAt: order.createdAt,
      },
    };
  }

  /**
   * Get order status (with Redis cache)
   */
  static async getOrderStatus(orderId: string) {
    // Try cache first
    const cached = await redis.get<string>("order:" + orderId);
    if (cached) {
      const order = typeof cached === "string" ? JSON.parse(cached) : cached;
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        servedAt: order.servedAt,
      };
    }

    // Fallback to DB
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        servedAt: true,
      },
    });

    if (!order) {
      throw status(404, "Order not found");
    }

    // Cache for future requests
    await redis.set("order:" + orderId, JSON.stringify(order), {
      ex: ORDER_CACHE_TTL,
    });

    return order;
  }

  /**
   * Get all orders for a session (table's order history)
   */
  static async getSessionOrders(tableToken: string) {
    const sessionKey = "session:" + tableToken;
    const session = await redis.get<{ sessionId: string }>(sessionKey);

    if (!session) {
      throw status(400, "No active session");
    }

    return await prisma.order.findMany({
      where: { sessionId: session.sessionId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            menuItem: {
              select: { name: true, nameEn: true, nameTh: true, image: true },
            },
          },
        },
      },
    });
  }
}