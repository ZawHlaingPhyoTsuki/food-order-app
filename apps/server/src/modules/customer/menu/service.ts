import { prisma } from "@/libs/prisma";
import { status } from "elysia";

export abstract class CustomerMenuService {
  /**
   * Get the full menu for a restaurant (public, no auth needed)
   * Only returns active categories and available items
   */
  static async getMenu(orgSlug: string) {
    const organization = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        currency: true,
        defaultLanguage: true,
        logo: true,
      },
    });

    if (!organization) {
      throw status(404, "Restaurant not found");
    }

    if (organization.status !== "ACTIVE") {
      throw status(400, "This restaurant is not currently accepting orders");
    }

    const categories = await prisma.menuCategory.findMany({
      where: {
        organizationId: organization.id,
        isActive: true,
      },
      orderBy: { displayOrder: "asc" },
      include: {
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
    });

    return {
      restaurant: {
        name: organization.name,
        slug: organization.slug,
        currency: organization.currency,
        defaultLanguage: organization.defaultLanguage,
        logo: organization.logo,
      },
      categories,
    };
  }

  /**
   * Get a single menu item detail
   */
  static async getMenuItem(orgSlug: string, itemId: string) {
    const organization = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      select: { id: true, status: true },
    });

    if (!organization || organization.status !== "ACTIVE") {
      throw status(404, "Restaurant not found");
    }

    const item = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        organizationId: organization.id,
        isAvailable: true,
      },
      include: {
        category: {
          select: { name: true, nameEn: true, nameTh: true },
        },
      },
    });

    if (!item) {
      throw status(404, "Menu item not found");
    }

    return item;
  }
}