import { Request, Response } from 'express';
import { counterService, CounterService } from '../services/counter.service';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export class CounterController {
  private service: CounterService;

  constructor(service: CounterService = counterService) {
    this.service = service;
  }

  createCounter = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.createCounter(req.body, req.user!);
    return sendResponse(res, 201, 'Counter created successfully', result);
  });

  getCounters = asyncHandler(async (req: Request, res: Response) => {
    const branchId = req.query.branchId as string | undefined;
    const result = await this.service.getCounters(branchId, req.user!);
    return sendResponse(res, 200, 'Counters retrieved successfully', result);
  });

  getCounterById = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getCounterById(req.params.id, req.user!);
    return sendResponse(res, 200, 'Counter details retrieved successfully', result);
  });

  updateCounter = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.updateCounter(req.params.id, req.body, req.user!);
    return sendResponse(res, 200, 'Counter updated successfully', result);
  });

  deleteCounter = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteCounter(req.params.id, req.user!);
    return sendResponse(res, 200, 'Counter soft deleted successfully', null);
  });

  // --- Staff Assignment ---

  assignStaff = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.assignStaff(req.params.id, req.body.staffProfileId, req.user!);
    return sendResponse(res, 200, 'Staff assigned to counter successfully', result);
  });

  removeStaff = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.removeStaff(req.params.id, req.params.staffId, req.user!);
    return sendResponse(res, 200, 'Staff removed from counter successfully', result);
  });

  // --- Service Assignment ---

  assignServices = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.assignServices(req.params.id, req.body.serviceIds, req.user!);
    return sendResponse(res, 200, 'Services assigned to counter successfully', result);
  });

  getCounterServices = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getCounterServices(req.params.id, req.user!);
    return sendResponse(res, 200, 'Counter services retrieved successfully', result);
  });

  removeService = asyncHandler(async (req: Request, res: Response) => {
    await this.service.removeService(req.params.id, req.params.serviceId, req.user!);
    return sendResponse(res, 200, 'Service mapping removed from counter successfully', null);
  });
}

export const counterController = new CounterController();
