import { z } from "zod";

export const registerOrganizationSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    phone: z
        .string()
        .regex(/^[0-9+\-\s()]+$/)
        .min(8)
        .max(20)
        .optional(),
    address: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    country: z.string().length(2).default("TH"),
    currency: z.string().length(3).default("THB"),
    defaultLanguage: z.enum(["en", "th", "mm", "sh"]).default("th"),
});

export const approveOrganizationSchema = z.object({
    approvedBy: z.string().optional(),
});

export const rejectOrganizationSchema = z.object({
    reason: z.string().min(10).max(500),
});
