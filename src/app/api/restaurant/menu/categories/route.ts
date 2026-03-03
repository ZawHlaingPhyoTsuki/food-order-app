import { type NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";
import { createCategorySchema } from "@/lib/validations/menu";

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

        const categories = await prisma.menuCategory.findMany({
            where: { organizationId: org.id },
            orderBy: { displayOrder: "asc" },
            include: {
                _count: {
                    select: { menuItems: true },
                },
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const org = await getOwnerOrganization(session.user.id);

        const body = await request.json();
        const data = createCategorySchema.parse(body);

        // Get max displayOrder
        const maxOrder = await prisma.menuCategory.findFirst({
            where: { organizationId: org.id },
            orderBy: { displayOrder: "desc" },
            select: { displayOrder: true },
        });

        const category = await prisma.menuCategory.create({
            data: {
                organizationId: org.id,
                displayOrder: (maxOrder?.displayOrder || 0) + 1,
                ...data,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        return handleError(error);
    }
}
