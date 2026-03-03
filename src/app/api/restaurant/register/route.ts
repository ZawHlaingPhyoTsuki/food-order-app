import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError, handleError } from "@/lib/api/error-handler";
import prisma from "@/lib/prisma";
import { registerOrganizationSchema } from "@/lib/validations/organization";

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.organization.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!existing) return slug;

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

export async function POST(request: NextRequest) {
    try {
        const { error, session } = await requireAuth(request);
        if (error) return error;

        const body = await request.json();
        const data = registerOrganizationSchema.parse(body);

        // Check if user already owns an organization
        const existingOrg = await prisma.organization.findFirst({
            where: { ownerId: session.user.id },
        });

        if (existingOrg) {
            if (existingOrg.status === "PENDING") {
                throw new ApiError(
                    `You already have a pending application for "${existingOrg.name}". Please wait for admin approval.`,
                    400,
                );
            }
            throw new ApiError(
                `You already own a restaurant: "${existingOrg.name}".`,
                400,
            );
        }

        // Generate unique slug
        const baseSlug = generateSlug(data.name);
        const uniqueSlug = await ensureUniqueSlug(baseSlug);

        // Create organization
        const organization = await prisma.organization.create({
            data: {
                name: data.name.trim(),
                slug: uniqueSlug,
                description: data.description?.trim(),
                phone: data.phone?.trim(),
                address: data.address?.trim(),
                city: data.city?.trim(),
                country: data.country,
                currency: data.currency,
                defaultLanguage: data.defaultLanguage,
                ownerId: session.user.id,
                status: "PENDING",
            },
            select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            message:
                "Restaurant application submitted successfully. An admin will review it within 24 hours.",
            organization,
        });
    } catch (error) {
        return handleError(error);
    }
}
