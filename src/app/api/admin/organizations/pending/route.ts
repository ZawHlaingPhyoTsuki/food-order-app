import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { error } = await requireAdmin(request);
        if (error) return error;

        const organizations = await prisma.organization.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "asc" }, // FIFO
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                    },
                },
            },
        });

        return NextResponse.json(organizations);
    } catch (error) {
        return handleError(error);
    }
}
