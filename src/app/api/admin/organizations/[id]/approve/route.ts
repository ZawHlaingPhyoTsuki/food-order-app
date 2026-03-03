import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { error, session } = await requireAdmin(request);
        if (error) return error;

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
                `Organization status is "${org.status}", cannot approve`,
                400,
            );
        }

        const approved = await prisma.organization.update({
            where: { id },
            data: {
                status: "ACTIVE",
                approvedAt: new Date(),
                approvedBy: session.user.id,
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

        // TODO: Send approval email
        // await sendEmail({
        //   to: approved.owner.email,
        //   subject: 'Restaurant Approved!',
        //   text: `Congratulations! Your restaurant "${approved.name}" has been approved.`
        // })

        return NextResponse.json(approved);
    } catch (error) {
        return handleError(error);
    }
}
