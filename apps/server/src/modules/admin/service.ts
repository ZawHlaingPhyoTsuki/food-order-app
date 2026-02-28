import { prisma } from "@/libs/prisma";
import { status } from "elysia";
import type { OrgStatus, UserRole } from "@/generated/prisma/enums";

export abstract class AdminService {
  /**
   * Get all pending organizations
   */
  static async getPendingOrganizations() {
    return await prisma.organization.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" }, // Oldest first (FIFO)
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
  }

  /**
   * Get all organizations with pagination and filtering
   */
  static async getAllOrganizations(
    statusFilter?: OrgStatus,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where: statusFilter ? { status: statusFilter } : undefined,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              tables: true,
              menuItems: true,
              orders: true,
            },
          },
        },
      }),
      prisma.organization.count({
        where: statusFilter ? { status: statusFilter } : undefined,
      }),
    ]);

    return {
      data: organizations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get single organization by ID
   */
  static async getOrganizationById(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            tables: true,
            menuItems: true,
            orders: true,
          },
        },
      },
    });

    if (!organization) {
      throw status(404, "Organization not found");
    }

    return organization;
  }

  /**
   * Approve an organization
   */
  static async approveOrganization(
    organizationId: string,
    adminUserId: string,
  ) {
    // Check if organization exists and is pending
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        status: true,
        name: true,
        owner: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!org) {
      throw status(404, "Organization not found");
    }

    if (org.status !== "PENDING") {
      throw status(
        400,
        `Organization status is "${org.status}", cannot approve`,
      );
    }

    // Approve organization
    const approvedOrg = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        status: "ACTIVE",
        approvedAt: new Date(),
        approvedBy: adminUserId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send email notification to owner
    // await sendApprovalEmail(org.owner.email, org.name);

    return approvedOrg;
  }

  /**
   * Reject an organization
   */
  static async rejectOrganization(organizationId: string, reason: string) {
    // Check if organization exists and is pending
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        status: true,
        name: true,
        owner: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!org) {
      throw status(404, "Organization not found");
    }

    if (org.status !== "PENDING") {
      throw status(
        400,
        `Organization status is "${org.status}", cannot reject`,
      );
    }

    // Reject organization
    const rejectedOrg = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send email notification to owner
    // await sendRejectionEmail(org.owner.email, org.name, reason);

    return rejectedOrg;
  }

  /**
   * Suspend an organization
   */
  static async suspendOrganization(organizationId: string, reason?: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { status: true },
    });

    if (!org) {
      throw status(404, "Organization not found");
    }

    if (org.status !== "ACTIVE") {
      throw status(400, "Can only suspend active organizations");
    }

    return await prisma.organization.update({
      where: { id: organizationId },
      data: {
        status: "SUSPENDED",
        // Store reason in description or add new field
      },
    });
  }

  /**
   * Reactivate a suspended organization
   */
  static async reactivateOrganization(organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { status: true },
    });

    if (!org) {
      throw status(404, "Organization not found");
    }

    if (org.status !== "SUSPENDED") {
      throw status(400, "Can only reactivate suspended organizations");
    }

    return await prisma.organization.update({
      where: { id: organizationId },
      data: { status: "ACTIVE" },
    });
  }

  /**
   * Get platform statistics
   */
  static async getPlatformStats() {
    const [
      totalOrgs,
      activeOrgs,
      pendingOrgs,
      suspendedOrgs,
      totalOrders,
      todayOrders,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { status: "ACTIVE" } }),
      prisma.organization.count({ where: { status: "PENDING" } }),
      prisma.organization.count({ where: { status: "SUSPENDED" } }),
      prisma.order.count(),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      organizations: {
        total: totalOrgs,
        active: activeOrgs,
        pending: pendingOrgs,
        suspended: suspendedOrgs,
      },
      orders: {
        total: totalOrders,
        today: todayOrders,
      },
    };
  }

  /**
   * Update user role (for testing/development)
   */
  static async updateUserRole(userId: string, role: UserRole) {
    return await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  /**
   * Get admin profile
   */
  static async getAdminProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw status(404, "User not found");
    }

    return user;
  }
}
