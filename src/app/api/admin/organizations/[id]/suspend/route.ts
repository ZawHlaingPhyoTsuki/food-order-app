import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

const suspendSchema = z.object({
    reason: z.string().optional(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { error } = await requireAdmin(request);
        if (error) return error;

        const body = await request.json();
        const _data = suspendSchema.parse(body);

        const { id } = await params;

        const org = await prisma.organization.findUnique({
            where: { id },
            select: { status: true },
        });

        if (!org) {
            throw new ApiError("Organization not found", 404);
        }

        if (org.status !== "ACTIVE") {
            throw new ApiError("Can only suspend active organizations", 400);
        }

        const suspended = await prisma.organization.update({
            where: { id },
            data: { status: "SUSPENDED" },
        });

        return NextResponse.json(suspended);
    } catch (error) {
        return handleError(error);
    }
}
