import { type NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";
import { createCategorySchema } from "@/lib/validations/menu";

async function verifyCategoryOwnership(categoryId: string, userId: string) {
    const category = await prisma.menuCategory.findFirst({
        where: {
            id: categoryId,
            organization: { ownerId: userId },
        },
        include: {
            _count: {
                select: { menuItems: true },
            },
        },
    });

    if (!category) {
        throw new ApiError("Category not found", 404);
    }

    return category;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const { id } = await params;

        const _category = await verifyCategoryOwnership(id, session.user.id);

        const withItems = await prisma.menuCategory.findUnique({
            where: { id },
            include: {
                menuItems: {
                    orderBy: { displayOrder: "asc" },
                },
            },
        });

        return NextResponse.json(withItems);
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const { id } = await params;

        await verifyCategoryOwnership(id, session.user.id);

        const body = await request.json();
        const data = createCategorySchema.partial().parse(body);

        const updated = await prisma.menuCategory.update({
            where: { id },
            data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleError(error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const { id } = await params;

        const category = await verifyCategoryOwnership(id, session.user.id);

        if (category._count.menuItems > 0) {
            throw new ApiError(
                "Cannot delete category with menu items. Please delete or move items first.",
                400,
            );
        }

        await prisma.menuCategory.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleError(error);
    }
}
