import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { UserRole } from "../../prisma/generated/enums";
import prisma from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: [UserRole.OWNER, UserRole.SUPER_ADMIN],
                default: UserRole.OWNER,
                required: false,
            },
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    advanced: {
        defaultCookieAttributes: {
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
        },
    },
});
