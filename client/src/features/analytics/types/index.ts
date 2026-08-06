import { PriorityLevel } from '@/features/queue/types';

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
  priority: PriorityLevel;
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
