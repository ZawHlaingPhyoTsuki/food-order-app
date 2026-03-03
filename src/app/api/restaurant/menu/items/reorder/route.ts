import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOwner } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

const reorderSchema = z.object({
    categoryId: z.string(),
    itemIds: z.array(z.string()).min(1),
});

async function getOwnerOrganization(userId: string) {
    const org = await prisma.organization.findFirst({
        where: { ownerId: userId, status: "ACTIVE" },
    });
    if (!org) throw new ApiError("No active organization found", 404);
    return org;
}

export async function POST(request: NextRequest) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const org = await getOwnerOrganization(session.user.id);

        const body = await request.json();
        const data = reorderSchema.parse(body);

        // Verify all items belong to organization and category
        const items = await prisma.menuItem.findMany({
            where: {
                id: { in: data.itemIds },
                organizationId: org.id,
                categoryId: data.categoryId,
            },
        });

        if (items.length !== data.itemIds.length) {
            throw new ApiError("Invalid item IDs", 400);
        }

        // Update display order in transaction
        await prisma.$transaction(
            data.itemIds.map((id, index) =>
                prisma.menuItem.update({
                    where: { id },
                    data: { displayOrder: index },
                }),
            ),
        );

        return NextResponse.json({
            success: true,
            message: "Items reordered successfully",
        });
    } catch (error) {
        return handleError(error);
    }
}
