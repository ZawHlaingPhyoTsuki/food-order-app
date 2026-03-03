import { type NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

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

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;

    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const item = await verifyItemOwnership(id, session.user.id);

        const updated = await prisma.menuItem.update({
            where: { id },
            data: { isAvailable: !item.isAvailable },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleError(error);
    }
}
