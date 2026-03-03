import { type NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/app/generated/prisma/client";
import type { OrgStatus } from "@/app/generated/prisma/enums";
import { requireAdmin } from "@/lib/api/auth";
import { handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { error } = await requireAdmin(request);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as OrgStatus | null;
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const skip = (page - 1) * limit;

        const where: Prisma.OrganizationWhereInput = status
            ? { status: status }
            : {};

        const [organizations, total] = await Promise.all([
            prisma.organization.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
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
                            orders: true,
                        },
                    },
                },
            }),
            prisma.organization.count({ where }),
        ]);

        return NextResponse.json({
            organizations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: skip + limit < total,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        return handleError(error);
    }
}
