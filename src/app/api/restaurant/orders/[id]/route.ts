import { type NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

async function verifyOrderOwnership(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            organization: { ownerId: userId },
        },
    });

    if (!order) {
        throw new ApiError("Order not found", 404);
    }

    return order;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        await verifyOrderOwnership(params.id, session.user.id);

        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: {
                table: true,
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });

        return NextResponse.json(order);
    } catch (error) {
        return handleError(error);
    }
}
