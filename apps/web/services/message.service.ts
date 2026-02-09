import { prisma } from "@school-admin/db";
import {
  CreateMessageThreadInput,
  CreateMessageInput,
  GetMessageThreadsInput,
  GetMessagesInput,
  MarkMessageReadInput,
  NotFoundError,
  ConflictError,
} from "@school-admin/shared";

/**
 * Message service
 */
export class MessageService {
  /**
   * Create or get existing message thread
   */
  async createOrGetThread(input: CreateMessageThreadInput, userId: string, schoolId: string) {
    // Verify all participants belong to school
    const participants = await prisma.user.findMany({
      where: {
        id: { in: input.participantIds },
      },
      include: {
        memberships: {
          where: {
            schoolId,
          },
        },
      },
    });

    if (participants.length !== input.participantIds.length) {
      throw new NotFoundError("Some participants not found");
    }

    // Ensure all participants have membership in school
    const allHaveMembership = participants.every((p) => p.memberships.length > 0);
    if (!allHaveMembership) {
      throw new ConflictError("Some participants don't belong to this school");
    }

    // Include current user in participants if not already
    const allParticipantIds = input.participantIds.includes(userId)
      ? input.participantIds
      : [...input.participantIds, userId];

    // For DIRECT threads, check if thread already exists
    if (input.type === "DIRECT" && allParticipantIds.length === 2) {
      const existingThread = await prisma.messageThread.findFirst({
        where: {
          type: "DIRECT",
          participants: {
            every: {
              userId: { in: allParticipantIds },
            },
          },
        },
        include: {
          participants: true,
        },
      });

      if (existingThread) {
        // Verify it has exactly these 2 participants
        if (existingThread.participants.length === 2) {
          return existingThread;
        }
      }
    }

    // Create new thread
    const thread = await prisma.messageThread.create({
      data: {
        subject: input.subject,
        type: input.type,
        participants: {
          create: allParticipantIds.map((participantId) => ({
            userId: participantId,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return thread;
  }

  /**
   * Get message threads for user
   */
  async getThreads(input: GetMessageThreadsInput, userId: string, schoolId: string) {
    const [threads, total] = await Promise.all([
      prisma.messageThread.findMany({
        where: {
          participants: {
            some: {
              userId,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  isRead: false,
                  senderId: { not: userId },
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.messageThread.count({
        where: {
          participants: {
            some: {
              userId,
            },
          },
        },
      }),
    ]);

    return {
      threads,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  /**
   * Get thread by ID
   */
  async getThreadById(threadId: string, userId: string, schoolId: string) {
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!thread) {
      throw new NotFoundError("MessageThread", threadId);
    }

    // Verify user is participant
    const isParticipant = thread.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new NotFoundError("MessageThread", threadId);
    }

    return thread;
  }

  /**
   * Send message
   */
  async sendMessage(input: CreateMessageInput, userId: string, schoolId: string) {
    // Verify thread exists and user is participant
    const thread = await this.getThreadById(input.threadId, userId, schoolId);

    const message = await prisma.message.create({
      data: {
        threadId: input.threadId,
        senderId: userId,
        content: input.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        attachments: true,
      },
    });

    // Update thread updatedAt
    await prisma.messageThread.update({
      where: { id: input.threadId },
      data: { updatedAt: new Date() },
    });

    // Mark as unread for other participants
    await prisma.messageThreadParticipant.updateMany({
      where: {
        threadId: input.threadId,
        userId: { not: userId },
      },
      data: {
        lastReadAt: null,
      },
    });

    return message;
  }

  /**
   * Get messages in thread
   */
  async getMessages(input: GetMessagesInput, userId: string, schoolId: string) {
    // Verify thread exists and user is participant
    await this.getThreadById(input.threadId, userId, schoolId);

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          threadId: input.threadId,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          attachments: true,
        },
        orderBy: { createdAt: "asc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.message.count({
        where: {
          threadId: input.threadId,
        },
      }),
    ]);

    return {
      messages,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  /**
   * Mark messages as read
   */
  async markAsRead(input: MarkMessageReadInput, userId: string, schoolId: string) {
    // Verify thread exists and user is participant
    await this.getThreadById(input.threadId, userId, schoolId);

    // Mark all unread messages in thread as read
    await prisma.message.updateMany({
      where: {
        threadId: input.threadId,
        senderId: { not: userId },
        isRead: false,
        ...(input.messageId ? { id: input.messageId } : {}),
      },
      data: {
        isRead: true,
      },
    });

    // Update participant lastReadAt
    await prisma.messageThreadParticipant.updateMany({
      where: {
        threadId: input.threadId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Delete thread
   */
  async deleteThread(threadId: string, userId: string, schoolId: string) {
    // Verify thread exists and user is participant
    await this.getThreadById(threadId, userId, schoolId);

    await prisma.messageThread.delete({
      where: { id: threadId },
    });

    return { success: true };
  }
}
