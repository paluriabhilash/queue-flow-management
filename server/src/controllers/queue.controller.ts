import { Request, Response } from 'express';
import { queueService, QueueService } from '../services/queue.service';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export class QueueController {
  private service: QueueService;

  constructor(service: QueueService = queueService) {
    this.service = service;
  }

  generateToken = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.generateToken(req.body, req.user);
    return sendResponse(res, 201, 'Token generated successfully', result);
  });

  getMyActiveTokens = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getMyActiveTokens(req.user!);
    return sendResponse(res, 200, 'Customer active tokens retrieved successfully', result);
  });

  getTokenPosition = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getTokenPosition(req.params.tokenId);
    return sendResponse(res, 200, 'Queue position retrieved successfully', result);
  });

  getCounterDashboard = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getCounterDashboard(req.params.counterId, req.user!);
    return sendResponse(res, 200, 'Staff counter dashboard retrieved successfully', result);
  });

  callNextToken = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.callNextToken(req.body.counterId, req.user!);
    return sendResponse(res, 200, 'Next token called successfully', result);
  });

  startService = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.startService(req.params.tokenId, req.user!);
    return sendResponse(res, 200, 'Token service started', result);
  });

  completeService = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.completeService(req.params.tokenId, req.user!);
    return sendResponse(res, 200, 'Token service completed', result);
  });

  skipToken = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.skipToken(req.params.tokenId, req.user!);
    return sendResponse(res, 200, 'Token skipped', result);
  });

  cancelToken = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.cancelToken(req.params.tokenId, req.user!);
    return sendResponse(res, 200, 'Token cancelled', result);
  });

  getBranchDisplayBoard = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getBranchDisplayBoardData(req.params.branchId);
    return sendResponse(res, 200, 'Branch display board retrieved successfully', result);
  });

  deleteToken = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.deleteToken(req.params.tokenId, req.user);
    return sendResponse(res, 200, 'Token ticket deleted successfully', result);
  });
}

export const queueController = new QueueController();
