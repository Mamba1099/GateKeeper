import { prisma } from "../prisma";

export class SessionManager {
  static async extendSession(sessionToken: string): Promise<void> {
    await prisma.session.update({
      where: { session_token: sessionToken },
      data: { expires_at: new Date(Date.now() + 30 * 60 * 1000) },
    });
  }

  static async revokeAllUserSessions(
    userId: string,
    currentSessionToken?: string,
  ): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        user_id: userId,
        ...(currentSessionToken && {
          session_token: { not: currentSessionToken },
        }),
      },
    });
  }

  static async getUserSessions(userId: string) {
    const sessions = await prisma.session.findMany({
      where: {
        user_id: userId,
        expires_at: { gt: new Date() },
      },
      orderBy: { expires_at: "desc" },
    });
    return sessions;
  }

  static async cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        expires_at: { lt: new Date() },
      },
    });
    return result.count;
  }
}
