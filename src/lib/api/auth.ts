import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireAuth(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        return {
            error: NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            ),
            session: null,
        };
    }

    return { error: null, session };
}

export async function requireAdmin(request: NextRequest) {
    const { error, session } = await requireAuth(request);

    if (error) return { error, session: null };

    if (session.user.role !== "SUPER_ADMIN") {
        return {
            error: NextResponse.json(
                { error: "Forbidden: Admin access required" },
                { status: 403 },
            ),
            session: null,
        };
    }

    return { error: null, session };
}

export async function requireOwner(request: NextRequest) {
    const { error, session } = await requireAuth(request);

    if (error) return { error, session: null };

    if (session.user.role !== "OWNER" && session.user.role !== "SUPER_ADMIN") {
        return {
            error: NextResponse.json(
                { error: "Forbidden: Owner access required" },
                { status: 403 },
            ),
            session: null,
        };
    }

    return { error: null, session };
}
