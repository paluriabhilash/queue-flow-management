import { Request, Response } from 'express';
import { analyticsService, AnalyticsService } from '../services/analytics.service';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export class AnalyticsController {
  private service: AnalyticsService;

  constructor(service: AnalyticsService = analyticsService) {
    this.service = service;
  }

  getDashboardAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getDashboardAnalytics(req.params.branchId, req.user!);
    return sendResponse(res, 200, 'Branch analytics dashboard metrics retrieved successfully', result);
  });
}

export const analyticsController = new AnalyticsController();
