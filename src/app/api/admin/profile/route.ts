import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { error, session } = await requireAdmin(request);
        if (error) return error;

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        return NextResponse.json(user);
    } catch (error) {
        return handleError(error);
    }
}
