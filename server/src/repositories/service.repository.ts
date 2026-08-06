import { PrismaClient, Service, PriorityLevelEnum } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateServiceData {
  branchId: string;
  name: string;
  code: string;
  description?: string;
  avgServiceTime: number;
  priority?: PriorityLevelEnum;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  avgServiceTime?: number;
  priority?: PriorityLevelEnum;
  isActive?: boolean;
}

export class ServiceRepository {
  async findServiceById(id: string) {
    return prisma.service.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        department: {
          include: {
            branch: {
              include: {
                organization: true,
              },
            },
          },
        },
        _count: {
          select: {
            counterServices: true,
            queues: true,
          },
        },
      },
    });
  }

  async findServiceByCode(branchId: string, code: string) {
    return prisma.service.findFirst({
      where: {
        code: code.toUpperCase(),
        department: {
          branchId,
        },
        isDeleted: false,
      },
    });
  }

  async getServicesByBranch(branchId: string) {
    return prisma.service.findMany({
      where: {
        department: {
          branchId,
        },
        isDeleted: false,
      },
      include: {
        department: {
          include: {
            branch: true,
          },
        },
        _count: {
          select: {
            counterServices: true,
            queues: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getServicesByOrganization(organizationId: string) {
    return prisma.service.findMany({
      where: {
        department: {
          branch: {
            organizationId,
          },
        },
        isDeleted: false,
      },
      include: {
        department: {
          include: {
            branch: true,
          },
        },
        _count: {
          select: {
            counterServices: true,
            queues: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllServices() {
    return prisma.service.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        department: {
          include: {
            branch: {
              include: {
                organization: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createService(data: CreateServiceData) {
    // Ensure department exists for branch
    let department = await prisma.department.findFirst({
      where: {
        branchId: data.branchId,
        isDeleted: false,
      },
    });

    if (!department) {
      department = await prisma.department.create({
        data: {
          branchId: data.branchId,
          name: 'General Services Department',
          code: 'GENERAL',
          description: 'Default department for branch services',
        },
      });
    }

    return prisma.service.create({
      data: {
        departmentId: department.id,
        name: data.name,
        code: data.code.toUpperCase(),
        prefix: data.code.toUpperCase(),
        description: data.description,
        avgServiceTimeMins: data.avgServiceTime,
      },
      include: {
        department: {
          include: {
            branch: true,
          },
        },
      },
    });
  }

  async updateService(id: string, data: UpdateServiceData): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.avgServiceTime !== undefined && { avgServiceTimeMins: data.avgServiceTime }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async softDeleteService(id: string): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}

export const serviceRepository = new ServiceRepository();
