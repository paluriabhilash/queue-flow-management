import { analyticsRepository, AnalyticsRepository } from '../repositories/analytics.repository';
import { branchRepository } from '../repositories/branch.repository';
import { ApiError } from '../utils/ApiError';
import { JwtPayload } from '../utils/jwt';

export class AnalyticsService {
  private repo: AnalyticsRepository;

  constructor(repo: AnalyticsRepository = analyticsRepository) {
    this.repo = repo;
  }

  async getDashboardAnalytics(branchId: string, currentUser: JwtPayload) {
    // 1. Verify Branch Location Exists
    const branch = await branchRepository.findBranchById(branchId);
    if (!branch) {
      throw ApiError.notFound('Branch location not found');
    }

    // 2. Authorization Check
    if (
      currentUser.role !== 'SUPER_ADMIN' &&
      currentUser.organizationId !== branch.organizationId
    ) {
      throw ApiError.forbidden('Access denied to analytics for this organization branch');
    }

    // 3. Compute Branch Analytics
    const analytics = await this.repo.getBranchAnalyticsDashboard(branchId);
    if (!analytics) {
      throw ApiError.notFound('Analytics metrics unavailable for this branch');
    }

    return analytics;
  }
}

export const analyticsService = new AnalyticsService();
