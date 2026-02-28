import { prisma } from "@/libs/prisma";
import { status } from "elysia";
import type { MenuItemModel } from "./model";

export abstract class MenuItemService {
  // Get all items for organization
  static async getAll(organizationId: string, categoryId?: string) {
    return await prisma.menuItem.findMany({
      where: {
        organizationId,
        ...(categoryId && { categoryId }),
      },
      orderBy: [{ categoryId: "asc" }, { displayOrder: "asc" }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            nameTh: true,
          },
        },
      },
    });
  }

  // Get single item
  static async getById(itemId: string, organizationId: string) {
    const item = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        organizationId,
      },
      include: {
        category: true,
      },
    });

    if (!item) {
      throw status(404, "Menu item not found");
    }

    return item;
  }

  // Create item
  static async create(
    organizationId: string,
    data: MenuItemModel["createBody"] & { categoryId: string },
  ) {
    // Verify category exists and belongs to organization
    const category = await prisma.menuCategory.findFirst({
      where: {
        id: data.categoryId,
        organizationId,
      },
    });

    if (!category) {
      throw status(404, "Category not found");
    }

    // Get max displayOrder in category
    const maxOrder = await prisma.menuItem.findFirst({
      where: {
        organizationId,
        categoryId: data.categoryId,
      },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    const item = await prisma.menuItem.create({
      data: {
        organizationId,
        displayOrder: (maxOrder?.displayOrder || 0) + 1,
        ...data,
      },
      include: {
        category: true,
      },
    });

    return item;
  }

  // Update item
  static async update(
    itemId: string,
    organizationId: string,
    data: MenuItemModel["updateBody"],
  ) {
    // Verify ownership
    const existing = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        organizationId,
      },
    });

    if (!existing) {
      throw status(404, "Menu item not found");
    }

    // If changing category, verify new category exists
    if (data.categoryId) {
      const category = await prisma.menuCategory.findFirst({
        where: {
          id: data.categoryId,
          organizationId,
        },
      });

      if (!category) {
        throw status(404, "Category not found");
      }
    }

    return await prisma.menuItem.update({
      where: { id: itemId },
      data,
      include: {
        category: true,
      },
    });
  }

  // Delete item
  static async delete(itemId: string, organizationId: string) {
    const item = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        organizationId,
      },
    });

    if (!item) {
      throw status(404, "Menu item not found");
    }

    await prisma.menuItem.delete({
      where: { id: itemId },
    });

    return { success: true, message: "Menu item deleted successfully" };
  }

  // Toggle availability
  static async toggleAvailability(itemId: string, organizationId: string) {
    const item = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        organizationId,
      },
    });

    if (!item) {
      throw status(404, "Menu item not found");
    }

    const updated = await prisma.menuItem.update({
      where: { id: itemId },
      data: { isAvailable: !item.isAvailable },
    });

    return updated;
  }

  // Bulk update availability
  static async bulkUpdateAvailability(
    organizationId: string,
    itemIds: string[],
    isAvailable: boolean,
  ) {
    // Verify all items belong to organization
    const items = await prisma.menuItem.findMany({
      where: {
        id: { in: itemIds },
        organizationId,
      },
    });

    if (items.length !== itemIds.length) {
      throw status(
        400,
        "Some items not found or do not belong to organization",
      );
    }

    await prisma.menuItem.updateMany({
      where: {
        id: { in: itemIds },
        organizationId,
      },
      data: { isAvailable },
    });

    return {
      success: true,
      message: `${itemIds.length} items updated successfully`,
    };
  }

  // Reorder items within a category
  static async reorder(
    organizationId: string,
    categoryId: string,
    itemIds: string[],
  ) {
    // Verify all items belong to organization and category
    const items = await prisma.menuItem.findMany({
      where: {
        id: { in: itemIds },
        organizationId,
        categoryId,
      },
    });

    if (items.length !== itemIds.length) {
      throw status(400, "Invalid item IDs");
    }

    // Update display order in transaction
    await prisma.$transaction(
      itemIds.map((id, index) =>
        prisma.menuItem.update({
          where: { id },
          data: { displayOrder: index },
        }),
      ),
    );

    return { success: true, message: "Items reordered successfully" };
  }

  // Search items
  static async search(organizationId: string, query: string) {
    return await prisma.menuItem.findMany({
      where: {
        organizationId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { nameEn: { contains: query, mode: "insensitive" } },
          { nameTh: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
