import {
  PrismaClient,
  Queue,
  Token,
  TokenLog,
  TokenStatusEnum,
  PriorityLevelEnum,
  QueueStatusEnum,
} from '@prisma/client';

const prisma = new PrismaClient();

// Helper to convert Priority Enum to numeric weight for comparison
export const PRIORITY_WEIGHTS: Record<PriorityLevelEnum, number> = {
  EMERGENCY: 4,
  VIP: 3,
  SENIOR_CITIZEN: 2,
  NORMAL: 1,
};

export interface CreateTokenData {
  branchId: string;
  serviceId: string;
  priority?: PriorityLevelEnum;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export class QueueRepository {
  /**
   * Finds or creates today's Queue instance for a given branch & service.
   */
  async findOrCreateTodayQueue(branchId: string, serviceId: string): Promise<Queue> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const existingQueue = await prisma.queue.findUnique({
      where: {
        branchId_serviceId_date: {
          branchId,
          serviceId,
          date: today,
        },
      },
    });

    if (existingQueue) {
      return existingQueue;
    }

    return await prisma.queue.create({
      data: {
        branchId,
        serviceId,
        date: today,
        status: QueueStatusEnum.ACTIVE,
        totalTokens: 0,
        currentServingSeq: 0,
      },
    });
  }

  /**
   * Atomically increments token sequence on Queue and creates new Token.
   */
  async createTokenWithAtomicSequence(
    queue: Queue,
    servicePrefix: string,
    avgServiceTimeMins: number,
    data: CreateTokenData
  ) {
    return await prisma.$transaction(async (tx) => {
      // Increment Queue totalTokens
      const updatedQueue = await tx.queue.update({
        where: { id: queue.id },
        data: { totalTokens: { increment: 1 } },
      });

      const seqNumber = updatedQueue.totalTokens;
      const formattedNum = `${servicePrefix}-${String(seqNumber).padStart(3, '0')}`;
      const priority = data.priority || PriorityLevelEnum.NORMAL;

      // Create Token record
      const token = await tx.token.create({
        data: {
          queueId: queue.id,
          serviceId: data.serviceId,
          tokenNumber: formattedNum,
          seqNumber,
          priority,
          status: TokenStatusEnum.WAITING,
          customerId: data.customerId || null,
          customerName: data.customerName || null,
          customerPhone: data.customerPhone || null,
          notes: data.notes || null,
        },
        include: {
          service: true,
          queue: {
            include: {
              branch: true,
            },
          },
        },
      });

      // Create initial TokenLog
      await tx.tokenLog.create({
        data: {
          tokenId: token.id,
          previousStatus: null,
          newStatus: TokenStatusEnum.WAITING,
          changedBy: data.customerId || null,
          remarks: 'Token generated',
        },
      });

      // Calculate tokens ahead (queue position)
      const waitingTokensAhead = await tx.token.count({
        where: {
          queueId: queue.id,
          status: TokenStatusEnum.WAITING,
          id: { not: token.id },
          OR: [
            {
              priority: {
                in: this.getHigherPriorities(priority),
              },
            },
            {
              priority: priority,
              seqNumber: { lt: seqNumber },
            },
          ],
        },
      });

      const estimatedWaitTime = (waitingTokensAhead + 1) * avgServiceTimeMins;

      return {
        token,
        queuePosition: waitingTokensAhead + 1,
        estimatedWaitTime,
      };
    });
  }

  /**
   * Helper array of priority levels higher than the given priority
   */
  private getHigherPriorities(priority: PriorityLevelEnum): PriorityLevelEnum[] {
    const targetWeight = PRIORITY_WEIGHTS[priority];
    return (Object.keys(PRIORITY_WEIGHTS) as PriorityLevelEnum[]).filter(
      (p) => PRIORITY_WEIGHTS[p] > targetWeight
    );
  }

  async findTokenById(id: string) {
    return prisma.token.findUnique({
      where: { id },
      include: {
        service: true,
        counter: true,
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        queue: {
          include: {
            branch: {
              include: {
                organization: true,
              },
            },
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findActiveTokensByCustomer(customerId: string) {
    const activeTokens = await prisma.token.findMany({
      where: {
        customerId,
        status: {
          in: [TokenStatusEnum.WAITING, TokenStatusEnum.CALLED, TokenStatusEnum.SERVING],
        },
      },
      include: {
        service: true,
        counter: true,
        queue: {
          include: {
            branch: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enhance each token with position and estimated wait time
    const result = [];
    for (const token of activeTokens) {
      const positionInfo = await this.calculateQueuePosition(token.id);
      result.push({
        ...token,
        queuePosition: positionInfo.queuePosition,
        queueAheadCount: positionInfo.queueAheadCount,
        estimatedWaitTime: positionInfo.estimatedWaitTime,
      });
    }

    return result;
  }

  async calculateQueuePosition(tokenId: string) {
    const token = await this.findTokenById(tokenId);
    if (!token) {
      return { queuePosition: 0, queueAheadCount: 0, estimatedWaitTime: 0 };
    }

    if (token.status !== TokenStatusEnum.WAITING) {
      return {
        queuePosition: 0,
        queueAheadCount: 0,
        estimatedWaitTime: 0,
      };
    }

    const higherPriorities = this.getHigherPriorities(token.priority);

    const queueAheadCount = await prisma.token.count({
      where: {
        queueId: token.queueId,
        status: TokenStatusEnum.WAITING,
        id: { not: token.id },
        OR: [
          {
            priority: {
              in: higherPriorities,
            },
          },
          {
            priority: token.priority,
            seqNumber: { lt: token.seqNumber },
          },
        ],
      },
    });

    const avgDuration = token.service?.avgServiceTimeMins || 10;
    const queuePosition = queueAheadCount + 1;
    const estimatedWaitTime = queuePosition * avgDuration;

    return {
      queuePosition,
      queueAheadCount,
      estimatedWaitTime,
    };
  }

  async getCounterDashboardData(counterId: string) {
    // 1. Get Counter Details & Mapped Services
    const counter = await prisma.counter.findUnique({
      where: { id: counterId },
      include: {
        branch: true,
        staffProfile: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        counterServices: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!counter) return null;

    const mappedServiceIds = counter.counterServices.map((cs) => cs.serviceId);

    // 2. Currently Serving / Called Token at this counter
    const currentServingToken = await prisma.token.findFirst({
      where: {
        counterId,
        status: {
          in: [TokenStatusEnum.CALLED, TokenStatusEnum.SERVING],
        },
      },
      include: {
        service: true,
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // 3. Today's active queues for mapped services
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const activeQueues = await prisma.queue.findMany({
      where: {
        branchId: counter.branchId,
        serviceId: { in: mappedServiceIds },
        date: today,
      },
    });

    const activeQueueIds = activeQueues.map((q) => q.id);

    // 4. Waiting tokens count for mapped services
    const waitingTokensCount = await prisma.token.count({
      where: {
        queueId: { in: activeQueueIds },
        status: TokenStatusEnum.WAITING,
      },
    });

    // 5. Next 5 Waiting Tokens preview ordered by Priority DESC, seqNumber ASC
    const nextWaitingTokens = await prisma.token.findMany({
      where: {
        queueId: { in: activeQueueIds },
        status: TokenStatusEnum.WAITING,
      },
      include: {
        service: true,
      },
      take: 5,
    });

    // Sort in memory by Priority Weight DESC then seqNumber ASC
    nextWaitingTokens.sort((a, b) => {
      const weightA = PRIORITY_WEIGHTS[a.priority];
      const weightB = PRIORITY_WEIGHTS[b.priority];
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      return a.seqNumber - b.seqNumber;
    });

    return {
      counter,
      currentServingToken,
      waitingTokensCount,
      nextWaitingTokens,
    };
  }

  async findNextWaitingTokenForCounter(counterId: string) {
    const counter = await prisma.counter.findUnique({
      where: { id: counterId },
      include: {
        counterServices: true,
      },
    });

    if (!counter) return null;

    const mappedServiceIds = counter.counterServices.map((cs) => cs.serviceId);
    if (mappedServiceIds.length === 0) return null;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const activeQueues = await prisma.queue.findMany({
      where: {
        branchId: counter.branchId,
        serviceId: { in: mappedServiceIds },
        date: today,
      },
    });

    const activeQueueIds = activeQueues.map((q) => q.id);
    if (activeQueueIds.length === 0) return null;

    // Fetch candidate waiting tokens
    const waitingTokens = await prisma.token.findMany({
      where: {
        queueId: { in: activeQueueIds },
        status: TokenStatusEnum.WAITING,
      },
      include: {
        service: true,
        queue: true,
      },
    });

    if (waitingTokens.length === 0) return null;

    // Sort by priority weight DESC then seqNumber ASC
    waitingTokens.sort((a, b) => {
      const weightA = PRIORITY_WEIGHTS[a.priority];
      const weightB = PRIORITY_WEIGHTS[b.priority];
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      return a.seqNumber - b.seqNumber;
    });

    return waitingTokens[0];
  }

  /**
   * Transactionally updates token status & creates TokenLog
   */
  async updateTokenStatus(
    tokenId: string,
    newStatus: TokenStatusEnum,
    changedById?: string,
    extraFields?: {
      counterId?: string;
      calledAt?: Date;
      servedAt?: Date;
      completedAt?: Date;
      cancelledAt?: Date;
    },
    remarks?: string
  ): Promise<Token> {
    return await prisma.$transaction(async (tx) => {
      const currentToken = await tx.token.findUnique({
        where: { id: tokenId },
      });

      if (!currentToken) {
        throw new Error('Token not found');
      }

      const previousStatus = currentToken.status;

      const updatedToken = await tx.token.update({
        where: { id: tokenId },
        data: {
          status: newStatus,
          ...(extraFields?.counterId && { counterId: extraFields.counterId }),
          ...(extraFields?.calledAt && { calledAt: extraFields.calledAt }),
          ...(extraFields?.servedAt && { servedAt: extraFields.servedAt }),
          ...(extraFields?.completedAt && { completedAt: extraFields.completedAt }),
          ...(extraFields?.cancelledAt && { cancelledAt: extraFields.cancelledAt }),
        },
        include: {
          service: true,
          counter: true,
          queue: {
            include: {
              branch: true,
            },
          },
        },
      });

      await tx.tokenLog.create({
        data: {
          tokenId,
          previousStatus,
          newStatus,
          changedBy: changedById || null,
          remarks: remarks || `Status changed from ${previousStatus} to ${newStatus}`,
        },
      });

      return updatedToken;
    });
  }

  async getBranchDisplayBoardData(branchId: string) {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true, name: true, code: true, address: true },
    });

    if (!branch) return null;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const activeQueues = await prisma.queue.findMany({
      where: {
        branchId,
        date: today,
      },
    });

    const activeQueueIds = activeQueues.map((q) => q.id);

    // Currently Called or Serving tokens at this branch
    const currentlyServing = await prisma.token.findMany({
      where: {
        queueId: { in: activeQueueIds },
        status: {
          in: [TokenStatusEnum.CALLED, TokenStatusEnum.SERVING],
        },
      },
      include: {
        service: true,
        counter: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Next waiting tokens at this branch
    const nextWaiting = await prisma.token.findMany({
      where: {
        queueId: { in: activeQueueIds },
        status: TokenStatusEnum.WAITING,
      },
      include: {
        service: true,
      },
      take: 10,
    });

    nextWaiting.sort((a, b) => {
      const weightA = PRIORITY_WEIGHTS[a.priority];
      const weightB = PRIORITY_WEIGHTS[b.priority];
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      return a.seqNumber - b.seqNumber;
    });

    return {
      branch,
      currentlyServing,
      nextWaiting,
    };
  }
}

export const queueRepository = new QueueRepository();
