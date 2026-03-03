import { prisma } from "@/libs/prisma";
import { redis } from "@/libs/redis";
import { status } from "elysia";

const SESSION_TTL = 1800; // 30 minutes

interface SessionData {
  sessionId: string;
  tableId: string;
  tableNumber: string;
  organizationId: string;
  organizationName: string;
  createdAt: string;
}

export abstract class SessionService {
  /**
   * Validate table token and create/fetch Redis session
   * This is the entry point when a customer scans a QR code
   */
  static async validateAndCreateSession(
    orgSlug: string,
    tableToken: string,
  ) {
    // 1. Find the table by token and verify org slug
    const table = await prisma.table.findUnique({
      where: { tableToken },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!table) {
      throw status(404, "Invalid table QR code");
    }

    // 2. Verify organization slug matches
    if (table.organization.slug !== orgSlug) {
      throw status(400, "Invalid table for this restaurant");
    }

    // 3. Verify organization is active
    if (table.organization.status !== "ACTIVE") {
      throw status(400, "This restaurant is not currently accepting orders");
    }

    // 4. Check for existing Redis session
    const sessionKey = "session:" + tableToken;
    const existingSession = await redis.get<SessionData>(sessionKey);

    if (existingSession) {
      // Refresh TTL
      await redis.expire(sessionKey, SESSION_TTL);

      return existingSession;
    }

    // 5. Create new session
    const sessionId = crypto.randomUUID();
    const sessionData: SessionData = {
      sessionId,
      tableId: table.id,
      tableNumber: table.tableNumber,
      organizationId: table.organization.id,
      organizationName: table.organization.name,
      createdAt: new Date().toISOString(),
    };

    // 6. Save to Redis with TTL
    await redis.set(sessionKey, sessionData, { ex: SESSION_TTL });

    // 7. Mark table as occupied
    await prisma.table.update({
      where: { id: table.id },
      data: { status: "OCCUPIED" },
    });

    return sessionData;
  }

  /**
   * Get current session for a table token
   */
  static async getSession(tableToken: string) {
    const sessionKey = "session:" + tableToken;
    const session = await redis.get<SessionData>(sessionKey);

    if (!session) {
      throw status(404, "No active session. Please scan the QR code again.");
    }

    // Refresh TTL
    await redis.expire(sessionKey, SESSION_TTL);

    return session;
  }

  /**
   * End a session (customer calls for bill / leaves)
   */
  static async endSession(tableToken: string) {
    const sessionKey = "session:" + tableToken;
    const session = await redis.get<SessionData>(sessionKey);

    if (session) {
      await redis.del(sessionKey);

      // Mark table for cleaning
      await prisma.table.update({
        where: { id: session.tableId },
        data: { status: "NEEDS_CLEANING" },
      });
    }

    return { success: true, message: "Session ended" };
  }
}