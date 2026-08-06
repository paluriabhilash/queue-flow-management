import {
  branchRepository,
  BranchRepository,
  CreateBranchData,
  UpdateBranchData,
  CreateWorkingHourData,
  UpdateWorkingHourData,
  CreateHolidayData,
  UpdateHolidayData,
} from '../repositories/branch.repository';
import { ApiError } from '../utils/ApiError';
import { JwtPayload } from '../utils/jwt';

export class BranchService {
  private repo: BranchRepository;

  constructor(repo: BranchRepository = branchRepository) {
    this.repo = repo;
  }

  async createBranch(data: CreateBranchData, currentUser: JwtPayload) {
    // Role check: Only SUPER_ADMIN and ORG_ADMIN can create branches
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ORG_ADMIN') {
      throw ApiError.forbidden('Only Super Admins and Organization Admins can create branches');
    }

    // ORG_ADMIN scope check
    if (currentUser.role === 'ORG_ADMIN' && currentUser.organizationId !== data.organizationId) {
      throw ApiError.forbidden('You can only create branches for your assigned organization');
    }

    // Check Code Uniqueness per Organization
    const existingCode = await this.repo.findBranchByCode(data.organizationId, data.code);
    if (existingCode) {
      throw ApiError.badRequest(`Branch code '${data.code.toUpperCase()}' already exists in this organization`);
    }

    return await this.repo.createBranch(data);
  }

  async getBranches(organizationIdFilter?: string, currentUser?: JwtPayload) {
    if (!currentUser || currentUser.role === 'CUSTOMER') {
      if (organizationIdFilter) {
        return await this.repo.getBranchesByOrganization(organizationIdFilter);
      }
      return await this.repo.getAllBranches();
    }

    if (currentUser.role === 'SUPER_ADMIN') {
      if (organizationIdFilter) {
        return await this.repo.getBranchesByOrganization(organizationIdFilter);
      }
      return await this.repo.getAllBranches();
    }

    if (currentUser.role === 'ORG_ADMIN' || currentUser.role === 'STAFF') {
      const orgId = currentUser.organizationId;
      if (!orgId) {
        throw ApiError.forbidden('User has no assigned organization');
      }
      return await this.repo.getBranchesByOrganization(orgId);
    }

    return await this.repo.getAllBranches();
  }

  async getBranchById(id: string, currentUser?: JwtPayload) {
    const branch = await this.repo.findBranchById(id);
    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }

    if (
      currentUser &&
      currentUser.role !== 'SUPER_ADMIN' &&
      currentUser.role !== 'CUSTOMER' &&
      currentUser.organizationId !== branch.organizationId
    ) {
      throw ApiError.forbidden('Access denied to this branch');
    }

    return branch;
  }

  async updateBranch(id: string, data: UpdateBranchData, currentUser: JwtPayload) {
    const branch = await this.repo.findBranchById(id);
    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId !== branch.organizationId) {
      throw ApiError.forbidden('You do not have permission to update this branch');
    }

    return await this.repo.updateBranch(id, data);
  }

  async deleteBranch(id: string, currentUser: JwtPayload) {
    const branch = await this.repo.findBranchById(id);
    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId !== branch.organizationId) {
      throw ApiError.forbidden('You do not have permission to delete this branch');
    }

    return await this.repo.softDeleteBranch(id);
  }

  // --- Working Hours ---

  async getWorkingHours(branchId: string, currentUser: JwtPayload) {
    await this.getBranchById(branchId, currentUser);
    return await this.repo.getWorkingHours(branchId);
  }

  async createWorkingHour(branchId: string, data: Omit<CreateWorkingHourData, 'branchId'>, currentUser: JwtPayload) {
    await this.getBranchById(branchId, currentUser);

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ORG_ADMIN') {
      throw ApiError.forbidden('Only Admins can modify branch working hours');
    }

    return await this.repo.createWorkingHour({
      ...data,
      branchId,
    });
  }

  async updateWorkingHour(id: string, data: UpdateWorkingHourData, currentUser: JwtPayload) {
    const wh = await this.repo.findWorkingHourById(id);
    if (!wh) {
      throw ApiError.notFound('Working hour record not found');
    }

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId !== wh.branch.organizationId) {
      throw ApiError.forbidden('You do not have permission to modify working hours for this branch');
    }

    return await this.repo.updateWorkingHour(id, data);
  }

  async deleteWorkingHour(id: string, currentUser: JwtPayload) {
    const wh = await this.repo.findWorkingHourById(id);
    if (!wh) {
      throw ApiError.notFound('Working hour record not found');
    }

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId !== wh.branch.organizationId) {
      throw ApiError.forbidden('You do not have permission to delete working hours for this branch');
    }

    return await this.repo.deleteWorkingHour(id);
  }

  // --- Holidays ---

  async getHolidays(branchId: string, currentUser: JwtPayload) {
    await this.getBranchById(branchId, currentUser);
    return await this.repo.getHolidays(branchId);
  }

  async createHoliday(branchId: string, data: Omit<CreateHolidayData, 'branchId'>, currentUser: JwtPayload) {
    await this.getBranchById(branchId, currentUser);

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ORG_ADMIN') {
      throw ApiError.forbidden('Only Admins can add branch holidays');
    }

    return await this.repo.createHoliday({
      ...data,
      branchId,
    });
  }

  async updateHoliday(id: string, data: UpdateHolidayData, currentUser: JwtPayload) {
    const holiday = await this.repo.findHolidayById(id);
    if (!holiday) {
      throw ApiError.notFound('Holiday record not found');
    }

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId !== holiday.branch.organizationId) {
      throw ApiError.forbidden('You do not have permission to update holidays for this branch');
    }

    return await this.repo.updateHoliday(id, data);
  }

  async deleteHoliday(id: string, currentUser: JwtPayload) {
    const holiday = await this.repo.findHolidayById(id);
    if (!holiday) {
      throw ApiError.notFound('Holiday record not found');
    }

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId !== holiday.branch.organizationId) {
      throw ApiError.forbidden('You do not have permission to delete holidays for this branch');
    }

    return await this.repo.deleteHoliday(id);
  }
}

export const branchService = new BranchService();
