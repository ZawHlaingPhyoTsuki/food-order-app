import { type NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { requireOwner } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";
import { createTableSchema } from "@/lib/validations/table";

async function getOwnerOrganization(userId: string) {
    const org = await prisma.organization.findFirst({
        where: { ownerId: userId, status: "ACTIVE" },
    });

    if (!org) {
        throw new ApiError("No active organization found", 404);
    }

    return org;
}

export async function GET(request: NextRequest) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const org = await getOwnerOrganization(session.user.id);

        const tables = await prisma.table.findMany({
            where: { organizationId: org.id },
            orderBy: { tableNumber: "asc" },
        });

        return NextResponse.json(tables);
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { error, session } = await requireOwner(request);
        if (error) return error;

        const org = await getOwnerOrganization(session.user.id);

        const body = await request.json();
        const data = createTableSchema.parse(body);

        // Check for duplicate
        const existing = await prisma.table.findUnique({
            where: {
                organizationId_tableNumber: {
                    organizationId: org.id,
                    tableNumber: data.tableNumber,
                },
            },
        });

        if (existing) {
            throw new ApiError("Table number already exists", 409);
        }

        // Create table
        const table = await prisma.table.create({
            data: {
                organizationId: org.id,
                tableNumber: data.tableNumber,
            },
        });

        // Generate QR code
        const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/menu/${org.slug}/${table.tableToken}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
            width: 300,
            margin: 2,
        });

        return NextResponse.json({
            success: true,
            table,
            qrCodeUrl: qrCodeDataUrl,
        });
    } catch (error) {
        return handleError(error);
    }
}
