import { NextResponse } from "next/server";
import { treeifyError, ZodError } from "zod";
import { Prisma } from "@/app/generated/prisma/client";

export function handleError(error: unknown) {
    console.error("API Error:", error);

    // Zod validation error
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: "Validation failed",
                details: treeifyError(error),
            },
            { status: 400 },
        );
    }

    // Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Resource already exists" },
                { status: 409 },
            );
        }
        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Resource not found" },
                { status: 404 },
            );
        }
    }

    // Custom error with status
    if (error instanceof Error && "status" in error) {
        return NextResponse.json(
            { error: error.message },
            { status: (error as any).status },
        );
    }

    // Generic error
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
    );
}

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number = 500,
    ) {
        super(message);
        this.name = "ApiError";
    }
}
