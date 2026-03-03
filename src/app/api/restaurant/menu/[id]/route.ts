import { type NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";
import { createMenuItemSchema } from "@/lib/validations/menu";

async function verifyItemOwnership(itemId: string, userId: string) {
    const item = await prisma.menuItem.findFirst({
        where: {
            id: itemId,
            organization: { ownerId: userId },
        },
    });

    if (!item) {
        throw new ApiError("Menu item not found", 404);
    }

    return item;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;

    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        await verifyItemOwnership(id, session.user.id);

        const item = await prisma.menuItem.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });

        return NextResponse.json(item);
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;

    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const item = await verifyItemOwnership(id, session.user.id);

        const body = await request.json();
        const data = createMenuItemSchema.partial().parse(body);

        // If changing category, verify it exists
        if (data.categoryId) {
            const category = await prisma.menuCategory.findFirst({
                where: {
                    id: data.categoryId,
                    organizationId: item.organizationId,
                },
            });

            if (!category) {
                throw new ApiError("Category not found", 404);
            }
        }

        const updated = await prisma.menuItem.update({
            where: { id },
            data,
            include: {
                category: true,
            },
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
    const { id } = await params;

    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        await verifyItemOwnership(id, session.user.id);

        await prisma.menuItem.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleError(error);
    }
}
