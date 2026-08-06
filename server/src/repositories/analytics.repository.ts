import { PrismaClient, TokenStatusEnum, PriorityLevelEnum } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnalyticsSummary {
  totalTokensGenerated: number;
  completedTokens: number;
  cancelledTokens: number;
  skippedTokens: number;
  avgWaitTimeMins: number;
  avgServiceDurationMins: number;
}

export interface HourlyStat {
  hour: string;
  count: number;
}

export interface ServicePerformanceStat {
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  totalServed: number;
  avgWaitTimeMins: number;
  avgServiceDurationMins: number;
}

export interface CounterPerformanceStat {
  counterId: string;
  counterName: string;
  counterNumber: number;
  servedCount: number;
  avgHandlingTimeMins: number;
}

export interface PriorityDistributionStat {
  priority: PriorityLevelEnum;
  count: number;
  percentage: number;
}

export interface BranchAnalyticsData {
  branch: {
    id: string;
    name: string;
    code: string;
  };
  summary: AnalyticsSummary;
  hourlyStats: HourlyStat[];
  servicePerformance: ServicePerformanceStat[];
  counterPerformance: CounterPerformanceStat[];
  priorityDistribution: PriorityDistributionStat[];
}

export class AnalyticsRepository {
  async getBranchAnalyticsDashboard(branchId: string): Promise<BranchAnalyticsData | null> {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true, name: true, code: true },
    });

    if (!branch) return null;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 1. Get today's queues for this branch
    const todayQueues = await prisma.queue.findMany({
      where: {
        branchId,
        date: today,
      },
      select: { id: true, serviceId: true },
    });

    const queueIds = todayQueues.map((q) => q.id);

    // Fetch all tokens generated today for these queues
    const tokens = await prisma.token.findMany({
      where: {
        queueId: { in: queueIds },
      },
      include: {
        service: true,
        counter: true,
      },
    });

    // 2. Compute Summary Metrics
    const totalTokensGenerated = tokens.length;
    let completedTokens = 0;
    let cancelledTokens = 0;
    let skippedTokens = 0;

    let totalWaitTimeMs = 0;
    let waitTimeCount = 0;

    let totalServiceDurationMs = 0;
    let serviceDurationCount = 0;

    tokens.forEach((t) => {
      if (t.status === TokenStatusEnum.COMPLETED) completedTokens++;
      if (t.status === TokenStatusEnum.CANCELLED) cancelledTokens++;
      if (t.status === TokenStatusEnum.SKIPPED) skippedTokens++;

      // Wait time: calledAt or servedAt - createdAt
      const startWait = new Date(t.createdAt).getTime();
      const endWait = t.servedAt
        ? new Date(t.servedAt).getTime()
        : t.calledAt
        ? new Date(t.calledAt).getTime()
        : null;

      if (endWait && endWait > startWait) {
        totalWaitTimeMs += endWait - startWait;
        waitTimeCount++;
      }

      // Service duration: completedAt - servedAt
      if (t.servedAt && t.completedAt) {
        const startServ = new Date(t.servedAt).getTime();
        const endServ = new Date(t.completedAt).getTime();
        if (endServ > startServ) {
          totalServiceDurationMs += endServ - startServ;
          serviceDurationCount++;
        }
      }
    });

    const avgWaitTimeMins =
      waitTimeCount > 0 ? Math.round((totalWaitTimeMs / waitTimeCount / 60000) * 10) / 10 : 0;

    const avgServiceDurationMins =
      serviceDurationCount > 0
        ? Math.round((totalServiceDurationMs / serviceDurationCount / 60000) * 10) / 10
        : 0;

    // 3. Hourly Queue Traffic (08:00 to 18:00)
    const hourlyCounts: Record<string, number> = {};
    for (let h = 8; h <= 18; h++) {
      const label = `${String(h).padStart(2, '0')}:00`;
      hourlyCounts[label] = 0;
    }

    tokens.forEach((t) => {
      const hourNum = new Date(t.createdAt).getHours();
      if (hourNum >= 8 && hourNum <= 18) {
        const label = `${String(hourNum).padStart(2, '0')}:00`;
        hourlyCounts[label] = (hourlyCounts[label] || 0) + 1;
      }
    });

    const hourlyStats: HourlyStat[] = Object.keys(hourlyCounts).map((hour) => ({
      hour,
      count: hourlyCounts[hour],
    }));

    // 4. Service Performance Breakdown
    const serviceMap: Record<
      string,
      {
        serviceId: string;
        serviceName: string;
        serviceCode: string;
        servedCount: number;
        totalWaitMs: number;
        waitCount: number;
        totalDurationMs: number;
        durationCount: number;
      }
    > = {};

    tokens.forEach((t) => {
      if (!serviceMap[t.serviceId]) {
        serviceMap[t.serviceId] = {
          serviceId: t.serviceId,
          serviceName: t.service.name,
          serviceCode: t.service.code,
          servedCount: 0,
          totalWaitMs: 0,
          waitCount: 0,
          totalDurationMs: 0,
          durationCount: 0,
        };
      }

      const sData = serviceMap[t.serviceId];

      if (t.status === TokenStatusEnum.COMPLETED || t.status === TokenStatusEnum.SERVING) {
        sData.servedCount++;
      }

      if (t.calledAt || t.servedAt) {
        const startWait = new Date(t.createdAt).getTime();
        const endWait = t.servedAt ? new Date(t.servedAt).getTime() : new Date(t.calledAt!).getTime();
        if (endWait > startWait) {
          sData.totalWaitMs += endWait - startWait;
          sData.waitCount++;
        }
      }

      if (t.servedAt && t.completedAt) {
        const startServ = new Date(t.servedAt).getTime();
        const endServ = new Date(t.completedAt).getTime();
        if (endServ > startServ) {
          sData.totalDurationMs += endServ - startServ;
          sData.durationCount++;
        }
      }
    });

    const servicePerformance: ServicePerformanceStat[] = Object.values(serviceMap).map((s) => ({
      serviceId: s.serviceId,
      serviceName: s.serviceName,
      serviceCode: s.serviceCode,
      totalServed: s.servedCount,
      avgWaitTimeMins: s.waitCount > 0 ? Math.round((s.totalWaitMs / s.waitCount / 60000) * 10) / 10 : 0,
      avgServiceDurationMins:
        s.durationCount > 0 ? Math.round((s.totalDurationMs / s.durationCount / 60000) * 10) / 10 : 0,
    }));

    // 5. Counter Performance Breakdown
    const counterMap: Record<
      string,
      {
        counterId: string;
        counterName: string;
        counterNumber: number;
        servedCount: number;
        totalDurationMs: number;
        durationCount: number;
      }
    > = {};

    tokens.forEach((t) => {
      if (t.counterId && t.counter) {
        if (!counterMap[t.counterId]) {
          counterMap[t.counterId] = {
            counterId: t.counterId,
            counterName: t.counter.name,
            counterNumber: t.counter.number,
            servedCount: 0,
            totalDurationMs: 0,
            durationCount: 0,
          };
        }

        const cData = counterMap[t.counterId];

        if (t.status === TokenStatusEnum.COMPLETED || t.status === TokenStatusEnum.SERVING) {
          cData.servedCount++;
        }

        if (t.servedAt && t.completedAt) {
          const startServ = new Date(t.servedAt).getTime();
          const endServ = new Date(t.completedAt).getTime();
          if (endServ > startServ) {
            cData.totalDurationMs += endServ - startServ;
            cData.durationCount++;
          }
        }
      }
    });

    const counterPerformance: CounterPerformanceStat[] = Object.values(counterMap).map((c) => ({
      counterId: c.counterId,
      counterName: c.counterName,
      counterNumber: c.counterNumber,
      servedCount: c.servedCount,
      avgHandlingTimeMins:
        c.durationCount > 0 ? Math.round((c.totalDurationMs / c.durationCount / 60000) * 10) / 10 : 0,
    }));

    // 6. Priority Distribution
    const priorityCounts: Record<PriorityLevelEnum, number> = {
      NORMAL: 0,
      VIP: 0,
      SENIOR_CITIZEN: 0,
      EMERGENCY: 0,
    };

    tokens.forEach((t) => {
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
    });

    const priorityDistribution: PriorityDistributionStat[] = (
      Object.keys(priorityCounts) as PriorityLevelEnum[]
    ).map((p) => {
      const count = priorityCounts[p];
      const percentage =
        totalTokensGenerated > 0 ? Math.round((count / totalTokensGenerated) * 100) : 0;
      return {
        priority: p,
        count,
        percentage,
      };
    });

    return {
      branch,
      summary: {
        totalTokensGenerated,
        completedTokens,
        cancelledTokens,
        skippedTokens,
        avgWaitTimeMins,
        avgServiceDurationMins,
      },
      hourlyStats,
      servicePerformance,
      counterPerformance,
      priorityDistribution,
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
