import { type NextRequest, NextResponse } from "next/server";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tableToken: string }> },
) {
    const { tableToken } = await params;

    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            throw new ApiError("Session ID required", 400);
        }

        const orders = await prisma.order.findMany({
            where: {
                tableToken,
                sessionId,
                status: { not: "PAID" },
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
                                price: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        const total = orders.reduce((sum, order) => sum + order.total, 0);
        const subtotal = orders.reduce((sum, order) => sum + order.subtotal, 0);
        const taxAmount = orders.reduce(
            (sum, order) => sum + order.taxAmount,
            0,
        );
        const serviceAmount = orders.reduce(
            (sum, order) => sum + order.serviceAmount,
            0,
        );

        return NextResponse.json({
            orders,
            summary: {
                subtotal,
                taxAmount,
                serviceAmount,
                total,
            },
            isPaid: orders.length === 0,
        });
    } catch (error) {
        return handleError(error);
    }
}
