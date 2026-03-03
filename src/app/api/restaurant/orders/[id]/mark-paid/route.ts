import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOwner } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

const markPaidSchema = z.object({
    paymentMethod: z.enum(["cash", "card", "promptpay"]),
});

async function verifyOrderOwnership(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            organization: { ownerId: userId },
        },
        include: {
            table: true,
        },
    });

    if (!order) {
        throw new ApiError("Order not found", 404);
    }

    return order;
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const order = await verifyOrderOwnership(params.id, session.user.id);

        const body = await request.json();
        const data = markPaidSchema.parse(body);

        // Update order
        const updated = await prisma.order.update({
            where: { id: params.id },
            data: {
                status: "PAID",
                isPaid: true,
                paidAt: new Date(),
                paymentMethod: data.paymentMethod,
            },
        });

        // Check if all orders for this session are paid
        const unpaidOrders = await prisma.order.count({
            where: {
                sessionId: order.sessionId,
                tableToken: order.tableToken,
                isPaid: false,
            },
        });

        // If all paid, clear session and reset table
        if (unpaidOrders === 0) {
            await redis.del(`session:${order.tableToken}`);

            await prisma.table.update({
                where: { id: order.tableId },
                data: { status: "FREE" },
            });
        }

        return NextResponse.json({
            success: true,
            order: updated,
            sessionCleared: unpaidOrders === 0,
        });
    } catch (error) {
        return handleError(error);
    }
}
