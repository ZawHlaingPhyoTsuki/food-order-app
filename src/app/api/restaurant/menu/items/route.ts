import { type NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";
import { createMenuItemSchema } from "@/lib/validations/menu";

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
        const categoryId = searchParams.get("categoryId");
        const search = searchParams.get("search");

        const items = await prisma.menuItem.findMany({
            where: {
                organizationId: org.id,
                ...(categoryId && { categoryId }),
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { nameEn: { contains: search, mode: "insensitive" } },
                        { nameTh: { contains: search, mode: "insensitive" } },
                        {
                            description: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }),
            },
            orderBy: [{ categoryId: "asc" }, { displayOrder: "asc" }],
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        nameEn: true,
                        nameTh: true,
                    },
                },
            },
        });

        return NextResponse.json(items);
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
        const data = createMenuItemSchema.parse(body);

        // Verify category belongs to organization
        const category = await prisma.menuCategory.findFirst({
            where: {
                id: data.categoryId,
                organizationId: org.id,
            },
        });

        if (!category) {
            throw new ApiError("Category not found", 404);
        }

        // Get max displayOrder in category
        const maxOrder = await prisma.menuItem.findFirst({
            where: {
                organizationId: org.id,
                categoryId: data.categoryId,
            },
            orderBy: { displayOrder: "desc" },
            select: { displayOrder: true },
        });

        const item = await prisma.menuItem.create({
            data: {
                organizationId: org.id,
                displayOrder: (maxOrder?.displayOrder || 0) + 1,
                ...data,
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(item);
    } catch (error) {
        return handleError(error);
    }
}
