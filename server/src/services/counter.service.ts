import {
  counterRepository,
  CounterRepository,
  CreateCounterData,
  UpdateCounterData,
} from '../repositories/counter.repository';
import { branchRepository } from '../repositories/branch.repository';
import { serviceRepository } from '../repositories/service.repository';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { JwtPayload } from '../utils/jwt';

const prisma = new PrismaClient();

export class CounterService {
  private repo: CounterRepository;

  constructor(repo: CounterRepository = counterRepository) {
    this.repo = repo;
  }

  async createCounter(data: CreateCounterData, currentUser: JwtPayload) {
    // 1. Role Check
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ORG_ADMIN') {
      throw ApiError.forbidden('Only Super Admins and Organization Admins can create counters');
    }

    // 2. Verify Branch Exists & Org Ownership
    const branch = await branchRepository.findBranchById(data.branchId);
    if (!branch) {
      throw ApiError.notFound('Branch not found');
    }

    if (currentUser.role === 'ORG_ADMIN' && currentUser.organizationId !== branch.organizationId) {
      throw ApiError.forbidden('You can only create counters for branches inside your organization');
    }

    // 3. Counter Number Uniqueness per Branch
    const existingCounter = await this.repo.findCounterByNumber(data.branchId, data.number);
    if (existingCounter) {
      throw ApiError.badRequest(`Counter number ${data.number} already exists in this branch`);
    }

    return await this.repo.createCounter(data);
  }

  async getCounters(branchIdFilter?: string, currentUser?: JwtPayload) {
    if (!currentUser) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (currentUser.role === 'SUPER_ADMIN') {
      if (branchIdFilter) {
        return await this.repo.getCountersByBranch(branchIdFilter);
      }
      return await this.repo.getAllCounters();
    }

    if (currentUser.role === 'ORG_ADMIN' || currentUser.role === 'STAFF') {
      const orgId = currentUser.organizationId;
      if (!orgId) {
        throw ApiError.forbidden('User has no assigned organization');
      }

      if (branchIdFilter) {
        const branch = await branchRepository.findBranchById(branchIdFilter);
        if (!branch || branch.organizationId !== orgId) {
          throw ApiError.forbidden('Access denied to counters in this branch');
        }
        return await this.repo.getCountersByBranch(branchIdFilter);
      }

      return await this.repo.getCountersByOrganization(orgId);
    }

    throw ApiError.forbidden('Access denied to counter list');
  }

  async getCounterById(id: string, currentUser: JwtPayload) {
    const counter = await this.repo.findCounterById(id);
    if (!counter) {
      throw ApiError.notFound('Counter not found');
    }

    if (
      currentUser.role !== 'SUPER_ADMIN' &&
      currentUser.organizationId !== counter.branch.organizationId
    ) {
      throw ApiError.forbidden('Access denied to this counter');
    }

    return counter;
  }

  async updateCounter(id: string, data: UpdateCounterData, currentUser: JwtPayload) {
    const counter = await this.repo.findCounterById(id);
    if (!counter) {
      throw ApiError.notFound('Counter not found');
    }

    if (
      currentUser.role !== 'SUPER_ADMIN' &&
      currentUser.organizationId !== counter.branch.organizationId
    ) {
      throw ApiError.forbidden('You do not have permission to update this counter');
    }

    return await this.repo.updateCounter(id, data);
  }

  async deleteCounter(id: string, currentUser: JwtPayload) {
    const counter = await this.repo.findCounterById(id);
    if (!counter) {
      throw ApiError.notFound('Counter not found');
    }

    if (
      currentUser.role !== 'SUPER_ADMIN' &&
      currentUser.organizationId !== counter.branch.organizationId
    ) {
      throw ApiError.forbidden('You do not have permission to delete this counter');
    }

    return await this.repo.deleteCounter(id);
  }

  // --- Staff Assignment ---

  async assignStaff(counterId: string, staffProfileId: string, currentUser: JwtPayload) {
    const counter = await this.getCounterById(counterId, currentUser);

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ORG_ADMIN') {
      throw ApiError.forbidden('Only Admins can assign staff to counters');
    }

    // Verify Staff Profile belongs to same Organization
    const staffProfile = await prisma.staffProfile.findUnique({
      where: { id: staffProfileId },
    });

    if (!staffProfile) {
      throw ApiError.notFound('Staff profile not found');
    }

    if (staffProfile.organizationId !== counter.branch.organizationId) {
      throw ApiError.badRequest('Staff member must belong to the same organization as the counter');
    }

    return await this.repo.assignStaffToCounter(counterId, staffProfileId);
  }

  async removeStaff(counterId: string, staffProfileId: string, currentUser: JwtPayload) {
    await this.getCounterById(counterId, currentUser);

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ORG_ADMIN') {
      throw ApiError.forbidden('Only Admins can remove staff from counters');
    }

    return await this.repo.removeStaffFromCounter(counterId, staffProfileId);
  }

  // --- Service Assignment ---

  async assignServices(counterId: string, serviceIds: string[], currentUser: JwtPayload) {
    const counter = await this.getCounterById(counterId, currentUser);

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ORG_ADMIN') {
      throw ApiError.forbidden('Only Admins can assign services to counters');
    }

    // Verify all services belong to the same Branch as the counter
    for (const serviceId of serviceIds) {
      const service = await serviceRepository.findServiceById(serviceId);
      if (!service) {
        throw ApiError.notFound(`Service ID ${serviceId} not found`);
      }
      if (service.department.branchId !== counter.branchId) {
        throw ApiError.badRequest(`Service '${service.name}' does not belong to the counter's branch`);
      }
    }

    return await this.repo.assignServicesToCounter(counterId, serviceIds);
  }

  async removeService(counterId: string, serviceId: string, currentUser: JwtPayload) {
    await this.getCounterById(counterId, currentUser);

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ORG_ADMIN') {
      throw ApiError.forbidden('Only Admins can remove services from counters');
    }

    await this.repo.removeServiceFromCounter(counterId, serviceId);
  }

  async getCounterServices(counterId: string, currentUser: JwtPayload) {
    await this.getCounterById(counterId, currentUser);
    return await this.repo.getCounterServices(counterId);
  }
}

export const counterService = new CounterService();
