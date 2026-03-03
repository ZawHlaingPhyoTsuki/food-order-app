import { type NextRequest, NextResponse } from "next/server";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { createOrderSchema } from "@/lib/validations/order";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = createOrderSchema.parse(body);

        // Verify session exists
        const session = await redis.get(`session:${data.tableToken}`);
        if (!session) {
            throw new ApiError("Session expired or invalid", 400);
        }

        const sessionData = JSON.parse(session as string);

        if (sessionData.sessionId !== data.sessionId) {
            throw new ApiError("Invalid session", 400);
        }

        // Get table
        const table = await prisma.table.findUnique({
            where: { tableToken: data.tableToken },
        });

        if (!table) {
            throw new ApiError("Table not found", 404);
        }

        // Get menu items and calculate prices
        const menuItemIds = data.items.map((item) => item.menuItemId);
        const menuItems = await prisma.menuItem.findMany({
            where: {
                id: { in: menuItemIds },
                organizationId: table.organizationId,
                isAvailable: true,
            },
        });

        if (menuItems.length !== menuItemIds.length) {
            throw new ApiError("Some menu items not found or unavailable", 400);
        }

        // Calculate order totals
        const orderItems = data.items.map((item) => {
            const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)!;
            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPrice: menuItem.price,
                totalPrice: menuItem.price * item.quantity,
                specialRequest: item.specialRequest,
            };
        });

        const subtotal = orderItems.reduce(
            (sum, item) => sum + item.totalPrice,
            0,
        );
        const taxAmount = Math.round(subtotal * 0.07); // 7% tax
        const serviceAmount = Math.round(subtotal * 0.1); // 10% service
        const total = subtotal + taxAmount + serviceAmount;

        // Get next order number
        const lastOrder = await prisma.order.findFirst({
            where: { organizationId: table.organizationId },
            orderBy: { orderNumber: "desc" },
        });
        const orderNumber = (lastOrder?.orderNumber || 0) + 1;

        // Create order
        const order = await prisma.order.create({
            data: {
                sessionId: data.sessionId,
                tableToken: data.tableToken,
                tableId: table.id,
                organizationId: table.organizationId,
                orderNumber,
                subtotal,
                taxAmount,
                serviceAmount,
                total,
                notes: data.notes,
                status: "PENDING",
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: {
                    include: {
                        menuItem: {
                            select: {
                                id: true,
                                name: true,
                                nameEn: true,
                                nameTh: true,
                            },
                        },
                    },
                },
            },
        });

        // Add to Redis kitchen queue
        await redis.lpush(
            `kitchen:${table.organizationId}`,
            JSON.stringify(order),
        );
        await redis.expire(`kitchen:${table.organizationId}`, 900); // 15min TTL

        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
        });
    } catch (error) {
        return handleError(error);
    }
}
