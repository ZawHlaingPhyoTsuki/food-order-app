import { z } from "zod";

export const createTableSchema = z.object({
    tableNumber: z.string().min(1).max(20),
});

export const updateTableSchema = z.object({
    tableNumber: z.string().min(1).max(20).optional(),
    status: z.enum(["FREE", "OCCUPIED", "NEEDS_CLEANING"]).optional(),
});
