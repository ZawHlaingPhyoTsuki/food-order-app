import { type NextRequest, NextResponse } from "next/server";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ tableToken: string }> },
) {
    const { tableToken } = await params;

    try {
        // Find table
        const table = await prisma.table.findUnique({
            where: { tableToken },
            include: {
                organization: {
                    select: {
                        id: true,
                        slug: true,
                        status: true,
                    },
                },
            },
        });

        if (!table) {
            throw new ApiError("Invalid table code", 404);
        }

        if (table.organization.status !== "ACTIVE") {
            throw new ApiError("Restaurant is currently inactive", 400);
        }

        // Check for existing session
        const existingSession = await redis.get(`session:${tableToken}`);

        if (existingSession) {
            return NextResponse.json(JSON.parse(existingSession as string));
        }

        // Create new session
        const sessionId = crypto.randomUUID();
        const session = {
            sessionId,
            tableToken,
            tableNumber: table.tableNumber,
            tableId: table.id,
            organizationId: table.organizationId,
            organizationSlug: table.organization.slug,
            createdAt: new Date().toISOString(),
        };

        // Store in Redis with 30min expiry
        await redis.setex(
            `session:${tableToken}`,
            1800, // 30 minutes
            JSON.stringify(session),
        );

        // Update table status
        await prisma.table.update({
            where: { id: table.id },
            data: { status: "OCCUPIED" },
        });

        return NextResponse.json(session);
    } catch (error) {
        return handleError(error);
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tableToken: string }> },
) {
    const { tableToken } = await params;

    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            throw new ApiError("Session ID required", 400);
        }

        const session = await redis.get(`session:${tableToken}`);

        if (!session) {
            return NextResponse.json({
                isActive: false,
                message: "Session expired",
            });
        }

        const parsed = JSON.parse(session as string);

        if (parsed.sessionId !== sessionId) {
            return NextResponse.json({
                isActive: false,
                message: "Invalid session",
            });
        }

        return NextResponse.json({
            isActive: true,
            session: parsed,
            expiresAt: new Date(Date.now() + 1800000).toISOString(),
        });
    } catch (error) {
        return handleError(error);
    }
}
