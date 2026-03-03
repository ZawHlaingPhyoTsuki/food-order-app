import { type NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { updateTableSchema } from "@/lib/validations/table";

async function verifyTableOwnership(tableId: string, userId: string) {
    const table = await prisma.table.findFirst({
        where: {
            id: tableId,
            organization: {
                ownerId: userId,
            },
        },
    });

    if (!table) {
        throw new ApiError("Table not found", 404);
    }

    return table;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const table = await verifyTableOwnership(params.id, session.user.id);

        return NextResponse.json(table);
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        await verifyTableOwnership(params.id, session.user.id);

        const body = await request.json();
        const data = updateTableSchema.parse(body);

        const updated = await prisma.table.update({
            where: { id: params.id },
            data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleError(error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const table = await verifyTableOwnership(params.id, session.user.id);

        // Clear any active sessions
        await redis.del(`session:${table.tableToken}`);

        await prisma.table.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleError(error);
    }
}
