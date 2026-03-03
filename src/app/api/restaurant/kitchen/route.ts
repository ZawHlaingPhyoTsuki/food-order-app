import { type NextRequest, NextResponse } from "next/server";
import type { OrderStatus } from "@/app/generated/prisma/enums";
import { requireOwner } from "@/lib/api/auth";
import { handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

async function getOwnerOrganization(userId: string) {
    const org = await prisma.organization.findFirst({
        where: { ownerId: userId, status: "ACTIVE" },
    });
    if (!org) throw new Error("No active organization");
    return org;
}

export async function GET(request: NextRequest) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const org = await getOwnerOrganization(session.user.id);

        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get("status");

        const orders = await prisma.order.findMany({
            where: {
                organizationId: org.id,
                status: statusFilter
                    ? { in: statusFilter.split(",") as OrderStatus[] }
                    : { in: ["PENDING", "PREPARING", "READY"] },
            },
            include: {
                table: {
                    select: {
                        tableNumber: true,
                    },
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
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(orders);
    } catch (error) {
        return handleError(error);
    }
}
