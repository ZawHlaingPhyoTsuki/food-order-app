import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";
import { rejectOrganizationSchema } from "@/lib/validations/organization";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { error } = await requireAdmin(request);
        if (error) return error;

        const body = await request.json();
        const data = rejectOrganizationSchema.parse(body);

        const { id } = await params;

        const org = await prisma.organization.findUnique({
            where: { id },
            select: { status: true, name: true },
        });

        if (!org) {
            throw new ApiError("Organization not found", 404);
        }

        if (org.status !== "PENDING") {
            throw new ApiError(
                `Organization status is "${org.status}", cannot reject`,
                400,
            );
        }

        const rejected = await prisma.organization.update({
            where: { id },
            data: {
                status: "REJECTED",
                rejectedAt: new Date(),
                rejectionReason: data.reason,
            },
            include: {
                owner: {
                    select: {
                        email: true,
                        name: true,
                    },
                },
            },
        });

        // TODO: Send rejection email
        // await sendEmail({
        //   to: rejected.owner.email,
        //   subject: 'Restaurant Application Update',
        //   text: `Unfortunately, your restaurant application has been rejected. Reason: ${data.reason}`
        // })

        return NextResponse.json(rejected);
    } catch (error) {
        return handleError(error);
    }
}
