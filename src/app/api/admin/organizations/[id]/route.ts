import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;

    try {
        const { error } = await requireAdmin(request);
        if (error) return error;

        const organization = await prisma.organization.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
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
        });

        if (!organization) {
            throw new ApiError("Organization not found", 404);
        }

        return NextResponse.json(organization);
    } catch (error) {
        return handleError(error);
    }
}
