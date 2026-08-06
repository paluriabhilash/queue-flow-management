import { Request, Response } from 'express';
import { organizationService, OrganizationService } from '../services/organization.service';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export class OrganizationController {
  private service: OrganizationService;

  constructor(service: OrganizationService = organizationService) {
    this.service = service;
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.createOrganization(req.body, req.user!);
    return sendResponse(res, 201, 'Organization created successfully', result);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.updateOrganization(req.params.id, req.body, req.user!);
    return sendResponse(res, 200, 'Organization profile updated successfully', result);
  });

  getDetails = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getOrganizationDetails(req.params.id, req.user!);
    return sendResponse(res, 200, 'Organization details retrieved successfully', result);
  });

  getSettings = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getSettings(req.params.id, req.user!);
    return sendResponse(res, 200, 'Organization settings retrieved successfully', result);
  });

  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.updateSettings(req.params.id, req.body, req.user!);
    return sendResponse(res, 200, 'Organization settings updated successfully', result);
  });
}

export const organizationController = new OrganizationController();
