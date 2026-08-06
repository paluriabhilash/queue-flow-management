import {
  organizationRepository,
  OrganizationRepository,
  CreateOrganizationData,
  UpdateOrganizationData,
  UpdateOrganizationSettingsData,
} from '../repositories/organization.repository';
import { ApiError } from '../utils/ApiError';
import { JwtPayload } from '../utils/jwt';

export class OrganizationService {
  private repo: OrganizationRepository;

  constructor(repo: OrganizationRepository = organizationRepository) {
    this.repo = repo;
  }

  async createOrganization(data: CreateOrganizationData, currentUser: JwtPayload) {
    // 1. Business Rule: Only SUPER_ADMIN can create organizations
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw ApiError.forbidden('Only Super Administrators can create new organizations');
    }

    // 2. Check Code Uniqueness
    const existingOrg = await this.repo.findByCode(data.code);
    if (existingOrg) {
      throw ApiError.badRequest(`Organization code '${data.code.toUpperCase()}' is already in use`);
    }

    return await this.repo.create(data);
  }

  async updateOrganization(id: string, data: UpdateOrganizationData, currentUser: JwtPayload) {
    // 1. Verify Organization Exists
    const org = await this.repo.findById(id);
    if (!org) {
      throw ApiError.notFound('Organization not found');
    }

    // 2. Business Rule: ORG_ADMIN can only update their own assigned organization
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId !== id) {
      throw ApiError.forbidden('You do not have permission to update this organization');
    }

    return await this.repo.update(id, data);
  }

  async getOrganizationDetails(id: string, currentUser: JwtPayload) {
    const org = await this.repo.findById(id);
    if (!org) {
      throw ApiError.notFound('Organization not found');
    }

    // Scoping Rule: ORG_ADMIN and STAFF can only view their own organization
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId !== id) {
      throw ApiError.forbidden('Access denied to this organization profile');
    }

    return org;
  }

  async getSettings(id: string, currentUser: JwtPayload) {
    const org = await this.repo.findById(id);
    if (!org) {
      throw ApiError.notFound('Organization not found');
    }

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId !== id) {
      throw ApiError.forbidden('Access denied to organization settings');
    }

    const settings = await this.repo.getSettings(id);
    if (!settings) {
      throw ApiError.notFound('Settings not found for this organization');
    }

    return settings;
  }

  async updateSettings(id: string, data: UpdateOrganizationSettingsData, currentUser: JwtPayload) {
    const org = await this.repo.findById(id);
    if (!org) {
      throw ApiError.notFound('Organization not found');
    }

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId !== id) {
      throw ApiError.forbidden('You do not have permission to modify settings for this organization');
    }

    return await this.repo.updateSettings(id, data);
  }
}

export const organizationService = new OrganizationService();
