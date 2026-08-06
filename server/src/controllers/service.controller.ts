import { Request, Response } from 'express';
import { serviceService, ServiceService } from '../services/service.service';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export class ServiceController {
  private service: ServiceService;

  constructor(service: ServiceService = serviceService) {
    this.service = service;
  }

  createService = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.createService(req.body, req.user!);
    return sendResponse(res, 201, 'Service created successfully', result);
  });

  getServices = asyncHandler(async (req: Request, res: Response) => {
    const branchId = req.query.branchId as string | undefined;
    const result = await this.service.getServices(branchId, req.user!);
    return sendResponse(res, 200, 'Services retrieved successfully', result);
  });

  getServiceById = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getServiceById(req.params.id, req.user!);
    return sendResponse(res, 200, 'Service details retrieved successfully', result);
  });

  updateService = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.updateService(req.params.id, req.body, req.user!);
    return sendResponse(res, 200, 'Service updated successfully', result);
  });

  deleteService = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteService(req.params.id, req.user!);
    return sendResponse(res, 200, 'Service soft deleted successfully', null);
  });
}

export const serviceController = new ServiceController();
