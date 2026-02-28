import { prisma } from "@/libs/prisma";
import { status } from "elysia";
import type { MenuCategoryModel } from "./model";

export abstract class MenuCategoryService {
  // Get all categories for organization
  static async getAll(organizationId: string) {
    return await prisma.menuCategory.findMany({
      where: { organizationId },
      orderBy: { displayOrder: "asc" },
      include: {
        _count: {
          select: { menuItems: true }, // Count items in each category
        },
      },
    });
  }

  // Get single category
  static async getById(categoryId: string, organizationId: string) {
    const category = await prisma.menuCategory.findFirst({
      where: {
        id: categoryId,
        organizationId,
      },
      include: {
        menuItems: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!category) {
      throw status(404, "Category not found");
    }

    return category;
  }

  // Create category
  static async create(
    organizationId: string,
    data: MenuCategoryModel["createBody"],
  ) {
    // Get max displayOrder
    const maxOrder = await prisma.menuCategory.findFirst({
      where: { organizationId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    const category = await prisma.menuCategory.create({
      data: {
        organizationId,
        displayOrder: (maxOrder?.displayOrder || 0) + 1,
        ...data,
      },
    });

    return category;
  }

  // Update category
  static async update(
    categoryId: string,
    organizationId: string,
    data: MenuCategoryModel["updateBody"],
  ) {
    // Verify ownership
    const existing = await prisma.menuCategory.findFirst({
      where: {
        id: categoryId,
        organizationId,
      },
    });

    if (!existing) {
      throw status(404, "Category not found");
    }

    return await prisma.menuCategory.update({
      where: { id: categoryId },
      data,
    });
  }

  // Delete category
  static async delete(categoryId: string, organizationId: string) {
    // Check if category has items
    const category = await prisma.menuCategory.findFirst({
      where: {
        id: categoryId,
        organizationId,
      },
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    });

    if (!category) {
      throw status(404, "Category not found");
    }

    if (category._count.menuItems > 0) {
      throw status(
        400,
        "Cannot delete category with menu items. Please delete or move items first.",
      );
    }

    await prisma.menuCategory.delete({
      where: { id: categoryId },
    });

    return { success: true, message: "Category deleted successfully" };
  }

  // Reorder categories
  static async reorder(organizationId: string, categoryIds: string[]) {
    // Verify all categories belong to organization
    const categories = await prisma.menuCategory.findMany({
      where: {
        id: { in: categoryIds },
        organizationId,
      },
    });

    if (categories.length !== categoryIds.length) {
      throw status(400, "Invalid category IDs");
    }

    // Update display order in transaction
    await prisma.$transaction(
      categoryIds.map((id, index) =>
        prisma.menuCategory.update({
          where: { id },
          data: { displayOrder: index },
        }),
      ),
    );

    return { success: true, message: "Categories reordered successfully" };
  }

  // Toggle active status
  static async toggleActive(categoryId: string, organizationId: string) {
    const category = await prisma.menuCategory.findFirst({
      where: {
        id: categoryId,
        organizationId,
      },
    });

    if (!category) {
      throw status(404, "Category not found");
    }

    const updated = await prisma.menuCategory.update({
      where: { id: categoryId },
      data: { isActive: !category.isActive },
    });

    return updated;
  }
}
