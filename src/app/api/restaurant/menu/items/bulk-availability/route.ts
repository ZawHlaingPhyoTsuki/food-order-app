import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOwner } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

const bulkAvailabilitySchema = z.object({
    itemIds: z.array(z.string()).min(1),
    isAvailable: z.boolean(),
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
        const data = bulkAvailabilitySchema.parse(body);

        // Verify all items belong to organization
        const items = await prisma.menuItem.findMany({
            where: {
                id: { in: data.itemIds },
                organizationId: org.id,
            },
        });

        if (items.length !== data.itemIds.length) {
            throw new ApiError(
                "Some items not found or do not belong to your organization",
                400,
            );
        }

        await prisma.menuItem.updateMany({
            where: {
                id: { in: data.itemIds },
            },
            data: { isAvailable: data.isAvailable },
        });

        return NextResponse.json({
            success: true,
            message: `${data.itemIds.length} items updated successfully`,
        });
    } catch (error) {
        return handleError(error);
    }
}
