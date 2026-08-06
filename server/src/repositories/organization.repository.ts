import { PrismaClient, Organization, OrganizationSetting } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateOrganizationData {
  name: string;
  code: string;
  description?: string;
  logoUrl?: string;
  themeColor?: string;
  maxTokensPerDay?: number;
  autoCallEnabled?: boolean;
  smsGatewayEnabled?: boolean;
  smsApiKey?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
}

export interface UpdateOrganizationSettingsData {
  maxTokensPerDay?: number;
  autoCallEnabled?: boolean;
  smsGatewayEnabled?: boolean;
  smsApiKey?: string;
  themeColor?: string;
  customConfig?: string;
}

export class OrganizationRepository {
  async findById(id: string): Promise<(Organization & { settings: OrganizationSetting | null }) | null> {
    return prisma.organization.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        settings: true,
        _count: {
          select: {
            branches: true,
            users: true,
          },
        },
      },
    });
  }

  async findByCode(code: string): Promise<Organization | null> {
    return prisma.organization.findFirst({
      where: {
        code: code.toUpperCase(),
        isDeleted: false,
      },
    });
  }

  async create(data: CreateOrganizationData): Promise<Organization & { settings: OrganizationSetting | null }> {
    return prisma.organization.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description,
        logoUrl: data.logoUrl,
        settings: {
          create: {
            themeColor: data.themeColor || '#0c8ce9',
            maxTokensPerDay: data.maxTokensPerDay ?? 500,
            autoCallEnabled: data.autoCallEnabled ?? false,
            smsGatewayEnabled: data.smsGatewayEnabled ?? false,
            smsApiKey: data.smsApiKey,
          },
        },
      },
      include: {
        settings: true,
      },
    });
  }

  async update(id: string, data: UpdateOrganizationData): Promise<Organization> {
    return prisma.organization.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async getSettings(organizationId: string): Promise<OrganizationSetting | null> {
    return prisma.organizationSetting.findUnique({
      where: { organizationId },
    });
  }

  async updateSettings(
    organizationId: string,
    data: UpdateOrganizationSettingsData
  ): Promise<OrganizationSetting> {
    return prisma.organizationSetting.upsert({
      where: { organizationId },
      update: {
        ...(data.maxTokensPerDay !== undefined && { maxTokensPerDay: data.maxTokensPerDay }),
        ...(data.autoCallEnabled !== undefined && { autoCallEnabled: data.autoCallEnabled }),
        ...(data.smsGatewayEnabled !== undefined && { smsGatewayEnabled: data.smsGatewayEnabled }),
        ...(data.smsApiKey !== undefined && { smsApiKey: data.smsApiKey }),
        ...(data.themeColor !== undefined && { themeColor: data.themeColor }),
        ...(data.customConfig !== undefined && { customConfig: data.customConfig }),
      },
      create: {
        organizationId,
        maxTokensPerDay: data.maxTokensPerDay ?? 500,
        autoCallEnabled: data.autoCallEnabled ?? false,
        smsGatewayEnabled: data.smsGatewayEnabled ?? false,
        smsApiKey: data.smsApiKey,
        themeColor: data.themeColor || '#0c8ce9',
        customConfig: data.customConfig,
      },
    });
  }
}

export const organizationRepository = new OrganizationRepository();
