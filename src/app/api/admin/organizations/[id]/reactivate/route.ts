import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { error } = await requireAdmin(request);
        if (error) return error;

        const { id } = await params;

        const org = await prisma.organization.findUnique({
            where: { id },
            select: { status: true },
        });

        if (!org) {
            throw new ApiError("Organization not found", 404);
        }

        if (org.status !== "SUSPENDED") {
            throw new ApiError(
                "Can only reactivate suspended organizations",
                400,
            );
        }

        const reactivated = await prisma.organization.update({
            where: { id },
            data: { status: "ACTIVE" },
        });

        return NextResponse.json(reactivated);
    } catch (error) {
        return handleError(error);
    }
}
