import { z } from "zod";

export const createCategorySchema = z.object({
    name: z.string().min(1).max(100),
    nameEn: z.string().max(100).optional(),
    nameTh: z.string().max(100).optional(),
    nameMm: z.string().max(100).optional(),
    nameSh: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    displayOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().default(true),
});

export const createMenuItemSchema = z.object({
    name: z.string().min(1).max(100),
    nameEn: z.string().max(100).optional(),
    nameTh: z.string().max(100).optional(),
    nameMm: z.string().max(100).optional(),
    nameSh: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    image: z.url().optional(),
    price: z.number().int().min(0),
    categoryId: z.string(),
    isAvailable: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    displayOrder: z.number().int().min(0).optional(),
});
