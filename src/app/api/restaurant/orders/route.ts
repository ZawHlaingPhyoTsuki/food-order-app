import { type NextRequest, NextResponse } from "next/server";
import type { OrderStatus, Prisma } from "@/app/generated/prisma/client";
import { requireOwner } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

async function getOwnerOrganization(userId: string) {
    const org = await prisma.organization.findFirst({
        where: { ownerId: userId, status: "ACTIVE" },
    });
    if (!org) throw new ApiError("No active organization found", 404);
    return org;
}

export async function GET(request: NextRequest) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const org = await getOwnerOrganization(session.user.id);

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const date = searchParams.get("date");
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const skip = (page - 1) * limit;

        const where: Prisma.OrderWhereInput = { organizationId: org.id };

        if (status) {
            where.status = { in: status.split(",") as OrderStatus[] };
        }

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            where.createdAt = { gte: startDate, lte: endDate };
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    table: {
                        select: { tableNumber: true },
                    },
                    items: {
                        include: {
                            menuItem: {
                                select: {
                                    name: true,
                                    nameEn: true,
                                    nameTh: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.order.count({ where }),
        ]);

        return NextResponse.json({
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return handleError(error);
    }
}
