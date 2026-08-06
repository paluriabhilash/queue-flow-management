import { Request, Response } from 'express';
import { branchService, BranchService } from '../services/branch.service';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export class BranchController {
  private service: BranchService;

  constructor(service: BranchService = branchService) {
    this.service = service;
  }

  createBranch = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.createBranch(req.body, req.user!);
    return sendResponse(res, 201, 'Branch created successfully', result);
  });

  getBranches = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.query.organizationId as string | undefined;
    const result = await this.service.getBranches(organizationId, req.user!);
    return sendResponse(res, 200, 'Branches retrieved successfully', result);
  });

  getBranchById = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getBranchById(req.params.id, req.user!);
    return sendResponse(res, 200, 'Branch details retrieved successfully', result);
  });

  updateBranch = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.updateBranch(req.params.id, req.body, req.user!);
    return sendResponse(res, 200, 'Branch profile updated successfully', result);
  });

  deleteBranch = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteBranch(req.params.id, req.user!);
    return sendResponse(res, 200, 'Branch soft deleted successfully', null);
  });

  // --- Working Hours ---

  getWorkingHours = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getWorkingHours(req.params.id, req.user!);
    return sendResponse(res, 200, 'Working hours retrieved successfully', result);
  });

  createWorkingHour = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.createWorkingHour(req.params.id, req.body, req.user!);
    return sendResponse(res, 201, 'Working hour created successfully', result);
  });

  updateWorkingHour = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.updateWorkingHour(req.params.id, req.body, req.user!);
    return sendResponse(res, 200, 'Working hour updated successfully', result);
  });

  deleteWorkingHour = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteWorkingHour(req.params.id, req.user!);
    return sendResponse(res, 200, 'Working hour deleted successfully', null);
  });

  // --- Holidays ---

  getHolidays = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getHolidays(req.params.id, req.user!);
    return sendResponse(res, 200, 'Holidays retrieved successfully', result);
  });

  createHoliday = asyncHandler(async (req: Request, res: Response) => {
    const dateObj = new Date(req.body.date);
    const result = await this.service.createHoliday(
      req.params.id,
      { ...req.body, date: dateObj },
      req.user!
    );
    return sendResponse(res, 201, 'Holiday created successfully', result);
  });

  updateHoliday = asyncHandler(async (req: Request, res: Response) => {
    const dateObj = req.body.date ? new Date(req.body.date) : undefined;
    const result = await this.service.updateHoliday(
      req.params.id,
      { ...req.body, date: dateObj },
      req.user!
    );
    return sendResponse(res, 200, 'Holiday updated successfully', result);
  });

  deleteHoliday = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteHoliday(req.params.id, req.user!);
    return sendResponse(res, 200, 'Holiday deleted successfully', null);
  });
}

export const branchController = new BranchController();
