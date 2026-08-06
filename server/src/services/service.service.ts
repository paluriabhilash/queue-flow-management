import {
  serviceRepository,
  ServiceRepository,
  CreateServiceData,
  UpdateServiceData,
} from '../repositories/service.repository';
import { branchRepository } from '../repositories/branch.repository';
import { ApiError } from '../utils/ApiError';
import { JwtPayload } from '../utils/jwt';

export class ServiceService {
  private repo: ServiceRepository;

  constructor(repo: ServiceRepository = serviceRepository) {
    this.repo = repo;
  }

  async createService(data: CreateServiceData, currentUser: JwtPayload) {
    // 1. Role Check: Only SUPER_ADMIN and ORG_ADMIN can create services
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ORG_ADMIN') {
      throw ApiError.forbidden('Only Super Admins and Organization Admins can create services');
    }

    // 2. Verify Branch Exists and check Org Ownership
    const branch = await branchRepository.findBranchById(data.branchId);
    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }

    if (currentUser.role === 'ORG_ADMIN' && currentUser.organizationId !== branch.organizationId) {
      throw ApiError.forbidden('You can only create services for branches inside your organization');
    }

    // 3. Check Code Uniqueness per Branch
    const existingService = await this.repo.findServiceByCode(data.branchId, data.code);
    if (existingService) {
      throw ApiError.badRequest(`Service code '${data.code.toUpperCase()}' already exists in this branch`);
    }

    return await this.repo.createService(data);
  }

  async getServices(branchIdFilter?: string, currentUser?: JwtPayload) {
    if (!currentUser || currentUser.role === 'CUSTOMER') {
      if (branchIdFilter) {
        return await this.repo.getServicesByBranch(branchIdFilter);
      }
      return await this.repo.getAllServices();
    }

    if (currentUser.role === 'SUPER_ADMIN') {
      if (branchIdFilter) {
        return await this.repo.getServicesByBranch(branchIdFilter);
      }
      return await this.repo.getAllServices();
    }

    if (currentUser.role === 'ORG_ADMIN' || currentUser.role === 'STAFF') {
      const orgId = currentUser.organizationId;
      if (!orgId) {
        throw ApiError.forbidden('User has no assigned organization');
      }

      if (branchIdFilter) {
        const branch = await branchRepository.findBranchById(branchIdFilter);
        if (!branch || branch.organizationId !== orgId) {
          throw ApiError.forbidden('Access denied to services in this branch');
        }
        return await this.repo.getServicesByBranch(branchIdFilter);
      }

      return await this.repo.getServicesByOrganization(orgId);
    }

    return await this.repo.getAllServices();
  }

  async getServiceById(id: string, currentUser?: JwtPayload) {
    const service = await this.repo.findServiceById(id);
    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    if (
      currentUser &&
      currentUser.role !== 'SUPER_ADMIN' &&
      currentUser.role !== 'CUSTOMER' &&
      currentUser.organizationId !== service.department.branch.organizationId
    ) {
      throw ApiError.forbidden('Access denied to this service');
    }

    return service;
  }

  async updateService(id: string, data: UpdateServiceData, currentUser: JwtPayload) {
    const service = await this.repo.findServiceById(id);
    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    if (
      currentUser.role !== 'SUPER_ADMIN' &&
      currentUser.organizationId !== service.department.branch.organizationId
    ) {
      throw ApiError.forbidden('You do not have permission to update this service');
    }

    return await this.repo.updateService(id, data);
  }

  async deleteService(id: string, currentUser: JwtPayload) {
    const service = await this.repo.findServiceById(id);
    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    if (
      currentUser.role !== 'SUPER_ADMIN' &&
      currentUser.organizationId !== service.department.branch.organizationId
    ) {
      throw ApiError.forbidden('You do not have permission to delete this service');
    }

    return await this.repo.softDeleteService(id);
  }
}

export const serviceService = new ServiceService();
