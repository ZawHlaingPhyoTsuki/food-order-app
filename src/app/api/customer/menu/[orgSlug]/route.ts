import { type NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ orgSlug: string }> },
) {
    const { orgSlug } = await params;

    try {
        const organization = await prisma.organization.findUnique({
            where: {
                slug: orgSlug,
                status: "ACTIVE",
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                logo: true,
                currency: true,
                defaultLanguage: true,
                menuCategories: {
                    where: { isActive: true },
                    orderBy: { displayOrder: "asc" },
                    select: {
                        id: true,
                        name: true,
                        nameEn: true,
                        nameTh: true,
                        nameMm: true,
                        nameSh: true,
                        description: true,
                        displayOrder: true,
                        menuItems: {
                            where: { isAvailable: true },
                            orderBy: { displayOrder: "asc" },
                            select: {
                                id: true,
                                name: true,
                                nameEn: true,
                                nameTh: true,
                                nameMm: true,
                                nameSh: true,
                                description: true,
                                image: true,
                                price: true,
                                isFeatured: true,
                            },
                        },
                    },
                },
            },
        });

        if (!organization) {
            return NextResponse.json(
                { error: "Restaurant not found or inactive" },
                { status: 404 },
            );
        }

        return NextResponse.json(organization);
    } catch (error) {
        return handleError(error);
    }
}
