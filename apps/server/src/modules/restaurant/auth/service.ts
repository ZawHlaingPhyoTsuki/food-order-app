import { prisma } from "@/libs/prisma";
import { status } from "elysia";
import type { RestaurantAuthModel } from "./model";
import type { User } from "better-auth";

export abstract class RestaurantAuthService {
  /**
   * Generate a unique URL-friendly slug from restaurant name
   */
  private static generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .trim()
        // Replace spaces and special chars with hyphens
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "")
    ); // Remove leading/trailing hyphens
  }

  /**
   * Ensure slug is unique by appending number if needed
   */
  private static async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.organization.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existing) {
        return slug;
      }

      // Slug exists, try with counter
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Register a new restaurant organization
   */
  static async register(body: RestaurantAuthModel["registerBody"], user: User) {
    const {
      name,
      description,
      phone,
      address,
      city,
      country,
      currency,
      defaultLanguage,
    } = body;

    // 1. Check if user already owns an organization
    const existingOrg = await prisma.organization.findFirst({
      where: { ownerId: user.id },
      select: { id: true, name: true, status: true },
    });

    if (existingOrg) {
      // If pending, inform them to wait
      if (existingOrg.status === "PENDING") {
        throw status(
          400,
          `You already have a pending application for "${existingOrg.name}". Please wait for admin approval.`,
        );
      }

      // If active or suspended, they can't register another
      throw status(
        400,
        `You already own a restaurant: "${existingOrg.name}". Multiple restaurants per owner are not supported yet.`,
      );
    }

    // 2. Generate unique slug
    const baseSlug = this.generateSlug(name);
    const uniqueSlug = await this.ensureUniqueSlug(baseSlug);

    // 3. Create organization
    const organization = await prisma.organization.create({
      data: {
        name: name.trim(),
        slug: uniqueSlug,
        description: description?.trim(),
        phone: phone?.trim(),
        address: address?.trim(),
        city: city?.trim(),
        country,
        currency,
        defaultLanguage,
        ownerId: user.id,
        status: "PENDING",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
      },
    });

    // 4. TODO: Send notification to admin about new registration
    // await sendAdminNotification(organization.id);

    return {
      success: true,
      message:
        "Restaurant application submitted successfully. An admin will review it within 24 hours.",
      organization,
    };
  }

  /**
   * Check if user has a pending or approved organization
   */
  static async checkUserOrganization(userId: string) {
    const organization = await prisma.organization.findFirst({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
        approvedAt: true,
      },
    });

    if (!organization) {
      return {
        hasOrganization: false,
        organization: null,
      };
    }

    return {
      hasOrganization: true,
      organization,
    };
  }
}
