import { z } from "zod";

export const createOrderSchema = z.object({
    sessionId: z.string(),
    tableToken: z.string(),
    items: z
        .array(
            z.object({
                menuItemId: z.string(),
                quantity: z.number().int().min(1),
                specialRequest: z.string().max(200).optional(),
            }),
        )
        .min(1),
    notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "PENDING",
        "PREPARING",
        "READY",
        "SERVED",
        "PAID",
        "CANCELLED",
    ]),
});
