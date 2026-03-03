import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { error } = await requireAdmin(request);
        if (error) return error;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalOrgs,
            activeOrgs,
            pendingOrgs,
            suspendedOrgs,
            totalOrders,
            todayOrders,
            totalRevenue,
        ] = await Promise.all([
            prisma.organization.count(),
            prisma.organization.count({ where: { status: "ACTIVE" } }),
            prisma.organization.count({ where: { status: "PENDING" } }),
            prisma.organization.count({ where: { status: "SUSPENDED" } }),
            prisma.order.count(),
            prisma.order.count({
                where: { createdAt: { gte: today } },
            }),
            prisma.order.aggregate({
                _sum: { total: true },
                where: { isPaid: true },
            }),
        ]);

        return NextResponse.json({
            organizations: {
                total: totalOrgs,
                active: activeOrgs,
                pending: pendingOrgs,
                suspended: suspendedOrgs,
            },
            orders: {
                total: totalOrders,
                today: todayOrders,
            },
            revenue: {
                total: totalRevenue._sum.total || 0,
            },
        });
    } catch (error) {
        return handleError(error);
    }
}
